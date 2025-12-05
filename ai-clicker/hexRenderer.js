/**
 * Hex Grid Renderer for AI Clicker
 * Handles visualization of the hexagonal bot grid on HTML5 Canvas
 * Uses flat-top hexagons with axial coordinates
 * Supports hemisphere projection for Stage 7+
 */

class HexGridRenderer {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.simulation = simulation;

        // Hemisphere projection mode (enabled at Stage 7)
        this.hemisphereMode = false;
        this.hemisphereExtent = 0.75; // 75% of hemisphere (67.5 degrees)

        // Calculate hex size to fit the hexagonal grid in the canvas
        this.calculateHexDimensions();

        // Color scheme for different bot types (matching bubble view)
        this.colors = {
            EMPTY: '#2a2a3e',                    // Dark gray for empty cells
            BOT_AUTOPOSTER: '#00ff41',           // Neon green (bubble: green/blue gradient)
            BOT_AUTO_AUTOPOSTER: '#ff006e',      // Neon pink (bubble: pink/purple gradient)
            BOT_IMAGE_GENERATOR: '#ffff00',      // Neon yellow (bubble: yellow/orange gradient)
            BOT_VIDEO_GENERATOR: '#b800e6',      // Neon purple
            BOT_DEEPFAKE_STUDIO: '#00bfff',      // Neon blue
            INFECTED: '#ff4500',                 // Orange-red fire
            RECENTLY_INFECTED: '#ffa500',        // Orange
            BACKGROUND: '#1a1a2e',               // Dark background
            MASKED_TINT: 0.4                     // Desaturation for masked bots
        };

        // Performance optimization: use offscreen canvas for double buffering
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = canvas.width;
        this.offscreenCanvas.height = canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        // Animation state
        this.animationId = null;
        this.lastRenderTime = 0;

