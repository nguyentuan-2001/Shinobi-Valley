import Phaser from 'phaser'
import type { Skill } from '../data/types'
import { combatManager } from '../systems/CombatManager'

export type Gender = 'men' | 'women' | 'vegeta'
type Facing = 'front' | 'back' | 'left' | 'right'
/** `vegeta`: ghép từ 3 mảnh đầu/thân/chân rời (`public/assets/sprites/player/vegeta/raw/`, do user cung cấp) —
 * cả 5 action đều dùng CHUNG đúng 1 kích thước cell (152×190) vì field `FRAME_SIZES` này chỉ nhận 1 size duy
 * nhất cho toàn bộ giới tính (không tách theo action như `frameSizes` ở `PreloadScene.ts`), khác nếu để mỗi
 * action 1 kích thước khác nhau (ảnh ghép thật ra có size hơi khác nhau mỗi action) thì nhân vật sẽ "nhảy" vị
 * trí/bóng đổ mỗi lần đổi animation. */
const FRAME_SIZES: Record<Gender, { width: number; height: number }> = {
  men: { width: 164, height: 213 },
  women: { width: 162, height: 334 },
  vegeta: { width: 152, height: 190 }
}

/** Sprite gốc to hơn nhiều so với tile 32x32 (đặc biệt women, frame cao 334px) — co lại để nhân vật
 * cao khoảng 1.5-2 lần tile, tỉ lệ hợp lý với map. Mỗi giới tính scale khác nhau vì kích thước frame gốc khác nhau.
 * `vegeta`: 0.35 × 190 ≈ 66.5px, canh gần đúng chiều cao hiển thị của `women` (334×0.2 ≈ 66.8px) cho đồng bộ
 * tỉ lệ giữa các nhân dạng chọn được. */
const SPRITE_SCALE: Record<Gender, number> = {
  men: 0.38,
  women: 0.2,
  vegeta: 0.35
}

