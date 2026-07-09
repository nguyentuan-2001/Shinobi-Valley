import Phaser from 'phaser'
import type { ArmorSlot, PlayerStats } from '../data/types'
import { GameData } from '../data/DataLoader'
import { createDefaultSaveState } from './SaveManager'

const RESPAWN_HP_MP_RATIO = 0.5
const DEATH_GOLD_LOSS_RATIO = 0.1
/** User yêu cầu thêm giới hạn (trước đó case 13 chỉ trừ đúng 10%, không trần) — nhân vật càng giàu càng không
 * bị phạt vô hạn mỗi lần chết, chặn ở 30.000đ dù 10% thực tế lớn hơn số này. */
const MAX_DEATH_GOLD_LOSS = 30_000
/** Lên cấp không còn tự cộng cứng chỉ số (bản Sprint 5 cũ) — thay bằng cộng điểm tự do vào kho, người chơi tự
 * phân bổ ở tab "Tiềm năng" (đúng `docs/planning/progression.md`: "Mỗi lần lên cấp nhận 10 điểm thuộc tính tự
 * do"). Đường cong EXP-cần-lên-cấp vẫn giữ nguyên hệ số nhân cũ (chưa áp đúng bảng EXP curve thật trong
 * progression.md — ngoài phạm vi thay đổi lần này, chỉ đổi phần "cộng gì khi lên cấp"). */
const FREE_POINTS_PER_LEVEL = 10
const EXP_TO_NEXT_MULTIPLIER = 1.25

/** Tra field thật trong `PlayerStats` cần cộng cho mỗi loại phân bổ — `hp`/`mp` phân bổ cộng vào
 * `max_hp`/`max_mp` (không phải field `hp`/`mp` hiện tại), khác tên nên cần bảng tra riêng. */
const POTENTIAL_STAT_FIELD = {
  hp: 'max_hp',
  mp: 'max_mp',
  atk: 'atk',
  def: 'def',
  move_speed: 'move_speed',
  crit: 'crit',
  attack_speed: 'attack_speed',
  luck: 'luck'
} as const
export type PotentialStat = keyof typeof POTENTIAL_STAT_FIELD

/** Chi phí (điểm) + hiệu ứng của mỗi lựa chọn phân bổ điểm tiềm năng — khớp đúng bảng "Điểm thuộc tính tự do"
 * trong `docs/planning/progression.md`. Field đổi là field GỐC trong `PlayerStats` (chưa cộng bonus trang bị),
 * `attack_speed` lưu dạng hệ số (1.0 = 100%) nên "+1% Attack Speed" quy đổi thành `+0.01`. */
const POTENTIAL_ALLOCATIONS: Record<PotentialStat, { cost: number; amount: number }> = {
  hp: { cost: 1, amount: 100 },
  mp: { cost: 1, amount: 100 },
  atk: { cost: 1, amount: 10 },
  def: { cost: 1, amount: 5 },
  move_speed: { cost: 1, amount: 2 },
  crit: { cost: 10, amount: 1 },
  attack_speed: { cost: 10, amount: 0.01 },
  luck: { cost: 10, amount: 1 }
}

const ARMOR_SLOTS: readonly ArmorSlot[] = ['head', 'chest', 'hands', 'feet', 'ring', 'necklace']

/** Quản lý chỉ số chiến đấu RUNTIME của người chơi — 1 instance dùng CHUNG xuyên suốt mọi scene (Farm/Bãi Tập
 * Luyện/Đồng Cỏ...), khác với `FarmManager`/`InventoryManager` là per-GameScene, vì HP/MP/EXP phải giữ nguyên
 * khi chuyển màn (mỗi scene tạo `Player` MỚI, nhưng không được tạo lại chỉ số chiến đấu). Emit sự kiện
 * `stats-changed` mỗi khi có gì đổi — scene đang active tự ghi vào `registry` cho UIScene đọc (theo đúng pattern
 * `selectedSeedName`/`gameTimeText` đã dùng ở GameScene), tách biệt khỏi việc lưu file (SaveManager, Sprint 6). */
