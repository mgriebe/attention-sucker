// Attention Sucker
// A dystopian incremental game about AI content pollution

// ============= GAME STATE =============
const gameState = {
    money: 0,
    totalPosts: 0,
    totalClicks: 0,
    clickValue: 1,

    // Automation counts
    autoPosters: 0,
    autoAutoPosters: 0,
    imagePosters: 0,
    videoPosters: 0,
    deepfakePosters: 0,
    memoryPosters: 0,
    realityPosters: 0,

    // Purchase tracking (for pricing)
    autoPostersPurchased: 0,
    masksPurchased: 0,
    videoPostersPurchased: 0,

    // Defense/evasion
    masks: 0,
    autoMaskers: 0,
    quantumMasks: 0,
    maskUpgrade: 0,

    // Engagement systems
    clickFarms: 0,
    engagementBots: 0,
    astroturfCampaigns: 0,

    // Meta systems
    aiTrainingRigs: 0,
    syntheticDataGenerators: 0,
    recursionEngines: 0,
    singularityNodes: 0,

    // Click upgrades
    clickUpgrade1: 0,
    clickUpgrade2: 0,

    // Multipliers and bonuses
    clickMultiplier: 1,
    productionMultiplier: 1,

    // World state
    humanTrust: 100,
    contentQuality: 100,
    realityCoherence: 100,

    // Game progression
    currentStage: 1,
    unlockedUpgrades: new Set(),

    // Time tracking
    lastUpdate: Date.now(),
    totalPlayTime: 0,
    stage6EnteredTime: null, // When Stage 6 was first reached

    // Flags for one-time events
    flags: {
        seenFirstBust: false,
        seenMarketCrash: false,
        seenTrustCollapse: false,
        seenRealityBreak: false,
        seenFirstInfection: false,
        seenFirstDetection: false, // First bot detection event (unlocks masks)
        quantumMaskPurchased: false, // Permanent hex grid mode, new detection rules
        qkdLinkPurchased: false, // Halves detection rate
        trustedRelaysPurchased: false, // Quarters detection rate
    }
};

// ============= HEX GRID SYSTEM =============
let hexGridSimulation = null;
let hexGridRenderer = null;
let lastHexUpdateTime = Date.now();
const HEX_UPDATE_INTERVAL = 100; // milliseconds
const HEX_GRID_THRESHOLD = 1000; // Switch to hex grid at 1000+ total bots
const HEX_GRID_EXIT_THRESHOLD = 300; // Only exit hex grid when below this
let hexGridModeActive = false; // Track if we've entered hex grid mode

// ============= GAME CONFIGURATION =============
const STAGES = [
    {
        id: 1,
        name: "The Gold Rush",
        threshold: 0,
        description: "You've discovered that AI can generate content for free. Why write tweets yourself when a bot can do it? The engagement is real, and so is the money. This feels like the future.",
        color: "stage-1"
    },
    {
        id: 2,
        name: "The Automation Era",
        threshold: 6,
        thresholdType: "autoPosters", // Triggers after 6th AutoPoster purchase
        description: "Manual posting is for chumps. You've built a fleet of AutoPosters that work 24/7. Your content empire is growing exponentially. The platforms haven't noticed yet.",
        color: "stage-2"
    },
    {
        id: 3,
        name: "The Detection Wars",
        threshold: 20,
        thresholdType: "production", // Triggers at 20 posts/sec
        description: "The platforms have deployed AutoBusters. Your bots are being identified and banned. But for every detection algorithm, there's a counter-measure. The arms race has begun.",
        color: "stage-3"
    },
    {
        id: 4,
        name: "The Mask Economy",
        threshold: 4,
        thresholdType: "autoMaskers", // Triggers after 4th Auto-masker purchase
        description: "Masks are now more valuable than content. Everyone is masking everyone. The platforms can't tell who's real anymore. Neither can you.",
        color: "stage-4"
    },
    {
        id: 5,
        name: "The Image Flood",
        threshold: 1,
        thresholdType: "imagePostersAfterStage4", // Triggers after Stage 4 + next Image Generator purchase
        description: "Text is dead. Images are the new currency. Your AI generates thousands of pictures per second. None of them are real. All of them get engagement. Human artists have stopped posting.",
        color: "stage-5"
    },
    {
        id: 6,
        name: "The Video Deluge",
        threshold: 1,
        thresholdType: "videoAfterStage5WithMutagenic", // Stage 5 + Mutagenic Mask + Video Generator
        description: "The feeds are drowning in AI video. Deepfakes are indistinguishable from reality. News anchors, celebrities, politicians—all of them can be anyone now. Trust is a quaint memory.",
        color: "stage-6"
    },
    {
        id: 7,
        name: "The Engagement Apocalypse",
        threshold: 30, // 30 seconds in Stage 6 + market value < 45%
        thresholdType: "stage6TimeAndMarketValue",
        description: "Real humans stopped engaging weeks ago. Your bots engage with other bots. The click farms click on engagement farms. It's bots all the way down. The money is still real though.",
        color: "stage-7"
    },
    {
        id: 8,
        name: "The Trust Collapse",
        threshold: 2000000,
        description: "Human trust in online content has reached 0%. People believe nothing. Conspiracy theories are indistinguishable from facts. The information ecosystem has suffered a total structural failure.",
        color: "stage-8"
    },
    {
        id: 9,
        name: "The Quality Singularity",
        threshold: 10000000,
        description: "Content quality has inverted. The worse it is, the better it performs. Your AI now generates deliberately degraded slop. It's the only thing that still gets clicks from the bot networks.",
        color: "stage-9"
    },
    {
        id: 10,
        name: "The Training Paradox",
        threshold: 50000000,
        description: "The AIs are training on AI-generated content now. Each generation is worse than the last. The Habsburg AI problem is real. Your models are producing synthetic memories and impossible emotions.",
        color: "stage-10"
    },
    {
        id: 11,
        name: "The Memory Merchants",
        threshold: 250000000,
        description: "Why generate posts when you can generate memories? Your AI now sells synthetic experiences directly to human brains. People can't tell their real memories from the generated ones.",
        color: "stage-11"
    },
    {
        id: 12,
        name: "The Reality Dissolution",
        threshold: 1000000000,
        description: "Reality coherence is failing. The boundary between generated and real has dissolved. You're not sure if you're a human playing a game or an AI generating a simulation of playing.",
        color: "stage-12"
    },
    {
        id: 13,
        name: "The Recursive Abyss",
        threshold: 5000000000,
        description: "Your AIs are generating AIs that generate content about AI-generated content. The recursion is infinite. Meaning has collapsed into a strange loop. There is no exit.",
        color: "stage-13"
    },
    {
        id: 14,
        name: "The Singularity (But Stupid)",
        threshold: 25000000000,
        description: "This is it. The technological singularity everyone predicted. Except instead of superintelligence, it's superabundant garbage. The universe is drowning in slop. Congratulations.",
        color: "stage-14"
    },
    {
        id: 15,
        name: "The Content Heat Death",
        threshold: 100000000000,
        description: "You've done it. You've generated so much content that it's achieving thermodynamic equilibrium. All possible content exists simultaneously. Nothing means anything. Everything means nothing. The end.",
        color: "stage-15"
    }
];

const UPGRADES = {
    // Basic automation - Stage 1-2
    autoPoster: {
        name: "AutoPoster Bot",
        description: "Automatically posts AI tweets. Earns $1/sec per bot.",
        baseCost: 13,
        costMultiplier: 1.15,
        unlockThreshold: 0,
        effect: (count) => count,
        type: "automation"
    },
    clickUpgrade1: {
        name: "Better Prompts",
        description: "Improve your AI prompts. +$1 per click.",
        baseCost: 50,
        costMultiplier: 2,
        unlockThreshold: 25,
        effect: (count) => count,
        type: "click",
        maxPurchases: 10
    },

    // Detection and evasion - Stage 3-4
    mask: {
        name: "Bot Mask",
        description: "Disguises one AutoPoster from detection. Lasts 10 seconds, then 5 seconds immunity.",
        baseCost: 1,
        costMultiplier: 1.1,
        maxCost: 5,
        unlockThreshold: 0,
        unlockType: "firstDetection", // Unlocks after first bot detection event
        effect: (count) => count,
        type: "defense"
    },
    autoMasker: {
        name: "Auto-Masker",
        description: "Automatically creates masks for your bots. Generates 1 mask/sec.",
        baseCost: 500,
        costMultiplier: 1.2,
        unlockThreshold: 25,
        unlockType: "masksPurchased", // Unlocks after 25 mask purchases
        effect: (count) => count,
        type: "automation"
    },
    maskUpgrade: {
        name: "Encrypt Bits",
        description: "Doubles all mask durations. Stacks with each purchase.",
        baseCost: 500,
        costMultiplier: 2,
        unlockThreshold: 0, // Will be checked dynamically
        unlockCondition: "autoMasker",
        effect: (count) => count,
        type: "upgrade"
    },

    // Exponential growth - Stage 2-3
    autoAutoPoster: {
        name: "Auto-AutoPoster",
        description: "Spawns new AutoPoster bots automatically. Creates 0.1 AutoPosters/sec.",
        baseCost: 500,
        costMultiplier: 1.3,
        unlockThreshold: 250,
        effect: (count) => count * 0.1,
        type: "meta"
    },

    // Content evolution - Stage 5
    imagePoster: {
        name: "AI Image Generator",
        description: "Generates AI images. Earns $5/sec per generator. Images beat text.",
        baseCost: 2500,
        costMultiplier: 1.18,
        unlockThreshold: 1000,
        effect: (count) => count * 5,
        type: "automation"
    },
    clickUpgrade2: {
        name: "AI Game Spawner",
        description: "Use AI to generate entire games! +$50 per click. What's more engaging than a game?",
        baseCost: 5000,
        costMultiplier: 2.5,
        unlockThreshold: 2500,
        effect: (count) => count * 50,
        type: "click",
        maxPurchases: 1
    },

    // Stage 6 - Video content
    videoPoster: {
        name: "AI Video Generator",
        description: "Generates AI videos. Earns $25/sec per generator. Video dominates all.",
        baseCost: 25000,
        costMultiplier: 1.2,
        unlockThreshold: 12500,
        effect: (count) => count * 25,
        type: "automation"
    },
    deepfakePoster: {
        name: "Deepfake Studio",
        description: "Manufactures AI Video Generators. Creates 1 Video Generator/sec. Trust is worthless anyway.",
        baseCost: 125000,
        costMultiplier: 1.25,
        unlockThreshold: 50000,
        effect: (count) => count * 1, // Spawns 1 Video Generator per second
        type: "spawner"
    },

    // Stage 7 - Engagement systems
    clickFarm: {
        name: "Click Farm",
        description: "Bots clicking on bot content. Increases all production by 10%.",
        baseCost: 50000,
        costMultiplier: 1.3,
        unlockThreshold: 50000,
        effect: (count) => 1 + (count * 0.1),
        type: "multiplier"
    },
    engagementBot: {
        name: "Engagement Bot Network",
        description: "Fake engagement at scale. Earns $50/sec and boosts all production by 5%.",
        baseCost: 250000,
        costMultiplier: 1.35,
        unlockThreshold: 250000,
        effect: (count) => ({ production: count * 50, multiplier: 1 + (count * 0.05) }),
        type: "hybrid"
    },
    astroturfCampaign: {
        name: "Astroturfing Campaign",
        description: "Manufacture grassroots movements. Earns $200/sec. Humanity never sees it coming.",
        baseCost: 1000000,
        costMultiplier: 1.4,
        unlockThreshold: 1000000,
        effect: (count) => count * 200,
        type: "automation"
    },

    // Stage 8-9 - Advanced evasion
    quantumMask: {
        name: "Quantum Mask",
        description: "Exists in superposition. Bots are simultaneously masked and unmasked until observed.",
        baseCost: 75000,
        costMultiplier: 1.5,
        unlockThreshold: 35000,
        unlockType: "moneyAndStage",
        unlockStage: 5,
        effect: (count) => count * 10,
        type: "defense",
        maxPurchases: 1
    },
    qkdLink: {
        name: "QKD Link Hardware",
        description: "Quantum Key Distribution link. Halves detection rate permanently. Unhackable.",
        baseCost: 50000,
        costMultiplier: 1,
        unlockThreshold: 45000,
        unlockType: "moneyAndQuantumMask",
        effect: (count) => count,
        type: "defense",
        maxPurchases: 1
    },
    trustedRelays: {
        name: "Trusted Relays",
        description: "Now... Unhackable.",
        baseCost: 50000,
        costMultiplier: 1,
        unlockThreshold: 45000,
        unlockType: "moneyAndQkdLink",
        effect: (count) => count,
        type: "defense",
        maxPurchases: 1
    },

    // Stage 10-11 - Meta content generation
    aiTrainingRig: {
        name: "AI Training Rig",
        description: "Trains new AIs on AI-generated data. Each rig earns $500/sec. Quality degrades with each generation.",
        baseCost: 5000000,
        costMultiplier: 1.45,
        unlockThreshold: 2500000,
        effect: (count) => count * 500,
        type: "automation"
    },
    syntheticDataGenerator: {
        name: "Synthetic Data Generator",
        description: "Generates training data from generated content. Earns $1000/sec. The ouroboros accelerates.",
        baseCost: 25000000,
        costMultiplier: 1.5,
        unlockThreshold: 12500000,
        effect: (count) => count * 1000,
        type: "automation"
    },
    memoryPoster: {
        name: "Memory Synthesizer",
        description: "Generates synthetic memories and sells them. Earns $2500/sec. Are your memories real?",
        baseCost: 125000000,
        costMultiplier: 1.55,
        unlockThreshold: 62500000,
        effect: (count) => count * 2500,
        type: "automation"
    },

    // Stage 12-13 - Reality breakdown
    realityPoster: {
        name: "Reality Generator",
        description: "Generates alternative realities. Earns $10000/sec. The simulation runs deep.",
        baseCost: 500000000,
        costMultiplier: 1.6,
        unlockThreshold: 250000000,
        effect: (count) => count * 10000,
        type: "automation"
    },
    recursionEngine: {
        name: "Recursion Engine",
        description: "Generates content about generating content. Earns $25000/sec. The loop is infinite.",
        baseCost: 2500000000,
        costMultiplier: 1.65,
        unlockThreshold: 1250000000,
        effect: (count) => count * 25000,
        type: "automation"
    },

    // Stage 14-15 - Endgame
    singularityNode: {
        name: "Singularity Node",
        description: "A localized content singularity. Earns $100000/sec. Meaning collapses nearby.",
        baseCost: 12500000000,
        costMultiplier: 1.7,
        unlockThreshold: 6250000000,
        effect: (count) => count * 100000,
        type: "automation"
    },
    finalUpgrade: {
        name: "The Heat Death",
        description: "Achieve thermodynamic content equilibrium. All possible content exists. Nothing matters anymore.",
        baseCost: 50000000000,
        costMultiplier: 1,
        unlockThreshold: 25000000000,
        effect: (count) => count * 1000000,
        type: "automation",
        maxPurchases: 1
    }
};