/** Frame nào dùng cho animation đi + frame đứng yên (khi dừng ở hướng back/side) — mỗi giới tính 1 bộ asset khác nhau.
 * men: bản cũ 3 frame/hướng, 1 frame vẽ lệch hướng nên phải bỏ ra, chỉ dùng 2 frame còn lại.
 * women: bản mới 8 frame/hướng đã gen đúng chuẩn key-frame — dùng đủ toàn bộ.
 * vegeta: chỉ ghép được đúng 2 frame/hướng (giới hạn số pose có trong 31 mảnh gốc) — dùng cả 2, đứng yên ở
 * frame 0 (mỗi hướng đều lấy frame đầu làm dáng đứng yên hợp lý nhất trong 2 frame có). */
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
  },
  vegeta: {
    front: { frames: 'all', stillFrame: 0 },
    back: { frames: 'all', stillFrame: 0 },
    side: { frames: 'all', stillFrame: 0 }
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
  /** Sprint 11 — dùng cho passive Cung Thủ "Nhãn Lực Tập Trung" (+Crit khi đứng yên ≥1s) và "Cung Pháp Tốc Xạ"
   * (+Attack Speed khi đang di chuyển) — `-Infinity` ban đầu nghĩa là "chưa từng di chuyển", coi như đã đứng
   * yên đủ lâu ngay từ đầu. */
  private lastMovedAt = -Infinity
  private currentlyMoving = false
  /** Sprint 12 — hệ số tốc độ do MÔI TRƯỜNG áp đặt (vd bão tuyết Núi Tuyết -10%), tách biệt hoàn toàn khỏi
   * `combatManager.getTotalMoveSpeed()` (chỉ số nhân vật) — scene chiến đấu tự gọi `setEnvironmentSpeedMultiplier()`
   * 1 lần lúc `create()` nếu map đó có cơ chế giảm tốc, mặc định 1 (không ảnh hưởng) cho mọi map khác. */
  private environmentSpeedMultiplier = 1

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

    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) this.startAttack()

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
      const speed = combatManager.getTotalMoveSpeed() * this.environmentSpeedMultiplier
      this.setVelocity((vx / len) * speed, (vy / len) * speed)
      this.facing = this.determineFacing()
      this.lastMovedAt = this.scene.time.now
    } else {
      this.setVelocity(0, 0)
    }
    this.currentlyMoving = moving

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

  /** Bắt đầu 1 lượt tấn công (animation + khoá di chuyển + emit `attack` cho scene check hitbox) — dùng chung
   * cho CẢ đòn thường (Space, tự gọi trong `update()`, không truyền `payload` → multiplier mặc định 1) LẪN
   * chiêu thức từ hotbar (Enter, scene tự gọi hàm này kèm `damageMultiplier` của chiêu đang chọn — xem
   * `systems/SkillHotbar.ts`). Trả về `false` nếu đang tấn công dở (animation khoá) — nơi gọi (scene) dựa vào
   * đây để biết chiêu KHÔNG ra được, tránh trừ MP cho 1 lượt đánh không xảy ra. */
  /** Scene cần biết TRƯỚC khi trừ MP/bắt đầu cooldown chiêu (hotbar) — nếu animation đang khoá thì không được
   * trừ gì cả (case 7/8 combat.md áp dụng đúng thời điểm, không phải trừ xong mới phát hiện đánh hụt). */
  canAttack(): boolean {
    return !this.isAttacking
  }

  /** Sprint 11 — passive Cung Thủ "Cung Pháp Tốc Xạ" (kiting): đơn giản hoá thành "đang di chuyển" thay vì thật
   * sự kiểm tra "đang lùi RA XA mục tiêu" (cần vector khoảng cách đang tăng/giảm qua từng frame, phức tạp hơn
   * hẳn cho lợi ích tương đương ở V1) — xem giải thích đầy đủ trong `docs/planning/progress.md` Sprint 11. */
  isMoving(): boolean {
    return this.currentlyMoving
  }

  /** Sprint 11 — passive Cung Thủ "Nhãn Lực Tập Trung" (+Crit khi đứng yên ≥1s trước khi bắn). */
  getStationaryDurationMs(): number {
    return this.scene.time.now - this.lastMovedAt
  }

  /** Sprint 12 — Núi Tuyết "bão tuyết làm giảm tốc độ di chuyển 10%" (`docs/world/maps.md`): scene gọi 1 lần
   * lúc `create()` với `0.9`, mọi map khác không gọi nên giữ mặc định `1`. */
  setEnvironmentSpeedMultiplier(multiplier: number): void {
    this.environmentSpeedMultiplier = multiplier
  }

  /** Sprint 11: `skill: null` = đòn đánh thường (Space, multiplier 1.0, hitbox melee mặc định qua
   * `getAttackHitboxBounds()`); có `skill` = chiêu từ hotbar (Enter) — scene tự đọc toàn bộ field của `skill`
   * (hits/range/aoe/effect/passive liên quan...) từ payload `attack` thay vì chỉ mỗi `damageMultiplier` như bản
   * Sprint 5 cũ, đủ để xử lý multi-hit/AOE/hiệu ứng trạng thái mà không cần Player.ts biết gì thêm về combat. */
  startAttack(skill: Skill | null = null): boolean {
    if (this.isAttacking) return false
    this.isAttacking = true
    const wasMoving = this.currentlyMoving
    this.setVelocity(0, 0)
    // Sprint 11 — Attack Speed giờ THẬT SỰ ảnh hưởng tốc độ ra đòn (trước đó chỉ là chỉ số hiển thị, không đụng
    // gì animation — bug phát hiện lúc làm passive "Tốc Kiếm Liên Hoàn"/"Cung Pháp Tốc Xạ", xem progress.md
    // Sprint 11): animation attack chạy nhanh hơn theo đúng hệ số, `isAttacking` clear ngay khi animation xong
    // (ANIMATION_COMPLETE listener có sẵn) nên ra đòn nhanh hơn thật, không chỉ là hình ảnh nhanh hơn suông.
    const attackSpeed = combatManager.getEffectiveAttackSpeed(wasMoving)
    this.play({ key: `player_${this.gender}_attack`, frameRate: 12 * attackSpeed }, true)
    // Sprint 11 — chỉ đòn ĐÁNH THƯỜNG (skill null) mới tính vào bộ đếm dùng cho passive "Trọng Kiếm Tích Lực"/
    // "Bách Xạ Quán Nhật" (xem docstring `CombatManager.registerBasicAttack()`) — chiêu Enter không tính.
    if (!skill) combatManager.registerBasicAttack()
    // Đánh dấu "vừa vung vũ khí" ngay lúc bắt đầu animation (không đợi animation chạy xong) — Sprint 5 chưa cần
    // khớp chính xác frame nào trong animation là lúc lưỡi kiếm thật sự chạm tới (cần rig hitbox theo từng
    // frame, việc của khi có animation thật đủ chi tiết), tính hit ngay lúc bấm cho đơn giản/phản hồi tức thời.
    this.emit('attack', { skill })
    return true
  }

  /** Vùng hitbox đòn đánh thường — 1 hình chữ nhật nhỏ đặt NGAY TRƯỚC mặt player theo hướng đang quay mặt
   * (`facing`), dùng cho `Phaser.Geom.Rectangle.Overlaps()` so với `getBounds()` của Người Rơm/quái ở scene.
   * Kích thước/khoảng đưa ra tạm ước lượng theo cỡ 1 ô Người Rơm/quái (~32px) — chưa cần rig theo asset vũ khí
   * thật vì animation attack hiện chỉ có 1 bản quay mặt ra trước, không đổi theo hệ vũ khí. */
  getAttackHitboxBounds(): Phaser.Geom.Rectangle {
    return this.computeHitboxRect(34, 42)
  }

  /** Sprint 11 — hitbox cho chiêu thức (khác đòn thường): `range: "ranged"` kéo dài tầm với hẳn (giả lập tên/phi
   * tiêu bay xa mà không cần dựng entity projectile thật/animation bay riêng — đơn giản hoá, xem progress.md
   * Sprint 11), `aoe: true` nới rộng cả tầm với LẪN bề ngang theo `aoe_radius` (dùng chung 1 hình chữ nhật cho
   * mọi trường hợp AOE thay vì dựng vùng tròn quanh tâm riêng — kể cả chiêu AOE quanh thân như "Vũ kiếm" hay
   * AOE tại điểm xa như "Thiên hà thương" đều đi qua cùng công thức này). Passive Thương Sĩ "Thương Pháp Quảng
   * Vực" (+20% tầm đánh, `range_percent`) nhân thêm vào cả tầm với lẫn bề ngang nếu đang active. */
  getSkillHitboxBounds(skill: Skill): Phaser.Geom.Rectangle {
    const rangeBonusPercent = combatManager.getActivePassive('range_percent')?.passive_value ?? 0
    const rangeMultiplier = 1 + rangeBonusPercent / 100
    let reach = (skill.range === 'ranged' ? 170 : 34) * rangeMultiplier
    let size = 42 * rangeMultiplier
    if (skill.aoe) {
      reach += skill.aoe_radius
      size += skill.aoe_radius * 2
    }
    return this.computeHitboxRect(reach, size)
  }

  private computeHitboxRect(reach: number, size: number): Phaser.Geom.Rectangle {
    const offsets: Record<Facing, { x: number; y: number }> = {
      front: { x: 0, y: reach },
      back: { x: 0, y: -reach },
      left: { x: -reach, y: 0 },
      right: { x: reach, y: 0 }
    }
    const offset = offsets[this.facing]
    return new Phaser.Geom.Rectangle(
      this.x + offset.x - size / 2,
      this.y + offset.y - size / 2,
      size,
      size
    )
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