export class CombatManager extends Phaser.Events.EventEmitter {
  private stats: PlayerStats

  constructor(initial: PlayerStats) {
    super()
    this.stats = { ...initial }
  }

  getStats(): Readonly<PlayerStats> {
    return this.stats
  }

  /** Sprint 6 — thay TOÀN BỘ chỉ số hiện tại bằng dữ liệu đã lưu — chỉ gọi ĐÚNG 1 LẦN lúc boot game load save
   * (trước khi bất kỳ scene nào kịp đọc/hiện `this.stats` mặc định lên HUD), không phải mỗi lần quay lại Farm. */
  loadStats(stats: PlayerStats): void {
    this.stats = { ...stats }
    this.emit('stats-changed')
  }

  /** Danh sách item trang bị (Armor) đang mặc thật — bỏ qua slot trống (`null`) hoặc id không tra được trong
   * `armor.json` (phòng hờ save cũ trỏ tới item đã bị xoá khỏi data). Dùng chung cho mọi `getTotal*()` cộng
   * bonus trang bị bên dưới, tránh lặp lại cùng đoạn lọc ở mỗi hàm. */
  private getEquippedArmorList() {
    return ARMOR_SLOTS.map((slot) => this.stats.equipped_armor[slot])
      .filter((id): id is string => id !== null)
      .map((id) => GameData.armor.find((a) => a.id === id))
      .filter((armor): armor is NonNullable<typeof armor> => armor !== undefined)
  }

  /** ATK/DEF thật dùng để tính damage — cộng thêm bonus vũ khí đang cầm (tra `weapons.json` theo `weapon_id`)
   * VÀ tổng `atk_bonus`/`def` của mọi trang bị đang mặc (Bao tay cộng ATK, mọi slot đều có thể cộng DEF theo
   * `docs/gameplay/equipment.md`). */
  getTotalAtk(): number {
    const weapon = GameData.weapons.find((w) => w.id === this.stats.weapon_id)
    const armorAtk = this.getEquippedArmorList().reduce((sum, a) => sum + a.atk_bonus, 0)
    return this.stats.atk + (weapon?.atk ?? 0) + armorAtk
  }

  getTotalDef(): number {
    const armorDef = this.getEquippedArmorList().reduce((sum, a) => sum + a.def, 0)
    return this.stats.def + armorDef
  }

  /** HP/MP tối đa THẬT (gốc + bonus trang bị, vd Mũ/Dây chuyền cộng HP, Dây chuyền cộng MP) — mọi nơi cần biết
   * "đầy máu/mana là bao nhiêu" (HUD, `heal()`, `fullRestore()`, `respawnAtVillage()`) phải gọi qua đây, KHÔNG
   * đọc thẳng `stats.max_hp`/`stats.max_mp` (đó là chỉ số GỐC chưa cộng trang bị, xem docstring `PlayerStats`). */
  getTotalMaxHp(): number {
    const armorHp = this.getEquippedArmorList().reduce((sum, a) => sum + a.hp_bonus, 0)
    return this.stats.max_hp + armorHp
  }

  getTotalMaxMp(): number {
    const armorMp = this.getEquippedArmorList().reduce((sum, a) => sum + a.mp_bonus, 0)
    return this.stats.max_mp + armorMp
  }

  /** % Chí mạng thật — gốc + bonus Nhẫn (`crit_bonus_percent`) + bonus vũ khí (`crit_bonus`). */
  getTotalCrit(): number {
    const weapon = GameData.weapons.find((w) => w.id === this.stats.weapon_id)
    const armorCrit = this.getEquippedArmorList().reduce((sum, a) => sum + a.crit_bonus_percent, 0)
    return this.stats.crit + armorCrit + (weapon?.crit_bonus ?? 0)
  }

