<objective>
Implement a hex-grid visualization system for the AI Clicker game that activates when the player accumulates 1,000+ total bots. This system replaces the bubble/icon bot display with a hexagonal grid where bots are represented as colored hexes. The infection/detection mechanic changes to spread spatially across adjacent hexes, similar to a forest fire simulation.

The existing bubble view should continue to work below 1,000 bots. The hex grid appears and takes over the play area only after reaching 1,000 total bots.
</objective>

<context>
Read and understand these files before implementing:

**Game files:**
- `@ai-clicker/game.js` - Core game logic, gameState object, upgrade system, current bot management
- `@ai-clicker/index.html` - Game layout structure
- `@ai-clicker/style.css` - Current styling

**Reference implementation (forest fire simulation):**
- `@src/simulation.js` - Hex grid simulation engine using axial coordinates, cell states, neighbor detection, update loop
- `@src/renderer.js` - Hex grid rendering with canvas, pixel-to-axial conversion, color mapping

The forest fire simulation provides the architectural pattern to follow:
- Axial coordinate system for hex positioning
- Double-buffered state updates (cells → nextCells)
- Neighbor detection for spread mechanics
- Canvas-based hex rendering with pre-calculated vertices
</context>

<requirements>
## Core Hex Grid System

1. **Grid Size Calculation**
   - Number of rings = floor(sqrt(totalBots))
   - Maximum rings = 64
   - Total cells formula: 1 + 3 × rings × (rings + 1)
   - Grid grows dynamically as bots increase, adding rings when needed

2. **Bot Types (Cell States)**
   Define these cell states with distinct colors:
   - `EMPTY` (0): Gray/brown - no bot, dead hex
   - `BOT_AUTOPOSTER` (1): Green - AutoPoster bot
   - `BOT_AUTO_AUTOPOSTER` (2): Red/Maroon - Auto-AutoPoster bot
   - `BOT_IMAGE_GENERATOR` (3): Blue - Image Generator bot
   - `BOT_VIDEO_GENERATOR` (4): Purple - Video Generator bot
   - `INFECTED` (5): Orange-red - actively infected, will die
   - `RECENTLY_INFECTED` (6): Lighter orange - visual transition before becoming empty

   For masked bots, use desaturated/grayed versions of each bot color.

3. **Bot Placement**
   - When new bots are created (purchased or auto-generated), place them on random unoccupied hexes
   - If grid is full, bots still count in gameState but aren't visualized (grid capped at 64 rings)
   - Map bot counts from gameState to hex cells:
     - `autoPosters` → BOT_AUTOPOSTER
     - `autoAutoPosters` → BOT_AUTO_AUTOPOSTER
     - `imagePosters` → BOT_IMAGE_GENERATOR
     - `videoPosters` → BOT_VIDEO_GENERATOR

## Infection/Detection Mechanics

4. **Infection Trigger**
   - At 100+ posts/second, detection activates
   - Each unmasked bot has a 1% chance per second of becoming infected
   - This replaces the current AutoBuster percentage-based destruction

5. **Infection Spread**
   - When a bot is INFECTED, on the next simulation step:
     - All adjacent (6 neighbors) NON-MASKED bots become INFECTED
     - Masked bots require 2+ adjacent infected cells to become infected
   - INFECTED bots become RECENTLY_INFECTED on the next step
   - RECENTLY_INFECTED bots become EMPTY on the following step
   - When a bot dies (becomes EMPTY), decrement the corresponding gameState counter

6. **Mask System (Simplified)**
   - Remove timer-based mask duration
   - Masked bots are visually distinct (grayed color)
   - Masked bots require 2+ adjacent infected neighbors to become infected (instead of 1)
   - Track which hex cells have masks applied

## View Transition

7. **Dual View System**
   - Below 1,000 total bots: Show existing bubble/icon visualization
   - At 1,000+ total bots: Switch to hex grid view
   - The transition should be clean - hide bubble view, show hex canvas
   - Consider a brief visual transition effect

## Integration Points

8. **Game Loop Integration**
   - The hex simulation update should run on each game tick (with appropriate delta time handling)
   - Sync hex grid state with gameState bot counts
   - When gameState.autoPosters changes (from purchases, auto-generation, or death), reflect in hex grid

9. **Canvas Placement**
   - The hex grid canvas should replace/overlay the current bot display area
   - Size appropriately for the game layout
   - Handle responsive sizing for mobile
</requirements>

<implementation>
## File Structure

Create these new files:
- `./ai-clicker/hexGrid.js` - Hex grid simulation engine (based on src/simulation.js pattern)
- `./ai-clicker/hexRenderer.js` - Canvas rendering for hex grid (based on src/renderer.js pattern)

Modify these existing files:
- `./ai-clicker/game.js` - Add hex grid integration, view switching logic
- `./ai-clicker/index.html` - Add hex grid canvas element
- `./ai-clicker/style.css` - Styling for hex grid container

## Key Adaptations from Forest Fire Code

The forest fire simulation uses:
- `TREE` → `BURNING` → `RECENTLY_BURNED` → `EMPTY`

Adapt to:
- `BOT_*` → `INFECTED` → `RECENTLY_INFECTED` → `EMPTY`

Key differences:
- Multiple bot types (not just one tree type)
- No regrowth - dead hexes stay empty unless new bots are placed
- Infection starts probabilistically (1%/sec at 100+ posts/sec), not from clicks
- Masks provide resistance (need 2 neighbors instead of 1)

## State Synchronization

The hex grid maintains its own cell state Map, but must stay synchronized with gameState:
- On bot purchase: add new bot to random empty hex
- On auto-generation (Auto-AutoPosters): add new bots to random empty hexes
- On death: decrement gameState counter, cell becomes EMPTY
- On grid growth: redistribute bots to new larger grid or just add new ring

## Avoid These Pitfalls

- Don't duplicate bot counting - the hex grid is a visualization of gameState, not a separate count
- Don't break existing mechanics that work below 1,000 bots
- Don't create memory leaks with the canvas animation loop
- Keep the simulation step interval reasonable (100ms like forest fire, or tied to game tick)
</implementation>

<verification>
Before declaring complete, verify:

1. **View Transition**
   - Game starts with bubble view
   - At exactly 1,000 bots, hex grid appears
   - Falling below 1,000 bots (from infection deaths) returns to bubble view

2. **Grid Sizing**
   - At 1,000 bots: floor(sqrt(1000)) = 31 rings
   - Grid grows as bots increase
   - Grid caps at 64 rings maximum

3. **Infection Mechanics**
   - At <100 posts/sec: no infection
   - At 100+ posts/sec: random bots get infected
   - Infected spreads to all unmasked neighbors
   - Masked bots only infected with 2+ infected neighbors
   - Dead bots reduce gameState counts

4. **Bot Type Colors**
   - Each bot type has distinct color
   - Masked versions are visually grayed
   - Infected/recently infected have fire colors

5. **No Regressions**
   - Bubble view still works normally under 1,000 bots
   - All existing game mechanics function
   - Save/load works with hex grid state
</verification>

<success_criteria>
- Hex grid appears at 1,000+ total bots
- Grid size = floor(sqrt(totalBots)) rings, max 64
- All bot types displayed as distinct colored hexes
- Infection spreads spatially to adjacent unmasked bots
- Masked bots require 2 infected neighbors to catch infection
- Dead bots permanently reduce gameState counts
- Clean visual transition between bubble and hex views
- Performance remains smooth with large grids (up to 64 rings = ~12,000 cells)
</success_criteria>
</content>
</invoke>