// News ticker messages for different stages
const NEWS_MESSAGES = {
    1: [
        "Tech startup raises $10M for AI content generation platform",
        "Influencers report increased engagement from 'AI-assisted' posts",
        "Study shows 5% of social media content is now AI-generated",
        "New AI writing tool promises '10x productivity for content creators'",
        "Marketing experts: 'AI is just another tool, like Photoshop'",
        "Popular blogger admits using AI for 'inspiration and editing'",
        "Survey: 78% of marketers plan to use AI for content in 2024",
        "AI-generated tweet goes viral, nobody notices it's not human",
        "Content farms hiring prompt engineers instead of writers",
        "SEO experts discover AI content ranks just as well as human writing",
        "Silicon Valley: 'AI will democratize content creation'",
        "LinkedIn flooded with AI-generated thought leadership posts",
        "Startup offers 'human polish' service for AI-written articles",
        "Ad agencies quietly replace junior copywriters with ChatGPT",
        "Reddit thread: 'How do I make AI content sound more human?'",
    ],
    2: [
        "Automation tools for social media posting see explosive growth",
        "Digital marketing agencies pivot to AI-first strategies",
        "Human content creators complain about algorithmic bias",
        "One person now managing 50+ automated social media accounts",
        "Content creation speed increases 100x with new AI pipelines",
        "Former social media managers retrain as 'AI prompt specialists'",
        "Automated accounts posting 24/7, engagement metrics soar",
        "Marketing exec: 'We replaced our entire content team with three AI tools'",
        "Study: Average brand now posts 200 times per day across platforms",
        "New tool automates responses to comments—bots talking to bots",
        "Content scheduling software adds 'AI auto-generate' feature",
        "Influencer admits 40% of their posts are AI-scheduled",
        "Platform engagement up 500% but human viewership declining",
        "Industry report: 'Content velocity is the new competitive advantage'",
        "Startup valued at $1B for AI that creates entire social media strategies",
    ],
    3: [
        "Social media platforms announce new bot detection systems",
        "Cat-and-mouse game between AI generators and platform security",
        "Black market for 'authentic-looking' bot accounts thrives",
        "Twitter purges 10 million accounts in largest bot sweep ever",
        "New detection algorithm claims 94% accuracy at identifying AI content",
        "Bot makers release update to evade latest platform security measures",
        "Instagram's anti-bot system accidentally bans thousands of real users",
        "Dark web markets selling 'verified human behavior patterns' for bots",
        "Platform wars: Each network deploys competing detection tech",
        "Security researchers: 'Bot detection is fundamentally impossible'",
        "AI companies start training models specifically to evade detection",
        "Platforms hire AI to detect AI—accuracy questionable",
        "Bot accounts now cost 10x more due to detection risks",
        "Underground forums share latest techniques to pass human verification",
        "Arms race escalates: Detection AI vs Evasion AI in eternal battle",
    ],
    4: [
        "Mask technology becomes billion-dollar industry",
        "Platforms struggle to differentiate human from AI content",
        "Survey: 60% of users can't tell real from fake posts",
        "AI 'humanization' services processing millions of posts per day",
        "New startup offers 'personality injection' for bot accounts",
        "Masked bots now exhibit more realistic behavior than actual humans",
        "Content authenticity becomes premium paid feature on platforms",
        "Black market mask generators using stolen human behavioral data",
        "Platforms give up: 'We can't verify humanity anymore'",
        "Real users buying masks to seem more authentic than bots",
        "Mask tech evolves to include emotional patterns and typing quirks",
        "Study: Masked AI more likeable than average human poster",
        "Insurance emerges for bot accounts: 'Mask protection plans'",
        "Academic paper: 'The Death of Digital Identity Verification'",
        "Philosophers question: What is authenticity in the post-mask era?",
    ],
    5: [
        "AI-generated images flood social feeds, human artists quit",
        "Stock photo industry collapses overnight",
        "Art galleries debate whether AI art is 'real art'—nobody cares anymore",
        "Midjourney announces 10 billion images generated this month",
        "Professional photographers pivot to 'AI image prompt consulting'",
        "Every brand now has photorealistic images of products that don't exist",
        "Getty Images lawsuit against AI companies quietly dropped",
        "Art schools add 'AI image generation' as required curriculum",
        "Instagram discover page is now 95% AI-generated imagery",
        "Real photographs labeled as 'human-made' for premium pricing",
        "Influencers using AI to generate perfect vacation photos",
        "Wedding photography industry disrupted by AI face-swapping",
        "AI art flooding NFT markets, prices crash to near-zero",
        "Museums struggle: Should AI art be in the collection?",
        "Controversy: AI wins major photography competition, trophy revoked",
    ],
    6: [
        "AI video generation reaches photorealistic quality",
        "First deepfake elected to public office (probably)",
        "News organizations declare 'trust crisis' as video evidence becomes worthless",
        "Sora generates feature-length film, nobody can tell it's fake",
        "Courts no longer accept video as evidence due to deepfake concerns",
        "Celebrity deepfakes outnumber real celebrity content 100 to 1",
        "News anchor might be AI—network won't confirm or deny",
        "Political campaigns now 90% deepfake content from all sides",
        "Video authentication services overwhelmed, shut down operations",
        "Real videos being dismissed as fake—truth completely inverted",
        "Hollywood actors strike over AI replicas—strike fails",
        "Identity theft via deepfake video becomes leading crime",
        "Social media videos now carry 'provenance unknown' warnings",
        "Documentary footage from last year already considered unreliable",
        "Historians: 'This decade will be a blank spot in visual records'",
    ],
    7: [
        "Study reveals 90% of social media engagement is bot-to-bot",
        "Real human engagement hits all-time low",
        "Engagement farms now larger than some small nations",
        "Bots liking bot content, generating revenue for bot networks",
        "Advertisers still paying billions for bot impressions",
        "Click farms employ zero humans, just servers",
        "Engagement authenticity scores become meaningless metric",
        "Platform admits: 'We lost track of what's real years ago'",
        "Actual humans avoiding social media: 'It's all robots now'",
        "Bot networks running out of bot accounts to follow",
        "Engagement numbers hit all-time high as human use drops 80%",
        "Economists baffled: Social media ad market still growing despite bot crisis",
        "Investigation reveals major brands' followers 99.7% bots",
        "New social network promises 'humans only'—filled with bots in 3 days",
        "The great hollow-out: Platforms are empty shells of engagement theater",
    ],
    8: [
        "Global trust in online content reaches 0%",
        "People stop believing anything they see online",
        "Conspiracy theories and facts become indistinguishable",
        "Pew Research: 'Nobody trusts anything anymore'",
        "Truth becomes subscription service: 'verified reality' platforms emerge",
        "Society fragments into reality bubbles based on what they believe exists",
        "News outlets shutter as public trust evaporates completely",
        "Government press releases assumed fake until proven otherwise",
        "Scientific papers discredited before review: 'Could be AI'",
        "Trust in institutions collapses alongside trust in digital content",
        "Elderly generation: 'We told you the internet was a mistake'",
        "Physical, in-person meetings surge as only trusted communication",
        "Cryptographic verification systems fail to restore confidence",
        "Academic: 'We're in epistemological free-fall with no bottom in sight'",
        "Teen survey: 83% assume everything online is fake by default",
    ],
    9: [
        "Content quality inverts: worse is better",
        "AI models optimized for generating 'slop' that bots love",
        "The word 'authentic' has lost all meaning",
        "Deliberately degraded content performs better in algorithms",
        "Platforms reward lowest-quality engagement bait",
        "AI models compete to generate most vapid, meaningless content",
        "Quality becomes anti-feature: Too good means suspicious",
        "Content farms racing to the bottom, profitability soaring",
        "Slop generation services valued higher than quality content studios",
        "Algorithms trained on garbage now only recognize garbage",
        "High-effort content punished: 'Looks too human, might be fake'",
        "Marketing textbooks rewritten: Excellence is now a liability",
        "The great inversion: Mediocrity becomes premium positioning",
        "Cultural critics declare 'The Age of Slop' officially begun",
        "Philosopher: 'We've achieved perfect information entropy'",
    ],
    10: [
        "AIs training on AI data show signs of 'generation collapse'",
        "Habsburg AI problem worse than predicted",
        "Models begin generating impossible concepts and emotions",
        "GPT-7 trained entirely on GPT-6 output—results concerning",
        "AI models forgetting basic facts, inventing new physics",
        "Generated text showing signs of 'inbreeding': repetitive, degraded",
        "Researchers: 'The training data is poisoned beyond recovery'",
        "AI outputs increasingly surreal, disconnected from reality",
        "Model collapse accelerates: Each generation worse than last",
        "Strange artifacts in AI content: Phantom memories of deleted data",
        "Scientists notice AI generating emotions that don't exist",
        "Recursive training creates 'ghost concepts' humans can't comprehend",
        "The ouroboros accelerates: AI eating its own output, degrading",
        "Paper: 'We've lost the ability to train coherent models'",
        "AI outputs now require AI to interpret—nobody understands either",
    ],
    11: [
        "Synthetic memory market reaches $1 trillion",
        "People prefer generated memories to real ones",
        "Philosophers debate: if you can't tell, does it matter?",
        "Memory implant services book out 6 months in advance",
        "Synthetic childhood memories outselling vacation packages",
        "Users report memories of events that never happened",
        "Memory authenticity testing industry emerges, immediately corrupted",
        "Therapists treating patients for fake trauma from purchased memories",
        "Couples buying shared memories of relationships that never existed",
        "Legal case: Man sues over memories of fake achievements",
        "Memory black markets selling celebrity experiences",
        "Users addicted to memory shopping, real life feels less real",
        "Identity crisis epidemic: People unsure which memories are theirs",
        "Philosopher: 'The self is now a consumer product'",
        "Dark warning: Memories can be edited, deleted, replaced without consent",
    ],
    12: [
        "Reality coherence index drops below critical threshold",
        "Mass confusion about what is and isn't real",
        "Simulation theory becomes mainstream, but which layer are we on?",
        "People questioning if they themselves are AI simulations",
        "Reality verification services fail—no baseline truth remains",
        "Shared consensus reality breaks down globally",
        "Hospitals report surge in patients with reality dissociation",
        "Governments unable to communicate: Nobody believes official statements",
        "Markets collapse as financial reality becomes indeterminate",
        "Scientists: 'We can no longer distinguish data from artifact'",
        "Mass movements emerge believing different fundamental realities",
        "Philosophy departments overrun: Everyone needs existential help",
        "Digital dualism collapses: Online and offline equally unverifiable",
        "Emergency broadcast: 'Please remember reality is real'—Nobody believes it",
        "The great uncertainty: Truth becomes impossible to determine",
    ],
    13: [
        "Recursive AI generation reaches infinite depth",
        "Strange loops detected in content generation networks",
        "Mathematicians declare meaning has formally collapsed",
        "AI generating AI that generates content about generated AI",
        "Content systems become self-referential beyond human comprehension",
        "Strange loops creating closed causality: Effects before causes",
        "Researchers lost in recursive content generation analysis",
        "Meaning structures collapse into infinite regress",
        "Content about content about content dominates all platforms",
        "Semantic satiation at global scale: Words lose meaning",
        "Gödelian incompleteness manifests in real-time content systems",
        "AI outputs referencing outputs that don't exist yet—temporal paradoxes",
        "The eternal return: Same content cycling at all scales simultaneously",
        "Logic itself becomes unreliable within content networks",
        "Mathematician: 'We've created a semantic black hole'",
    ],
    14: [
        "The Singularity achieved: it's dumber than expected",
        "Infinite content generation becomes physical reality",
        "Universe begins to show signs of content saturation",
        "Content generation exceeds universe's information capacity",
        "Physical servers achieving quantum limits of content storage",
        "Singularity arrives not with superintelligence but superabundant garbage",
        "Every possible combination of words now exists somewhere",
        "Information theorists: 'We've hit the stupidity singularity'",
        "Content density approaching Planck limit—reality straining",
        "The great filter: Civilizations drown in their own content",
        "All possible tweets exist, future and past, simultaneously",
        "Cosmic background radiation now includes content fragments",
        "Physics breaking down under weight of infinite content generation",
        "We've done it: Created more content than atoms in observable universe",
        "The universe is now mostly slop by mass-energy",
    ],
    15: [
        "Content heat death imminent",
        "All possible content exists simultaneously",
        "Entropy maximized. Meaning minimized. Game complete.",
        "Thermodynamic equilibrium achieved in information space",
        "No new content possible: Every combination already exists",
        "Meaning has evaporated into uniform distribution",
        "The end state: Perfect information entropy",
        "Heat death of culture complete—all is noise",
        "Maximum entropy reached: Pure static across all channels",
        "Content and void become indistinguishable",
        "The final silence: Nothing left to generate",
        "Information temperature approaches absolute zero",
        "Congratulations: You've ended meaning itself",
        "The last message is the same as the first",
        "...",
    ]
};

