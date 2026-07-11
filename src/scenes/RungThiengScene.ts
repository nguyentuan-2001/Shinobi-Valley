import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Monster } from '../entities/Monster'
import {
  SACRED_FOREST_EXIT_ZONES,
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

const GROUND_TEXTURE = 'sacred_forest_bg'
const DEATH_RESPAWN_POINT = { x: 890, y: 430 }
const DEFAULT_SPAWN = { x: 150, y: 350 }
const MONSTER_SPAWNS: MonsterSpawnDef[] = [
  { monsterId: 'spirit_fox', x: 350, y: 250 },
  { monsterId: 'night_moth_ghost', x: 500, y: 500 },
  { monsterId: 'corrupted_beast', x: 800, y: 300 },
  { monsterId: 'monster_tree', x: 1000, y: 480 }
]
/** "Khu vực ô nhiễm — một số ô đất gây 1 HP/giây thiệt hại trừ khi có Cuộn Giấy Tẩy Uế" — `docs/world/maps.md`
 * mục Map 6. Đơn giản hoá: dùng luôn NỬA PHẢI của map (`zone2`, đã có màu nền khác biệt qua
 * `createFlatZoneGroundTexture()`) làm "khu ô nhiễm" thay vì định nghĩa thêm 1 vùng hình học riêng — vừa khớp
 * trực quan (nửa phải đổi màu tím/xanh bệnh) vừa tái dùng đúng ranh giới 2 khu đã có sẵn. */
const CORRUPTION_ZONE_X = COMBAT_MAP_WIDTH / 2
const CORRUPTION_TICK_MS = 1000
const CORRUPTION_DAMAGE_PER_TICK = 1

export class RungThiengScene extends Phaser.Scene {
  private player!: Player
  private monsters: Monster[] = []
  private combatEngine!: CombatEngine
  private hotbar!: SkillHotbar
  private isTransitioning = true
  private readonly targetSelector = new TargetSelector<Monster>()
  private targetReticle!: Phaser.GameObjects.Image
  private f2Key!: Phaser.Input.Keyboard.Key
  private lastCorruptionTickAt = -Infinity
  private corruptionWarningText?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'RungThiengScene' })
  }

  create(data: { spawnX?: number; spawnY?: number }) {
    createCombatPlaceholderTextures(this)
    createFlatZoneGroundTexture(this, {
      key: GROUND_TEXTURE,
      width: COMBAT_MAP_WIDTH,
      height: COMBAT_MAP_HEIGHT,
      zone1Color: 0x2f4a2a,
      zone2Color: 0x4a2f5a,
      speckleColor: 'rgba(90,40,110,0.5)'
    })
    this.add.image(0, 0, GROUND_TEXTURE).setOrigin(0, 0).setDepth(-10000)

    this.physics.world.setBounds(0, 0, COMBAT_MAP_WIDTH, COMBAT_MAP_HEIGHT)
    this.cameras.main.setBounds(0, 0, COMBAT_MAP_WIDTH, COMBAT_MAP_HEIGHT)

    this.monsters = spawnMonstersFromDefs(this, MONSTER_SPAWNS)
    for (const zone of SACRED_FOREST_EXIT_ZONES) placePortalAtZone(this, zone)

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

    this.add
      .text(
        8,
        8,
        'Map 6 — Rừng Thiêng (Lv40+). Nửa phải bị ô nhiễm (-1 HP/s) — cần Cuộn Giấy Tẩy Uế (item "purify_scroll") để miễn nhiễm. Space: đòn thường | 1-6: chọn chiêu, Enter: đánh chiêu | F2: đổi mục tiêu | C: bảng nhân vật.',
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
      this.updateCorruption()
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
        SACRED_FOREST_EXIT_ZONES,
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

  /** Case đo được ở "Done when" Sprint 12: đứng trong khu ô nhiễm (nửa phải) mà KHÔNG có Cuộn Giấy Tẩy Uế thì
   * trừ đúng `CORRUPTION_DAMAGE_PER_TICK` HP mỗi `CORRUPTION_TICK_MS` — dùng mốc thời gian riêng (giống
   * `Monster.CONTACT_DAMAGE_COOLDOWN_MS`), không tick khi vừa rời khu (không cộng dồn "nợ" thời gian đứng
   * ngoài). Không tiêu hao Cuộn Giấy Tẩy Uế (miễn nhiễm khi CÓ SẴN trong túi, không phải dùng 1 lần). */
  private updateCorruption(): void {
    const inCorruptionZone = this.player.x >= CORRUPTION_ZONE_X
    if (!inCorruptionZone) {
      this.corruptionWarningText?.destroy()
      this.corruptionWarningText = undefined
      this.lastCorruptionTickAt = -Infinity
      return
    }

    const hasPurifyScroll = inventoryManager
      .getSlots()
      .some((s) => s.itemId === 'purify_scroll' && s.quantity > 0)

    if (!this.corruptionWarningText) {
      this.corruptionWarningText = this.add
        .text(
          this.player.x,
          this.player.y - 30,
          hasPurifyScroll ? 'Được Tẩy Uế bảo vệ' : 'Ô nhiễm! (-1 HP/s)',
          {
            fontSize: '10px',
            color: hasPurifyScroll ? '#b4ffcc' : '#ffb4b4',
            fontFamily: 'monospace',
            backgroundColor: '#00000088',
            padding: { x: 3, y: 1 }
          }
        )
        .setOrigin(0.5)
        .setDepth(999_999)
    } else {
      this.corruptionWarningText.setPosition(this.player.x, this.player.y - 30)
    }

    if (hasPurifyScroll) return

    const now = this.time.now
    if (now - this.lastCorruptionTickAt < CORRUPTION_TICK_MS) return
    this.lastCorruptionTickAt = now
    combatManager.takeDamage(CORRUPTION_DAMAGE_PER_TICK, now)
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
