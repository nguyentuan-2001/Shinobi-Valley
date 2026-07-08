import Phaser from 'phaser'
import type { PlayerStats } from '../data/types'
import { GameData } from '../data/DataLoader'
import { createDefaultSaveState } from './SaveManager'

const RESPAWN_HP_MP_RATIO = 0.5
const DEATH_GOLD_LOSS_RATIO = 0.1
/** User yêu cầu thêm giới hạn (trước đó case 13 chỉ trừ đúng 10%, không trần) — nhân vật càng giàu càng không
 * bị phạt vô hạn mỗi lần chết, chặn ở 30.000đ dù 10% thực tế lớn hơn số này. */
const MAX_DEATH_GOLD_LOSS = 30_000
/** Tăng trưởng đơn giản mỗi lần lên cấp — chưa có bảng 10 điểm thuộc tính tự do thật (xem
 * `docs/gameplay/mechanics.md` mục "Hệ thống điểm thuộc tính"), đó là UI phân bổ điểm thuộc Sprint sau (chưa
 * nằm trong "Done when" của Sprint 5). Tạm tự cộng để nhân vật mạnh dần lên khi cày quái. */
const LEVEL_UP_GROWTH = { maxHp: 50, maxMp: 20, atk: 3, def: 1, expToNextMultiplier: 1.25 }

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

  /** ATK/DEF thật dùng để tính damage — cộng thêm bonus vũ khí đang cầm (tra `weapons.json` theo `weapon_id`).
   * Chưa có giáp/trang bị nào cộng DEF (Sprint sau), nên DEF hiện chỉ = chỉ số gốc. */
  getTotalAtk(): number {
    const weapon = GameData.weapons.find((w) => w.id === this.stats.weapon_id)
    return this.stats.atk + (weapon?.atk ?? 0)
  }

  getTotalDef(): number {
    return this.stats.def
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
    this.stats.hp = Math.min(this.stats.max_hp, this.stats.hp + amount)
    this.emit('stats-changed')
  }

  /** Hồi đầy CẢ HP lẫn MP cùng lúc — dùng cho vật phẩm hồi phục toàn phần (vd Gà Quay ở nông trại), khác `heal()`
   * (chỉ hồi 1 lượng HP nhất định, không đụng MP). */
  fullRestore(): void {
    this.stats.hp = this.stats.max_hp
    this.stats.mp = this.stats.max_mp
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
    this.stats.hp = Math.round(this.stats.max_hp * RESPAWN_HP_MP_RATIO)
    this.stats.mp = Math.round(this.stats.max_mp * RESPAWN_HP_MP_RATIO)
    this.emit('stats-changed')
    this.emit('player-respawned', goldLost)
  }

  addGold(amount: number): void {
    this.stats.gold += amount
    this.emit('stats-changed')
  }

  /** Cộng EXP + xử lý lên cấp (có thể lên nhiều cấp cùng lúc nếu EXP dư nhiều) — tăng trưởng chỉ số tạm theo
   * `LEVEL_UP_GROWTH`, xem giải thích ở khai báo hằng số. */
  gainExp(amount: number): void {
    this.stats.exp += amount
    while (this.stats.exp >= this.stats.exp_to_next) {
      this.stats.exp -= this.stats.exp_to_next
      this.stats.level += 1
      this.stats.max_hp += LEVEL_UP_GROWTH.maxHp
      this.stats.max_mp += LEVEL_UP_GROWTH.maxMp
      this.stats.atk += LEVEL_UP_GROWTH.atk
      this.stats.def += LEVEL_UP_GROWTH.def
      this.stats.exp_to_next = Math.round(
        this.stats.exp_to_next * LEVEL_UP_GROWTH.expToNextMultiplier
      )
      this.emit('level-up', this.stats.level)
    }
    this.emit('stats-changed')
  }
}

/** Instance DUY NHẤT dùng chung mọi scene — xem giải thích lý do ở docstring class phía trên. Khởi tạo từ chỉ
 * số mặc định của `createDefaultSaveState()` (chưa load save thật vì SaveManager/UI load-save là việc Sprint
 * 6 — "chốt Alpha"). */
export const combatManager = new CombatManager(createDefaultSaveState().player_stats)
