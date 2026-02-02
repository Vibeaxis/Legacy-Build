
export const ACHIEVEMENTS = [
  // Milestone Achievements
  {
    id: "first_mark",
    name: "The First Mark",
    description: "Begin your journey with a single signature.",
    icon: "PenTool",
    category: "Standard",
    conditionType: "count",
    threshold: 1
  },
  {
    id: "prolific_scribe",
    name: "Prolific Scribe",
    description: "Reach 50 signatures in your ledger.",
    icon: "Scroll",
    category: "Standard",
    conditionType: "count",
    threshold: 50
  },
  {
    id: "century_keeper",
    name: "Century Keeper",
    description: "Complete 100 signatures.",
    icon: "Book",
    category: "Standard",
    conditionType: "count",
    threshold: 100
  },
  // Skill Achievements (Consistency)
  {
    id: "steady_hand",
    name: "Steady Hand",
    description: "Achieve a consistency score of 90% or higher.",
    icon: "Activity",
    category: "Skill",
    conditionType: "consistency",
    threshold: 90
  },
  {
    id: "iron_grip",
    name: "Iron Grip",
    description: "Achieve a consistency score of 95% or higher.",
    icon: "Target",
    category: "Skill",
    conditionType: "consistency",
    threshold: 95
  },
  {
    id: "perfectionist",
    name: "The Perfectionist",
    description: "Achieve a perfect 100% consistency score.",
    icon: "Award",
    category: "Skill",
    conditionType: "consistency",
    threshold: 100
  },
  // Rarity Achievements
  {
    id: "diamond_rough",
    name: "Diamond in the Rough",
    description: "Receive a Rare prompt.",
    icon: "Gem",
    category: "Rarity",
    conditionType: "rarity",
    target: "rare"
  },
  {
    id: "legacy_touched",
    name: "Legacy Touched",
    description: "Encounter a Fixed Legacy prompt.",
    icon: "Crown",
    category: "Rarity",
    conditionType: "type",
    target: "fixed_legacy"
  },
  {
    id: "mythic_collector",
    name: "Mythic Collector",
    description: "Sign a Mythic rarity prompt.",
    icon: "Sparkles",
    category: "Rarity",
    conditionType: "rarity",
    target: "mythic"
  },
  // Narrative/Lexicon Achievements
  {
    id: "weaver",
    name: "The Weaver",
    description: "Use words from multiple unlocked lexicons.",
    icon: "Feather",
    category: "Narrative",
    conditionType: "lexicon_mix",
    target: "mixed"
  },
  {
    id: "natures_child",
    name: "Nature's Child",
    description: "Unlock the Nature's Whisper lexicon.",
    icon: "Leaf",
    category: "Narrative",
    conditionType: "lexicon_unlock",
    target: "nature"
  },
  {
    id: "industrial_heart",
    name: "Industrial Heart",
    description: "Unlock the Industrial lexicon.",
    icon: "Hammer",
    category: "Narrative",
    conditionType: "lexicon_unlock",
    target: "industrial"
  },
  {
    id: "ethereal_dreamer",
    name: "Ethereal Dreamer",
    description: "Unlock the Ethereal lexicon.",
    icon: "Moon",
    category: "Narrative",
    conditionType: "lexicon_unlock",
    target: "ethereal"
  }
];
