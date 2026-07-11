import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Monster } from '../entities/Monster'
import {
  CAVE_EXIT_ZONES,
  FARM_SCENE_KEY,
  COMBAT_MAP_WIDTH,
  COMBAT_MAP_HEIGHT
} from '../data/mapTransitions'
import { checkGatedExitZones, fadeOutToScene, fadeInScene } from '../systems/SceneTransition'
import { placePortalAtZone } from '../systems/PortalVisual'
import { createCombatPlaceholderTextures, TARGET_RETICLE_TEXTURE } from '../systems/CombatTextures'
import { syncCombatHudToRegistry } from '../systems/CombatHud'
import { combatManager } from '../systems/CombatManager'
import { inventoryManager } from '../systems/InventoryManager'
import { CombatEngine } from '../systems/CombatEngine'
import {
  createFlatZoneGroundTexture,
  spawnMonstersFromDefs,
  showLevelGateMessage,
  type MonsterSpawnDef
} from '../systems/CombatMapCommon'
import { SkillHotbar, bindSkillHotbarInput } from '../systems/SkillHotbar'
import { TargetSelector } from '../systems/TargetSelector'
import type { CharacterPanel } from '../systems/CharacterPanel'
import type { Skill } from '../data/types'
import { UIScene } from './UIScene'

const GROUND_TEXTURE = 'cave_bg'
const DEATH_RESPAWN_POINT = { x: 890, y: 430 }
const DEFAULT_SPAWN = { x: 150, y: 350 }
const MONSTER_SPAWNS: MonsterSpawnDef[] = [
  { monsterId: 'poison_spider', x: 350, y: 250 },
  { monsterId: 'skeleton', x: 500, y: 500 },
  { monsterId: 'stone_golem', x: 800, y: 300 },
  { monsterId: 'blood_bat', x: 1000, y: 480 }
]

/** Đèn lồng (item `lantern`) mở rộng tầm nhìn — "Địa đạo ngầm — khu vực tối cần cơ chế đèn lồng" theo
 * `docs/world/maps.md` mục Map 4. Vẽ bằng 1 texture RẤT LỚN (2400×2400, tạo 1 lần) là gradient toả tròn từ
 * trong suốt (quanh người chơi) ra tối gần như đen ở rìa — kích thước lớn hơn hẳn camera để mép luôn phủ kín
 * màn hình dù người chơi đứng ở đâu trong map, không cần cắt lỗ bằng mask/blend mode phức tạp. */
const DARKNESS_CANVAS_SIZE = 2400
const VISION_RADIUS_NO_LANTERN = 90
const VISION_RADIUS_WITH_LANTERN = 220
const DARKNESS_TEXTURE_DARK = 'cave_darkness_no_lantern'
const DARKNESS_TEXTURE_LIT = 'cave_darkness_lantern'
const DARKNESS_DEPTH = 500_000

export class HangDongScene extends Phaser.Scene {
  private player!: Player
  private monsters: Monster[] = []
  private combatEngine!: CombatEngine
  private hotbar!: SkillHotbar
  private isTransitioning = true
  private readonly targetSelector = new TargetSelector<Monster>()
  private targetReticle!: Phaser.GameObjects.Image
  private f2Key!: Phaser.Input.Keyboard.Key
  private darknessImage!: Phaser.GameObjects.Image
  private hasLanternCached = false

  constructor() {
    super({ key: 'HangDongScene' })
  }

  create(data: { spawnX?: number; spawnY?: number }) {
    createCombatPlaceholderTextures(this)
    createFlatZoneGroundTexture(this, {
      key: GROUND_TEXTURE,
      width: COMBAT_MAP_WIDTH,
      height: COMBAT_MAP_HEIGHT,
      zone1Color: 0x2e2a26,
      zone2Color: 0x24211f,
      speckleColor: 'rgba(60,55,50,0.4)'
    })
    this.add.image(0, 0, GROUND_TEXTURE).setOrigin(0, 0).setDepth(-10000)

    this.physics.world.setBounds(0, 0, COMBAT_MAP_WIDTH, COMBAT_MAP_HEIGHT)
    this.cameras.main.setBounds(0, 0, COMBAT_MAP_WIDTH, COMBAT_MAP_HEIGHT)

    this.monsters = spawnMonstersFromDefs(this, MONSTER_SPAWNS)
    for (const zone of CAVE_EXIT_ZONES) placePortalAtZone(this, zone)

    this.targetReticle = this.add
      .image(0, 0, TARGET_RETICLE_TEXTURE)
      .setVisible(false)
      .setDepth(100000)
    this.f2Key = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F2)

    const spawnX = data?.spawnX ?? DEFAULT_SPAWN.x
    const spawnY = data?.spawnY ?? DEFAULT_SPAWN.y
    this.player = new Player(this, spawnX, spawnY, 'vegeta')
    this.hotbar = new SkillHotbar(this, combatManager.getWeaponSkillClass())
    this.combatEngine = new CombatEngine(this, this.player, this.monsters, this.hotbar)
    this.player.on('attack', (payload: { skill: Skill | null }) =>
      this.combatEngine.handlePlayerAttack(payload.skill)
    )