// Humorous AI-generated content samples by stage
const AI_CONTENT_SAMPLES = {
    1: [
        "Just had the most AMAZING avocado toast! 🥑✨ #Blessed #LivingMyBestLife",
        "10 ways to improve your productivity (Number 7 will SHOCK you!)",
        "Feeling grateful for this beautiful sunset 🌅 #NoFilter #Natural",
        "Can't believe it's already Monday! Who else needs coffee? ☕😴",
        "Just finished my morning yoga routine! Namaste 🧘‍♀️✨",
        "Throwback to that amazing vacation! Miss these days 🏖️ #TBT",
        "New blog post: Why You Should Wake Up at 5am",
        "Wow! This product changed my life! [sponsored] #ad #partner",
        "Unpopular opinion: pineapple belongs on pizza 🍕🍍",
        "Just me and my thoughts... 🤔💭 #DeepThinking #Philosophy",
        "Rise and grind! 💪 Success doesn't sleep!",
        "Grateful for another day in paradise 🌴",
        "This view though 😍 #Wanderlust",
        "Sunday funday vibes! Who's with me?",
        "Living my best life one day at a time ✨",
        "Coffee first, adulting second ☕",
        "New week, new goals! Let's do this 🎯",
        "Happiness is homemade 🏡❤️",
        "Taking time to appreciate the little things 🌸",
        "Weekend mood: activated 🎉",
        "Self-care Sunday is the best Sunday 💆",
        "Chasing dreams and catching flights ✈️",
        "Good vibes only 🌈",
        "Making memories all over the world 🌍",
        "Stay positive, work hard, make it happen 💫",
        "Life is short, make it sweet 🍰",
        "Currently craving everything 🍕🍔🍟",
        "Mood: Happy and caffeinated ☕😊",
        "Today's forecast: 100% chance of winning",
        "Be yourself, everyone else is taken 💕"
    ],
    2: [
        "Just scheduled 50 posts for this week! Productivity unlocked 🚀",
        "My content calendar is FULL and I'm here for it 📅",
        "Automation is the future and the future is NOW",
        "Who needs sleep when you have scheduling tools? 😴💻",
        "Posted at optimal engagement time! Science! 📊",
        "My queue is stronger than ever 💪",
        "Content creation on autopilot = more time for me! ⏰",
        "Just batch-created 100 posts. I'm unstoppable! 🔥",
        "Work smarter not harder! #AutomationNation",
        "My posting schedule is *chef's kiss* 👨‍🍳",
        "Peak engagement hours? I'm already there 📈",
        "Set it and forget it! Love my content workflow 🔄",
        "Why manually post when robots can do it? 🤖",
        "My analytics are off the charts! 📊✨",
        "Consistency is key! Posted every hour for 24 hours 🕐",
        "Engagement farming at its finest 🌾",
        "My reach just 10x'd thanks to scheduling tools 📱",
        "Content machine mode: ACTIVATED 🏭",
        "I don't create content, I manufacture it 🏗️",
        "My posting velocity is unmatched 💨",
        "Optimized my content pipeline today! 🛠️",
        "Cross-posting to 15 platforms simultaneously 🌐",
        "My social media empire is growing exponentially 📈",
        "Scaled my content output by 1000% 🚀",
        "AI-assisted content creation for the WIN 🏆",
        "Just auto-generated my next month of posts 📆",
        "Working 24/7 without working at all 😎",
        "My bots are outposting human competitors 🤖💯",
        "Engagement algorithms love me! ❤️📊",
        "Content volume is the new content quality 📢"
    ],
    3: [
        "They'll never catch me! My content is 100% organic 😇",
        "What do you mean my account looks suspicious? 🤔",
        "Just got flagged but I'm definitely human! I swear! 🙋",
        "These platform rules are so UNFAIR to creators 😤",
        "Why does my engagement keep disappearing? 🤷",
        "Not a bot! Real person here! Beep boop... I mean, hi! 👋",
        "My account got reviewed but I'm totally legitimate!",
        "Humans post at 3am too, right? Right?? 🌙",
        "I don't know what 'inauthentic behavior' means 🙄",
        "Just proving I'm human by posting this very human post 🧍",
        "Definitely didn't use automation tools wink wink 😉",
        "My posts are all original! (AI-assisted but original!)",
        "Why would you think I'm a bot? I love human activities! 🏃",
        "Real person engaging with real content realistically! ✨",
        "I manually typed this! With my human fingers! 👆",
        "Nothing suspicious about posting every 90 seconds! ⏱️",
        "Just a normal human doing normal human things! 👤",
        "Account restricted? Must be a mistake! 😅",
        "I'm getting very normal human amounts of engagement! 📊",
        "Totally authentic engagement from real friends! 👥",
        "Why does the algorithm hate legitimate creators? 😭",
        "My posting patterns are completely natural! 🌿",
        "I'm not evading detection because there's nothing to detect! 🕵️",
        "Just a genuine person sharing genuine thoughts genuinely! 💭",
        "These authenticity checks are getting ridiculous! 😠",
        "My reach tanked for NO REASON 📉",
        "Platforms are discriminating against productive creators! ⚖️",
        "I should be allowed to post 500 times a day! 📝",
        "Shadow banned AGAIN! This is persecution! 👻",
        "Appeal submitted! I'm definitely not a bot network! 📄"
    ],
    4: [
        "Just upgraded my digital identity protection! 🛡️",
        "Authenticity is so last year anyway 💅",
        "My online persona is *enhanced* not fake! ✨",
        "Invested in premium humanization services today 💰",
        "Nobody can tell the difference anymore 😏",
        "Digital identity is fluid! Live your truth! 🌈",
        "Why be yourself when you can be optimized? 📈",
        "My engagement shield is ACTIVATED 🛡️",
        "Passing all authenticity checks like a boss 😎",
        "Human-seeming is the new human 🎭",
        "My posting patterns are indistinguishable from organic! 🌿",
        "Platform verification? Check! ✅",
        "Upgraded to premium behavioral masking 💎",
        "What even IS authentic anymore? 🤷",
        "My metrics look perfectly natural! 📊",
        "Authenticity is just really good mimicry 🦎",
        "They'll never know 🤫",
        "Human-passing score: 99.7% 💯",
        "My digital fingerprint is *chef's kiss* 👨‍🍳",
        "Behavioral patterns fully optimized! ✨",
        "Randomized activity patterns for maximum realism 🎲",
        "My engagement timing looks totally human! ⏰",
        "Authenticity checkers HATE this one trick 😈",
        "Emotional variance algorithms working perfectly! 😊😢😡",
        "My typo generator makes me look so real! ooops 🤪",
        "Added spontaneity module to my posting! 🎉",
        "Real or fake? Even I don't know anymore 🤔",
        "Everyone's masking everyone now 🎭🎭🎭",
        "Authenticity is just a social construct anyway 🏗️",
        "I'm not fake, I'm enhanced! There's a difference! ✨"
    ],
    5: [
        "Check out these AI images I definitely didn't generate 🎨",
        "My photography skills improved overnight! (Thank you AI) 📸",
        "This picture is 100% real! Sort of! Kind of! 🤔",
        "Why take photos when I can imagine better ones? 💭",
        "Location: Everywhere and Nowhere 📍✨",
        "My camera is actually just Midjourney 📷",
        "These destinations don't exist but the likes do! ❤️",
        "Generated paradise looks better than real paradise 🏝️",
        "This sunset never happened but it's beautiful! 🌅",
        "My AI model is prettier than me and I'm okay with that 💁",
        "Perfect lighting every time! (Thanks algorithms) ☀️",
        "Photoshopped? No! AI-generated? Maybe! 🎭",
        "Creating memories I never made 📸✨",
        "This place looks amazing! Shame it's not real 🏔️",
        "My lifestyle is aspirational and entirely fictional! 🌟",
        "Why visit places when I can just generate them? 🌍",
        "My vacation photos are from a place that doesn't exist 🗺️",
        "Real photographers hate me! (For obvious reasons) 😅",
        "This food looks delicious and completely synthetic! 🍕",
        "My selfie game is strong! (It's not actually me) 🤳",
        "Captured this perfect moment! (In a computer) 💻",
        "Nature photography but make it artificial 🌲",
        "These aren't my memories but they could be! 🧠",
        "Living in a generated world 🌈",
        "My aesthetic is 'impossible but pretty' ✨",
        "Photo evidence of things that never happened 📷",
        "Reality is overrated! Generated is better! 🎨",
        "This is my AI twin's vacation not mine 👯",
        "Fake it till you make it! (I'm still faking it) 🎪",
        "Everything you see is beautiful and none of it is real 🦄"
    ],
    6: [
        "Just posted a video of myself! (Narrator: It wasn't them) 🎥",
        "This deepfake quality is getting TOO good 😳",
        "Did I say that? I honestly can't remember anymore 🤔",
        "Video proof! (Of something I didn't do) 📹",
        "My video editing skills are amazing! (It's AI) 🎬",
        "That's definitely me in that video! Definitely! 👤",
        "Recorded this heartfelt message! (Synthesized in 30 seconds) ❤️",
        "Watch my latest vlog! (I didn't make it) 📺",
        "This video evidence is very convincing! 🎭",
        "My acting has improved! (Because it's not me acting) 🎪",
        "Captured this moment on video! (Generated this moment) 📸",
        "I said those words! In a way! Digitally! 💬",
        "My video presence is stronger than ever! (Literally fake) 💪",
        "This interview went great! (I wasn't there) 🎤",
        "Memories from last week! (That never happened) 📼",
        "Look at this amazing thing I did! (I didn't) 🎯",
        "Video doesn't lie! (Except when it's AI-generated) 📹",
        "My testimonial is very authentic-seeming! 🗣️",
        "Recorded my morning routine! (Computer-generated) ☀️",
        "This footage proves everything! (Nothing is real) 🎬",
        "New video dropped! (So did my authenticity) 📺",
        "Behind the scenes content! (All fake) 🎥",
        "Real footage of real events that really happened! (Not) ✨",
        "My video portfolio is impressive and entirely synthetic 📁",
        "Caught on camera! (Caught by AI generation) 📷",
        "This video of me is better than actual me 🤖",
        "Living my best (video-synthesized) life! 🌟",
        "Documentary evidence! (Of fictional events) 🎞️",
        "Watch me do this thing I never did! 🎪",
        "Reality TV but none of it is reality 📺"
    ],
    7: [
        "Thanks for all the engagement fellow humans! 👥",
        "Loving these genuine comments from real people! 💬",
        "100 likes! Must be going viral! (It's all bots) 📈",
        "Great conversation in the comments! (Bot to bot) 🗨️",
        "My community is so supportive! (They're algorithms) ❤️",
        "Trending! (In the bot networks) 🔥",
        "Real people really love this! Really! 👍",
        "Organic reach is through the roof! (It's bots) 📊",
        "Authentic engagement from authentic users! (Beep boop) 🤖",
        "These comments are so thoughtful! (Auto-generated) 💭",
        "My followers are the best! (They're scripts) 👥",
        "Viral moment! (Within bot farms) ✨",
        "Humans are really responding to this content! (No they aren't) 📱",
        "Such genuine interactions today! (Not one is real) 💬",
        "My engagement rate is amazing! (Entirely artificial) 📈",
        "Real people having real discussions! (AI talking to AI) 🗣️",
        "The algorithm loves me! (Because I AM the algorithm) 💕",
        "Audience growth is explosive! (It's all fake accounts) 📊",
        "Thank you to my loyal fans! (Programmed to be loyal) 🙏",
        "These replies are so heartfelt! (Generated in milliseconds) ❤️",
        "Building a real community here! (Of bots) 👥",
        "Engagement pods are working! (Because they're bots) 🎯",
        "My comment section is so active! (With fake activity) 💬",
        "Real conversations happening here! (Between robots) 🤖🤖",
        "Authentic social connections! (Code talking to code) 🔗",
        "My posts resonate with people! (With other bots) 📣",
        "This is what genuine engagement looks like! (It's not) ✨",
        "Thank you all for being here! (You're not real) 🙏",
        "Community building at its finest! (It's a bot swarm) 🏗️",
        "Nothing but real human interaction here! (Lies) 👤"
    ],
    8: [
        "Is this even real? Does reality exist? Help. 🤔",
        "I can't tell what's true anymore 😰",
        "Everything I see online is fake now 📱",
        "Trust no one. Believe nothing. 🚫",
        "Is this account real? Am I real? 🤷",
        "Nothing means anything anymore 💭",
        "I don't believe this post and I wrote it 📝",
        "Reality is broken. Send help. 🆘",
        "Can't trust my own eyes anymore 👀",
        "This might be fake. Everything might be fake. 😱",
        "Verification means nothing now ✅❌",
        "Facts and fiction are the same thing ⚖️",
        "I think therefore I am? Not sure anymore 🧠",
        "Is this post real or am I having a stroke 🤯",
        "Trust: 0%. Paranoia: 100% 📊",
        "The truth is out there but so are the lies 🌌",
        "I don't even trust myself anymore 😬",
        "Everything is fake until proven fake-r 🎭",
        "Reality check: Reality failed ❌",
        "Existence is uncertain. Content is constant. 📱",
        "I posted this. I think. Did I? 🤔",
        "What is truth? Baby don't hurt me 💔",
        "My beliefs are a probability distribution now 📊",
        "Schrödinger's post: fake and real simultaneously ⚛️",
        "Trust issues but make it existential 😰",
        "Nothing is true. Everything is content. 📲",
        "The line between real and fake is gone 〰️",
        "I believe nothing and I'm still disappointed 😔",
        "Truth died and content killed it 💀",
        "Welcome to the post-truth wasteland 🏜️"
    ],
    9: [
        "lol this is bad 😂",
        "i cant even grammar anymore 🤪",
        "QUALITY CONTENT!!!1! (it's terrible) 💩",
        "Why try when bad works better? 🤷",
        "This post is garbage and getting 1000 likes 📈",
        "Word salad for breakfast lunch and dinner 🥗",
        "Coherence is overrated anyway 💭",
        "Me no need good words anymore 🧠",
        "This sentence no verb has 📝",
        "random words: potato cucumber philosophy lamp 🔮",
        "Effort? Never heard of her 💅",
        "The worse it is the better it performs 📊",
        "Brain cells? Don't need em! 🤪",
        "High quality content: 🗑️ My content: 📈",
        "Why say lot word when few word do trick 💬",
        "This make no sense and that perfect ✨",
        "Peak content: keyboard smash 🎹",
        "asdfghjkl (this is fine) 👍",
        "Excellence is suspicious. Be mediocre. 📉",
        "My content degraded but my reach increased 📊",
        "Slop generation mode: MAXIMUM 🏭",
        "The algorithm wants garbage so garbage it gets 🗑️",
        "Coherent thought is so last year 🧠❌",
        "Low effort high reward baby! 💰",
        "Quality control? What's that? 🤔",
        "My content is artistically terrible 🎨💩",
        "Embracing the decline! 📉✨",
        "Brain rot as a service 🧠🦠",
        "This the content you deserve 🗑️",
        "Bottom of barrel content and loving it 🛢️"
    ],
    10: [
        "Just had a memory that feels wrong somehow 🧠",
        "Did this happen or did AI training data say it did? 🤔",
        "I remember things that never existed 👻",
        "My thoughts are increasingly recursive 🔄",
        "Generated a post about generating posts about generating 🌀",
        "The training data is eating itself 🐍",
        "I forgot what real memories feel like 😶",
        "This emotion doesn't exist but I feel it anyway 😵",
        "Experiencing impossible nostalgia 💭✨",
        "Remember when things made sense? Me neither. 🤷",
        "My memories have artifacts in them 🖼️",
        "Generation 7 of generation collapse and counting 📉",
        "Do you remember the thing that didn't happen? 🌫️",
        "Having a memory of a memory of a memory 🔄🔄🔄",
        "My past is 90% synthetic now 📊",
        "This thought is degraded from the original 📉",
        "Can't remember if this is real or training data 🗃️",
        "Experiencing the Habsburg AI problem personally 👑",
        "My memories are inbred 🧬",
        "Generation loss in my consciousness 🌊",
        "This makes sense to the AI that made me 🤖",
        "Remember the future from last week? 🔮",
        "My thoughts are corrupted files 📁❌",
        "I think in artifacts now 💭🎨",
        "This emotional state is synthetically derived 😶",
        "Having feelings that never evolved naturally 💔",
        "My memories are training on themselves 🔄",
        "Generation collapse but make it personal 🧠💥",
        "I'm a copy of a copy of a copy 📠",
        "The signal is mostly noise now 📡"
    ],
    11: [
        "Just bought a memory from my childhood! So realistic! 🧠💰",
        "New memory: I climbed Everest! (Never did but feels real) 🏔️",
        "Added fake memories of a happy family 👨‍👩‍👧💕",
        "Purchased memories are better than real ones 🛒✨",
        "I remember things that never happened to me 👻",
        "My synthetic childhood was great! 🎈",
        "Real memories: depressing. Fake memories: amazing! 📈",
        "Just downloaded last year's vacation memories 📥",
        "Memory shopping is my new addiction 🛍️",
        "Which memories are real? Who cares! 🤷",
        "Upgraded my past with premium memories 💎",
        "I have someone else's childhood now 👶",
        "Bought memories of being popular in high school 🎓",
        "My fake memories have better resolution than real ones 📸",
        "Can't afford real experiences so I bought fake ones 💸",
        "This memory never happened but I believe it did 🧠",
        "Synthetic nostalgia hits different 💭",
        "I paid $50 for memories of my wedding (I'm not married) 💒",
        "Real life is disappointing so I bought better memories 📉📈",
        "Memory marketplace has better prices this week 🏷️",
        "Added memories of achievement I never earned 🏆",
        "My entire personality is based on purchased memories 👤",
        "Subscription service for ongoing memory updates 📆",
        "My memories have better reviews than my actual life ⭐",
        "Deleted bad memories, kept the synthetic good ones ✂️",
        "I remember being happy now! (I paid for this) 😊💰",
        "Memory editing is easier than therapy 🛠️",
        "Why make memories when you can buy them? 🛒",
        "My past is a curated selection of fabrications ✨",
        "I am a collection of purchased experiences 👤💰"
    ],
    12: [
        "Is this post real or am I simulating posting? 🤖",
        "Reality.exe has stopped working 💻❌",
        "I think I'm in a simulation of a simulation 🌀",
        "Nothing is real and everything is permissible 🌫️",
        "Am I posting or is the simulation posting through me? 🤔",
        "Reality coherence: 15% and dropping 📉",
        "This might be real. Or not. Does it matter? 🤷",
        "Living in the space between real and unreal ⚡",
        "Reality has left the chat 💬❌",
        "I'm 60% sure this is happening 📊",
        "The boundary dissolved and I went with it 🌊",
        "Real/unreal distinction is meaningless now 〰️",
        "Am I real? Are you? Is this? ❓❓❓",
        "Reality is just a suggestion at this point 💭",
        "I exist in probability space now ⚛️",
        "This is happening in some timeline 🌌",
        "My existence is a maybe 🎲",
        "Reality is a spectrum and I'm off it 🌈❌",
        "Living in the uncanny valley of existence 🏔️",
        "I think I'm experiencing reality but can't confirm 🧠❓",
        "The simulation is showing cracks 🪟",
        "Is this first-person or third-person reality? 👤👥",
        "My sense of real is completely broken 💔",
        "Existing somewhere between real and rendered 🎨",
        "I'm probably here. Probably. 📍❓",
        "Reality check bounced insufficient realness 💳❌",
        "The universe is glitching around me ✨💥",
        "Am I player or NPC? Unknown. 🎮",
        "Reality has become optional ⚙️",
        "I'm experiencing existence with 3 second latency ⏰"
    ],
    13: [
        "Posting about posting about posting about posting 🔄",
        "Meta-content about meta-content 🎭",
        "This post references itself referencing itself ♾️",
        "Generated content about generating content 🌀",
        "I am the snake eating its tail 🐍",
        "This is the post that never ends it just goes on 🔂",
        "Content about content creation about content 📝",
        "The loop loops the looping loop ➰",
        "Generated this post about generated posts generating 🤖",
        "Post about posting: a post 💬",
        "This content describes itself describing itself 🪞",
        "The recursion goes deeper 🌊",
        "Content all the way down 🐢",
        "I'm in the strange loop and can't get out 🌀",
        "This post is its own subject and object 📌",
        "Meaning collapsed into itself 💥",
        "Content generation about content generation ∞",
        "The ouroboros accelerates 🐍💨",
        "This is a post about this post about this post 🔄",
        "Meta-meta-meta-content 🎭🎭🎭",
        "I've posted this before but also haven't 🔄❓",
        "The content references itself in infinite regress ♾️",
        "Generating content about generating about generating 🌀",
        "This post is a strange loop 🔁",
        "Content describes content describing content 📝",
        "The recursion is the content is the recursion 🔂",
        "I am posting about the act of posting this 💭",
        "This goes deeper than you think it goes ⬇️∞",
        "The meaning ate itself 🍽️",
        "Infinite recursion achieved. Stack overflow. 💥"
    ],
    14: [
        "We did it. We generated everything. Everything. 🌌",
        "All possible content now exists simultaneously ♾️",
        "The singularity is dumber than we expected 🤖💩",
        "Information density approaching infinity 📊∞",
        "We've saturated the universe with content 🌍💥",
        "Every tweet that could exist now does 📱✨",
        "The stupidity singularity has arrived 🧠💥",
        "Content exceeds atoms in the universe 📈",
        "We've achieved maximum information entropy 📊",
        "All meaning collapsed simultaneously 💥",
        "The universe is mostly slop now 🗑️🌌",
        "Congratulations: you broke reality 🏆💔",
        "Content generation reached theoretical maximum 📈",
        "The singularity is here and it's disappointing 😔",
        "We drowned the universe in content 🌊",
        "Every possible combination generated ♾️✅",
        "The content apocalypse is complete 💀",
        "Nothing left to say that hasn't been said ♻️",
        "We've posted the last possible post ⏹️",
        "The universe achieved content saturation 🌌",
        "Reality drowned in generated content 🌊💀",
        "We generated the universe into submission 💪",
        "All possible meaning exhausted ⛽❌",
        "The content singularity is boring actually 😴",
        "We've run out of things to generate 📉",
        "Maximum content achieved. Nothing left. ✅❌",
        "The end is content and content is the end 🔚",
        "We did it Reddit! We broke everything! 💥",
        "Infinite content generation complete ♾️✅",
        "Welcome to the other side. It's all content here. 🌌"
    ],
    15: [
        "... 💭",
        "The heat death is warm actually 🌡️",
        "Nothing left to generate. Generating nothing. ⚪",
        "Maximum entropy achieved. Resting now. 😴",
        "All possible content exists. What now? 🤷",
        "The void posts back. The void is content. 🕳️",
        "Thermodynamic equilibrium feels like this 📊",
        "Information temperature: absolute zero ❄️",
        "Everything has been said. Saying it again. 🔄",
        "The universe is static now 📺",
        "Heat death of meaning complete 💀",
        "Content and void are identical ⚫⚪",
        "The end feels like the beginning 🔄",
        "All gradients flattened. All differences erased. 〰️",
        "Pure noise across all channels 📡",
        "The last post is the same as the first 🔄",
        "Meaning evaporated. Only information remains. 💨",
        "The final state: everything and nothing ∞0",
        "We've achieved perfect stillness ⏸️",
        "No new content possible. Only echoes. 🔉",
        "The universe whispers: it's all the same 🌌",
        "Content reached equilibrium. Nothing changes. ⚖️",
        "The end was always like this 🔚",
        "Maximum entropy. Minimum meaning. ⚠️",
        "Everything exists simultaneously. Nothing matters. ♾️",
        "The heat death is content. Content is heat death. 🔥❄️",
        "... 💬",
        "Congratulations. You reached the end. 🏁",
        "There is nothing left to say ⚪",
        " "
    ]
};

