
export const CORE_LEXICON = {
  nouns: [
    "path", "stone", "river", "tree", "mountain", "wind", "shadow", "light", "voice", "hand",
    "door", "fire", "water", "home", "heart", "breath", "sky", "earth", "sun", "moon",
    "star", "night", "day", "ocean", "forest", "desert", "rain", "snow", "ice", "dust",
    "sand", "rock", "cliff", "valley", "hill", "field", "garden", "flower", "leaf", "root",
    "seed", "fruit", "bird", "wing", "feather", "claw", "tooth", "bone", "blood", "tear",
    "smile", "gaze", "touch", "step", "journey", "memory", "dream", "thought", "word", "silence",
    "sound", "echo", "whisper", "song", "note", "rhythm", "time", "moment", "hour", "year",
    "age", "past", "future", "present", "beginning", "end", "middle", "center", "edge", "boundary",
    "wall", "window", "roof", "floor", "bridge", "road", "gate", "key", "lock", "chain",
    "anchor", "sail", "ship", "boat", "wave", "tide", "storm", "cloud", "mist", "fog",
    "island", "shore", "beach", "cavern", "cave", "tunnel", "mirror", "glass", "iron", "gold",
    "silver", "copper", "clay", "wood", "ash", "smoke", "spark", "flame", "ember", "coal"
  ],
  verbs: [
    "walks", "stands", "flows", "grows", "rises", "blows", "falls", "shines", "speaks", "holds",
    "sees", "touches", "drifts", "fades", "blooms", "breaks", "mends", "whispers", "echoes", "runs",
    "sleeps", "wakes", "dreams", "remembers", "forgets", "loses", "finds", "seeks", "hides", "shows",
    "opens", "closes", "locks", "unlocks", "builds", "destroys", "burns", "freezes", "melts", "shatters",
    "bends", "twists", "turns", "stops", "begins", "ends", "waits", "listens", "watches", "calls",
    "answers", "asks", "knows", "learns", "teaches", "writes", "reads", "paints", "draws", "sings",
    "dances", "flies", "swims", "sails", "rows", "climbs", "digs", "plants", "harvests", "eats",
    "drinks", "breathes", "lives", "dies", "fights", "surrenders", "gives", "takes", "keeps", "shares",
    "loves", "hates", "fears", "hopes", "wishes", "prays", "believes", "doubts", "trusts", "betrays",
    "protects", "attacks", "defends", "heals", "hurts", "helps", "hinders", "changes", "stays", "leaves",
    "arrives", "departs", "returns", "wanders", "travels", "follows", "leads", "guides", "misleads"
  ],
  sentiments: [
    "quietly", "steadily", "softly", "brightly", "calmly", "slowly", "firmly", "loudly", "quickly", "harshly",
    "gently", "fiercely", "wildly", "tame", "bravely", "fearfully", "joyfully", "sadly", "angrily", "peacefully",
    "patiently", "eagerly", "reluctantly", "willingly", "freely", "bound", "lost", "found", "broken", "whole",
    "empty", "full", "heavy", "light", "dark", "warm", "cold", "hot", "dry", "wet",
    "smooth", "rough", "sharp", "dull", "hard", "soft", "sweet", "bitter", "sour", "salty",
    "clear", "cloudy", "hazy", "foggy", "misty", "sunny", "rainy", "stormy", "windy", "still",
    "silent", "noisy", "old", "new", "young", "ancient", "modern", "future", "past", "present",
    "high", "low", "deep", "shallow", "wide", "narrow", "long", "short", "big", "small",
    "vast", "tiny", "infinite", "finite", "eternal", "temporary", "fleeting", "lasting", "constant", "changing"
  ]
};

export const UNLOCKABLE_PACKS = [
  {
    id: "celestial",
    name: "Celestial Pack",
    description: "Words from the heavens above.",
    unlockedAt: 10,
    words: {
      nouns: ["comet", "orbit", "nebula", "constellation", "eclipse", "horizon", "zenith", "stardust", "void", "nova"],
      verbs: ["ascends", "descends", "aligns", "collides", "shimmers", "orbits", "eclipses", "illuminates", "gravitates", "expands"],
      sentiments: ["infinitely", "cosmically", "radiantly", "distantly", "universally", "stellarly", "celestially"]
    }
  },
  {
    id: "forest",
    name: "Forest Pack",
    description: "Whispers from the deep woods.",
    unlockedAt: 15,
    words: {
      nouns: ["canopy", "fern", "moss", "thicket", "grove", "bark", "sap", "mycelium", "undergrowth", "hollow"],
      verbs: ["rustles", "roots", "sprouts", "decays", "shelters", "entangles", "flourishes", "withers", "branches", "shades"],
      sentiments: ["wildly", "naturally", "densely", "quietly", "organically", "primitively", "serenely"]
    }
  },
  {
    id: "obsidian",
    name: "Obsidian Pack",
    description: "Sharp, dark, and reflective words.",
    unlockedAt: 30,
    words: {
      nouns: ["shard", "blade", "volcano", "glass", "nightmare", "abyss", "edge", "shadow", "reflection", "darkness"],
      verbs: ["cuts", "bleeds", "reflects", "shatters", "pierces", "darkens", "slices", "erupts", "solidifies", "fractures"],
      sentiments: ["sharply", "darkly", "coldly", "brittly", "intensely", "dangerously", "mysteriously"]
    }
  },
  {
    id: "amber",
    name: "Amber Pack",
    description: "Preserved memories and golden light.",
    unlockedAt: 40,
    words: {
      nouns: ["resin", "fossil", "honey", "sunset", "glow", "time", "capsule", "warmth", "gold", "preservation"],
      verbs: ["traps", "preserves", "glows", "hardens", "melts", "encapsulates", "remembers", "lingers", "shines", "suspends"],
      sentiments: ["warmly", "timelessly", "sweetly", "viscously", "goldenly", "eternally", "softly"]
    }
  },
  {
    id: "industrial",
    name: "Industrial Pack",
    description: "Steel, steam, and structure.",
    unlockedAt: 50,
    words: {
      nouns: ["gear", "piston", "factory", "smoke", "steel", "engine", "clock", "mechanism", "grid", "metal"],
      verbs: ["grinds", "pumps", "churns", "builds", "forges", "mechanizes", "assembles", "constructs", "drives", "fuels"],
      sentiments: ["mechanically", "precisely", "relentlessly", "powerfully", "rhythmically", "structurally", "efficiently"]
    }
  },
  {
    id: "ethereal",
    name: "Ethereal Pack",
    description: "Dreams, spirits, and the unknown.",
    unlockedAt: 60,
    words: {
      nouns: ["spirit", "ghost", "wraith", "phantom", "illusion", "mirage", "vapor", "essence", "aura", "soul"],
      verbs: ["haunts", "vanishes", "appears", "floats", "drifts", "transcends", "fades", "manifests", "dissolves", "evaporates"],
      sentiments: ["spookily", "ethereally", "ghostly", "insubstantially", "mysteriously", "spiritually", "transiently"]
    }
  }
];

// For backward compatibility and LexiconManager usage
export const LEXICONS = [
    {
        id: "core",
        name: "Core Lexicon",
        description: "The foundation of all language.",
        unlockedAt: 0,
        words: CORE_LEXICON
    },
    ...UNLOCKABLE_PACKS
];
