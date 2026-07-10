import type Phaser from 'phaser'
import type {
  Armor,
  Crop,
  Fertilizer,
  Fish,
  GachaPool,
  GameEvent,
  Item,
  Monster,
  Npc,
  Profession,
  Quest,
  Recipe,
  Skill,
  Weapon
} from './types'

const DATA_FILES = {
  crops: '/data/crops.json',
  items: '/data/items.json',
  weapons: '/data/weapons.json',
  armor: '/data/armor.json',
  fertilizers: '/data/fertilizers.json',
  skills: '/data/skills.json',
  monsters: '/data/monsters.json',
  npcs: '/data/npc.json',
  quests: '/data/quests.json',
  recipes: '/data/recipes.json',
  fish: '/data/fish.json',
  professions: '/data/professions.json',
  gacha: '/data/gacha.json',
  events: '/data/events.json'
} as const

type DataKey = keyof typeof DATA_FILES

interface GameDataStore {
  crops: Crop[]
  items: Item[]
  weapons: Weapon[]
  armor: Armor[]
  fertilizers: Fertilizer[]
  skills: Skill[]
  monsters: Monster[]
  npcs: Npc[]
  quests: Quest[]
  recipes: Recipe[]
  fish: Fish[]
  professions: Profession[]
  gacha: GachaPool[]
  events: GameEvent[]
}

const store: GameDataStore = {
  crops: [],
  items: [],
  weapons: [],
  armor: [],
  fertilizers: [],
  skills: [],
  monsters: [],
  npcs: [],
  quests: [],
  recipes: [],
  fish: [],
  professions: [],
  gacha: [],
  events: []
}

/** Gọi trong PreloadScene.preload() — nạp toàn bộ JSON dữ liệu game vào cache. */
export function preloadGameData(scene: Phaser.Scene): void {
  for (const key of Object.keys(DATA_FILES) as DataKey[]) {
    scene.load.json(key, DATA_FILES[key])
  }
}

/** Gọi trong PreloadScene.create() sau khi preload xong — đọc cache JSON vào store đã typed. */
export function initGameData(scene: Phaser.Scene): void {
  for (const key of Object.keys(DATA_FILES) as DataKey[]) {
    store[key] = scene.cache.json.get(key)
  }
}

export const GameData = {
  get crops(): Crop[] {
    return store.crops
  },
  get items(): Item[] {
    return store.items
  },
  get weapons(): Weapon[] {
    return store.weapons
  },
  get armor(): Armor[] {
    return store.armor
  },
  get fertilizers(): Fertilizer[] {
    return store.fertilizers
  },
  get skills(): Skill[] {
    return store.skills
  },
  get monsters(): Monster[] {
    return store.monsters
  },
  get npcs(): Npc[] {
    return store.npcs
  },
  get quests(): Quest[] {
    return store.quests
  },
  get recipes(): Recipe[] {
    return store.recipes
  },
  get fish(): Fish[] {
    return store.fish
  },
  get professions(): Profession[] {
    return store.professions
  },
  get gacha(): GachaPool[] {
    return store.gacha
  },
  get events(): GameEvent[] {
    return store.events
  }
}