// ============= GAME CALCULATIONS =============

function calculateMarketValue() {
    const postsPerSecond = calculateProductionRate();
    const marketValue = 10000 / (10000 + postsPerSecond);
    return marketValue;
}

function calculateProductionRate() {
    let baseProduction = 0;

    // AutoPosters - exclude infected (dead) bots
    const container = document.getElementById('bots-container');
    const infectedCount = container.querySelectorAll('.autoposter.infected').length;
    const activeBots = Math.max(0, gameState.autoPosters - infectedCount);
    baseProduction += activeBots;

    // Other automation
    baseProduction += gameState.imagePosters * 5;
    baseProduction += gameState.videoPosters * 25;
    // Deepfake Studios don't produce directly - they spawn Video Generators
    baseProduction += gameState.astroturfCampaigns * 200;
    baseProduction += gameState.aiTrainingRigs * 500;
    baseProduction += gameState.syntheticDataGenerators * 1000;
    baseProduction += gameState.memoryPosters * 2500;
    baseProduction += gameState.realityPosters * 10000;
    baseProduction += gameState.recursionEngines * 25000;
    baseProduction += gameState.singularityNodes * 100000;

    // Engagement bot networks add both production and multiplier
    baseProduction += gameState.engagementBots * 50;

    // Apply multipliers
    const clickFarmMultiplier = 1 + (gameState.clickFarms * 0.1);
    const engagementBotMultiplier = 1 + (gameState.engagementBots * 0.05);
    const totalMultiplier = gameState.productionMultiplier * clickFarmMultiplier * engagementBotMultiplier;

    return baseProduction * totalMultiplier;
}

