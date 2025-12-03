<objective>
Create "AI Clicker" (or similar title) - a browser-based incremental clicker game that tells a dystopian story about how AI-generated content pollutes social media, degrades the information ecosystem, and ultimately corrupts both human and artificial intelligence.

This is a story-focused experience that uses the addictive incremental game mechanics as a vehicle for narrative delivery. The game should feel colorful and retro while delivering an increasingly dark and absurdist commentary on AI content proliferation.

Include as many creative dystopian elements as possible. Go beyond the basic mechanics to create a fully-realized narrative experience with 10-15 progression stages.
</objective>

<context>
The game will run primarily in the browser with minimal server-side resources.  The game is insipred by the game Universal Papercilps -the code for which can be found here. https://github.com/jgmize/paperclips.  The development of this game can closely mirror that one.

Players should be able to:
- Click to 'generate AI content' (posts, images, videos)
- Purchase automated systems (bots, masks, engagement farms)
- Watch as their actions degrade the value of online content
- Progress through a narrative arc showing the cascading collapse of the information ecosystem

Keep in mind that no AI content is actually being generated for the user -when they 'click' they get a 'point' or dollar added to their score.  Likewise, the automated systems also are a method for generating point per second.  (You can add humorous pretend AI generated stuff from time to time, like one a minute, if it would add to the humour of the story telling.)

The user has provided initial mechanics as examples, but you should thoroughly consider the narrative arc and create specific, creative progression stages that enhance the dystopian storytelling.

Technology choice: Select the stack that best balances performance, animation capabilities, and ease of implementation for a browser game with no server dependencies. Vanilla HTML/CSS/JS is recommended for simplicity and zero build dependencies.
</context>

<requirements>

**Core Game Mechanics:**
1. Click-based earning system (initial: $1 per click for posting AI tweets)
2. Automated earning systems (AutoPosters that earn $1/second each)
3. Counter-measures and evasion (AutoBusters vs Masks/Automaskers)
4. Dynamic market pricing based on content volume: `marketValue = 500,000,000 / (500,000,000 + postsPerSecond)`
5. Multiple content types with separate progression paths (tweets → images → videos → ?)
6. Score inflation into ridiculously large numbers (millions, billions, trillions)
7. LocalStorage-based save system (auto-save every few seconds)

**Narrative Progression (10-15 stages):**
Design a complete story arc that explores:
- Stage 1-3: Initial "gold rush" of AI content creation (feels profitable and harmless)
- Stage 4-6: Platform countermeasures and arms race (AutoBusters, detection, masks)
- Stage 7-9: Market saturation and value collapse (engagement farming, click farms)
- Stage 10-12: Information ecosystem degradation (human confusion, trust collapse)
- Stage 13-15: Terminal stages (AI training on AI slop, reality breakdown, absurdist endgame)

Be creative with naming, flavor text, and dystopian details. Each unlock should advance the narrative.

**Visual Design:**
- Colorful, retro aesthetic (think 80s/90s bright colors, pixel art or bold geometric shapes)
- Animations for key events (bots being busted, upgrades activating, market crashes)
- Visual feedback for clicking and automation
- Stats display showing: money, posts/second by type, market values, current stage
- Consider particle effects, screen shake, color shifts as the dystopia deepens

**Example Progression Elements (expand creatively):**
- Click to Post AI Tweet → AutoPoster bots → AutoBusters (bust 1% per second at 100+ posts/sec)
- Mask system (manual then automated) to evade detection
- Auto-AutoPosters that spawn new AutoPosters
- Content type evolution: tweets → image posts → video posts → deepfakes? → ?
- Engagement systems: fake clicks, bot networks, astroturfing campaigns
- Meta-progression: Platform Trust Scores, Human Attention Span metrics, Reality Coherence index
- Late-game absurdist elements: AI training on synthetic data, recursive quality collapse, the Singularity-but-stupid

**UI/UX Requirements:**
- Large clickable central area (the "post" button)
- Left sidebar: Available upgrades/purchases (grayed out if unaffordable)
- Right sidebar: Statistics, rates, market values
- Bottom ticker: Narrative flavor text that updates with story progression
- Visual representation of automation (show active bots, animations for their actions)
- Number formatting for large values (1.2M, 3.4B, 5.6T, etc.)

