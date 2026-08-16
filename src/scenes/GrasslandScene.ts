import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Monster } from '../entities/Monster'
import { GameData } from '../data/DataLoader'
import { GRASSLAND_EXIT_ZONES, FARM_EXIT_ZONES, FARM_SCENE_KEY } from '../data/mapTransitions'
import { checkGatedExitZones, fadeOutToScene, fadeInScene } from '../systems/SceneTransition'
import { placePortalAtZone } from '../systems/PortalVisual'
import { createCombatPlaceholderTextures, TARGET_RETICLE_TEXTURE } from '../systems/CombatTextures'
import { syncCombatHudToRegistry } from '../systems/CombatHud'
import { combatManager } from '../systems/CombatManager'
import { CombatEngine } from '../systems/CombatEngine'
import { showLevelGateMessage } from '../systems/CombatMapCommon'
import { SkillHotbar, bindSkillHotbarInput } from '../systems/SkillHotbar'
import { TargetSelector } from '../systems/TargetSelector'
import type { CharacterPanel } from '../systems/CharacterPanel'
import type { Skill } from '../data/types'
import { UIScene } from './UIScene'
import { COMBAT_CONTROLS } from '../data/controlsHelp'

const MAP_WIDTH = 1000
const MAP_HEIGHT = 750
const GROUND_TEXTURE = 'grassland_bg'
/** Bản đồ chưa có "làng" (Map 0) thật để respawn theo đúng `docs/gameplay/mechanics.md` ("respawn tại làng") —
 * tạm dùng điểm spawn mặc định của Farm thay thế, xem giải thích đầy đủ ở `docs/planning/progress.md`. */
const DEATH_RESPAWN_POINT = { x: 890, y: 430 }
const DEFAULT_SPAWN = FARM_EXIT_ZONES[1].entryPoint
/** Sprint 12 — đủ 4 loại quái của Đồng Cỏ theo `docs/world/maps.md` (trước chỉ có Thỏ Hoang). */
const MONSTER_SPAWNS: Array<{ monsterId: string; x: number; y: number }> = [
  { monsterId: 'wild_rabbit', x: 400, y: 250 },
  { monsterId: 'wild_rabbit', x: 700, y: 500 },
  { monsterId: 'fire_fox', x: 550, y: 350 },
  { monsterId: 'wild_boar', x: 300, y: 550 },
  { monsterId: 'grass_wolf', x: 850, y: 300 }
]

/** Map 2 — Đồng Cỏ (bản tối giản, KHÔNG phải bản polish đầy đủ với tileset/nhiều khu vực nối tiếp thật — xem
 * giải thích lựa chọn kiến trúc ở `systems/CombatMapCommon.ts`, Sprint 12 áp dụng cho 5 map MỚI nhưng chưa quay
 * lại polish map này vì đã hoạt động ổn từ Sprint 5). */
export class GrasslandScene extends Phaser.Scene {
  private player!: Player
  private monsters: Monster[] = []
  private combatEngine!: CombatEngine
  private hotbar!: SkillHotbar
  private isTransitioning = true
  private readonly targetSelector = new TargetSelector<Monster>()
  private targetReticle!: Phaser.GameObjects.Image
  private f2Key!: Phaser.Input.Keyboard.Key

  constructor() {
    super({ key: 'GrasslandScene' })
  }

  create(data: { spawnX?: number; spawnY?: number }) {
    createCombatPlaceholderTextures(this)
    this.createGroundTexture()
    this.add.image(0, 0, GROUND_TEXTURE).setOrigin(0, 0).setDepth(-10000)

    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

    this.monsters = MONSTER_SPAWNS.map((spawn, index) => {
      const data = GameData.monsters.find((m) => m.id === spawn.monsterId)!
      return new Monster(this, spawn.x, spawn.y, data, index)
    })
    for (const zone of GRASSLAND_EXIT_ZONES) placePortalAtZone(this, zone)

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
    this.registry.set('controlsHelpEntries', COMBAT_CONTROLS)
    this.scene.launch('UIScene')

    this.add
      .text(
        8,
        8,
        'Map 2 — Đồng Cỏ (thử nghiệm). Space: đòn thường | 1-6: chọn chiêu, Enter: đánh chiêu | F2: đổi mục tiêu | C: bảng nhân vật. Bước vào cổng dịch chuyển để quay lại Farm hoặc đi tiếp sang Rừng Tre.',
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 6, y: 4 }
        }
      )
      .setScrollFactor(0)
      .setDepth(2000)

    // Case 13 (combat.md): người chơi chết -> mất 10% Đồng + respawn 50% HP/MP. Chưa có Map 0 (Làng) thật nên
    // respawn tạm về Farm — xem giải thích ở `DEATH_RESPAWN_POINT`. Đăng ký 1 lần cho scene này (mỗi lần
    // `create()` chạy lại là 1 listener mới — gỡ listener cũ khi scene shutdown để tránh treo lơ lửng giống bug
    // đã gặp với `registry.events` ở UIScene, xem progress.md).
    const onPlayerDied = () => this.handlePlayerDeath()
    combatManager.on('player-died', onPlayerDied)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      combatManager.off('player-died', onPlayerDied)
    })

    fadeInScene(this, () => {
      this.isTransitioning = false
    })
  }

  update(_time: number, _delta: number) {
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
        GRASSLAND_EXIT_ZONES,
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

  private handlePlayerDeath() {
    if (this.isTransitioning) return
    this.isTransitioning = true
    combatManager.respawnAtVillage()
    fadeOutToScene(this, FARM_SCENE_KEY, DEATH_RESPAWN_POINT)
  }

  /** Bảng nhân vật sống ở `UIScene`, không phải scene này — xem giải thích ở docstring field `characterPanel`
   * trong `UIScene.ts` (lý do: thứ tự vẽ giữa scene khác nhau tính theo SCENE, không theo `depth`). */
  private getCharacterPanel(): CharacterPanel | undefined {
    return (this.scene.get('UIScene') as UIScene | null)?.characterPanel
  }

  private createGroundTexture() {
    if (this.textures.exists(GROUND_TEXTURE)) return
    const canvasTexture = this.textures.createCanvas(GROUND_TEXTURE, MAP_WIDTH, MAP_HEIGHT)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    ctx.fillStyle = '#7CB955'
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT)
    // Vài mảng cỏ đậm hơn rải rác cho đỡ phẳng lì, không cần texture tile thật.
    ctx.fillStyle = 'rgba(90,150,60,0.4)'
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * MAP_WIDTH
      const y = Math.random() * MAP_HEIGHT
      ctx.beginPath()
      ctx.ellipse(x, y, 14, 8, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    canvasTexture.refresh()
  }
}
