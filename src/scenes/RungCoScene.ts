import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Monster } from '../entities/Monster'
import {
  ANCIENT_FOREST_EXIT_ZONES,
  FARM_SCENE_KEY,
  COMBAT_MAP_WIDTH,
  COMBAT_MAP_HEIGHT
} from '../data/mapTransitions'
import { checkGatedExitZones, fadeOutToScene, fadeInScene } from '../systems/SceneTransition'
import { placePortalAtZone } from '../systems/PortalVisual'
import { createCombatPlaceholderTextures, TARGET_RETICLE_TEXTURE } from '../systems/CombatTextures'
import { syncCombatHudToRegistry } from '../systems/CombatHud'
import { combatManager } from '../systems/CombatManager'
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

const GROUND_TEXTURE = 'ancient_forest_bg'
const DEATH_RESPAWN_POINT = { x: 890, y: 430 }
const DEFAULT_SPAWN = { x: 150, y: 350 }
const MONSTER_SPAWNS: MonsterSpawnDef[] = [
  { monsterId: 'small_ancient_dragon', x: 350, y: 250 },
  { monsterId: 'furious_spirit_tribe', x: 500, y: 500 },
  { monsterId: 'ancient_stone_man', x: 800, y: 300 },
  { monsterId: 'death_spirit', x: 1000, y: 480 }
]

/** Map 7 — Rừng Cổ (Lv50+, cuối chuỗi hiện tại). Chưa có cổng tiến sang Map 8 (Thánh Điện Cổ) — cần MQ-09 hoàn
 * thành trước, chưa có hệ quest (Sprint 16+/17). */
export class RungCoScene extends Phaser.Scene {
  private player!: Player
  private monsters: Monster[] = []
  private combatEngine!: CombatEngine
  private hotbar!: SkillHotbar
  private isTransitioning = true
  private readonly targetSelector = new TargetSelector<Monster>()
  private targetReticle!: Phaser.GameObjects.Image
  private f2Key!: Phaser.Input.Keyboard.Key

  constructor() {
    super({ key: 'RungCoScene' })
  }

  create(data: { spawnX?: number; spawnY?: number }) {
    createCombatPlaceholderTextures(this)
    createFlatZoneGroundTexture(this, {
      key: GROUND_TEXTURE,
      width: COMBAT_MAP_WIDTH,
      height: COMBAT_MAP_HEIGHT,
      zone1Color: 0x1f3a28,
      zone2Color: 0x162a1e,
      speckleColor: 'rgba(40,80,50,0.4)'
    })
    this.add.image(0, 0, GROUND_TEXTURE).setOrigin(0, 0).setDepth(-10000)

    this.physics.world.setBounds(0, 0, COMBAT_MAP_WIDTH, COMBAT_MAP_HEIGHT)
    this.cameras.main.setBounds(0, 0, COMBAT_MAP_WIDTH, COMBAT_MAP_HEIGHT)

    this.monsters = spawnMonstersFromDefs(this, MONSTER_SPAWNS)
    for (const zone of ANCIENT_FOREST_EXIT_ZONES) placePortalAtZone(this, zone)

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
        'Map 7 — Rừng Cổ (Lv50+). Space: đòn thường | 1-6: chọn chiêu, Enter: đánh chiêu | F2: đổi mục tiêu | C: bảng nhân vật.',
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
        ANCIENT_FOREST_EXIT_ZONES,
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

  private getCharacterPanel(): CharacterPanel | undefined {
    return (this.scene.get('UIScene') as UIScene | null)?.characterPanel
  }
}