**Technical Requirements:**
- Single HTML file with embedded CSS and JavaScript (or separate files if cleaner)
- No external dependencies or build process required
- LocalStorage save/load (auto-save every 5 seconds)
- Game loop running at 60fps for smooth animations
- Efficient calculation of compound automation (don't iterate thousands of bots individually)
- Export/reset save functionality
</requirements>

<implementation>

**Narrative Design:**
Thoroughly consider the dystopian arc. Each stage should have:
- A thematic name (e.g., "The Gold Rush", "The Bot Wars", "The Engagement Apocalypse", "The Coherence Collapse")
- Unlocked upgrades that advance the story
- Flavor text that appears in the UI describing what's happening to the world
- Visual changes (color shifts, UI degradation, chaos increasing)

**Progression Balance:**
- Early game: Clicks feel meaningful, first AutoPoster at $25 feels like an achievement
- Mid game: Automation snowballs, exponential growth kicks in, numbers get big fast
- Late game: Meta-commentary emerges, absurdist elements, philosophical implications
- Design costs and unlock thresholds that create satisfying "aha!" moments

**Creative Freedom:**
Go beyond the provided examples. Consider:
- What happens when AI content exceeds human content 1000:1?
- What new content types emerge? (AI-generated "experiences"? "Memories"? "Emotions"?)
- How do platforms evolve? (Authenticity scores? Human verification costs?)
- What's the endgame? (Heat death of meaning? A "reset" option that's narratively justified?)
- Can you include dark humor and satire without being preachy?

**Code Structure:**
- Game state object with all variables
- Clear separation: game logic, rendering, UI updates, save/load
- Efficient game loop using requestAnimationFrame
- Event-driven upgrade purchases
- Make it easy to add new upgrades/stages by using data-driven configuration

**Why These Constraints:**
- Single file / no build: Ensures anyone can run it by opening index.html
- LocalStorage: Persistence without server complexity
- Efficient calculations: Large numbers and many automated systems can kill performance
- Visual feedback: Incremental games are addictive because of juice and feedback
</implementation>

<output>
Create a complete, playable game:
- `./ai-clicker/index.html` - The complete game (or split into separate files if cleaner)
- `./ai-clicker/style.css` - Styling (if separated)
- `./ai-clicker/game.js` - Game logic (if separated)
- `./ai-clicker/README.md` - How to play, narrative summary, technical notes

The game should be immediately playable by opening index.html in any modern browser.
</output>

<verification>
Before declaring complete, verify:
- [ ] Game runs in browser without errors
- [ ] Click mechanics work and feel responsive
- [ ] At least 10 upgrade types with clear progression
- [ ] Market value formula correctly decreases with volume
- [ ] LocalStorage save/load works (test by refreshing page)
- [ ] Numbers display correctly even at large values (millions/billions)
- [ ] Automation systems calculate efficiently (no lag with hundreds of bots)
- [ ] Narrative progression is clear through flavor text
- [ ] Visual design is colorful and retro
- [ ] At least one animation (e.g., bots being busted) works
- [ ] The dystopian story arc is complete and impactful

Test by playing through at least 5-7 stages to ensure progression feels good.
</verification>

<success_criteria>
- A fully playable incremental clicker game that runs in the browser
- 10-15 distinct progression stages with narrative coherence
- Colorful, retro visual design with animations
- Core mechanics: clicking, automation, market dynamics, countermeasures
- Dystopian narrative that escalates from "harmless AI posts" to "information apocalypse"
- Save system that persists across sessions
- Creative, darkly humorous take on AI content pollution
- Code is readable and extensible for future additions
- Game is genuinely fun to play while delivering its message
</success_criteria>

<narrative_inspiration>
Consider these dystopian beats for your story (expand creatively):
- The realization that quantity beats quality in algorithmic feeds
- The arms race between detection and evasion
- The moment when "authentic" content becomes more expensive than AI slop
- Human creators giving up because they can't compete
- Platforms collapsing under bot traffic
- AI models training on AI-generated content (the "Habsburg AI" problem)
- The death of shared reality and common knowledge
- The commodification of attention itself
- An absurdist endgame that comments on the futility of infinite growth
- Perhaps a bittersweet or darkly ironic conclusion?

Make the player feel complicit in the collapse. The addictive game mechanics should mirror the addictive growth-at-all-costs mentality that creates these problems in reality.
</narrative_inspiration>
