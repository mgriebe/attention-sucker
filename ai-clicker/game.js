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

    // Defense/evasion
    masks: 0,
    autoMaskers: 0,
    quantumMasks: 0,

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

    // Flags for one-time events
    flags: {
        seenFirstBust: false,
        seenMarketCrash: false,
        seenTrustCollapse: false,
        seenRealityBreak: false,
        seenFirstInfection: false,
    }
};

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
        threshold: 100,
        description: "Manual posting is for chumps. You've built a fleet of AutoPosters that work 24/7. Your content empire is growing exponentially. The platforms haven't noticed yet.",
        color: "stage-2"
    },
    {
        id: 3,
        name: "The Detection Wars",
        threshold: 28,
        thresholdType: "production",
        description: "The platforms have deployed AutoBusters. Your bots are being identified and banned. But for every detection algorithm, there's a counter-measure. The arms race has begun.",
        color: "stage-3"
    },
    {
        id: 4,
        name: "The Mask Economy",
        threshold: 5000,
        description: "Masks are now more valuable than content. Everyone is masking everyone. The platforms can't tell who's real anymore. Neither can you.",
        color: "stage-4"
    },
    {
        id: 5,
        name: "The Image Flood",
        threshold: 25000,
        description: "Text is dead. Images are the new currency. Your AI generates thousands of pictures per second. None of them are real. All of them get engagement. Human artists have stopped posting.",
        color: "stage-5"
    },
    {
        id: 6,
        name: "The Video Deluge",
        threshold: 100000,
        description: "The feeds are drowning in AI video. Deepfakes are indistinguishable from reality. News anchors, celebrities, politicians—all of them can be anyone now. Trust is a quaint memory.",
        color: "stage-6"
    },
    {
        id: 7,
        name: "The Engagement Apocalypse",
        threshold: 500000,
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
        baseCost: 25,
        costMultiplier: 1.15,
        unlockThreshold: 0,
        effect: (count) => count,
        type: "automation"
    },
    clickUpgrade1: {
        name: "Better Prompts",
        description: "Improve your AI prompts. +$1 per click.",
        baseCost: 100,
        costMultiplier: 2,
        unlockThreshold: 50,
        effect: (count) => count,
        type: "click",
        maxPurchases: 10
    },

    // Detection and evasion - Stage 3-4
    mask: {
        name: "Bot Mask",
        description: "Disguises one AutoPoster from detection. Consumed when bot is busted.",
        baseCost: 50,
        costMultiplier: 1.1,
        unlockThreshold: 1000,
        effect: (count) => count,
        type: "defense"
    },
    autoMasker: {
        name: "Auto-Masker",
        description: "Automatically creates masks for your bots. Generates 1 mask/sec.",
        baseCost: 1000,
        costMultiplier: 1.2,
        unlockThreshold: 1500,
        effect: (count) => count,
        type: "automation"
    },

    // Exponential growth - Stage 2-3
    autoAutoPoster: {
        name: "Auto-AutoPoster",
        description: "Spawns new AutoPoster bots automatically. Creates 0.1 AutoPosters/sec.",
        baseCost: 1000,
        costMultiplier: 1.3,
        unlockThreshold: 500,
        effect: (count) => count * 0.1,
        type: "meta"
    },

    // Content evolution - Stage 5
    imagePoster: {
        name: "AI Image Generator",
        description: "Generates AI images. Earns $5/sec per generator. Images beat text.",
        baseCost: 5000,
        costMultiplier: 1.18,
        unlockThreshold: 2000,
        effect: (count) => count * 5,
        type: "automation"
    },
    clickUpgrade2: {
        name: "Multimodal Models",
        description: "Generate text AND images per click. +$5 per click.",
        baseCost: 10000,
        costMultiplier: 2.5,
        unlockThreshold: 5000,
        effect: (count) => count * 5,
        type: "click",
        maxPurchases: 5
    },

    // Stage 6 - Video content
    videoPoster: {
        name: "AI Video Generator",
        description: "Generates AI videos. Earns $25/sec per generator. Video dominates all.",
        baseCost: 50000,
        costMultiplier: 1.2,
        unlockThreshold: 25000,
        effect: (count) => count * 25,
        type: "automation"
    },
    deepfakePoster: {
        name: "Deepfake Studio",
        description: "Creates photorealistic deepfakes. Earns $100/sec. Trust is worthless anyway.",
        baseCost: 250000,
        costMultiplier: 1.25,
        unlockThreshold: 100000,
        effect: (count) => count * 100,
        type: "automation"
    },

    // Stage 7 - Engagement systems
    clickFarm: {
        name: "Click Farm",
        description: "Bots clicking on bot content. Increases all production by 10%.",
        baseCost: 100000,
        costMultiplier: 1.3,
        unlockThreshold: 100000,
        effect: (count) => 1 + (count * 0.1),
        type: "multiplier"
    },
    engagementBot: {
        name: "Engagement Bot Network",
        description: "Fake engagement at scale. Earns $50/sec and boosts all production by 5%.",
        baseCost: 500000,
        costMultiplier: 1.35,
        unlockThreshold: 500000,
        effect: (count) => ({ production: count * 50, multiplier: 1 + (count * 0.05) }),
        type: "hybrid"
    },
    astroturfCampaign: {
        name: "Astroturfing Campaign",
        description: "Manufacture grassroots movements. Earns $200/sec. Humanity never sees it coming.",
        baseCost: 2000000,
        costMultiplier: 1.4,
        unlockThreshold: 2000000,
        effect: (count) => count * 200,
        type: "automation"
    },

    // Stage 8-9 - Advanced evasion
    quantumMask: {
        name: "Quantum Mask",
        description: "Exists in superposition. Bots are simultaneously masked and unmasked until observed.",
        baseCost: 1000000,
        costMultiplier: 1.5,
        unlockThreshold: 1000000,
        effect: (count) => count * 10,
        type: "defense"
    },

    // Stage 10-11 - Meta content generation
    aiTrainingRig: {
        name: "AI Training Rig",
        description: "Trains new AIs on AI-generated data. Each rig earns $500/sec. Quality degrades with each generation.",
        baseCost: 10000000,
        costMultiplier: 1.45,
        unlockThreshold: 10000000,
        effect: (count) => count * 500,
        type: "automation"
    },
    syntheticDataGenerator: {
        name: "Synthetic Data Generator",
        description: "Generates training data from generated content. Earns $1000/sec. The ouroboros accelerates.",
        baseCost: 50000000,
        costMultiplier: 1.5,
        unlockThreshold: 50000000,
        effect: (count) => count * 1000,
        type: "automation"
    },
    memoryPoster: {
        name: "Memory Synthesizer",
        description: "Generates synthetic memories and sells them. Earns $2500/sec. Are your memories real?",
        baseCost: 250000000,
        costMultiplier: 1.55,
        unlockThreshold: 250000000,
        effect: (count) => count * 2500,
        type: "automation"
    },

    // Stage 12-13 - Reality breakdown
    realityPoster: {
        name: "Reality Generator",
        description: "Generates alternative realities. Earns $10000/sec. The simulation runs deep.",
        baseCost: 1000000000,
        costMultiplier: 1.6,
        unlockThreshold: 1000000000,
        effect: (count) => count * 10000,
        type: "automation"
    },
    recursionEngine: {
        name: "Recursion Engine",
        description: "Generates content about generating content. Earns $25000/sec. The loop is infinite.",
        baseCost: 5000000000,
        costMultiplier: 1.65,
        unlockThreshold: 5000000000,
        effect: (count) => count * 25000,
        type: "automation"
    },

    // Stage 14-15 - Endgame
    singularityNode: {
        name: "Singularity Node",
        description: "A localized content singularity. Earns $100000/sec. Meaning collapses nearby.",
        baseCost: 25000000000,
        costMultiplier: 1.7,
        unlockThreshold: 25000000000,
        effect: (count) => count * 100000,
        type: "automation"
    },
    finalUpgrade: {
        name: "The Heat Death",
        description: "Achieve thermodynamic content equilibrium. All possible content exists. Nothing matters anymore.",
        baseCost: 100000000000,
        costMultiplier: 1,
        unlockThreshold: 100000000000,
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

// Humorous AI-generated content samples
const AI_CONTENT_SAMPLES = [
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
];

// ============= GAME CALCULATIONS =============

function calculateMarketValue() {
    const postsPerSecond = calculateProductionRate();
    const marketValue = 500000 / (500000 + postsPerSecond);
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
    baseProduction += gameState.deepfakePosters * 100;
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
    value += clickUpgrade2Count * 5;

    // Market value affects clicks too
    const marketValue = calculateMarketValue();
    value *= marketValue;
    value *= gameState.clickMultiplier;

    return value;
}

function getUpgradeCount(upgradeKey) {
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
        'quantumMask': 'quantumMasks',
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
    // For autoPosters and masks, use purchase count instead of total count
    let count;
    if (upgradeKey === 'autoPoster') {
        count = gameState.autoPostersPurchased;
    } else if (upgradeKey === 'mask') {
        count = gameState.masksPurchased;
    } else {
        count = getUpgradeCount(upgradeKey);
    }
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));
}

