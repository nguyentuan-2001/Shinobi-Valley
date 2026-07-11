import Phaser from 'phaser'
import type { Monster as MonsterData } from '../data/types'
import { WILD_RABBIT_TEXTURE, HIT_SPARK_TEXTURE } from '../systems/CombatTextures'
import { combatManager } from '../systems/CombatManager'
import { inventoryManager } from '../systems/InventoryManager'
import { computeDamage } from '../systems/CombatSystem'
import { StatusEffectTracker, type StatusEffectType } from '../systems/StatusEffectTracker'

/** ~5-8 ô theo `docs/gameplay/mechanics.md` mục "Cơ chế Kẻ Địch" (Tầm phát hiện) — quy đổi tạm 1 ô ≈ 32px world
 * (chưa có lưới tile thật ở các map chiến đấu, xem `GrasslandScene`/`TrainingGroundScene`). */
const DETECT_RADIUS = 220
/** ~12 ô — khoảng cách buông aggro, đuổi xa hơn tầm phát hiện ban đầu đúng "đuổi theo tới khi cách xa 12 ô". */
const LOSE_AGGRO_RADIUS = 380
const CHASE_SPEED = 70
const PATROL_SPEED = 30
const CONTACT_DAMAGE_COOLDOWN_MS = 1000
const CONTACT_RANGE = 20
/** User yêu cầu đổi từ 5 phút xuống 10 giây thực — khớp đúng nhịp hồi sinh của Người Rơm ở Bãi Tập Luyện
 * (`TrainingDummy.RESPAWN_MS`, cũng vừa đổi xuống 10s cùng lúc) — mốc thời gian cố định kể từ lúc chết, chưa
 * phân biệt "vào lại khu vực" (cần theo dõi transition ra/vào phức tạp hơn, không cần thiết với mốc ngắn thế
 * này). */
const RESPAWN_MS = 10 * 1000

/** Quái thường (khác hẳn `TrainingDummy`) — HP/ATK/DEF thật từ `monsters.json`, AI đơn giản patrol quanh điểm
 * spawn khi chưa thấy người chơi, đuổi theo khi trong tầm phát hiện. Chết thật sự cộng EXP/gold/drop đồ (qua
 * singleton `combatManager`/`inventoryManager`, dùng chung với Farm — xem giải thích lý do dùng singleton ở
 * `InventoryManager.ts`). */
export class Monster extends Phaser.Physics.Arcade.Sprite {
  /** ID ổn định để `TargetSelector` (xem `systems/TargetSelector.ts`) nhớ đang ngắm con nào giữa các frame —
   * gán từ index lúc spawn (xem `GrasslandScene`), không dùng object reference vì Phaser sprite bị tái sử dụng
   * qua `scene.start()`. */
  readonly id: number
  private readonly monsterData: MonsterData
  private hp: number
  private deadState = false
  private isChasing = false
  private lastContactDamageAt = -Infinity
  private readonly spawnX: number
  private readonly spawnY: number
  private patrolTarget: { x: number; y: number }
  private patrolWaitUntil = 0
  private readonly hpBarBg: Phaser.GameObjects.Rectangle
  private readonly hpBarFill: Phaser.GameObjects.Rectangle
  /** Sprint 11 — hiệu ứng trạng thái (poison/bleed/slow/stun/burn/def_down) áp lên quái này từ chiêu thức người
   * chơi, xem `StatusEffectTracker.ts`. */
  private readonly statusEffects = new StatusEffectTracker()

  constructor(scene: Phaser.Scene, x: number, y: number, data: MonsterData, id: number) {
    super(scene, x, y, WILD_RABBIT_TEXTURE)
    this.id = id
    this.monsterData = data
    this.hp = data.hp
    this.spawnX = x
    this.spawnY = y
    this.patrolTarget = { x, y }

    scene.add.existing(this)
    scene.physics.add.existing(this)
    ;(this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true)
    this.setDepth(y)

    const barWidth = 28
    this.hpBarBg = scene.add.rectangle(x, y - 22, barWidth, 4, 0x000000, 0.6).setDepth(y + 1)
    this.hpBarFill = scene.add
      .rectangle(x - barWidth / 2, y - 22, barWidth, 4, 0xd8362e, 1)
      .setOrigin(0, 0.5)
      .setDepth(y + 2)

    this.pickNewPatrolTarget()
  }

  isAlive(): boolean {
    return !this.deadState
  }

  /** Alias cho `TargetSelector<Targetable>` — cùng ý nghĩa với `isAlive()`, tên riêng để khớp interface
   * `Targetable` dùng chung cho cả Monster lẫn TrainingDummy. */
  isValid(): boolean {
    return this.isAlive()
  }

