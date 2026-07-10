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
export type FertilizerTier = 'basic' | 'advanced' | 'golden'
export type PenType = 'chicken_coop' | 'large_pen'

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

/** Phân bón — file/interface riêng (giống `Weapon`/`Armor`) thay vì nhồi vào `items.json`/`Item` chung, vì có
 * field số nhân hiệu ứng riêng mà nông sản/vật liệu khác không cần. Bón lên 1 ô đang `planted` (xem
 * `FarmManager.applyFertilizer()`): `growth_speed_multiplier` nhân trực tiếp vào số giờ cần để lớn/chín (nhỏ
 * hơn 1 = lớn nhanh hơn), `moisture_decay_multiplier` nhân vào `crop.moisture_decay_per_hour` (nhỏ hơn 1 = giữ
 * ẩm lâu hơn), `yield_bonus` cộng thẳng vào số lượng thu hoạch được (sau khi đã tính % độ ẩm). */
export interface Fertilizer {
  id: string
  name: string
  tier: FertilizerTier
  buy_price: number
  growth_speed_multiplier: number
  moisture_decay_multiplier: number
  yield_bonus: number
  stack_max: number
  description: string
}

/** Định nghĩa 1 loại vật nuôi (Sprint 8) — `pen_type` quyết định con này nuôi được trong loại chuồng nào
 * (`chicken_coop` 4 chỗ cho gà/vịt, `large_pen` 2 chỗ cho bò/cừu, theo đúng `docs/gameplay/crafting.md`).
 * Chưa có shop nên `buy_price` hiện chỉ mang tính tham khảo/tư liệu, chưa có nơi nào đọc field này để bán thật
 * (giống cách `Weapon`/`Armor` giữ `buy_price`/`craft_recipe` dù chưa có shop/craft thật). */
