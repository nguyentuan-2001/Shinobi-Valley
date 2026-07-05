// TypeScript interfaces khớp từng schema trong docs/data/data-schema.md

export type CropTier = 'common' | 'mid' | 'advanced' | 'rare'
export type ItemRank = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type ItemType =
  | 'weapon'
  | 'armor'
  | 'tool'
  | 'consumable'
  | 'material'
  | 'seed'
  | 'fish'
  | 'decoration'
  | 'currency'
export type ArmorSlot = 'head' | 'chest' | 'hands' | 'feet' | 'ring' | 'necklace'
export type SkillType = 'active' | 'buff' | 'debuff' | 'passive' | 'ultimate'
export type SkillEffect =
  'poison' | 'bleed' | 'slow' | 'stun' | 'burn' | 'def_down' | 'atk_up' | null
export type RecipeType = 'fixed' | 'random'
export type Station = 'blacksmith' | 'alchemist' | 'kitchen' | 'loom' | 'field'
export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type FarmTileState = 'empty' | 'tilled' | 'planted' | 'ready' | 'withered'
export type Gender = 'male' | 'female'

export interface Crop {
  id: string
  name: string
  tier: CropTier
  seed_cost: number
  growth_hours: number
  multi_harvest: boolean
  harvest_count: number
  regrow_hours: number
  yield_min: number
  yield_max: number
  sell_price: number
  unlock_level: number
  needs_water_tile: boolean
  night_only: boolean
  special_tool: string | null
  crafting_tag: string[]
  moisture_decay_per_hour: number
  moisture_min: number
  moisture_max: number
}

export interface Item {
  id: string
  name: string
  type: ItemType
  rarity: ItemRank
  sell_price: number
  stack_max: number
  description: string
  source: string[]
  crafting_tag: string[]
}

export interface Weapon {
  id: string
  name: string
  type: 'weapon'
  weapon_class: string
  rank: ItemRank
  atk: number
  atk_multiplier: number
  crit_bonus: number
  attack_speed_bonus: number
  skill_class: string
  buy_price: number
  sell_price: number
  craft_recipe: Record<string, number>
  unlock_level: number
  enhancement_max: number
  sub_stats: string[]
}

export interface Armor {
  id: string
  name: string
  slot: ArmorSlot
  rank: ItemRank
  def: number
  hp_bonus: number
  sub_stats: string[]
  craft_recipe: Record<string, number>
  unlock_level: number
  enhancement_max: number
}

export interface Skill {
  id: string
  name: string
  class: string
  skill_index: number
  unlock_level: number
  mp_cost: number
  cooldown: number
  damage_multiplier: number
  hits: number
  range: string
  aoe: boolean
  aoe_radius: number
  effect: SkillEffect
  effect_duration: number
  type: SkillType
}

export interface MonsterDrop {
  item: string
  chance: number
  qty_min: number
  qty_max: number
}

export interface Monster {
  id: string
  name: string
  map: string
  type: string
  level: number
  hp: number
  atk: number
  def: number
  move_speed: number
  exp: number
  drop_table: MonsterDrop[]
  drop_gold_min: number
  drop_gold_max: number
  is_boss: boolean
}

export interface Npc {
  id: string
  name: string
  location: string
  shop_type: string | null
  quest_giver: boolean
  dialogue_default: string
  unlock_level: number
  relationship_max: number
}

export interface QuestReward {
  gold: number
  exp: number
  item?: string
}

export interface Quest {
  id: string
  name: string
  giver: string
  type: string
  objective: Record<string, string | number>
  reward: QuestReward
  prerequisite_quest: string | null
  unlock_level: number
  story_quest: boolean
}

export interface RecipeIngredient {
  item: string
  qty: number
}

export interface Recipe {
  id: string
  result_item: string
  result_rank: ItemRank
  result_qty: number
  type: RecipeType
  station: Station
  station_level: number
  ingredients: RecipeIngredient[]
  craft_time: number
  unlock_level: number
}

export interface Fish {
  id: string
  name: string
  rarity: FishRarity
  sell_price: number
  location: string[]
  catch_time_min: number
  catch_time_max: number
  sweet_zone_size: number
  luck_required: number
  night_only: boolean
}

export interface ProfessionXpSource {
  action: string
  xp: number
}

export interface ProfessionLevelReward {
  level: number
  effect: string
  value: number
}

export interface Profession {
  id: string
  name: string
  max_level: number
  xp_per_level: number
  unlock_condition: string
  xp_sources: ProfessionXpSource[]
  level_rewards: ProfessionLevelReward[]
}

export interface GachaPity {
  guaranteed_rare_at: number
  soft_pity_starts: number
  soft_pity_legendary_bonus_per_pull: number
  hard_pity_legendary_at: number
  hard_pity_mythic_at: number
}

export interface GachaPool {
  id: string
  name: string
  currency: string
  cost_per_pull: number
  cost_10_pull: number
  free_daily_pull: boolean
  rates: Record<string, number>
  pity: GachaPity
}

export interface EventReward {
  tokens: number
  reward: string
}

export interface EventBoss {
  name: string
  level: number
  spawn_location: string
  respawn_hours: number
}

export interface GameEvent {
  id: string
  name: string
  duration_days: number
  currency: string
  activities: string[]
  rewards: EventReward[]
  event_boss: EventBoss
}

export interface FarmTile {
  x: number
  y: number
  state: FarmTileState
  crop_id: string | null
  planted_at_timestamp: number | null
  moisture: number
  fertilizer_applied: string | null
  harvest_count_remaining: number
}

export interface AnimalState {
  type: string
  pen_slot: number
  last_fed_timestamp: number
  last_product_timestamp: number
}

export interface SaveState {
  player_id: string
  gender: Gender
  farm_tiles: FarmTile[]
  animals: AnimalState[]
  buildings_built: string[]
  farm_decorations: unknown[]
}