  /** Tốc độ đánh thật (hệ số, 1.0 = 100%) — gốc + bonus vũ khí. Trang bị không cộng Attack Speed theo bảng
   * "Chỉ số gốc theo slot" trong equipment.md (chỉ có ở pool thuộc tính phụ ngẫu nhiên, chưa làm ở V1). */
  getTotalAttackSpeed(): number {
    const weapon = GameData.weapons.find((w) => w.id === this.stats.weapon_id)
    return this.stats.attack_speed + (weapon?.attack_speed_bonus ?? 0)
  }

  /** Tốc độ di chuyển thật — gốc + bonus Giày (`move_speed_bonus`). */
  getTotalMoveSpeed(): number {
    const armorMoveSpeed = this.getEquippedArmorList().reduce(
      (sum, a) => sum + a.move_speed_bonus,
      0
    )
    return this.stats.move_speed + armorMoveSpeed
  }

  /** Luck thật — gốc + bonus Nhẫn (`luck_bonus`). */
  getTotalLuck(): number {
    const armorLuck = this.getEquippedArmorList().reduce((sum, a) => sum + a.luck_bonus, 0)
    return this.stats.luck + armorLuck
  }

  /** Hệ số nhân damage của vũ khí đang cầm (`atk_multiplier`, mặc định 1 nếu không tìm thấy) — nhân thêm vào
   * cùng `damage_multiplier` của đòn đang dùng (Sprint 5 chỉ có đòn thường = 1.0). */
  getWeaponMultiplier(): number {
    const weapon = GameData.weapons.find((w) => w.id === this.stats.weapon_id)
    return weapon?.atk_multiplier ?? 1
  }

  /** `skill_class` của vũ khí đang cầm (vd `swordsman`) — dùng để `SkillHotbar` lọc đúng bộ chiêu của hệ đang
   * cầm. `'swordsman'` mặc định nếu không tra được vũ khí (không nên xảy ra ở V1 vì chỉ có `iron_sword`). */
  getWeaponSkillClass(): string {
    const weapon = GameData.weapons.find((w) => w.id === this.stats.weapon_id)
    return weapon?.skill_class ?? 'swordsman'
  }

  isDead(): boolean {
    return this.stats.hp <= 0
  }

  /** Case 1 (combat.md): dmg tối thiểu đã được `computeDamage()` đảm bảo ≥1 từ trước khi gọi vào đây. */
  takeDamage(amount: number): void {
    if (this.isDead()) return
    this.stats.hp = Math.max(0, this.stats.hp - amount)
    this.emit('stats-changed')
    if (this.stats.hp === 0) this.emit('player-died')
  }

  heal(amount: number): void {
    this.stats.hp = Math.min(this.getTotalMaxHp(), this.stats.hp + amount)
    this.emit('stats-changed')
  }

  /** Hồi đầy CẢ HP lẫn MP cùng lúc — dùng cho vật phẩm hồi phục toàn phần (vd Gà Quay ở nông trại), khác `heal()`
   * (chỉ hồi 1 lượng HP nhất định, không đụng MP). */
  fullRestore(): void {
    this.stats.hp = this.getTotalMaxHp()
    this.stats.mp = this.getTotalMaxMp()
    this.emit('stats-changed')
  }

  /** Case 8 (combat.md): "Dùng chiêu không đủ MP" — chặn hoàn toàn, không trừ MP âm. Trả về `false` để nơi gọi
   * (hotbar chiêu thức) biết mà HUỶ LUÔN hành động đánh, không chỉ huỷ việc trừ MP (nếu không đủ MP thì không
   * được đánh gì cả, không phải "đánh chay không tốn MP"). */
  spendMp(amount: number): boolean {
    if (this.stats.mp < amount) return false
    this.stats.mp -= amount
    this.emit('stats-changed')
    return true
  }