export interface AnimalDef {
  id: string
  name: string
  pen_type: PenType
  buy_price: number
  product_item: string
  cycle_hours: number
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

/** Trang bị (armor) — Sprint "Trang bị + Tiềm năng" mở rộng thêm 4 field bonus so với schema gốc trong
 * `docs/data/data-schema.md` (trước đó chỉ có `def`/`hp_bonus`, đủ cho slot `chest`). Theo bảng "Chỉ số gốc
 * theo slot" trong `docs/gameplay/equipment.md`, mỗi slot có 1-2 chỉ số chính khác nhau (Bao tay: DEF+ATK,
 * Giày: DEF+Move Speed, Nhẫn: Luck+Crit%, Dây chuyền: HP+MP) — 4 field mới đều mặc định 0, chỉ khác 0 ở đúng
 * slot liên quan (không dùng `Partial`/optional để khỏi phải `?? 0` rải rác mọi nơi tính tổng). */
export interface Armor {
  id: string
  name: string
  slot: ArmorSlot
  rank: ItemRank
  def: number
  hp_bonus: number
  atk_bonus: number
  mp_bonus: number
  move_speed_bonus: number
  luck_bonus: number
  /** % Chí mạng cộng thêm — đặt tên khác `crit_bonus` (đã dùng cho field tương ứng bên `Weapon`) chỉ để rõ
   * nghĩa hơn khi đọc code tính tổng ở `CombatManager`, giá trị/ý nghĩa giống nhau. */
  crit_bonus_percent: number
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

/** Trạng thái lưu lại của 1 ô đất — Sprint 6. Khớp 1-1 với field runtime thật của `FarmManager.FarmTileRuntime`
 * (trừ `x/y/width/height/tileType`, là metadata vị trí CỐ ĐỊNH từ `farmTiles.ts`, không cần lưu vì luôn dựng
 * lại giống nhau từ placement — chỉ `id` là đủ để khớp lại đúng ô khi load). Lưu thẳng `plantedAt`/
 * `lastWateredAt` (mốc thời gian thực, không lưu % `moisture` tính sẵn) để cây tiếp tục lớn/khô đúng theo giờ
 * thực đã trôi qua kể cả trong lúc tắt game — khớp đúng thiết kế farming.md "mọi thời gian tính bằng giờ
 * thực". **Khác với schema gốc trong `docs/data/data-schema.md` (dùng `x/y`+`moisture` tính sẵn)** — schema đó
 * viết trước khi `FarmManager` thật được dựng, chưa từng khớp implementation, xem `docs/planning/progress.md`. */
export interface FarmTileSaveState {
  id: number
  state: FarmTileState
  cropId: string | null
  plantedAt: number | null
  lastWateredAt: number | null
  harvestCountRemaining: number
  cycleHours: number
  isRegrowCycle: boolean
  /** Loại phân bón đang có hiệu lực trên ô (Sprint 7) — `null` nếu chưa bón. */
  fertilizerId: string | null
}

/** Trạng thái lưu lại của 1 CHỖ NUÔI trong chuồng (Sprint 8) — `id` khớp `AnimalPenSlot.id` (vị trí cố định,
 * xem `data/animalPens.ts`), giống cách `FarmTileSaveState` khớp theo `id` thay vì toạ độ. `animalType: null`
 * = chỗ trống (chưa có con nào — chưa có shop mua con giống, test bằng cách gán thẳng qua console, xem
 * `docs/planning/progress.md` Sprint 8). `cycleStartAt: null` = chưa cho ăn lần nào từ sau lần thu hoạch gần
 * nhất — phải cho ăn để BẮT ĐẦU 1 chu kỳ sản xuất mới (đúng "Done when": bỏ đói thì không sản xuất, không chết
 * — con vật không mất đi, chỉ đơn giản chu kỳ không chạy). */
export interface AnimalState {
  id: number
  animalType: string | null
  lastFedAt: number | null
  cycleStartAt: number | null
}

/** Vị trí + map hiện tại lúc lưu — Sprint 6 chỉ hỗ trợ resume vào lại `GameScene` (Farm), KHÔNG resume thẳng
 * vào Bãi Tập Luyện/Đồng Cỏ dù đang lưu lúc ở đó (đơn giản hoá hợp lý theo đúng "Done when" Sprint 6 chỉ yêu
 * cầu giữ đúng farm + inventory + stats, không yêu cầu giữ đúng map chiến đấu đang đứng) — `scene` hiện luôn là
 * `'GameScene'`, giữ field riêng để mở rộng khi cần resume đa map thật sau này. */
export interface PlayerPositionState {
  scene: string
  x: number
  y: number
}

export interface GameTimeState {
  day: number
  hour: number
}

/** Chỉ số chiến đấu runtime của người chơi — Sprint 5, mở rộng thêm ở Sprint "Trang bị + Tiềm năng"
 * (`move_speed/crit/attack_speed/luck/free_points/equipped_armor`, theo đúng `docs/gameplay/equipment.md` +
 * `docs/planning/progression.md`). `weapon_id` là vũ khí đang cầm — đổi qua `CombatManager.equipWeapon()`.
 * **`max_hp`/`max_mp`/`atk`/`def`/`move_speed`/`crit`/`attack_speed`/`luck` là chỉ số GỐC (chưa cộng bonus
 * trang bị)** — tổng thật dùng cho combat/HUD phải qua `CombatManager.getTotal*()` (cộng thêm vũ khí +
 * `equipped_armor`), không đọc thẳng field này ở ngoài `CombatManager`. */
export interface PlayerStats {
  level: number
  exp: number
  exp_to_next: number
  hp: number
  max_hp: number
  mp: number
  max_mp: number
  atk: number
  def: number
  move_speed: number
  /** % Chí mạng gốc (chưa cộng bonus vũ khí/nhẫn) — đơn vị %, vd `2` = 2%. */
  crit: number
  attack_speed: number
  luck: number
  gold: number
  weapon_id: string
  /** Điểm thuộc tính tự do CHƯA phân bổ (10 điểm/lần lên cấp, xem `docs/planning/progression.md`) — trừ dần
   * mỗi lần `CombatManager.allocatePoint()` thành công. */
  free_points: number
  /** Item đang mặc ở từng slot (`null` = trống) — key khớp `ArmorSlot`, đổi qua `CombatManager.equipArmor()`. */
  equipped_armor: Record<ArmorSlot, string | null>
}

export interface SaveState {
  player_id: string
  gender: Gender
  farm_tiles: FarmTileSaveState[]
  animals: AnimalState[]
  buildings_built: string[]
  farm_decorations: unknown[]
  player_stats: PlayerStats
  /** Túi đồ — Sprint 6. Kiểu tối giản (không import `InventorySlot` từ `systems/InventoryManager` để giữ
   * `data/types.ts` không phụ thuộc ngược vào `systems/`) — `InventorySlot` thật khớp cấu trúc này 1-1 nên gán
   * qua lại được trực tiếp (structural typing), xem `InventoryManager.serialize()`. */
  inventory: Array<{ itemId: string; quantity: number }>
  game_time: GameTimeState
  player_position: PlayerPositionState
}