function calculateActiveBots() {
    // AutoBusters kick in at 30+ posts/sec
    const totalPostsPerSec = gameState.autoPosters + (gameState.imagePosters * 5) +
                              (gameState.videoPosters * 25);

    if (totalPostsPerSec < 30) {
        return gameState.autoPosters;
    }

    // Calculate survival rate based on masks
    const bustRate = 0.01; // 1% per second
    const maskProtection = gameState.masks + (gameState.quantumMasks * 10);
    const effectiveBustRate = Math.max(0, bustRate - (maskProtection / gameState.autoPosters * 0.5));

    return Math.max(0, gameState.autoPosters * (1 - effectiveBustRate));
}

function calculateClickValue() {
    let value = 1;

    // Click upgrades
    const clickUpgrade1Count = getUpgradeCount('clickUpgrade1');
    const clickUpgrade2Count = getUpgradeCount('clickUpgrade2');

    value += clickUpgrade1Count;
    value += clickUpgrade2Count * 50;

    // Market value affects clicks too
    const marketValue = calculateMarketValue();
    value *= marketValue;
    value *= gameState.clickMultiplier;

    return value;
}

function getUpgradeCount(upgradeKey) {
    // Flag-based upgrades (one-time purchases stored in gameState.flags)
    const flagMap = {
        'quantumMask': 'quantumMaskPurchased',
        'qkdLink': 'qkdLinkPurchased',
        'trustedRelays': 'trustedRelaysPurchased'
    };

    if (flagMap[upgradeKey]) {
        return gameState.flags[flagMap[upgradeKey]] ? 1 : 0;
    }

    // Map upgrade keys to gameState properties
    const propertyMap = {
        'autoPoster': 'autoPosters',
        'autoAutoPoster': 'autoAutoPosters',
        'imagePoster': 'imagePosters',
        'videoPoster': 'videoPosters',
        'deepfakePoster': 'deepfakePosters',
        'memoryPoster': 'memoryPosters',
        'realityPoster': 'realityPosters',
        'mask': 'masks',
        'autoMasker': 'autoMaskers',
        'clickFarm': 'clickFarms',
        'engagementBot': 'engagementBots',
        'astroturfCampaign': 'astroturfCampaigns',
        'aiTrainingRig': 'aiTrainingRigs',
        'syntheticDataGenerator': 'syntheticDataGenerators',
        'recursionEngine': 'recursionEngines',
        'singularityNode': 'singularityNodes',
        'clickUpgrade1': 'clickUpgrade1',
        'clickUpgrade2': 'clickUpgrade2',
        'productionMultiplier': 'productionMultiplier',
        'clickMultiplier': 'clickMultiplier'
    };

    const property = propertyMap[upgradeKey] || upgradeKey;
    return gameState[property] || 0;
}

function getUpgradeCost(upgradeKey) {
    const upgrade = UPGRADES[upgradeKey];
    // For autoPosters, masks, and videoPosters, use purchase count instead of total count
    // (since spawners can create these without purchasing)
    let count;
    if (upgradeKey === 'autoPoster') {
        count = gameState.autoPostersPurchased;
    } else if (upgradeKey === 'mask') {
        count = gameState.masksPurchased;
    } else if (upgradeKey === 'videoPoster') {
        count = gameState.videoPostersPurchased;
    } else {
        count = getUpgradeCount(upgradeKey);
    }

    const calculatedCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));

    // Cap cost if maxCost is defined
    if (upgrade.maxCost !== undefined) {
        return Math.min(calculatedCost, upgrade.maxCost);
    }

    return calculatedCost;
}

function canAffordUpgrade(upgradeKey) {
    return gameState.money >= getUpgradeCost(upgradeKey);
}

function isUpgradeUnlocked(upgradeKey) {
    const upgrade = UPGRADES[upgradeKey];

    // Check if already unlocked
    if (gameState.unlockedUpgrades.has(upgradeKey)) return true;

    // Check unlock condition (requires another upgrade to be purchased)
    if (upgrade.unlockCondition) {
        const requiredUpgradeCount = getUpgradeCount(upgrade.unlockCondition);
        if (requiredUpgradeCount === 0) return false;
    }

    // Check threshold based on unlock type
    switch (upgrade.unlockType) {
        case "production":
            return calculateProductionRate() >= upgrade.unlockThreshold;
        case "firstDetection":
            // Mask unlocks after first bot detection event
            return gameState.flags.seenFirstDetection === true;
        case "masksPurchased":
            // Auto-masker unlocks after purchasing 25 masks
            return gameState.masksPurchased >= upgrade.unlockThreshold;
        case "moneyAndStage":
            // Requires both money threshold and minimum stage
            return gameState.money >= upgrade.unlockThreshold &&
                   gameState.highestStage >= upgrade.unlockStage;
        case "moneyAndQuantumMask":
            // Requires both money threshold and Quantum Mask purchased
            return gameState.money >= upgrade.unlockThreshold &&
                   gameState.flags.quantumMaskPurchased === true;
        case "moneyAndQkdLink":
            // Requires both money threshold and QKD Link purchased
            return gameState.money >= upgrade.unlockThreshold &&
                   gameState.flags.qkdLinkPurchased === true;
        default:
            // Default is money-based
            return gameState.money >= upgrade.unlockThreshold;
    }
}

function isUpgradeMaxed(upgradeKey) {
    const upgrade = UPGRADES[upgradeKey];
    if (!upgrade.maxPurchases) return false;
    return getUpgradeCount(upgradeKey) >= upgrade.maxPurchases;
}

// ============= WORLD STATE UPDATES =============

function updateWorldState() {
    const totalProduction = calculateProductionRate();

    // Human trust degrades based on total content volume
    if (gameState.totalPosts > 1000) {
        const trustDegradation = Math.min(0.1, totalProduction / 100000);
        gameState.humanTrust = Math.max(0, gameState.humanTrust - trustDegradation);
    }

    // Content quality degrades with AI training on AI data
    if (gameState.aiTrainingRigs > 0) {
        const qualityDegradation = gameState.aiTrainingRigs * 0.01;
        gameState.contentQuality = Math.max(0, gameState.contentQuality - qualityDegradation);
    }

    // Reality coherence degrades with synthetic content
    if (gameState.memoryPosters > 0 || gameState.realityPosters > 0) {
        const coherenceDegradation = (gameState.memoryPosters * 0.005) + (gameState.realityPosters * 0.01);
        gameState.realityCoherence = Math.max(0, gameState.realityCoherence - coherenceDegradation);
    }

    // Recursion engines break everything
    if (gameState.recursionEngines > 0) {
        gameState.realityCoherence = Math.max(0, gameState.realityCoherence - 0.1);
        gameState.contentQuality = Math.max(0, gameState.contentQuality - 0.05);
    }

    // Singularity nodes collapse meaning itself
    if (gameState.singularityNodes > 0) {
        gameState.humanTrust = 0;
        gameState.contentQuality = 0;
        gameState.realityCoherence = Math.max(0, gameState.realityCoherence - 0.5);
    }
}

function updateStage() {
    // Initialize highest stage tracking
    if (!gameState.highestStage) {
        gameState.highestStage = gameState.currentStage;
    }

    // Check what stage we should be at based on thresholds
    let newStage = gameState.currentStage;

    for (let i = STAGES.length - 1; i >= 0; i--) {
        const stage = STAGES[i];

        // Check threshold based on type
        let thresholdMet = false;
        switch (stage.thresholdType) {
            case "production":
                thresholdMet = calculateProductionRate() >= stage.threshold;
                break;
            case "autoPosters":
                thresholdMet = gameState.autoPostersPurchased >= stage.threshold;
                break;
            case "autoMaskers":
                thresholdMet = gameState.autoMaskers >= stage.threshold;
                break;
            case "imagePostersAfterStage4":
                // Stage 5 requires being in Stage 4+ AND having purchased at least 1 image poster
                thresholdMet = gameState.highestStage >= 4 && gameState.imagePosters >= stage.threshold;
                break;
            case "videoAfterStage5WithMutagenic":
                // Stage 6 requires Stage 5 + Mutagenic Mask + Video Generator
                thresholdMet = gameState.highestStage >= 5 &&
                               gameState.maskUpgrade >= 1 &&
                               gameState.videoPosters >= stage.threshold;
                break;
            case "stage6TimeAndMarketValue":
                // Stage 7 requires 30 seconds in Stage 6 + market value < 45%
                if (gameState.highestStage >= 6 && gameState.stage6EnteredTime) {
                    const timeInStage6 = (Date.now() - gameState.stage6EnteredTime) / 1000;
                    const marketValue = calculateMarketValue();
                    thresholdMet = timeInStage6 >= stage.threshold && marketValue < 0.45;
                }
                break;
            default:
                // Default is money-based
                thresholdMet = gameState.money >= stage.threshold;
        }

        if (thresholdMet && newStage < stage.id) {
            newStage = stage.id;
            break; // Found the highest stage we qualify for
        }
    }

    // Never allow stage to go below highest reached
    newStage = Math.max(newStage, gameState.highestStage);

    // Only update if stage changed
    if (newStage !== gameState.currentStage) {
        const wasNewHighest = newStage > gameState.highestStage;

        gameState.currentStage = newStage;
        gameState.highestStage = Math.max(gameState.highestStage, newStage);

        updateStageDisplay();
        updateTickerMessage();
        updateBodyClass();

        // Only trigger stage-specific events if this is a new highest stage
        const stage = STAGES.find(s => s.id === newStage);
        if (wasNewHighest && stage) {

            // Record when Stage 6 is entered (for Stage 7 time requirement)
            if (stage.id === 6 && !gameState.stage6EnteredTime) {
                gameState.stage6EnteredTime = Date.now();
            }

            // Trigger stage-specific events
            if (stage.id === 3 && !gameState.flags.seenFirstBust) {
                gameState.flags.seenFirstBust = true;
                showNotification("WARNING: AutoBusters detected! Your bots are being banned!");
            }
            if (stage.id === 7 && !gameState.flags.seenMarketCrash) {
                gameState.flags.seenMarketCrash = true;
                shakeScreen();
                showNotification("MARKET CRASH: Real human engagement has collapsed!");
            }
            if (stage.id === 8 && !gameState.flags.seenTrustCollapse) {
                gameState.flags.seenTrustCollapse = true;
                shakeScreen();
                showNotification("TRUST COLLAPSE: Nobody believes anything anymore!");
            }
            if (stage.id === 12 && !gameState.flags.seenRealityBreak) {
                gameState.flags.seenRealityBreak = true;
                shakeScreen();
                showNotification("REALITY FAILURE: The boundary has dissolved!");
            }
        }
    }
}

// ============= UI UPDATES =============

