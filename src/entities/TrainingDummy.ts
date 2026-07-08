import Phaser from 'phaser'
import {
  TRAINING_DUMMY_TEXTURE,
  HIT_SPARK_TEXTURE,
  STRAW_PARTICLE_TEXTURE
} from '../systems/CombatTextures'

const HITS_TO_DIE = 5
const RESPAWN_MS = 15_000

/** Người Rơm (Training Dummy) — cơ chế HOÀN TOÀN KHÁC `Monster` (xem `docs/gameplay/mechanics.md` mục
 * "Người Rơm"): không HP/ATK/DEF, không công thức damage, chỉ đếm đủ 5 lần trúng đòn thì "chết" (despawn +
 * hiệu ứng rơm vỡ), không EXP/gold/drop, hồi sinh sau ĐÚNG 15 giây thực tại đúng vị trí ban đầu — khác hẳn quái
 * thường (5 phút/30 phút, xem `Monster.ts`). Đứng yên tuyệt đối, không aggro, dùng static body. */
export class TrainingDummy extends Phaser.Physics.Arcade.Sprite {
  /** ID ổn định để `TargetSelector` (xem `systems/TargetSelector.ts`) nhớ đang ngắm con nào giữa các frame. */
  readonly id: number
  private hitCount = 0
  private deadState = false
  private readonly hitCountText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
    super(scene, x, y, TRAINING_DUMMY_TEXTURE)
    this.id = id
    scene.add.existing(this)
    scene.physics.add.existing(this, true)
    this.setDepth(y)

    this.hitCountText = scene.add
      .text(x, y - 34, `0/${HITS_TO_DIE}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#00000088',
        padding: { x: 3, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(y + 1)
  }

  /** Case 4 (combat.md): "đánh trúng mục tiêu đã chết/đang despawn" — scene phải tự kiểm `isAlive()` trước khi
   * gọi `takeHit()` (không có hitbox trong lúc chờ hồi sinh, đúng mechanics.md). */
  isAlive(): boolean {
    return !this.deadState
  }

  /** Alias cho `TargetSelector<Targetable>` — xem giải thích ở `Monster.isValid()`. */
  isValid(): boolean {
    return this.isAlive()
  }

  /** Mỗi lần trúng gọi riêng lẻ (kể cả AOE trúng nhiều Người Rơm cùng lúc — mỗi con tự đếm độc lập, scene chỉ
   * cần lặp qua danh sách và gọi hàm này cho từng con, không dùng chung 1 bộ đếm). */
  takeHit(): void {
    if (this.deadState) return
    this.hitCount += 1
    this.playHitSpark()
    if (this.hitCount >= HITS_TO_DIE) {
      this.die()
    } else {
      this.hitCountText.setText(`${this.hitCount}/${HITS_TO_DIE}`)
    }
  }

  private playHitSpark(): void {
    const spark = this.scene.add.image(this.x, this.y - 16, HIT_SPARK_TEXTURE).setDepth(this.y + 2)
    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 1.6,
      duration: 200,
      onComplete: () => spark.destroy()
    })
  }

  private die(): void {
    this.deadState = true
    this.hitCountText.setVisible(false)
    this.setVisible(false)
    ;(this.body as Phaser.Physics.Arcade.StaticBody).enable = false
    this.playBreakEffect()
    this.scene.time.delayedCall(RESPAWN_MS, () => this.respawn())
  }

  /** Rơm vỡ tung — nhiều mảnh nhỏ toả ra ngẫu nhiên rồi mờ dần, mô phỏng particle burst mà không cần
   * `ParticleEmitter` thật (dùng thẳng vài chục `tween` độc lập, đủ cho hiệu ứng 1 lần ngắn). */
  private playBreakEffect(): void {
    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add
        .image(this.x, this.y - 16, STRAW_PARTICLE_TEXTURE)
        .setDepth(this.y + 2)
      const angle = Math.random() * Math.PI * 2
      const dist = 16 + Math.random() * 20
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * dist,
        y: this.y - 16 + Math.sin(angle) * dist,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        onComplete: () => particle.destroy()
      })
    }
  }

  private respawn(): void {
    this.deadState = false
    this.hitCount = 0
    this.hitCountText.setText(`0/${HITS_TO_DIE}`).setVisible(true)
    this.setVisible(true)
    ;(this.body as Phaser.Physics.Arcade.StaticBody).enable = true
  }
}
