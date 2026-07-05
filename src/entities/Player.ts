import Phaser from 'phaser'

export type Gender = 'men' | 'women'
type Facing = 'front' | 'back' | 'left' | 'right'

const SPEED = 140
const FRAME_SIZES: Record<Gender, { width: number; height: number }> = {
  men: { width: 164, height: 213 },
  women: { width: 162, height: 334 }
}

/** Sprite gốc to hơn nhiều so với tile 32x32 (đặc biệt women, frame cao 334px) — co lại để nhân vật
 * cao khoảng 1.5-2 lần tile, tỉ lệ hợp lý với map. Mỗi giới tính scale khác nhau vì kích thước frame gốc khác nhau. */
const SPRITE_SCALE: Record<Gender, number> = {
  men: 0.38,
  women: 0.2
}

/** Frame nào dùng cho animation đi + frame đứng yên (khi dừng ở hướng back/side) — mỗi giới tính 1 bộ asset khác nhau.
 * men: bản cũ 3 frame/hướng, 1 frame vẽ lệch hướng nên phải bỏ ra, chỉ dùng 2 frame còn lại.
 * women: bản mới 8 frame/hướng đã gen đúng chuẩn key-frame — dùng đủ toàn bộ. */
interface WalkDirectionConfig {
  frames: number[] | 'all'
  stillFrame: number
}
const WALK_CONFIG: Record<Gender, Record<'front' | 'back' | 'side', WalkDirectionConfig>> = {
  men: {
    front: { frames: [0, 2], stillFrame: 0 },
    back: { frames: [1, 2], stillFrame: 1 },
    side: { frames: [0, 2], stillFrame: 0 }
  },
  women: {
    front: { frames: 'all', stillFrame: 2 },
    back: { frames: 'all', stillFrame: 2 },
    side: { frames: 'all', stillFrame: 2 }
  }
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly gender: Gender
  private facing: Facing = 'front'
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private readonly attackKey: Phaser.Input.Keyboard.Key
  private isAttacking = false
  private readonly shadow: Phaser.GameObjects.Image
  private readonly shadowOffsetY: number

  constructor(scene: Phaser.Scene, x: number, y: number, gender: Gender = 'men') {
    super(scene, x, y, `player_${gender}_idle_front`, 0)
    this.gender = gender

    scene.add.existing(this)
    scene.physics.add.existing(this)

    const { width, height } = FRAME_SIZES[gender]
    this.setScale(SPRITE_SCALE[gender])

    const bodyWidth = 48
    const bodyHeight = 40
    this.body?.setSize(bodyWidth, bodyHeight)
    this.setOffset((width - bodyWidth) / 2, height - bodyHeight - 12)
    this.setCollideWorldBounds(true)

    // Bóng đổ dưới chân — chân nằm cách tâm sprite (height/2 - 12) px gốc, quy đổi theo scale từng giới tính.
    // Kết hợp Y-sort (depth = y ở update()) để tạo cảm giác 2.5D dù map vẫn là top-down 2D.
    this.shadowOffsetY = (height / 2 - 12) * SPRITE_SCALE[gender]
    this.shadow = scene.add
      .image(x, y + this.shadowOffsetY, 'shadow_oval')
      .setScale(0.6, 0.4)
      .setAlpha(0.9)

    Player.createAnimations(scene, gender)
    this.play(`player_${gender}_idle_front`)

    this.cursors = scene.input.keyboard!.createCursorKeys()
    this.attackKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Attack chỉ có bản quay mặt ra trước (xem asset-manifest.md) — dùng chung cho mọi hướng ở bản Alpha
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
      if (anim.key === `player_${this.gender}_attack`) this.isAttacking = false
    })
  }

  static createAnimations(scene: Phaser.Scene, gender: Gender): void {
    const prefix = `player_${gender}`
    if (scene.anims.exists(`${prefix}_idle_front`)) return

    scene.anims.create({
      key: `${prefix}_idle_front`,
      frames: scene.anims.generateFrameNumbers(`${prefix}_idle_front`, {}),
      frameRate: 6,
      repeat: -1
    })
    for (const direction of ['front', 'back', 'side'] as const) {
      const textureKey = `${prefix}_walk_${direction}`
      const config = WALK_CONFIG[gender][direction]
      scene.anims.create({
        key: textureKey,
        frames:
          config.frames === 'all'
            ? scene.anims.generateFrameNumbers(textureKey, {})
            : config.frames.map((frame) => ({ key: textureKey, frame })),
        frameRate: 6,
        repeat: -1
      })
    }
    scene.anims.create({
      key: `${prefix}_attack`,
      frames: scene.anims.generateFrameNumbers(`${prefix}_attack`, {}),
      frameRate: 12,
      repeat: 0
    })
  }

  update(): void {
    // Y-sort: object càng thấp trên màn hình (y lớn) càng vẽ đè lên object phía trên — tạo cảm giác đi trước/sau prop.
    // Dùng toạ độ CHÂN (this.y + shadowOffsetY) làm depth, không dùng tâm sprite (this.y) — nếu so bằng tâm,
    // player phải đi sâu qua khỏi rào ~shadowOffsetY (~31px, gần gấp rưỡi bề dày rào) mới được vẽ đè lên, khiến
    // đứng rõ ràng bên dưới hàng rào (data/fencePlacements.ts) mà vẫn bị hàng rào che (bug thật đã gặp).
    const feetY = this.y + this.shadowOffsetY
    this.setDepth(feetY)
    this.shadow.setPosition(this.x, feetY)
    this.shadow.setDepth(feetY - 1)

    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
      this.isAttacking = true
      this.setVelocity(0, 0)
      this.play(`player_${this.gender}_attack`, true)
    }

    if (this.isAttacking) return

    const left = this.cursors.left.isDown
    const right = this.cursors.right.isDown
    const up = this.cursors.up.isDown
    const down = this.cursors.down.isDown

    let vx = 0
    let vy = 0
    if (left) vx -= 1
    if (right) vx += 1
    if (up) vy -= 1
    if (down) vy += 1

    const moving = vx !== 0 || vy !== 0
    if (moving) {
      const len = Math.hypot(vx, vy)
      this.setVelocity((vx / len) * SPEED, (vy / len) * SPEED)
      this.facing = this.determineFacing()
    } else {
      this.setVelocity(0, 0)
    }

    this.updateAnimation(moving)
  }

  /** Hướng quay theo phím di chuyển vừa được bấm gần nhất (thay vì cố định ưu tiên ngang/dọc) —
   * tránh thoáng sai hướng khi đổi hướng lúc bàn phím thật chưa kịp nhả phím cũ. */
  private determineFacing(): Facing {
    const candidates: Array<{ facing: Facing; key: Phaser.Input.Keyboard.Key }> = []
    if (this.cursors.left.isDown) candidates.push({ facing: 'left', key: this.cursors.left })
    if (this.cursors.right.isDown) candidates.push({ facing: 'right', key: this.cursors.right })
    if (this.cursors.up.isDown) candidates.push({ facing: 'back', key: this.cursors.up })
    if (this.cursors.down.isDown) candidates.push({ facing: 'front', key: this.cursors.down })

    candidates.sort((a, b) => b.key.timeDown - a.key.timeDown)
    return candidates[0]?.facing ?? this.facing
  }

  private updateAnimation(moving: boolean): void {
    const prefix = `player_${this.gender}`
    this.setFlipX(this.facing === 'left')
    const directionKey = this.facing === 'left' || this.facing === 'right' ? 'side' : this.facing

    if (moving) {
      this.play(`${prefix}_walk_${directionKey}`, true)
      return
    }

    if (this.facing === 'front') {
      this.play(`${prefix}_idle_front`, true)
    } else {
      // Frame đứng yên lấy từ WALK_CONFIG — mỗi giới tính/hướng có 1 frame tĩnh hợp lý riêng (xem khai báo ở đầu file)
      const stillFrame = WALK_CONFIG[this.gender][directionKey as 'back' | 'side'].stillFrame
      this.anims.stop()
      this.setTexture(`${prefix}_walk_${directionKey}`, stillFrame)
    }
  }
}