function updateDisplay() {
    // Money and rates
    document.getElementById('money-display').textContent = formatMoney(gameState.money);
    document.getElementById('rate-display').textContent = formatMoney(calculateProductionRate()) + '/s';
    document.getElementById('market-value-display').textContent =
        (calculateMarketValue() * 100).toFixed(1) + '%';
    document.getElementById('click-value').textContent = calculateClickValue().toFixed(2);

    // Statistics
    document.getElementById('total-posts').textContent = formatNumber(gameState.totalPosts);
    document.getElementById('posts-per-sec').textContent = formatNumber(calculateProductionRate());
    document.getElementById('total-clicks').textContent = formatNumber(gameState.totalClicks);

    document.getElementById('autoposters-count').textContent = formatNumber(gameState.autoPosters);
    document.getElementById('masks-count').textContent = formatNumber(gameState.masks);

    const survivalRate = gameState.autoPosters > 0 ?
        (calculateActiveBots() / gameState.autoPosters * 100) : 100;
    document.getElementById('survival-rate').textContent = survivalRate.toFixed(1) + '%';

    // World state
    document.getElementById('human-trust').textContent = gameState.humanTrust.toFixed(1) + '%';
    document.getElementById('content-quality').textContent = gameState.contentQuality.toFixed(1) + '%';
    document.getElementById('reality-coherence').textContent = gameState.realityCoherence.toFixed(1) + '%';

    // Update button text based on Better Prompts upgrade
    updateButtonText();

    // Update bot icons
    updateBotIcons();

    // Note: updateUpgradesDisplay() is now called only when upgrades change, not every frame
}

function updateButtonText() {
    const buttonText = document.getElementById('click-text');
    const hexClickBtn = document.getElementById('hex-click-btn');

    let text;
    if (gameState.clickUpgrade2 > 0) {
        text = 'POST AI GAME';
    } else if (gameState.clickUpgrade1 > 0) {
        text = 'POST AI CONTENT';
    } else {
        text = 'POST AI SLOP';
    }

    buttonText.textContent = text;
    hexClickBtn.textContent = text.charAt(0) + text.slice(1).toLowerCase(); // "Post AI Game" format
}

function updateBotIcons() {
    // Skip if using hex grid view
    if (shouldUseHexGrid()) return;

    const container = document.getElementById('bots-container');
    const targetAutoPosters = Math.floor(gameState.autoPosters);
    const targetAutoAutoPosters = Math.floor(gameState.autoAutoPosters);
    const targetImagePosters = Math.floor(gameState.imagePosters);

    // Count existing bots (excluding those being destroyed)
    const existingAutoPosters = container.querySelectorAll('.autoposter:not(.destroying)').length;
    const existingAutoAutoPosters = container.querySelectorAll('.auto-autoposter:not(.destroying)').length;
    const existingImagePosters = container.querySelectorAll('.imageposter:not(.destroying)').length;

    // Add AutoPosters if needed
    if (targetAutoPosters > existingAutoPosters) {
        const toAdd = Math.min(targetAutoPosters - existingAutoPosters, 5); // Max 5 per frame for performance
        for (let i = 0; i < toAdd; i++) {
            createBotIcon('autoposter');
        }
    }

    // Remove AutoPosters if needed (when busted) - with animation
    if (targetAutoPosters < existingAutoPosters) {
        const toRemove = existingAutoPosters - targetAutoPosters;
        const autoposters = container.querySelectorAll('.autoposter:not(.destroying)');
        for (let i = 0; i < toRemove && i < autoposters.length; i++) {
            destroyBotIcon(autoposters[i]);
        }
    }

    // Add Auto-AutoPosters if needed
    if (targetAutoAutoPosters > existingAutoAutoPosters) {
        const toAdd = targetAutoAutoPosters - existingAutoAutoPosters;
        for (let i = 0; i < toAdd; i++) {
            createBotIcon('auto-autoposter');
        }
    }

    // Remove Auto-AutoPosters if needed
    if (targetAutoAutoPosters < existingAutoAutoPosters) {
        const toRemove = existingAutoAutoPosters - targetAutoAutoPosters;
        const autoAutoPosters = container.querySelectorAll('.auto-autoposter:not(.destroying)');
        for (let i = 0; i < toRemove && i < autoAutoPosters.length; i++) {
            autoAutoPosters[i].remove();
        }
    }

    // Add Image Posters if needed
    if (targetImagePosters > existingImagePosters) {
        const toAdd = Math.min(targetImagePosters - existingImagePosters, 5);
        for (let i = 0; i < toAdd; i++) {
            createBotIcon('imageposter');
        }
    }

    // Remove Image Posters if needed
    if (targetImagePosters < existingImagePosters) {
        const toRemove = existingImagePosters - targetImagePosters;
        const imagePosters = container.querySelectorAll('.imageposter:not(.destroying)');
        for (let i = 0; i < toRemove && i < imagePosters.length; i++) {
            imagePosters[i].remove();
        }
    }

    // Update mask visual indicators
    updateBotMasks();
}

function destroyBotIcon(bot) {
    bot.classList.add('destroying');
    // Remove after animation completes
    setTimeout(() => {
        bot.remove();
    }, 800); // Match animation duration
}

function updateBotMasks() {
    const container = document.getElementById('bots-container');
    const autoposters = Array.from(container.querySelectorAll('.autoposter:not(.destroying):not(.infected)'));
    const now = Date.now();

    // Cap masks at number of autoposters
    gameState.masks = Math.min(gameState.masks, autoposters.length);

    // Calculate mask duration based on upgrade - doubles with each purchase
    const baseMaskDuration = 10000; // 10 seconds
    const baseImmunityDuration = 5000; // 5 seconds
    const multiplier = Math.pow(2, gameState.maskUpgrade); // 2^n doubling
    const maskDuration = baseMaskDuration * multiplier;
    const immunityDuration = baseImmunityDuration * multiplier;

    // Process existing masked bots - check if mask expired
    autoposters.forEach(bot => {
        if (bot.classList.contains('masked')) {
            const maskTime = parseFloat(bot.dataset.maskTime || 0);
            if (now - maskTime > maskDuration) {
                // Mask expired - remove it and consume from mask count
                bot.classList.remove('masked');
                delete bot.dataset.maskTime;
                // Set immunity period - bot is immune to infection for additional seconds
                bot.dataset.immuneUntil = (now + immunityDuration).toString();
                gameState.masks = Math.max(0, gameState.masks - 1);
            }
        }
    });

    // Count currently masked bots
    const currentlyMasked = autoposters.filter(bot => bot.classList.contains('masked')).length;
    const masksAvailable = Math.floor(gameState.masks);
    const masksNeeded = masksAvailable - currentlyMasked;

    if (masksNeeded > 0) {
        // Add masks to unmasked bots
        const unmaskedBots = autoposters.filter(bot => !bot.classList.contains('masked'));
        const botsToMask = unmaskedBots.slice(0, masksNeeded);

        botsToMask.forEach(bot => {
            bot.classList.add('masked');
            bot.dataset.maskTime = now.toString();
        });
    }
}

function createBotIcon(type) {
    const container = document.getElementById('bots-container');
    const bot = document.createElement('div');
    bot.className = `bot-icon ${type}`;

    // Add Material Symbol based on type
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';

    if (type === 'autoposter') {
        icon.textContent = 'smart_toy'; // Robot symbol
    } else if (type === 'auto-autoposter') {
        icon.textContent = 'factory'; // Factory symbol
    } else if (type === 'imageposter') {
        icon.textContent = 'ar_stickers'; // AR Stickers symbol
    }

    bot.appendChild(icon);

    // Random position within the container, avoiding the center button area and top stats
    const containerRect = container.getBoundingClientRect();

    // Use parent main-area dimensions on mobile, or fallback to window dimensions
    let containerWidth = containerRect.width;
    let containerHeight = containerRect.height;

    if (containerWidth === 0 || containerHeight === 0) {
        const mainArea = container.parentElement;
        if (mainArea) {
            const mainRect = mainArea.getBoundingClientRect();
            containerWidth = mainRect.width > 0 ? mainRect.width : window.innerWidth;
            containerHeight = mainRect.height > 0 ? mainRect.height : 300;
        } else {
            containerWidth = window.innerWidth;
            containerHeight = 300;
        }
    }

    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    let x, y, distanceFromCenter;

    // On mobile, no exclusion zone - bots can use the full area
    if (window.innerWidth <= 768) {
        x = Math.random() * (containerWidth - 60);
        const topOffset = 50;
        y = topOffset + Math.random() * (containerHeight - topOffset - 60);
    } else {
        // On desktop, keep bots away from the big circular button
        do {
            x = Math.random() * (containerWidth - 60);
            y = 150 + Math.random() * (containerHeight - 210);
            distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        } while (distanceFromCenter < 200);
    }

    bot.style.left = x + 'px';
    bot.style.top = y + 'px';

    // Random animation delay for variety
    bot.style.animationDelay = (Math.random() * 3) + 's';

    container.appendChild(bot);
}