  /** Scene cần DEF gốc để tự tính damage bằng `computeDamage()` TRƯỚC khi gọi `takeDamage()` — giữ công thức
   * tính toán tập trung ở 1 chỗ (`CombatSystem.ts`) thay vì lặp lại bên trong class này. Sprint 11: nhân thêm hệ
   * số Def Down đang active (nếu có) — `now` mặc định `Date.now()` cho tiện gọi từ nơi không có sẵn `scene.time.
   * now` (hiếm khi cần), scene chiến đấu luôn truyền `this.time.now` thật. */
  getDef(now: number = Date.now()): number {
    return this.monsterData.def * this.statusEffects.getDefDownMultiplier(now)
  }

  /** Sprint 11 — áp 1 hiệu ứng trạng thái từ chiêu thức người chơi (case 9 combat.md: refresh không cộng dồn,
   * xem `StatusEffectTracker.apply()`). Scene gọi hàm này ngay sau khi xác định hit trúng + skill có `effect`. */
  applyStatusEffect(
    type: StatusEffectType,
    durationSeconds: number,
    magnitude: number,
    now: number
  ): void {
    if (this.deadState) return
    this.statusEffects.apply(type, durationSeconds * 1000, magnitude, now)
  }

  hasAnyStatusEffect(now: number): boolean {
    return this.statusEffects.hasAnyActiveEffect(now)
  }

  hasDefDown(now: number): boolean {
    return this.statusEffects.hasDefDown(now)
  }

