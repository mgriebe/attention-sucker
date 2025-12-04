/**
 * Hex Grid Simulation Engine for AI Clicker
 * Manages bot visualization and infection spread on a hexagonal grid
 * Based on axial coordinate system with spatial infection mechanics
 *
 * Cell States:
 * - EMPTY (0): No bot, dead hex
 * - BOT_AUTOPOSTER (1): Green AutoPoster bot
 * - BOT_AUTO_AUTOPOSTER (2): Maroon Auto-AutoPoster bot
 * - BOT_IMAGE_GENERATOR (3): Blue Image Generator bot
 * - BOT_VIDEO_GENERATOR (4): Purple Video Generator bot
 * - INFECTED (5): Orange-red, actively infected, will die
 * - RECENTLY_INFECTED (6): Lighter orange, transition before empty
 */

const CellState = {
    EMPTY: 0,
    BOT_AUTOPOSTER: 1,
    BOT_AUTO_AUTOPOSTER: 2,
    BOT_IMAGE_GENERATOR: 3,
    BOT_VIDEO_GENERATOR: 4,
    INFECTED: 5,
    RECENTLY_INFECTED: 6
};

class HexGridSimulation {
    /**
     * Create a hexagonal grid with the given number of rings
     * Number of rings = floor(sqrt(totalBots))
     * Total cells = 1 + 3 * rings * (rings + 1)
     * Maximum rings = 64
     */
    constructor(rings = 1) {
        this.rings = Math.min(rings, 64); // Cap at 64 rings
        this.totalCells = 1 + 3 * this.rings * (this.rings + 1);

        // Store cells in a Map using axial coordinate key "q,r"
        this.cells = new Map();
        this.nextCells = new Map();

        // Store all valid cell coordinates for iteration
        this.cellCoords = [];

        // Track which cells have masks applied
        this.maskedCells = new Set();

        // Simulation state
        this.isRunning = false;
        this.timerId = null;
        this.stepCallback = null;
        this.stepInterval = 100; // milliseconds

        // Infection probability (1% per second when at 100+ posts/sec)
        this.infectionProbability = 0.001; // Base per-step probability

        this.initialize();
    }

    /**
     * Initialize the hexagonal grid with all empty cells
     * Uses axial coordinates (q, r) where the center is (0, 0)
     */
    initialize() {
        this.cells.clear();
        this.nextCells.clear();
        this.cellCoords = [];

        // Generate all cells in the hexagonal grid
        for (let q = -this.rings; q <= this.rings; q++) {
            const r1 = Math.max(-this.rings, -q - this.rings);
            const r2 = Math.min(this.rings, -q + this.rings);
            for (let r = r1; r <= r2; r++) {
                const key = `${q},${r}`;
                this.cells.set(key, CellState.EMPTY);
                this.nextCells.set(key, CellState.EMPTY);
                this.cellCoords.push({ q, r });
            }
        }
    }

    /**
     * Resize the grid to accommodate more bots
     */
    resize(newRings) {
        newRings = Math.min(newRings, 64); // Cap at 64 rings
        if (newRings === this.rings) return;

        const oldCells = new Map(this.cells);
        this.rings = newRings;
        this.totalCells = 1 + 3 * this.rings * (this.rings + 1);

        this.initialize();

        // Copy over existing cells
        for (const [key, state] of oldCells.entries()) {
            if (this.cells.has(key)) {
                this.cells.set(key, state);
            }
        }
    }

    /**
     * Get the state of a cell at given axial coordinates
     */
    getCellState(q, r) {
        const key = `${q},${r}`;
        if (!this.cells.has(key)) {
            return null;
        }
        return this.cells.get(key);
    }

    /**
     * Set the state of a cell at given axial coordinates
     */
    setCellState(q, r, state) {
        const key = `${q},${r}`;
        if (this.cells.has(key)) {
            this.cells.set(key, state);
        }
    }

    /**
     * Check if a cell is masked
     */
    isCellMasked(q, r) {
        const key = `${q},${r}`;
        return this.maskedCells.has(key);
    }