  /** Case 13 (combat.md): mất 10% Đồng đang cầm (tối đa `MAX_DEATH_GOLD_LOSS`, user yêu cầu thêm trần) + respawn
   * 50% HP/MP tại làng. Chưa dựng vật phẩm Đồng rơi ra đất nhặt lại được (cần entity/inventory pickup riêng,
   * ngoài "Done when" của Sprint 5) — hiện chỉ trừ thẳng, ghi rõ ở progress.md để không tưởng nhầm là đã đủ case. */
  respawnAtVillage(): void {
    const goldLost = Math.min(
      Math.round(this.stats.gold * DEATH_GOLD_LOSS_RATIO),
      MAX_DEATH_GOLD_LOSS
    )
    this.stats.gold -= goldLost
    this.stats.hp = Math.round(this.getTotalMaxHp() * RESPAWN_HP_MP_RATIO)
    this.stats.mp = Math.round(this.getTotalMaxMp() * RESPAWN_HP_MP_RATIO)
    this.emit('stats-changed')
    this.emit('player-respawned', goldLost)
  }

  addGold(amount: number): void {
    this.stats.gold += amount
    this.emit('stats-changed')
  }

  /** Cộng EXP + xử lý lên cấp (có thể lên nhiều cấp cùng lúc nếu EXP dư nhiều) — mỗi cấp cộng
   * `FREE_POINTS_PER_LEVEL` điểm tiềm năng vào kho, KHÔNG tự cộng cứng chỉ số nữa (xem giải thích ở
   * `FREE_POINTS_PER_LEVEL`). */
  gainExp(amount: number): void {
    this.stats.exp += amount
    while (this.stats.exp >= this.stats.exp_to_next) {
      this.stats.exp -= this.stats.exp_to_next
      this.stats.level += 1
      this.stats.free_points += FREE_POINTS_PER_LEVEL
      this.stats.exp_to_next = Math.round(this.stats.exp_to_next * EXP_TO_NEXT_MULTIPLIER)
      this.emit('level-up', this.stats.level)
    }
    this.emit('stats-changed')
  }

  /** Tab "Tiềm năng" — phân bổ 1 lượt điểm tự do vào 1 chỉ số, theo đúng chi phí/hiệu ứng trong
   * `POTENTIAL_ALLOCATIONS`. Trả `false` nếu không đủ điểm (không trừ/không cộng gì). */
  allocatePoint(stat: PotentialStat): boolean {
    const { cost, amount } = POTENTIAL_ALLOCATIONS[stat]
    if (this.stats.free_points < cost) return false
    this.stats.free_points -= cost
    const field = POTENTIAL_STAT_FIELD[stat]
    this.stats[field] += amount
    this.emit('stats-changed')
    return true
  }

  /** Tab "Trang bị" — mặc/gỡ 1 item vào đúng slot của nó (`null` = gỡ ra). Không kiểm `unlock_level` (đúng
   * tinh thần "chưa có cơ chế chặn theo cấp độ thật" đã áp dụng cho menu hạt giống Farm — xem
   * `PLANTABLE_CROP_IDS` ở `GameScene.ts`), chỉ chặn khi `itemId` không khớp đúng `slot` truyền vào (tránh
   * nhét lộn item sai ô do lỗi gọi hàm). */
  equipArmor(slot: ArmorSlot, itemId: string | null): boolean {
    if (itemId !== null) {
      const armor = GameData.armor.find((a) => a.id === itemId)
      if (!armor || armor.slot !== slot) return false
    }
    this.stats.equipped_armor = { ...this.stats.equipped_armor, [slot]: itemId }
    this.emit('stats-changed')
    return true
  }

  /** Đổi vũ khí đang cầm — cũng không kiểm `unlock_level`, cùng lý do ở `equipArmor()`. */
  equipWeapon(weaponId: string): boolean {
    const weapon = GameData.weapons.find((w) => w.id === weaponId)
    if (!weapon) return false
    this.stats.weapon_id = weaponId
    this.emit('stats-changed')
    return true
  }
}

/** Instance DUY NHẤT dùng chung mọi scene — xem giải thích lý do ở docstring class phía trên. Khởi tạo từ chỉ
 * số mặc định của `createDefaultSaveState()` (chưa load save thật vì SaveManager/UI load-save là việc Sprint
 * 6 — "chốt Alpha"). */
export const combatManager = new CombatManager(createDefaultSaveState().player_stats)