    this.cameras.main.startFollow(this.player, true)
    syncCombatHudToRegistry(this)
    bindSkillHotbarInput(this, this.hotbar, this.player)
    this.scene.launch('UIScene')

    this.createDarknessTextures()
    this.hasLanternCached = this.hasLantern()
    this.darknessImage = this.add
      .image(0, 0, this.hasLanternCached ? DARKNESS_TEXTURE_LIT : DARKNESS_TEXTURE_DARK)
      .setScrollFactor(0)
      .setDepth(DARKNESS_DEPTH)

    this.add
      .text(
        8,
        8,
        'Map 4 — Hang Động (Lv20+). Tối — cần Đèn lồng (item "lantern") để thấy xa hơn. Space: đòn thường | 1-6: chọn chiêu, Enter: đánh chiêu | F2: đổi mục tiêu | C: bảng nhân vật.',
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 6, y: 4 }
        }
      )
      .setScrollFactor(0)
      .setDepth(2000)

    const onPlayerDied = () => this.handlePlayerDeath()
    combatManager.on('player-died', onPlayerDied)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      combatManager.off('player-died', onPlayerDied)
    })

    fadeInScene(this, () => {
      this.isTransitioning = false
    })
  }

  update() {
    this.hotbar.update()

    if (!this.isTransitioning && !this.getCharacterPanel()?.isOpen) {
      this.player.update()
      for (const monster of this.monsters)
        monster.updateAi(
          this.player.x,
          this.player.y,
          this.time.now,
          this.combatEngine.hasCombatStarted()
        )
    }

    this.updateDarkness()

    if (Phaser.Input.Keyboard.JustDown(this.f2Key)) this.targetSelector.cycleNext(this.monsters)
    const target = this.targetSelector.update(this.monsters, this.player.x, this.player.y)
    if (target) {
      this.targetReticle.setPosition(target.x, target.y).setVisible(true)
    } else {
      this.targetReticle.setVisible(false)
    }

    if (!this.isTransitioning) {
      const level = combatManager.getStats().level
      const { zone, blockedByLevel } = checkGatedExitZones(
        this.player.x,
        this.player.y,
        CAVE_EXIT_ZONES,
        level
      )
      if (zone) {
        this.isTransitioning = true
        fadeOutToScene(this, zone.targetScene, zone.entryPoint)
      } else if (blockedByLevel) {
        showLevelGateMessage(this, this.player.x, this.player.y, blockedByLevel)
      }
    }
  }

  private hasLantern(): boolean {
    return inventoryManager.getSlots().some((s) => s.itemId === 'lantern' && s.quantity > 0)
  }

  /** Di chuyển ảnh tối theo đúng vị trí MÀN HÌNH (không phải world) của player — `scrollFactor(0)` nên toạ độ
   * đặt vào là toạ độ canvas, quy đổi từ world bằng `player.x/y - cam.scrollX/scrollY` (game không zoom/xoay
   * camera nên phép trừ đơn giản này đủ chính xác). Đổi texture (bán kính rộng/hẹp) ngay khi trạng thái có/không
   * Đèn lồng thay đổi (chỉ đổi thật khi khác lần trước, tránh gọi `setTexture()` dư mỗi frame). */
  private updateDarkness(): void {
    const cam = this.cameras.main
    this.darknessImage.setPosition(this.player.x - cam.scrollX, this.player.y - cam.scrollY)

    const hasLantern = this.hasLantern()
    if (hasLantern !== this.hasLanternCached) {
      this.hasLanternCached = hasLantern
      this.darknessImage.setTexture(hasLantern ? DARKNESS_TEXTURE_LIT : DARKNESS_TEXTURE_DARK)
    }
  }

  private createDarknessTextures(): void {
    this.createDarknessTexture(DARKNESS_TEXTURE_DARK, VISION_RADIUS_NO_LANTERN)
    this.createDarknessTexture(DARKNESS_TEXTURE_LIT, VISION_RADIUS_WITH_LANTERN)
  }

  private createDarknessTexture(key: string, visionRadius: number): void {
    if (this.textures.exists(key)) return
    const size = DARKNESS_CANVAS_SIZE
    const canvasTexture = this.textures.createCanvas(key, size, size)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    const center = size / 2
    // Canvas radial gradient tự động dùng màu của stop CUỐI cho mọi điểm NGOÀI bán kính ngoài — nghĩa là cả
    // texture 2400px sẽ tối đều ngoài vùng nhìn thấy mà không cần vẽ thêm gì khác.
    const gradient = ctx.createRadialGradient(
      center,
      center,
      visionRadius * 0.35,
      center,
      center,
      visionRadius
    )
    gradient.addColorStop(0, 'rgba(4,4,8,0)')
    gradient.addColorStop(1, 'rgba(4,4,8,0.96)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    canvasTexture.refresh()
  }

  private handlePlayerDeath() {
    if (this.isTransitioning) return
    this.isTransitioning = true
    combatManager.respawnAtVillage()
    fadeOutToScene(this, FARM_SCENE_KEY, DEATH_RESPAWN_POINT)
  }

  private getCharacterPanel(): CharacterPanel | undefined {
    return (this.scene.get('UIScene') as UIScene | null)?.characterPanel
  }
}