    /**
     * Set mask status for a cell
     */
    setCellMask(q, r, masked) {
        const key = `${q},${r}`;
        if (masked) {
            this.maskedCells.add(key);
        } else {
            this.maskedCells.delete(key);
        }
    }

    /**
     * Get a random empty cell for placing a new bot
     */
    getRandomEmptyCell() {
        const emptyCells = this.cellCoords.filter(coord => {
            const state = this.getCellState(coord.q, coord.r);
            return state === CellState.EMPTY;
        });

        if (emptyCells.length === 0) return null;

        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    /**
     * Place a bot at a random empty cell
     */
    placeBot(botType) {
        const cell = this.getRandomEmptyCell();
        if (cell) {
            this.setCellState(cell.q, cell.r, botType);
            return cell;
        }
        return null;
    }

    /**
     * Count bots of each type currently on the grid
     */
    countBots() {
        const counts = {
            autoPosters: 0,
            autoAutoPosters: 0,
            imagePosters: 0,
            videoPosters: 0
        };

        for (const coord of this.cellCoords) {
            const state = this.getCellState(coord.q, coord.r);
            if (state === CellState.BOT_AUTOPOSTER) {
                counts.autoPosters++;
            } else if (state === CellState.BOT_AUTO_AUTOPOSTER) {
                counts.autoAutoPosters++;
            } else if (state === CellState.BOT_IMAGE_GENERATOR) {
                counts.imagePosters++;
            } else if (state === CellState.BOT_VIDEO_GENERATOR) {
                counts.videoPosters++;
            }
        }

        return counts;
    }

    /**
     * Get the 6 hexagonal neighbors for a cell at (q, r)
     * In axial coordinates, the 6 neighbors have fixed offsets
     */
    getNeighborOffsets() {
        return [
            { dq: 1, dr: 0 },   // East
            { dq: 1, dr: -1 },  // Northeast
            { dq: 0, dr: -1 },  // Northwest
            { dq: -1, dr: 0 },  // West
            { dq: -1, dr: 1 },  // Southwest
            { dq: 0, dr: 1 }    // Southeast
        ];
    }

    /**
     * Count how many neighbors are infected
     */
    countInfectedNeighbors(q, r) {
        const neighbors = this.getNeighborOffsets();
        let count = 0;

        for (const { dq, dr } of neighbors) {
            const nq = q + dq;
            const nr = r + dr;
            const state = this.getCellState(nq, nr);
            if (state === CellState.INFECTED) {
                count++;
            }
        }

        return count;
    }

    /**
     * Check if a bot is a valid bot type (not empty, infected, or recently infected)
     */
    isBot(state) {
        return state === CellState.BOT_AUTOPOSTER ||
               state === CellState.BOT_AUTO_AUTOPOSTER ||
               state === CellState.BOT_IMAGE_GENERATOR ||
               state === CellState.BOT_VIDEO_GENERATOR;
    }

    /**
     * Apply random infection to unmasked bots (1% chance per second)
     */
    applyRandomInfection(postsPerSecond) {
        if (postsPerSecond < 100) return false;

        // Calculate probability per step (100ms steps = 10 steps per second)
        // 1% per second = 0.1% per step
        const probabilityPerStep = 0.01 / 10;
        return Math.random() < probabilityPerStep;
    }

    /**
     * Update the grid state for one time step
     */
    update(postsPerSecond) {
        // Copy current state to next state
        for (const coord of this.cellCoords) {
            const key = `${coord.q},${coord.r}`;
            this.nextCells.set(key, this.cells.get(key));
        }

        // Apply infection rules to each cell
        for (const coord of this.cellCoords) {
            const { q, r } = coord;
            const key = `${q},${r}`;
            const currentState = this.cells.get(key);
            const isMasked = this.isCellMasked(q, r);

            if (this.isBot(currentState)) {
                const infectedNeighbors = this.countInfectedNeighbors(q, r);

                // Infection spread logic
                if (isMasked) {
                    // Masked bots need 2+ infected neighbors
                    if (infectedNeighbors >= 2) {
                        this.nextCells.set(key, CellState.INFECTED);
                    }
                } else {
                    // Unmasked bots: 1 infected neighbor OR random infection
                    if (infectedNeighbors >= 1) {
                        this.nextCells.set(key, CellState.INFECTED);
                    } else if (this.applyRandomInfection(postsPerSecond)) {
                        this.nextCells.set(key, CellState.INFECTED);
                    }
                }
            } else if (currentState === CellState.INFECTED) {
                // Infected becomes recently infected
                this.nextCells.set(key, CellState.RECENTLY_INFECTED);
            } else if (currentState === CellState.RECENTLY_INFECTED) {
                // Recently infected becomes empty
                this.nextCells.set(key, CellState.EMPTY);
                // Remove mask if present
                this.maskedCells.delete(key);
            }
        }

        // Swap current and next states
        [this.cells, this.nextCells] = [this.nextCells, this.cells];

        if (this.stepCallback) {
            this.stepCallback();
        }
    }

    /**
     * Start the simulation with automatic updates
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
        }
    }

    /**
     * Stop the simulation
     */
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
        }
    }

    /**
     * Register a callback to be called after each step
     */
    onStep(callback) {
        this.stepCallback = callback;
    }

    /**
     * Synchronize grid with game state bot counts
     * This adds or removes bots to match the current game state
     */
    syncWithGameState(gameState) {
        const currentCounts = this.countBots();

        // Calculate required rings based on total bots
        const totalBots = Math.floor(gameState.autoPosters + gameState.autoAutoPosters +
                                     gameState.imagePosters + gameState.videoPosters);
        const requiredRings = Math.min(Math.floor(Math.sqrt(totalBots)), 64);

        // Resize grid if needed
        if (requiredRings > this.rings) {
            this.resize(requiredRings);
        }

        // Add bots where needed
        const toAddAutoPosters = Math.floor(gameState.autoPosters) - currentCounts.autoPosters;
        for (let i = 0; i < toAddAutoPosters; i++) {
            this.placeBot(CellState.BOT_AUTOPOSTER);
        }

        const toAddAutoAutoPosters = Math.floor(gameState.autoAutoPosters) - currentCounts.autoAutoPosters;
        for (let i = 0; i < toAddAutoAutoPosters; i++) {
            this.placeBot(CellState.BOT_AUTO_AUTOPOSTER);
        }

        const toAddImagePosters = Math.floor(gameState.imagePosters) - currentCounts.imagePosters;
        for (let i = 0; i < toAddImagePosters; i++) {
            this.placeBot(CellState.BOT_IMAGE_GENERATOR);
        }

        const toAddVideoPosters = Math.floor(gameState.videoPosters) - currentCounts.videoPosters;
        for (let i = 0; i < toAddVideoPosters; i++) {
            this.placeBot(CellState.BOT_VIDEO_GENERATOR);
        }

        // Update mask status based on game state
        this.updateMasks(gameState.masks);
    }

    /**
     * Update which bots are masked based on available masks
     */
    updateMasks(availableMasks) {
        // Get all bot cells (not infected or recently infected)
        const botCells = this.cellCoords.filter(coord => {
            const state = this.getCellState(coord.q, coord.r);
            return this.isBot(state);
        });

        // Clear all masks first
        this.maskedCells.clear();

        // Apply masks to random bots up to the available count
        const masksToApply = Math.min(Math.floor(availableMasks), botCells.length);
        const shuffled = botCells.sort(() => Math.random() - 0.5);

        for (let i = 0; i < masksToApply; i++) {
            const coord = shuffled[i];
            this.setCellMask(coord.q, coord.r, true);
        }
    }

    /**
     * Get bot type name for a cell state
     */
    getBotTypeName(state) {
        switch (state) {
            case CellState.BOT_AUTOPOSTER:
                return 'autoPosters';
            case CellState.BOT_AUTO_AUTOPOSTER:
                return 'autoAutoPosters';
            case CellState.BOT_IMAGE_GENERATOR:
                return 'imagePosters';
            case CellState.BOT_VIDEO_GENERATOR:
                return 'videoPosters';
            default:
                return null;
        }
    }
}