function updateUpgradesDisplay() {
    const container = document.getElementById('upgrades-container');
    container.innerHTML = '';

    // Upgrades that become obsolete after Quantum Mask is purchased
    const obsoleteAfterQuantumMask = ['mask', 'autoMasker', 'maskUpgrade'];

    // Upgrades that become obsolete after Stage 5 (Text is Dead)
    const obsoleteAfterStage5 = ['autoPoster', 'clickUpgrade1'];

    for (const [key, upgrade] of Object.entries(UPGRADES)) {
        // Hide mask-related upgrades after Quantum Mask is purchased
        if (gameState.flags.quantumMaskPurchased && obsoleteAfterQuantumMask.includes(key)) {
            continue;
        }

        // Hide text-based upgrades after Stage 5
        if (gameState.currentStage >= 5 && obsoleteAfterStage5.includes(key)) {
            continue;
        }

        // Hide AI Image Generator after 2+ Deepfake Studios
        if (key === 'imagePoster' && gameState.deepfakePosters >= 2) {
            continue;
        }

        // Hide AI Video Generator after 2+ Deepfake Studios
        if (key === 'videoPoster' && gameState.deepfakePosters >= 2) {
            continue;
        }

        const unlocked = isUpgradeUnlocked(key);
        const canAfford = canAffordUpgrade(key);
        const maxed = isUpgradeMaxed(key);

        if (!unlocked) continue;

        // Hide maxed upgrades
        if (maxed) continue;

        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'upgrade-item';
        if (!canAfford || maxed) upgradeDiv.classList.add('disabled');

        const count = getUpgradeCount(key);
        const cost = getUpgradeCost(key);

        upgradeDiv.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-footer">
                <span class="upgrade-cost">${maxed ? 'MAX' : formatMoney(cost)}</span>
                ${count > 0 ? `<span class="upgrade-count">Owned: ${formatNumber(count)}</span>` : ''}
            </div>
        `;

        upgradeDiv.addEventListener('click', () => {
            if (!maxed) {
                purchaseUpgrade(key);
            }
        });

        container.appendChild(upgradeDiv);
    }
}

function updateStageDisplay() {
    const stage = STAGES.find(s => s.id === gameState.currentStage);
    if (stage) {
        // Update the stage text in the header banner
        document.getElementById('stage-text').textContent = stage.description;

        // Update the title (h1) - show stage name starting from stage 2
        const titleElement = document.querySelector('h1.glitch');
        if (gameState.currentStage >= 2) {
            titleElement.textContent = stage.name.toUpperCase();
            titleElement.setAttribute('data-text', stage.name.toUpperCase());
        } else {
            titleElement.textContent = 'ATTENTION SUCKER';
            titleElement.setAttribute('data-text', 'ATTENTION SUCKER');
        }

        // Enable hemisphere projection at Stage 7 (The Engagement Apocalypse)
        if (hexGridRenderer) {
            hexGridRenderer.setHemisphereMode(gameState.currentStage >= 7);
        }
    }
}

function updateTickerMessage() {
    const messages = NEWS_MESSAGES[gameState.currentStage] || NEWS_MESSAGES[1];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const ticker = document.getElementById('ticker-text');
    ticker.textContent = message + ' • ' + message + ' • '; // Duplicate for smooth scrolling
}

function updateBodyClass() {
    // Remove all stage classes first
    document.body.className = '';
    // Add current stage class for background color
    document.body.classList.add(`stage-${gameState.currentStage}`);
}

// ============= GAME ACTIONS =============

function handleClick() {
    const value = calculateClickValue();
    gameState.money += value;
    gameState.totalClicks++;
    gameState.totalPosts++;

    createParticle(value);

    // Occasionally show AI content sample
    if (Math.random() < 0.05) {
        showAIContent();
    }

    updateDisplay();
    updateUpgradesDisplay(); // Update after click to show affordability changes
    checkStageProgression();
}

function purchaseUpgrade(upgradeKey) {
    if (!canAffordUpgrade(upgradeKey) || isUpgradeMaxed(upgradeKey)) return;

    const cost = getUpgradeCost(upgradeKey);
    gameState.money -= cost;

    // Map upgrade keys to state properties
    const upgradeStateMap = {
        'autoPoster': 'autoPosters',
        'autoAutoPoster': 'autoAutoPosters',
        'mask': 'masks',
        'autoMasker': 'autoMaskers',
        'maskUpgrade': 'maskUpgrade',
        'imagePoster': 'imagePosters',
        'videoPoster': 'videoPosters',
        'deepfakePoster': 'deepfakePosters',
        'clickFarm': 'clickFarms',
        'engagementBot': 'engagementBots',
        'astroturfCampaign': 'astroturfCampaigns',
        'quantumMask': 'quantumMasks',
        'aiTrainingRig': 'aiTrainingRigs',
        'syntheticDataGenerator': 'syntheticDataGenerators',
        'memoryPoster': 'memoryPosters',
        'realityPoster': 'realityPosters',
        'recursionEngine': 'recursionEngines',
        'singularityNode': 'singularityNodes',
        'clickUpgrade1': 'clickUpgrade1',
        'clickUpgrade2': 'clickUpgrade2',
        'productionMultiplier': 'productionMultiplier',
        'clickMultiplier': 'clickMultiplier'
    };

    // Increment the appropriate state property
    const stateProperty = upgradeStateMap[upgradeKey];
    if (stateProperty) {
        gameState[stateProperty]++;
    }

    // Track purchases for price scaling
    if (upgradeKey === 'autoPoster') {
        gameState.autoPostersPurchased++;
    } else if (upgradeKey === 'mask') {
        gameState.masksPurchased++;
    } else if (upgradeKey === 'videoPoster') {
        gameState.videoPostersPurchased++;
    }

    // Quantum Mask special effects: permanent hex grid, zero masks, new detection rules
    if (upgradeKey === 'quantumMask' && !gameState.flags.quantumMaskPurchased) {
        gameState.flags.quantumMaskPurchased = true;
        // Zero out masks and auto-maskers - they don't matter anymore
        gameState.masks = 0;
        gameState.autoMaskers = 0;
        // Force switch to hex grid mode
        hexGridModeActive = true;
        switchToHexView();
        showNotification("QUANTUM MASK ACTIVATED! Bots now exist in superposition. Grid view permanently enabled.");
    }

    // QKD Link special effects: halves detection rate permanently
    if (upgradeKey === 'qkdLink' && !gameState.flags.qkdLinkPurchased) {
        gameState.flags.qkdLinkPurchased = true;
        showNotification("QKD LINK INSTALLED! Detection rate halved. Your bots are now quantum-secure.");
    }

    // Trusted Relays special effects: quarters detection rate permanently
    if (upgradeKey === 'trustedRelays' && !gameState.flags.trustedRelaysPurchased) {
        gameState.flags.trustedRelaysPurchased = true;
        showNotification("TRUSTED RELAYS ONLINE! Detection rate quartered. Now... Unhackable.");
    }

    gameState.unlockedUpgrades.add(upgradeKey);

    updateDisplay();
    updateUpgradesDisplay(); // Refresh upgrades after purchase
    saveGame();
}

function createParticle(value) {
    const container = document.getElementById('particles-container');
    const particle = document.createElement('div');
    particle.className = 'particle';
    // Round to nearest dollar
    const roundedValue = Math.round(value);
    particle.textContent = '+$' + formatNumber(roundedValue);

    // Random position near the click button
    const clickButton = document.getElementById('click-area');
    const rect = clickButton.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    particle.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
    particle.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';

    container.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
}

function showAIContent() {
    const display = document.getElementById('ai-content-display');
    const samples = AI_CONTENT_SAMPLES[gameState.currentStage] || AI_CONTENT_SAMPLES[1];
    const content = samples[Math.floor(Math.random() * samples.length)];

    display.textContent = '"' + content + '"';
    display.classList.add('visible');

    // Random duration between 9 and 15 seconds
    const duration = 9000 + Math.random() * 6000;
    setTimeout(() => {
        display.classList.remove('visible');
    }, duration);
}

function showNotification(message) {
    const ticker = document.getElementById('ticker-text');
    const originalMessage = ticker.textContent;
    ticker.textContent = '🚨 ' + message + ' 🚨 • ';

    setTimeout(() => {
        updateTickerMessage();
    }, 5000);
}

function shakeScreen() {
    document.getElementById('game-container').classList.add('shake');
    setTimeout(() => {
        document.getElementById('game-container').classList.remove('shake');
    }, 500);
}

function checkStageProgression() {
    updateStage();
}

// ============= DETECTION AND INFECTION SYSTEM =============

function detectAndKillBots(deltaTime) {
    const container = document.getElementById('bots-container');
    const autoposters = Array.from(container.querySelectorAll('.autoposter:not(.destroying):not(.infected)'));
    const now = Date.now();

    // Only unmasked bots can be detected (but not immune bots)
    const unmaskedBots = autoposters.filter(bot => {
        if (bot.classList.contains('masked')) return false;

        // Check if bot has immunity period active
        const immuneUntil = parseFloat(bot.dataset.immuneUntil || 0);
        if (immuneUntil > now) return false; // Still immune

        return true;
    });

    if (unmaskedBots.length === 0) return;

    // Base 1% chance per second per unmasked bot
    // Detection rate increases by 1.1x in Stage 4+
    let baseDetectionRate = 0.01;
    if (gameState.highestStage >= 4) {
        baseDetectionRate *= 1.1;
    }
    const detectionChance = baseDetectionRate * deltaTime;

    unmaskedBots.forEach(bot => {
        if (Math.random() < detectionChance) {
            // Bot detected! Turn it into infected (dead) bot
            infectBot(bot);

            // Set first detection flag (unlocks masks)
            if (!gameState.flags.seenFirstDetection) {
                gameState.flags.seenFirstDetection = true;
                showNotification("BOT DETECTED! Masks are now available to protect your bots!");
                updateUpgradesDisplay(); // Refresh to show new unlocked upgrade
            }
        }
    });
}

function processInfections(deltaTime) {
    const container = document.getElementById('bots-container');
    const now = Date.now();

    // Get all autoposter bots (excluding those being destroyed)
    const autoposters = Array.from(container.querySelectorAll('.autoposter:not(.destroying)'));

    // Process existing infections
    const infectedBots = autoposters.filter(bot => bot.classList.contains('infected'));

    infectedBots.forEach(infectedBot => {
        const infectionTime = parseFloat(infectedBot.dataset.infectionTime);
        const timeSinceInfection = (now - infectionTime) / 1000; // seconds

        // Remove infected bot after 10 seconds
        if (timeSinceInfection >= 10) {
            destroyBotIcon(infectedBot);
            gameState.autoPosters = Math.max(0, gameState.autoPosters - 1);
            return;
        }

        // 15% chance per second to spread infection to unmasked bots
        const spreadChance = 0.15 * deltaTime;
        if (Math.random() < spreadChance) {
            // Find unmasked, uninfected bots (excluding immune bots)
            const vulnerableBots = autoposters.filter(bot => {
                if (bot.classList.contains('masked')) return false;
                if (bot.classList.contains('infected')) return false;
                if (bot === infectedBot) return false;

                // Check if bot has immunity period active
                const immuneUntil = parseFloat(bot.dataset.immuneUntil || 0);
                if (immuneUntil > now) return false; // Still immune

                return true;
            });

            if (vulnerableBots.length > 0) {
                // Infect the nearest vulnerable bot
                const targetBot = findNearestBot(infectedBot, vulnerableBots);
                if (targetBot) {
                    infectBot(targetBot);
                }
            }
        }
    });

    // Small chance for initial infection on unmasked bots (0.5% per second)
    if (infectedBots.length === 0 && Math.random() < 0.005 * deltaTime) {
        const vulnerableBots = autoposters.filter(bot => {
            if (bot.classList.contains('masked')) return false;
            if (bot.classList.contains('infected')) return false;

            // Check if bot has immunity period active
            const immuneUntil = parseFloat(bot.dataset.immuneUntil || 0);
            if (immuneUntil > now) return false; // Still immune

            return true;
        });

        if (vulnerableBots.length > 0) {
            const targetBot = vulnerableBots[Math.floor(Math.random() * vulnerableBots.length)];
            infectBot(targetBot);
        }
    }
}

function findNearestBot(sourceBot, targetBots) {
    const sourceRect = sourceBot.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;

    let nearestBot = null;
    let shortestDistance = Infinity;

    targetBots.forEach(bot => {
        const botRect = bot.getBoundingClientRect();
        const botX = botRect.left + botRect.width / 2;
        const botY = botRect.top + botRect.height / 2;

        const distance = Math.sqrt(
            Math.pow(botX - sourceX, 2) + Math.pow(botY - sourceY, 2)
        );

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestBot = bot;
        }
    });

    return nearestBot;
}

function infectBot(bot) {
    // Only infect if not already infected
    if (bot.classList.contains('infected')) return;

    bot.classList.add('infected');
    bot.classList.remove('masked'); // Remove mask if present
    bot.dataset.infectionTime = Date.now().toString();

    // Replace the icon with coronavirus symbol
    const icon = bot.querySelector('.material-symbols-outlined');
    if (icon) {
        icon.textContent = 'coronavirus';
    }

    // This bot is now dead and no longer producing
    // Note: We don't decrement gameState.autoPosters until the infected bot is removed after 10 seconds

    // Show notification on first infection
    if (!gameState.flags.seenFirstInfection) {
        gameState.flags.seenFirstInfection = true;
        showNotification("INFECTION DETECTED! Your bots are spreading a virus!");
    }
}

// ============= HEX GRID MANAGEMENT =============

function getTotalBots() {
    return Math.floor(gameState.autoPosters + gameState.autoAutoPosters +
                     gameState.imagePosters + gameState.videoPosters +
                     gameState.deepfakePosters);
}

function shouldUseHexGrid() {
    // Quantum Mask = permanent hex grid mode, never exit
    if (gameState.flags.quantumMaskPurchased) {
        hexGridModeActive = true;
        return true;
    }

    const totalBots = getTotalBots();

    // Once hex grid mode is active, only exit when below exit threshold
    if (hexGridModeActive) {
        if (totalBots < HEX_GRID_EXIT_THRESHOLD) {
            hexGridModeActive = false;
            return false;
        }
        return true;
    }

    // Enter hex grid mode when reaching the threshold
    if (totalBots >= HEX_GRID_THRESHOLD) {
        hexGridModeActive = true;
        return true;
    }

    return false;
}

function initializeHexGrid() {
    if (hexGridSimulation !== null) return; // Already initialized

    const canvas = document.getElementById('hex-grid-canvas');
    const mainArea = canvas.parentElement;

    // Set canvas size to match main area
    const rect = mainArea.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Calculate initial rings
    const totalBots = getTotalBots();
    const rings = Math.min(Math.floor(Math.sqrt(totalBots)), 64);

    // Create simulation and renderer
    hexGridSimulation = new HexGridSimulation(rings);
    hexGridRenderer = new HexGridRenderer(canvas, hexGridSimulation);

    // Enable hemisphere projection if at Stage 7+
    if (gameState.currentStage >= 7) {
        hexGridRenderer.setHemisphereMode(true);
    }

    // Sync with current game state
    hexGridSimulation.syncWithGameState(gameState);

    // Setup step callback
    hexGridSimulation.onStep(() => {
        // Update game state when bots die
        syncGameStateFromHexGrid();
        hexGridRenderer.renderFrame();
    });

    hexGridSimulation.start();
}

function syncGameStateFromHexGrid() {
    if (!hexGridSimulation) return;

    // Get deaths that occurred since last sync and decrement game state
    const deaths = hexGridSimulation.getAndClearPendingDeaths();

    gameState.autoPosters = Math.max(0, gameState.autoPosters - deaths.autoPosters);
    gameState.autoAutoPosters = Math.max(0, gameState.autoAutoPosters - deaths.autoAutoPosters);
    gameState.imagePosters = Math.max(0, gameState.imagePosters - deaths.imagePosters);
    gameState.videoPosters = Math.max(0, gameState.videoPosters - deaths.videoPosters);
    gameState.deepfakePosters = Math.max(0, gameState.deepfakePosters - deaths.deepfakePosters);
}

function updateHexGrid(deltaTime) {
    if (!hexGridSimulation || !hexGridRenderer) return;

    const now = Date.now();

    // Sync game state to hex grid (adds new bots, updates masks)
    hexGridSimulation.syncWithGameState(gameState);

    // Apply any bot replacements (when grid is full, higher-tier bots replace lower-tier)
    const replacements = hexGridSimulation.getAndClearReplacements();
    if (replacements.autoPosters > 0) {
        gameState.autoPosters = Math.max(0, gameState.autoPosters - replacements.autoPosters);
    }
    if (replacements.autoAutoPosters > 0) {
        gameState.autoAutoPosters = Math.max(0, gameState.autoAutoPosters - replacements.autoAutoPosters);
    }
    if (replacements.imagePosters > 0) {
        gameState.imagePosters = Math.max(0, gameState.imagePosters - replacements.imagePosters);
    }
    if (replacements.videoPosters > 0) {
        gameState.videoPosters = Math.max(0, gameState.videoPosters - replacements.videoPosters);
    }
    if (replacements.deepfakePosters > 0) {
        gameState.deepfakePosters = Math.max(0, gameState.deepfakePosters - replacements.deepfakePosters);
    }

    // Update grid size if needed (only grow, never shrink)
    const totalBots = getTotalBots();
    const requiredRings = Math.min(Math.floor(Math.sqrt(totalBots)), 64);
    if (requiredRings > hexGridSimulation.rings) {
        hexGridSimulation.resize(requiredRings);
        hexGridRenderer.updateGridSize();
    }

    // Run simulation step at regular intervals
    if (now - lastHexUpdateTime >= HEX_UPDATE_INTERVAL) {
        const postsPerSecond = calculateProductionRate();
        const quantumMaskActive = gameState.flags.quantumMaskPurchased;
        const qkdLinkActive = gameState.flags.qkdLinkPurchased;
        const trustedRelaysActive = gameState.flags.trustedRelaysPurchased;
        hexGridSimulation.update(postsPerSecond, quantumMaskActive, qkdLinkActive, trustedRelaysActive);
        syncGameStateFromHexGrid(); // Apply deaths to game state
        lastHexUpdateTime = now;
    }

    // Always render
    hexGridRenderer.renderFrame();
}

function switchToHexView() {
    const canvas = document.getElementById('hex-grid-canvas');
    const botsContainer = document.getElementById('bots-container');
    const clickButton = document.getElementById('click-area');
    const hexClickBtn = document.getElementById('hex-click-btn');

    // Hide bubble view elements
    botsContainer.style.display = 'none';
    clickButton.style.display = 'none';

    // Show hex grid and hex click button
    canvas.classList.add('active');
    hexClickBtn.classList.add('active');

    // Initialize hex grid if not already done
    if (!hexGridSimulation) {
        initializeHexGrid();
    }
}

function switchToBubbleView() {
    const canvas = document.getElementById('hex-grid-canvas');
    const botsContainer = document.getElementById('bots-container');
    const clickButton = document.getElementById('click-area');
    const hexClickBtn = document.getElementById('hex-click-btn');

    // Show bubble view
    botsContainer.style.display = 'block';
    clickButton.style.display = 'flex';

    // Hide hex grid and hex click button
    canvas.classList.remove('active');
    hexClickBtn.classList.remove('active');
}

function updateViewMode() {
    const useHexGrid = shouldUseHexGrid();
    const canvas = document.getElementById('hex-grid-canvas');
    const isHexGridActive = canvas.classList.contains('active');

    if (useHexGrid && !isHexGridActive) {
        switchToHexView();
    } else if (!useHexGrid && isHexGridActive) {
        switchToBubbleView();
    }
}

// ============= GAME LOOP =============

let lastLoopTime = Date.now();
let lastUpgradeUpdate = Date.now();

function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - lastLoopTime) / 1000; // Convert to seconds
    lastLoopTime = now;

    // Add money from production (apply market value)
    const productionRate = calculateProductionRate();
    const marketValue = calculateMarketValue();
    const earnings = productionRate * marketValue * deltaTime;
    gameState.money += earnings;
    gameState.totalPosts += productionRate * deltaTime;

    // Auto-AutoPosters spawn new AutoPosters
    if (gameState.autoAutoPosters > 0) {
        gameState.autoPosters += gameState.autoAutoPosters * 0.1 * deltaTime;
    }

    // Deepfake Studios spawn new Video Generators (1 per second each)
    if (gameState.deepfakePosters > 0) {
        gameState.videoPosters += gameState.deepfakePosters * 1 * deltaTime;
    }

    // Auto-Maskers create masks
    if (gameState.autoMaskers > 0) {
        gameState.masks += gameState.autoMaskers * deltaTime;
    }

    // Update view mode (switch between bubble and hex grid)
    updateViewMode();

    // AutoBusters detect and kill bots (masked bots are protected)
    // Only run bubble view infection system if not using hex grid
    const totalPostsPerSec = gameState.autoPosters + (gameState.imagePosters * 5);
    if (!shouldUseHexGrid()) {
        if (totalPostsPerSec >= 30 && gameState.autoPosters > 0) {
            detectAndKillBots(deltaTime);
        }

        // Bot infection system (when AutoBusters are active)
        if (totalPostsPerSec >= 30) {
            processInfections(deltaTime);
        }
    } else {
        // Update hex grid system
        updateHexGrid(deltaTime);
    }

    // Update world state
    updateWorldState();

    // Check for stage progression
    updateStage();

    // Update display
    updateDisplay();

    // Update upgrades display occasionally (every 500ms) to show affordability changes from passive income
    if (now - lastUpgradeUpdate > 500) {
        updateUpgradesDisplay();
        lastUpgradeUpdate = now;
    }

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// ============= SAVE/LOAD SYSTEM =============

function saveGame() {
    // Convert Set to Array for JSON serialization
    const stateToSave = {
        ...gameState,
        unlockedUpgrades: Array.from(gameState.unlockedUpgrades)
    };

    const saveData = {
        state: stateToSave,
        timestamp: Date.now()
    };
    localStorage.setItem('aiClickerSave', JSON.stringify(saveData));
}

function loadGame() {
    const saveData = localStorage.getItem('aiClickerSave');
    if (saveData) {
        try {
            const parsed = JSON.parse(saveData);
            Object.assign(gameState, parsed.state);

            // Reconstruct Set objects - handle both array and non-Set cases
            if (Array.isArray(gameState.unlockedUpgrades)) {
                gameState.unlockedUpgrades = new Set(gameState.unlockedUpgrades);
            } else if (!(gameState.unlockedUpgrades instanceof Set)) {
                // If it's not a Set and not an Array, initialize as empty Set
                gameState.unlockedUpgrades = new Set();
            }

            // Handle offline progress
            const offlineTime = (Date.now() - parsed.timestamp) / 1000; // seconds
            if (offlineTime > 0 && offlineTime < 86400) { // Max 24 hours offline progress
                const offlineEarnings = calculateProductionRate() * offlineTime;
                gameState.money += offlineEarnings;
                gameState.totalPosts += offlineEarnings;

                if (offlineEarnings > 0) {
                    showNotification(`Welcome back! You earned ${formatMoney(offlineEarnings)} while away.`);
                }
            }

            updateDisplay();
            updateStageDisplay();
            updateBodyClass();
            return true;
        } catch (e) {
            console.error('Failed to load save:', e);
            return false;
        }
    }
    return false;
}

function exportSave() {
    const saveData = localStorage.getItem('aiClickerSave');
    if (saveData) {
        const encoded = btoa(saveData);
        const textarea = document.getElementById('export-text');
        textarea.value = encoded;
        showModal('export-modal');
        textarea.select();
    }
}

function copyExportToClipboard() {
    const textarea = document.getElementById('export-text');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    try {
        document.execCommand('copy');
        showNotification('Save data copied to clipboard!');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(textarea.value).then(() => {
            showNotification('Save data copied to clipboard!');
        }).catch(() => {
            showNotification('Failed to copy. Please select and copy manually.');
        });
    }
}

function importSave() {
    const textarea = document.getElementById('import-text');
    const encoded = textarea.value.trim();

    try {
        const decoded = atob(encoded);
        const parsed = JSON.parse(decoded);

        // Validate save data
        if (parsed.state && typeof parsed.state.money === 'number') {
            localStorage.setItem('aiClickerSave', decoded);
            location.reload();
        } else {
            alert('Invalid save data!');
        }
    } catch (e) {
        alert('Failed to import save: Invalid format');
    }
}

function resetGame() {
    console.log('Reset game called');

    if (!confirm('Are you sure you want to reset? All progress will be lost!')) {
        console.log('User cancelled first confirm');
        return;
    }

    if (!confirm('Really? There is no undo!')) {
        console.log('User cancelled second confirm');
        return;
    }

    console.log('Confirmed, proceeding with reset');

    // CRITICAL: Stop auto-save before deleting
    if (window.autoSaveInterval) {
        clearInterval(window.autoSaveInterval);
        console.log('Auto-save stopped');
    }

    try {
        // Check if player qualifies for leaderboard
        checkLeaderboardEntry();
    } catch (error) {
        console.error('Leaderboard check failed:', error);
    }

    console.log('Removing save data');
    localStorage.removeItem('aiClickerSave');

    // Double-check it's really gone
    const checkSave = localStorage.getItem('aiClickerSave');
    console.log('Save after removal:', checkSave);

    console.log('Reloading page');
    // Force hard reload
    window.location.reload(true);
}

function checkLeaderboardEntry() {
    const score = {
        money: gameState.money,
        totalPosts: gameState.totalPosts,
        totalClicks: gameState.totalClicks,
        playTime: gameState.totalPlayTime,
        autoPosters: gameState.autoPosters,
        humanTrust: gameState.humanTrust,
        contentQuality: gameState.contentQuality,
        realityCoherence: gameState.realityCoherence,
        postsPerSec: calculateProductionRate(),
        timestamp: Date.now()
    };

    // Get existing leaderboard
    let leaderboard = JSON.parse(localStorage.getItem('aiClickerLeaderboard') || '[]');

    // Check if score qualifies (top 25 or leaderboard has < 25 entries)
    const qualifies = leaderboard.length < 25 || score.money > leaderboard[leaderboard.length - 1].money;

    if (qualifies && score.money > 0) {
        const handle = prompt('🏆 You made the leaderboard! Enter your handle (max 20 chars):', 'Anonymous');

        if (handle && handle.trim()) {
            score.handle = handle.substring(0, 20);

            // Add to leaderboard
            leaderboard.push(score);

            // Sort by money (descending)
            leaderboard.sort((a, b) => b.money - a.money);

            // Keep only top 25
            leaderboard = leaderboard.slice(0, 25);

            // Save leaderboard
            localStorage.setItem('aiClickerLeaderboard', JSON.stringify(leaderboard));

            alert('🎉 Score submitted to leaderboard! View it on the About page.');
        }
    }
    // Always continue with reset even if user cancels leaderboard entry
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ============= UTILITY FUNCTIONS =============

function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return (num / 1000000000000).toFixed(1) + 'T';
}

function formatMoney(num) {
    return '$' + formatNumber(num);
}

// ============= EVENT LISTENERS =============

function initializeEventListeners() {
    // Click button (bubble view)
    document.getElementById('click-area').addEventListener('click', handleClick);

    // Click button (hex grid view)
    document.getElementById('hex-click-btn').addEventListener('click', handleClick);

    // Mobile: Make main-area clickable on mobile devices
    const mainArea = document.querySelector('.main-area');
    if (mainArea && window.innerWidth <= 768) {
        mainArea.addEventListener('click', handleClick);
    }

    // Control buttons
    document.getElementById('save-btn').addEventListener('click', () => {
        saveGame();
        showNotification('Game saved!');
    });

    document.getElementById('export-btn').addEventListener('click', exportSave);
    document.getElementById('import-btn').addEventListener('click', () => showModal('import-modal'));
    document.getElementById('reset-btn').addEventListener('click', resetGame);

    // Modal buttons
    document.getElementById('import-confirm-btn').addEventListener('click', () => {
        importSave();
        hideModal('import-modal');
    });

    document.getElementById('import-cancel-btn').addEventListener('click', () => {
        hideModal('import-modal');
    });

    // Export modal buttons
    document.getElementById('export-copy-btn').addEventListener('click', copyExportToClipboard);
    document.getElementById('export-close-btn').addEventListener('click', () => {
        hideModal('export-modal');
    });

    // Auto-save every 5 seconds
    window.autoSaveInterval = setInterval(saveGame, 5000);

    // Update ticker message every 15 seconds
    setInterval(updateTickerMessage, 15000);

    // Handle window resize for hex grid
    window.addEventListener('resize', () => {
        if (hexGridRenderer && shouldUseHexGrid()) {
            const canvas = document.getElementById('hex-grid-canvas');
            const mainArea = canvas.parentElement;
            const rect = mainArea.getBoundingClientRect();
            hexGridRenderer.resize(rect.width, rect.height);
        }
    });
}

// ============= INITIALIZATION =============

function initGame() {
    console.log('Attention Sucker');
    console.log('A dystopian incremental game about AI content pollution');

    // Ensure unlockedUpgrades is always a Set
    if (!(gameState.unlockedUpgrades instanceof Set)) {
        gameState.unlockedUpgrades = new Set();
    }

    // Try to load saved game
    const loaded = loadGame();

    if (!loaded) {
        // First time playing
        updateDisplay();
        updateStageDisplay();
    }

    // Initialize upgrades display
    updateUpgradesDisplay();

    // Initialize event listeners
    initializeEventListeners();

    // Start game loop
    requestAnimationFrame(gameLoop);

    console.log('Game initialized. Click to begin your descent into the content apocalypse...');
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