        // Pre-calculate hex vertices for performance
        this.hexVertices = this.calculateHexVertices();
    }

    /**
     * Enable or disable hemisphere projection mode
     */
    setHemisphereMode(enabled) {
        this.hemisphereMode = enabled;
        this.calculateHexDimensions();
        this.hexVertices = this.calculateHexVertices();
    }

    /**
     * Calculate hex dimensions to fit the grid in the canvas
     * Using flat-top hexagons
     */
    calculateHexDimensions() {
        const rings = this.simulation.rings;

        // Calculate size to fit in canvas with padding
        // Extra padding at top for stats display, and sides for margins
        const paddingHorizontal = 30;
        const paddingTop = 80; // Extra space for stats display
        const paddingBottom = 30;
        const availableWidth = this.canvas.width - 2 * paddingHorizontal;
        const availableHeight = this.canvas.height - paddingTop - paddingBottom;

        // For flat-top hex grid with N rings:
        const sizeFromWidth = availableWidth / (3 * rings + 1);
        const sizeFromHeight = availableHeight / ((2 * rings + 1) * Math.sqrt(3));

        this.hexSize = Math.min(sizeFromWidth, sizeFromHeight);
        this.hexWidth = 2 * this.hexSize;
        this.hexHeight = Math.sqrt(3) * this.hexSize;

        // Center offset - shift down slightly to account for top padding
        this.centerX = this.canvas.width / 2;
        this.centerY = paddingTop + (availableHeight / 2);

        // Hemisphere projection parameters
        // The flat grid radius (distance from center to outermost hex)
        this.flatRadius = this.hexSize * (3/2 * this.simulation.rings + 0.5);
        // The projected dome radius on screen
        this.domeRadius = Math.min(availableWidth, availableHeight) / 2;
    }

    /**
     * Project a point from flat grid space onto a hemisphere
     * Input: (x, y) relative to grid center in flat space
     * Output: (x, y) projected position on screen
     */
    projectToHemisphere(flatX, flatY) {
        // Normalize to unit disk (0 to 1 from center to edge)
        const flatDist = Math.sqrt(flatX * flatX + flatY * flatY);

        if (flatDist === 0) {
            return { x: 0, y: 0 };
        }

        // Normalize distance to 0-1 range based on grid extent
        const normalizedDist = Math.min(flatDist / this.flatRadius, 1);

        // Map flat disk to partial hemisphere using equidistant azimuthal projection
        // hemisphereExtent controls how much of the hemisphere we use
        // At extent=1.0, edge maps to 90 degrees (full hemisphere)
        // At extent=0.75, edge maps to 67.5 degrees
        const maxTheta = (Math.PI / 2) * this.hemisphereExtent;
        const theta = normalizedDist * maxTheta;
        const projectedDist = Math.sin(theta) * this.domeRadius / Math.sin(maxTheta);

        // Maintain the same direction, just change the distance
        const scale = projectedDist / flatDist;

        return {
            x: flatX * scale,
            y: flatY * scale
        };
    }

    /**
     * Get the scale factor at a given flat position for sizing hexes
     * Hexes near center appear larger, hexes near edge appear smaller
     */
    getProjectionScale(flatX, flatY) {
        const flatDist = Math.sqrt(flatX * flatX + flatY * flatY);
        const normalizedDist = Math.min(flatDist / this.flatRadius, 1);

        // The derivative of sin(theta) is cos(theta)
        // Scale factor is cos(angle) - this gives us how much the projection
        // compresses/expands at each point
        const maxTheta = (Math.PI / 2) * this.hemisphereExtent;
        const theta = normalizedDist * maxTheta;
        return Math.cos(theta) * (this.domeRadius / this.flatRadius) / Math.sin(maxTheta);
    }

    /**
     * Pre-calculate hexagon vertices relative to center (0, 0)
     * For flat-top hexagons
     */
    calculateHexVertices() {
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            vertices.push({
                x: this.hexSize * Math.cos(angle),
                y: this.hexSize * Math.sin(angle)
            });
        }
        return vertices;
    }

    /**
     * Convert axial coordinates (q, r) to pixel coordinates
     * Using flat-top hexagon layout
     */
    axialToPixel(q, r) {
        const x = this.hexSize * (3/2 * q);
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        return {
            x: this.centerX + x,
            y: this.centerY + y
        };
    }

    /**
     * Get color for a given cell state
     */
    getColor(state, isMasked = false) {
        let baseColor;

        switch (state) {
            case CellState.EMPTY:
                return this.colors.EMPTY;
            case CellState.BOT_AUTOPOSTER:
                baseColor = this.colors.BOT_AUTOPOSTER;
                break;
            case CellState.BOT_AUTO_AUTOPOSTER:
                baseColor = this.colors.BOT_AUTO_AUTOPOSTER;
                break;
            case CellState.BOT_IMAGE_GENERATOR:
                baseColor = this.colors.BOT_IMAGE_GENERATOR;
                break;
            case CellState.BOT_VIDEO_GENERATOR:
                baseColor = this.colors.BOT_VIDEO_GENERATOR;
                break;
            case CellState.BOT_DEEPFAKE_STUDIO:
                baseColor = this.colors.BOT_DEEPFAKE_STUDIO;
                break;
            case CellState.INFECTED:
                return this.colors.INFECTED;
            case CellState.RECENTLY_INFECTED:
                return this.colors.RECENTLY_INFECTED;
            default:
                return this.colors.EMPTY;
        }

        // If masked, desaturate the color
        if (isMasked) {
            return this.desaturateColor(baseColor, this.colors.MASKED_TINT);
        }

        return baseColor;
    }

    /**
     * Desaturate a hex color by a given factor
     */
    desaturateColor(hex, factor) {
        // Parse hex color
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // Convert to grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Interpolate between original and grayscale
        const newR = Math.round(r + (gray - r) * factor);
        const newG = Math.round(g + (gray - g) * factor);
        const newB = Math.round(b + (gray - b) * factor);

        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Draw a single hexagon at the given center position (flat mode)
     */
    drawHexagonFlat(ctx, centerX, centerY, color) {
        ctx.fillStyle = color;
        ctx.beginPath();

        for (let i = 0; i < this.hexVertices.length; i++) {
            const vertex = this.hexVertices[i];
            const x = centerX + vertex.x;
            const y = centerY + vertex.y;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();

        // Add a subtle border for better visibility
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    /**
     * Draw a single hexagon with hemisphere projection
     * flatCenterX, flatCenterY are in flat grid space (relative to grid center)
     */
    drawHexagonHemisphere(ctx, flatCenterX, flatCenterY, color) {
        ctx.fillStyle = color;
        ctx.beginPath();

        for (let i = 0; i < 6; i++) {
            // Calculate vertex position in flat space
            const angle = (Math.PI / 3) * i;
            const flatVertexX = flatCenterX + this.hexSize * Math.cos(angle);
            const flatVertexY = flatCenterY + this.hexSize * Math.sin(angle);

            // Project the vertex onto the hemisphere
            const projected = this.projectToHemisphere(flatVertexX, flatVertexY);

            // Convert to screen coordinates
            const x = this.centerX + projected.x;
            const y = this.centerY + projected.y;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();

        // Add a subtle border for better visibility
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    /**
     * Render the entire hex grid
     */
    render() {
        const ctx = this.offscreenCtx;

        // Fill background
        ctx.fillStyle = this.colors.BACKGROUND;
        ctx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

        // Draw each cell as a hexagon
        for (const coord of this.simulation.cellCoords) {
            const { q, r } = coord;
            const state = this.simulation.getCellState(q, r);
            const isMasked = this.simulation.isCellMasked(q, r);
            const color = this.getColor(state, isMasked);

            if (this.hemisphereMode) {
                // Calculate flat grid position (relative to center)
                const flatX = this.hexSize * (3/2 * q);
                const flatY = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);

                // Draw the hexagon with hemisphere projection
                this.drawHexagonHemisphere(ctx, flatX, flatY, color);
            } else {
                // Calculate hexagon center position (flat mode)
                const { x, y } = this.axialToPixel(q, r);

                // Draw the hexagon
                this.drawHexagonFlat(ctx, x, y, color);
            }
        }

        // Copy offscreen canvas to visible canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    /**
     * Start continuous rendering loop (for smooth animation)
     */
    startRendering() {
        const renderLoop = (timestamp) => {
            this.render();
            this.animationId = requestAnimationFrame(renderLoop);
        };

        this.animationId = requestAnimationFrame(renderLoop);
    }

    /**
     * Stop continuous rendering
     */
    stopRendering() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.lastRenderTime = 0;
        }
    }

    /**
     * Render a single frame (called after each simulation step)
     */
    renderFrame() {
        this.render();
    }

    /**
     * Resize canvas and recalculate hex dimensions
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;

        this.calculateHexDimensions();
        this.hexVertices = this.calculateHexVertices();

        this.render();
    }

    /**
     * Update renderer when simulation grid size changes
     */
    updateGridSize() {
        this.calculateHexDimensions();
        this.hexVertices = this.calculateHexVertices();
    }
}