  /** Gọi mỗi frame từ scene (patrol/chase/dam sát thương tiếp xúc lên player) — nhận toạ độ player trực tiếp
   * thay vì tự import `Player` để tránh phụ thuộc vòng, giống cách `resolvePolygonCollision` nhận sprite ngoài.
   * `combatStarted` (user yêu cầu): quái CHỈ phát hiện/đuổi theo/gây sát thương khi người chơi đã chủ động đánh
   * trúng ít nhất 1 quái TRONG MAP NÀY từ trước (`CombatEngine.hasCombatStarted()`) — chưa từng đánh ai thì đi
   * ngang qua bao gần cũng chỉ patrol bình thường, không bị tấn công. */
  updateAi(playerX: number, playerY: number, time: number, combatStarted: boolean): void {
    if (this.deadState) return
    this.setDepth(this.y)
    this.updateHpBarPosition()

    // Sprint 11 — tick DOT (Poison/Bleed/Burn) trước AI, dừng ngay nếu DOT vừa giết chết quái (case 6 combat.md:
    // `takeDamage()` tự set `deadState`, các bước AI phía dưới sẽ bị chặn ở early-return đầu hàm lần gọi kế).
    const dotDamage = this.statusEffects.update(time)
    if (dotDamage > 0) this.takeDamage(Math.round(dotDamage))
    if (this.deadState) return

    // Case "khống chế": đang Stun thì đứng im hoàn toàn, không patrol/chase/gây sát thương tiếp xúc.
    if (this.statusEffects.isStunned(time)) {
      this.setVelocity(0, 0)
      return
    }

    const slowMultiplier = this.statusEffects.getSlowSpeedMultiplier(time)
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)
    const shouldEngage =
      combatStarted &&
      (distToPlayer <= DETECT_RADIUS || (this.isChasing && distToPlayer <= LOSE_AGGRO_RADIUS))
    if (shouldEngage) {
      this.isChasing = true
      this.chase(playerX, playerY, slowMultiplier)
      if (distToPlayer <= CONTACT_RANGE) this.dealContactDamage(time)
    } else {
      this.isChasing = false
      this.patrol(time, slowMultiplier)
    }
  }

  /** `speedMultiplier` (Sprint 11): hệ số Slow đang active, xem `StatusEffectTracker.getSlowSpeedMultiplier()` —
   * 1 nếu không bị Slow. */
  private chase(playerX: number, playerY: number, speedMultiplier: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY)
    this.setVelocity(
      Math.cos(angle) * CHASE_SPEED * speedMultiplier,
      Math.sin(angle) * CHASE_SPEED * speedMultiplier
    )
    this.setFlipX(Math.cos(angle) < 0)
  }

  private patrol(time: number, speedMultiplier: number): void {
    const distToTarget = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.patrolTarget.x,
      this.patrolTarget.y
    )
    if (distToTarget < 6) {
      this.setVelocity(0, 0)
      if (time > this.patrolWaitUntil) {
        this.patrolWaitUntil = time + 1500 + Math.random() * 2000
        this.pickNewPatrolTarget()
      }
      return
    }
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.patrolTarget.x,
      this.patrolTarget.y
    )
    this.setVelocity(
      Math.cos(angle) * PATROL_SPEED * speedMultiplier,
      Math.sin(angle) * PATROL_SPEED * speedMultiplier
    )
    this.setFlipX(Math.cos(angle) < 0)
  }

  /** Đi lang thang quanh điểm spawn ban đầu trong bán kính nhỏ — không đi lạc quá xa khỏi khu vực của nó. */
  private pickNewPatrolTarget(): void {
    const angle = Math.random() * Math.PI * 2
    const dist = 40 + Math.random() * 80
    this.patrolTarget = {
      x: this.spawnX + Math.cos(angle) * dist,
      y: this.spawnY + Math.sin(angle) * dist
    }
  }

  /** Case ngoài combat.md nhưng cần thiết cho AI đuổi bắt: quái chạm player gây damage trực tiếp (không phải
   * player tấn công quái — chiều ngược lại, xem `takeDamage()`), có cooldown tránh trừ máu liên tục mỗi frame
   * khi đang dính sát. Gọi thẳng `combatManager.takeDamage()` vì đây là biến đổi state PLAYER, không phải state
   * của Monster này — không cần scene làm trung gian. Sprint 11: roll né đòn (Song Kiếm Passive "Thân Pháp
   * Khinh Vũ") TRƯỚC khi tính damage — né được thì bỏ qua hẳn, không vào `takeDamage()`/khiên Ninja gì cả. */
  private dealContactDamage(time: number): void {
    if (time - this.lastContactDamageAt < CONTACT_DAMAGE_COOLDOWN_MS) return
    this.lastContactDamageAt = time
    if (combatManager.rollDodge()) return
    const result = computeDamage(this.monsterData.atk, 1, combatManager.getTotalDef(), 0)
    combatManager.takeDamage(result.damage, time)
  }

  /** Case 1 (combat.md): công thức damage chuẩn, roll Crit riêng — `damageMultiplier`/`critChance` truyền từ
   * scene (đòn đánh thường Sprint 5 dùng 1.0/critChance cố định thấp, xem `Player.ts`/scene gọi vào). */
  takeDamage(damage: number): void {
    if (this.deadState) return
    this.hp = Math.max(0, this.hp - damage)
    this.updateHpBarFill()
    this.playHitSpark()
    if (this.hp <= 0) this.die()
  }

  private playHitSpark(): void {
    const spark = this.scene.add.image(this.x, this.y - 10, HIT_SPARK_TEXTURE).setDepth(this.y + 3)
    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 1.6,
      duration: 200,
      onComplete: () => spark.destroy()
    })
  }

  /** Case 12 (combat.md): despawn + cộng EXP/gold + roll drop_table + hồi sinh sau 5 phút. Không tính vào đây
   * việc quái chết do DOT đang tick (case 6) — Sprint 5 chưa có status effect nào áp dụng lên quái. */
  private die(): void {
    this.deadState = true
    this.setVisible(false)
    this.hpBarBg.setVisible(false)
    this.hpBarFill.setVisible(false)
    ;(this.body as Phaser.Physics.Arcade.Body).enable = false

    combatManager.gainExp(this.monsterData.exp)
    const gold = Phaser.Math.Between(this.monsterData.drop_gold_min, this.monsterData.drop_gold_max)
    combatManager.addGold(gold)
    for (const drop of this.monsterData.drop_table) {
      if (Math.random() > drop.chance) continue
      const qty = Phaser.Math.Between(drop.qty_min, drop.qty_max)
      inventoryManager.addItem(drop.item, qty)
    }
    this.showLootText(gold)

    this.scene.time.delayedCall(RESPAWN_MS, () => this.respawn())
  }

  private showLootText(gold: number): void {
    const text = this.scene.add
      .text(this.x, this.y - 20, `+${gold}đ, +${this.monsterData.exp} EXP`, {
        fontSize: '11px',
        color: '#ffe9a8',
        fontFamily: 'monospace',
        backgroundColor: '#00000088',
        padding: { x: 3, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(this.y + 3)
    this.scene.tweens.add({
      targets: text,
      y: this.y - 50,
      alpha: 0,
      duration: 900,
      onComplete: () => text.destroy()
    })
  }

  private respawn(): void {
    this.deadState = false
    this.hp = this.monsterData.hp
    this.setPosition(this.spawnX, this.spawnY)
    this.setVisible(true)
    this.hpBarBg.setVisible(true)
    this.hpBarFill.setVisible(true)
    this.updateHpBarFill()
    this.updateHpBarPosition()
    ;(this.body as Phaser.Physics.Arcade.Body).enable = true
  }

  private updateHpBarPosition(): void {
    this.hpBarBg.setPosition(this.x, this.y - 22).setDepth(this.y + 1)
    this.hpBarFill.setPosition(this.x - this.hpBarBg.width / 2, this.y - 22).setDepth(this.y + 2)
  }

  private updateHpBarFill(): void {
    const ratio = Phaser.Math.Clamp(this.hp / this.monsterData.hp, 0, 1)
    this.hpBarFill.width = this.hpBarBg.width * ratio
  }
}
