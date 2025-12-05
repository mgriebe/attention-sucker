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
 * - BOT_DEEPFAKE_STUDIO (5): Neon Blue Deepfake Studio bot
 * - INFECTED (6): Orange-red, actively infected, will die
 * - RECENTLY_INFECTED (7): Lighter orange, transition before empty
 */

const CellState = {
    EMPTY: 0,
    BOT_AUTOPOSTER: 1,
    BOT_AUTO_AUTOPOSTER: 2,
    BOT_IMAGE_GENERATOR: 3,
    BOT_VIDEO_GENERATOR: 4,
    BOT_DEEPFAKE_STUDIO: 5,
    INFECTED: 6,
    RECENTLY_INFECTED: 7
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

        // Track which cells have masks applied (key -> maskAppliedTime)
        this.maskedCells = new Map();

        // Track immunity periods (key -> immuneUntilTime)
        this.immuneCells = new Map();

        // Track what type of bot is in each infected cell (key -> original bot type)
        this.infectedBotTypes = new Map();

        // Track deaths this update cycle (reset after sync)
        this.pendingDeaths = {
            autoPosters: 0,
            autoAutoPosters: 0,
            imagePosters: 0,
            videoPosters: 0,
            deepfakePosters: 0
        };

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
     * Check if a cell is immune (post-mask immunity period)
     */
    isCellImmune(q, r) {
        const key = `${q},${r}`;
        if (!this.immuneCells.has(key)) return false;
        return Date.now() < this.immuneCells.get(key);
    }

    /**
     * Set mask status for a cell with timestamp
     */
    setCellMask(q, r, masked) {
        const key = `${q},${r}`;
        if (masked) {
            this.maskedCells.set(key, Date.now());
        } else {
            this.maskedCells.delete(key);
        }
    }

    /**
     * Set immunity period for a cell
     */
    setCellImmunity(q, r, immuneUntil) {
        const key = `${q},${r}`;
        this.immuneCells.set(key, immuneUntil);
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
     * Get the tier of a bot type (higher = more valuable)
     * Used for replacement logic when grid is full
     */
    getBotTier(botType) {
        switch (botType) {
            case CellState.BOT_AUTOPOSTER: return 1;
            case CellState.BOT_AUTO_AUTOPOSTER: return 2;
            case CellState.BOT_IMAGE_GENERATOR: return 3;
            case CellState.BOT_VIDEO_GENERATOR: return 4;
            case CellState.BOT_DEEPFAKE_STUDIO: return 5;
            default: return 0;
        }
    }

    /**
     * Find a random cell containing a bot of lower tier than the given type
     */
    getRandomLowerTierBotCell(botType) {
        const targetTier = this.getBotTier(botType);
        const lowerTierCells = this.cellCoords.filter(coord => {
            const state = this.getCellState(coord.q, coord.r);
            if (!this.isBot(state)) return false;
            return this.getBotTier(state) < targetTier;
        });

        if (lowerTierCells.length === 0) return null;
        return lowerTierCells[Math.floor(Math.random() * lowerTierCells.length)];
    }

    /**
     * Place a bot at a random empty cell, or replace a lower-tier bot if grid is full
     * Returns the cell where the bot was placed, or null if placement failed
     * Also returns info about any replaced bot
     */
    placeBot(botType) {
        // First try to find an empty cell
        const emptyCell = this.getRandomEmptyCell();
        if (emptyCell) {
            this.setCellState(emptyCell.q, emptyCell.r, botType);
            return { cell: emptyCell, replaced: null };
        }

        // Grid is full - try to replace a lower-tier bot
        const lowerTierCell = this.getRandomLowerTierBotCell(botType);
        if (lowerTierCell) {
            const replacedType = this.getCellState(lowerTierCell.q, lowerTierCell.r);
            this.setCellState(lowerTierCell.q, lowerTierCell.r, botType);
            return { cell: lowerTierCell, replaced: replacedType };
        }

        // No empty cells and no lower-tier bots to replace
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
            videoPosters: 0,
            deepfakePosters: 0
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
            } else if (state === CellState.BOT_DEEPFAKE_STUDIO) {
                counts.deepfakePosters++;
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
               state === CellState.BOT_VIDEO_GENERATOR ||
               state === CellState.BOT_DEEPFAKE_STUDIO;
    }

    /**
     * Apply random infection to bots
     * Normal mode: 1% chance per second (only at 100+ posts/sec)
     * Quantum Mask mode: 1/20000 chance per second for ALL bots (no mask protection)
     * QKD Link: halves detection rate
     * Trusted Relays: quarters detection rate (stacks with QKD Link for 1/8)
     */
    applyRandomInfection(postsPerSecond, quantumMaskActive = false, qkdLinkActive = false, trustedRelaysActive = false) {
        // QKD Link halves, Trusted Relays quarters (multiplicative)
        let multiplier = 1.0;
        if (qkdLinkActive) multiplier *= 0.5;
        if (trustedRelaysActive) multiplier *= 0.25;

        if (quantumMaskActive) {
            // Quantum Mask: 1/20000 per second = 0.00005 per second
            // Per step (100ms = 10 steps per second) = 0.000005 per step
            const probabilityPerStep = ((1 / 20000) / 10) * multiplier;
            return Math.random() < probabilityPerStep;
        }

        // Normal mode: requires 100+ posts/sec
        if (postsPerSecond < 100) return false;

        // Calculate probability per step (100ms steps = 10 steps per second)
        // 1% per second = 0.1% per step
        const probabilityPerStep = (0.01 / 10) * multiplier;
        return Math.random() < probabilityPerStep;
    }

    /**
     * Update the grid state for one time step
     * @param {number} postsPerSecond - Current production rate
     * @param {boolean} quantumMaskActive - Whether Quantum Mask has been purchased
     * @param {boolean} qkdLinkActive - Whether QKD Link has been purchased (halves detection)
     * @param {boolean} trustedRelaysActive - Whether Trusted Relays has been purchased (quarters detection)
     */
    update(postsPerSecond, quantumMaskActive = false, qkdLinkActive = false, trustedRelaysActive = false) {
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
            const isImmune = this.isCellImmune(q, r);

            if (this.isBot(currentState)) {
                // In Quantum Mask mode, immunity and masks don't matter
                // In normal mode, immune bots cannot be infected
                if (!quantumMaskActive && isImmune) continue;

                const infectedNeighbors = this.countInfectedNeighbors(q, r);
                let becomesInfected = false;

                if (quantumMaskActive) {
                    // Quantum Mask mode: masks don't help, only grid spread matters
                    // 1 infected neighbor = infection, OR random 1/20000 per second
                    if (infectedNeighbors >= 1) {
                        becomesInfected = true;
                    } else if (this.applyRandomInfection(postsPerSecond, true, qkdLinkActive, trustedRelaysActive)) {
                        becomesInfected = true;
                    }
                } else {
                    // Normal infection spread logic
                    if (isMasked) {
                        // Masked bots need 2+ infected neighbors
                        if (infectedNeighbors >= 2) {
                            becomesInfected = true;
                        }
                    } else {
                        // Unmasked bots: 1 infected neighbor OR random infection
                        if (infectedNeighbors >= 1) {
                            becomesInfected = true;
                        } else if (this.applyRandomInfection(postsPerSecond, false, qkdLinkActive, trustedRelaysActive)) {
                            becomesInfected = true;
                        }
                    }
                }

                if (becomesInfected) {
                    this.nextCells.set(key, CellState.INFECTED);
                    // Track what type of bot this was so we can decrement the right counter
                    this.infectedBotTypes.set(key, currentState);
                }
            } else if (currentState === CellState.INFECTED) {
                // Infected becomes recently infected
                this.nextCells.set(key, CellState.RECENTLY_INFECTED);
            } else if (currentState === CellState.RECENTLY_INFECTED) {
                // Recently infected becomes empty - record the death
                this.nextCells.set(key, CellState.EMPTY);

                // Record the death based on original bot type
                const originalType = this.infectedBotTypes.get(key);
                if (originalType === CellState.BOT_AUTOPOSTER) {
                    this.pendingDeaths.autoPosters++;
                } else if (originalType === CellState.BOT_AUTO_AUTOPOSTER) {
                    this.pendingDeaths.autoAutoPosters++;
                } else if (originalType === CellState.BOT_IMAGE_GENERATOR) {
                    this.pendingDeaths.imagePosters++;
                } else if (originalType === CellState.BOT_VIDEO_GENERATOR) {
                    this.pendingDeaths.videoPosters++;
                } else if (originalType === CellState.BOT_DEEPFAKE_STUDIO) {
                    this.pendingDeaths.deepfakePosters++;
                }
                this.infectedBotTypes.delete(key);

                // Remove mask and immunity if present
                this.maskedCells.delete(key);
                this.immuneCells.delete(key);
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
    /**
     * Track replacements that occurred during sync
     * These need to be applied back to gameState
     */
    pendingReplacements = {
        autoPosters: 0,
        autoAutoPosters: 0,
        imagePosters: 0,
        videoPosters: 0,
        deepfakePosters: 0
    };

    /**
     * Record a bot replacement
     */
    recordReplacement(replacedType) {
        if (replacedType === CellState.BOT_AUTOPOSTER) {
            this.pendingReplacements.autoPosters++;
        } else if (replacedType === CellState.BOT_AUTO_AUTOPOSTER) {
            this.pendingReplacements.autoAutoPosters++;
        } else if (replacedType === CellState.BOT_IMAGE_GENERATOR) {
            this.pendingReplacements.imagePosters++;
        } else if (replacedType === CellState.BOT_VIDEO_GENERATOR) {
            this.pendingReplacements.videoPosters++;
        } else if (replacedType === CellState.BOT_DEEPFAKE_STUDIO) {
            this.pendingReplacements.deepfakePosters++;
        }
    }

    /**
     * Get and clear pending replacements
     */
    getAndClearReplacements() {
        const replacements = { ...this.pendingReplacements };
        this.pendingReplacements = {
            autoPosters: 0,
            autoAutoPosters: 0,
            imagePosters: 0,
            videoPosters: 0,
            deepfakePosters: 0
        };
        return replacements;
    }

    syncWithGameState(gameState) {
        const currentCounts = this.countBots();

        // Calculate required rings based on total bots (capped at grid max)
        const totalBots = Math.floor(gameState.autoPosters + gameState.autoAutoPosters +
                                     gameState.imagePosters + gameState.videoPosters +
                                     gameState.deepfakePosters);
        const requiredRings = Math.min(Math.floor(Math.sqrt(totalBots)), 64);

        // Resize grid if needed
        if (requiredRings > this.rings) {
            this.resize(requiredRings);
        }

        // Add bots where needed - process in tier order (lowest first, so higher tiers can replace)
        const toAddAutoPosters = Math.floor(gameState.autoPosters) - currentCounts.autoPosters;
        for (let i = 0; i < toAddAutoPosters; i++) {
            const result = this.placeBot(CellState.BOT_AUTOPOSTER);
            // AutoPosters can't replace anything (lowest tier), so if null, just skip
        }

        const toAddAutoAutoPosters = Math.floor(gameState.autoAutoPosters) - currentCounts.autoAutoPosters;
        for (let i = 0; i < toAddAutoAutoPosters; i++) {
            const result = this.placeBot(CellState.BOT_AUTO_AUTOPOSTER);
            if (result && result.replaced) {
                this.recordReplacement(result.replaced);
            }
        }

        const toAddImagePosters = Math.floor(gameState.imagePosters) - currentCounts.imagePosters;
        for (let i = 0; i < toAddImagePosters; i++) {
            const result = this.placeBot(CellState.BOT_IMAGE_GENERATOR);
            if (result && result.replaced) {
                this.recordReplacement(result.replaced);
            }
        }

        const toAddVideoPosters = Math.floor(gameState.videoPosters) - currentCounts.videoPosters;
        for (let i = 0; i < toAddVideoPosters; i++) {
            const result = this.placeBot(CellState.BOT_VIDEO_GENERATOR);
            if (result && result.replaced) {
                this.recordReplacement(result.replaced);
            }
        }

        const toAddDeepfakePosters = Math.floor(gameState.deepfakePosters) - currentCounts.deepfakePosters;
        for (let i = 0; i < toAddDeepfakePosters; i++) {
            const result = this.placeBot(CellState.BOT_DEEPFAKE_STUDIO);
            if (result && result.replaced) {
                this.recordReplacement(result.replaced);
            }
        }

        // Update mask status based on game state
        this.updateMasks(gameState);
    }

    /**
     * Update which bots are masked based on available masks
     * Masks have duration (10 sec base) and grant immunity after expiring (5 sec base)
     * maskUpgrade doubles these durations
     */
    updateMasks(gameState) {
        const now = Date.now();
        const availableMasks = gameState.masks;

        // Calculate mask duration based on upgrade - doubles with each purchase
        const baseMaskDuration = 10000; // 10 seconds
        const baseImmunityDuration = 5000; // 5 seconds
        const multiplier = Math.pow(2, gameState.maskUpgrade || 0);
        const maskDuration = baseMaskDuration * multiplier;
        const immunityDuration = baseImmunityDuration * multiplier;

        // Check for expired masks and grant immunity
        const expiredMasks = [];
        for (const [key, maskTime] of this.maskedCells.entries()) {
            if (now - maskTime > maskDuration) {
                expiredMasks.push(key);
                // Grant immunity period
                this.immuneCells.set(key, now + immunityDuration);
            }
        }

        // Remove expired masks and consume from mask count
        for (const key of expiredMasks) {
            this.maskedCells.delete(key);
            gameState.masks = Math.max(0, gameState.masks - 1);
        }

        // Clean up expired immunity periods
        for (const [key, immuneUntil] of this.immuneCells.entries()) {
            if (now >= immuneUntil) {
                this.immuneCells.delete(key);
            }
        }

        // Get all bot cells (not infected or recently infected)
        const botCells = this.cellCoords.filter(coord => {
            const state = this.getCellState(coord.q, coord.r);
            return this.isBot(state);
        });

        // Count currently masked bots
        const currentlyMasked = this.maskedCells.size;
        const masksAvailable = Math.floor(gameState.masks);
        const masksNeeded = masksAvailable - currentlyMasked;

        if (masksNeeded > 0) {
            // Add masks to unmasked bots (prefer non-immune bots)
            const unmaskedBots = botCells.filter(coord => {
                const key = `${coord.q},${coord.r}`;
                return !this.maskedCells.has(key);
            });

            // Shuffle for random selection
            const shuffled = unmaskedBots.sort(() => Math.random() - 0.5);
            const botsToMask = Math.min(masksNeeded, shuffled.length);

            for (let i = 0; i < botsToMask; i++) {
                const coord = shuffled[i];
                this.setCellMask(coord.q, coord.r, true);
            }
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
            case CellState.BOT_DEEPFAKE_STUDIO:
                return 'deepfakePosters';
            default:
                return null;
        }
    }

    /**
     * Get pending deaths and reset the counter
     */
    getAndClearPendingDeaths() {
        const deaths = { ...this.pendingDeaths };
        this.pendingDeaths = {
            autoPosters: 0,
            autoAutoPosters: 0,
            imagePosters: 0,
            videoPosters: 0,
            deepfakePosters: 0
        };
        return deaths;
    }
}