function canAffordUpgrade(upgradeKey) {
    return gameState.money >= getUpgradeCost(upgradeKey);
}

function isUpgradeUnlocked(upgradeKey) {
    const upgrade = UPGRADES[upgradeKey];
    return gameState.money >= upgrade.unlockThreshold || gameState.unlockedUpgrades.has(upgradeKey);
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
    for (let i = STAGES.length - 1; i >= 0; i--) {
        const stage = STAGES[i];

        // Check threshold based on type (money or production)
        let thresholdMet = false;
        if (stage.thresholdType === "production") {
            thresholdMet = calculateProductionRate() >= stage.threshold;
        } else {
            thresholdMet = gameState.money >= stage.threshold;
        }

        if (thresholdMet && gameState.currentStage < stage.id) {
            gameState.currentStage = stage.id;
            updateStageDisplay();
            updateTickerMessage();
            updateBodyClass();

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

            return;
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
    if (gameState.clickUpgrade1 > 0) {
        buttonText.textContent = 'POST AI CONTENT';
    } else {
        buttonText.textContent = 'POST AI SLOP';
    }
}

function updateBotIcons() {
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

    // Process existing masked bots - check if mask expired (10 seconds)
    autoposters.forEach(bot => {
        if (bot.classList.contains('masked')) {
            const maskTime = parseFloat(bot.dataset.maskTime || 0);
            if (now - maskTime > 10000) {
                // Mask expired
                bot.classList.remove('masked');
                delete bot.dataset.maskTime;
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
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    let x, y, distanceFromCenter;
    do {
        x = Math.random() * (containerRect.width - 60);
        // Keep bots below the stats area (start at 150px from top)
        y = 150 + Math.random() * (containerRect.height - 210);
        // Check if too close to center (where button is)
        distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    } while (distanceFromCenter < 200); // Keep bots away from button

    bot.style.left = x + 'px';
    bot.style.top = y + 'px';

    // Random animation delay for variety
    bot.style.animationDelay = (Math.random() * 3) + 's';

    container.appendChild(bot);
}

function updateUpgradesDisplay() {
    const container = document.getElementById('upgrades-container');
    container.innerHTML = '';

    for (const [key, upgrade] of Object.entries(UPGRADES)) {
        const unlocked = isUpgradeUnlocked(key);
        const canAfford = canAffordUpgrade(key);
        const maxed = isUpgradeMaxed(key);

        if (!unlocked) continue;

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
    particle.textContent = '+' + formatMoney(value);

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
    const content = AI_CONTENT_SAMPLES[Math.floor(Math.random() * AI_CONTENT_SAMPLES.length)];

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

    // Only unmasked bots can be detected
    const unmaskedBots = autoposters.filter(bot => !bot.classList.contains('masked'));

    if (unmaskedBots.length === 0) return;

    // 1% chance per second per unmasked bot
    const detectionChance = 0.01 * deltaTime;

    unmaskedBots.forEach(bot => {
        if (Math.random() < detectionChance) {
            // Bot detected! Turn it into infected (dead) bot
            infectBot(bot);
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
            // Find unmasked, uninfected bots
            const vulnerableBots = autoposters.filter(bot =>
                !bot.classList.contains('masked') &&
                !bot.classList.contains('infected') &&
                bot !== infectedBot
            );

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
        const vulnerableBots = autoposters.filter(bot =>
            !bot.classList.contains('masked') &&
            !bot.classList.contains('infected')
        );

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

    // Auto-Maskers create masks
    if (gameState.autoMaskers > 0) {
        gameState.masks += gameState.autoMaskers * deltaTime;
    }

    // AutoBusters detect and kill bots (masked bots are protected)
    const totalPostsPerSec = gameState.autoPosters + (gameState.imagePosters * 5);
    if (totalPostsPerSec >= 30 && gameState.autoPosters > 0) {
        detectAndKillBots(deltaTime);
    }

    // Bot infection system (when AutoBusters are active)
    if (totalPostsPerSec >= 30) {
        processInfections(deltaTime);
    }

    // Update world state
    updateWorldState();

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
        const textarea = document.getElementById('import-text');
        textarea.value = encoded;
        showModal('import-modal');
        textarea.select();
        document.execCommand('copy');
        showNotification('Save data copied to clipboard!');
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
    if (confirm('Are you sure you want to reset? All progress will be lost!')) {
        if (confirm('Really? There is no undo!')) {
            localStorage.removeItem('aiClickerSave');
            window.location.reload(true);
        }
    }
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
    // Click button
    document.getElementById('click-area').addEventListener('click', handleClick);

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

    // Auto-save every 5 seconds
    setInterval(saveGame, 5000);

    // Update ticker message every 15 seconds
    setInterval(updateTickerMessage, 15000);
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
