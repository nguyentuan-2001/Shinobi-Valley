import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { TrainingDummy } from '../entities/TrainingDummy'
import { TRAINING_DUMMY_PLACEMENTS } from '../data/trainingDummyPlacement'
import { TRAINING_GROUND_EXIT_ZONES, FARM_EXIT_ZONES } from '../data/mapTransitions'
import { checkExitZones, fadeOutToScene, fadeInScene } from '../systems/SceneTransition'
import { placePortalAtZone } from '../systems/PortalVisual'
import { createCombatPlaceholderTextures, TARGET_RETICLE_TEXTURE } from '../systems/CombatTextures'
import { syncCombatHudToRegistry } from '../systems/CombatHud'
import { SkillHotbar, bindSkillHotbarInput } from '../systems/SkillHotbar'
import { combatManager } from '../systems/CombatManager'
import { TargetSelector } from '../systems/TargetSelector'
import type { CharacterPanel } from '../systems/CharacterPanel'
import { UIScene } from './UIScene'

const MAP_WIDTH = 700
const MAP_HEIGHT = 550
const GROUND_TEXTURE = 'training_ground_bg'
/** Toạ độ mặc định khi vào scene KHÔNG qua Exit Zone (vd load thẳng scene này lúc dev) — bình thường luôn có
 * `data.spawnX/spawnY` từ `FARM_EXIT_ZONES[0].entryPoint`, xem `data/mapTransitions.ts`. */
const DEFAULT_SPAWN = FARM_EXIT_ZONES[0].entryPoint

/** Bãi Tập Luyện — map phụ đầu tiên nối Farm, chỉ có 5 Người Rơm đứng yên để tập đòn tay (xem
 * `docs/world/maps.md` mục "Bãi Tập Luyện"). Chưa có background thật (chỉ vẽ nền đất bằng code, xem
 * `createGroundTexture()`) — thay bằng tileset thật khi có, không đổi logic gì khác. */
export class TrainingGroundScene extends Phaser.Scene {
  private player!: Player
  private dummies: TrainingDummy[] = []
  private hotbar!: SkillHotbar
  /** Khoá input di chuyển/tấn công trong lúc fade — đúng pattern `seedMenuOpen` ở GameScene, chỉ khác lý do
   * khoá (đang fade thay vì đang mở menu). */
  private isTransitioning = true
  private readonly targetSelector = new TargetSelector<TrainingDummy>()
  private targetReticle!: Phaser.GameObjects.Image
  private f2Key!: Phaser.Input.Keyboard.Key

  constructor() {
    super({ key: 'TrainingGroundScene' })
  }

  create(data: { spawnX?: number; spawnY?: number }) {
    createCombatPlaceholderTextures(this)
    this.createGroundTexture()
    this.add.image(0, 0, GROUND_TEXTURE).setOrigin(0, 0).setDepth(-10000)

    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

    this.dummies = TRAINING_DUMMY_PLACEMENTS.map(
      (p, index) => new TrainingDummy(this, p.x, p.y, index)
    )
    for (const zone of TRAINING_GROUND_EXIT_ZONES) placePortalAtZone(this, zone)

    this.targetReticle = this.add
      .image(0, 0, TARGET_RETICLE_TEXTURE)
      .setVisible(false)
      .setDepth(100000)
    this.f2Key = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F2)

    const spawnX = data?.spawnX ?? DEFAULT_SPAWN.x
    const spawnY = data?.spawnY ?? DEFAULT_SPAWN.y
    this.player = new Player(this, spawnX, spawnY, 'vegeta')
    this.player.on('attack', () => this.handlePlayerAttack())

    this.cameras.main.startFollow(this.player, true)
    syncCombatHudToRegistry(this)
    this.hotbar = new SkillHotbar(this, combatManager.getWeaponSkillClass())
    bindSkillHotbarInput(this, this.hotbar, this.player)
    this.scene.launch('UIScene')

    this.add
      .text(
        8,
        8,
        'Bãi Tập Luyện — Space: đòn thường | 1-5: chọn chiêu, Enter: đánh chiêu | F2: đổi mục tiêu | C: bảng nhân vật. Bước vào cổng dịch chuyển để quay lại Farm.',
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 6, y: 4 }
        }
      )
      .setScrollFactor(0)
      .setDepth(2000)

    fadeInScene(this, () => {
      this.isTransitioning = false
    })
  }

  update() {
    this.hotbar.update()

    if (!this.isTransitioning && !this.getCharacterPanel()?.isOpen) this.player.update()

    if (Phaser.Input.Keyboard.JustDown(this.f2Key)) this.targetSelector.cycleNext(this.dummies)
    const target = this.targetSelector.update(this.dummies, this.player.x, this.player.y)
    if (target) {
      this.targetReticle.setPosition(target.x, target.y).setVisible(true)
    } else {
      this.targetReticle.setVisible(false)
    }

    if (!this.isTransitioning) {
      const exit = checkExitZones(this.player.x, this.player.y, TRAINING_GROUND_EXIT_ZONES)
      if (exit) {
        this.isTransitioning = true
        fadeOutToScene(this, exit.targetScene, exit.entryPoint)
      }
    }
  }

  /** Người Rơm đứng yên, không có tương tác nào khác ngoài bị đánh — không cần check "đánh trúng mục tiêu đã
   * chết" bằng damage thật vì `TrainingDummy.isAlive()` đã tự chặn (case 4 combat.md). */
  private handlePlayerAttack() {
    const hitbox = this.player.getAttackHitboxBounds()
    for (const dummy of this.dummies) {
      if (dummy.isAlive() && Phaser.Geom.Rectangle.Overlaps(hitbox, dummy.getBounds())) {
        dummy.takeHit()
      }
    }
  }

  /** Bảng nhân vật sống ở `UIScene`, không phải scene này — xem giải thích ở docstring field `characterPanel`
   * trong `UIScene.ts` (lý do: thứ tự vẽ giữa scene khác nhau tính theo SCENE, không theo `depth`). */
  private getCharacterPanel(): CharacterPanel | undefined {
    return (this.scene.get('UIScene') as UIScene | null)?.characterPanel
  }

  /** Nền đất tạm (vẽ bằng code) — màu be/nâu nhạt phân biệt rõ với cỏ xanh của Farm, có vài đường kẻ ô mờ gợi ý
   * "sân tập" thay vì đồng cỏ tự nhiên. */
  private createGroundTexture() {
    if (this.textures.exists(GROUND_TEXTURE)) return
    const canvasTexture = this.textures.createCanvas(GROUND_TEXTURE, MAP_WIDTH, MAP_HEIGHT)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    ctx.fillStyle = '#C9A876'
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT)
    ctx.strokeStyle = 'rgba(140,110,70,0.35)'
    ctx.lineWidth = 1
    for (let x = 0; x <= MAP_WIDTH; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, MAP_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y <= MAP_HEIGHT; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(MAP_WIDTH, y)
      ctx.stroke()
    }
    canvasTexture.refresh()
  }
}
