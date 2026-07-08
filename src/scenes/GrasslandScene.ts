import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Monster } from '../entities/Monster'
import { GameData } from '../data/DataLoader'
import { GRASSLAND_EXIT_ZONES, FARM_EXIT_ZONES, FARM_SCENE_KEY } from '../data/mapTransitions'
import { checkExitZones, fadeOutToScene, fadeInScene } from '../systems/SceneTransition'
import { placePortalAtZone } from '../systems/PortalVisual'
import { createCombatPlaceholderTextures, TARGET_RETICLE_TEXTURE } from '../systems/CombatTextures'
import { syncCombatHudToRegistry } from '../systems/CombatHud'
import { combatManager } from '../systems/CombatManager'
import { computeDamage } from '../systems/CombatSystem'
import { SkillHotbar, bindSkillHotbarInput } from '../systems/SkillHotbar'
import { TargetSelector } from '../systems/TargetSelector'

const MAP_WIDTH = 1000
const MAP_HEIGHT = 750
const GROUND_TEXTURE = 'grassland_bg'
/** Bản đồ chưa có "làng" (Map 0) thật để respawn theo đúng `docs/gameplay/mechanics.md` ("respawn tại làng") —
 * tạm dùng điểm spawn mặc định của Farm thay thế, xem giải thích đầy đủ ở `docs/planning/progress.md`. */
const DEATH_RESPAWN_POINT = { x: 890, y: 430 }
const DEFAULT_SPAWN = FARM_EXIT_ZONES[1].entryPoint
/** Player chưa có crit chance thật trong `PlayerStats` (Sprint 5 không yêu cầu — xem `docs/gameplay/mechanics.md`
 * thuộc tính Crit chỉ cộng qua điểm thuộc tính, chưa làm UI phân bổ) — dùng tạm 1 số nhỏ cố định cho đòn thường
 * có cơ hội chí mạng thay vì luôn 0%, để case "Chí mạng" (case 1 combat.md) thật sự xảy ra được khi test. */
const PLAYER_BASIC_ATTACK_CRIT_CHANCE = 0.05
const MONSTER_SPAWNS: Array<{ x: number; y: number }> = [
  { x: 500, y: 300 },
  { x: 700, y: 500 }
]

/** Map 2 — Đồng Cỏ (bản tối giản chỉ đủ để test combat thật, KHÔNG phải bản polish đầy đủ — polish toàn bộ map
 * 2-7 là việc của Sprint 12 theo `dev-schedule.md`). Chưa có background thật, dùng nền cỏ vẽ bằng code tạm. */
export class GrasslandScene extends Phaser.Scene {
  private player!: Player
  private monsters: Monster[] = []
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

    const wildRabbit = GameData.monsters.find((m) => m.id === 'wild_rabbit')
    if (wildRabbit) {
      this.monsters = MONSTER_SPAWNS.map(
        (pos, index) => new Monster(this, pos.x, pos.y, wildRabbit, index)
      )
    }
    for (const zone of GRASSLAND_EXIT_ZONES) placePortalAtZone(this, zone)

    this.targetReticle = this.add
      .image(0, 0, TARGET_RETICLE_TEXTURE)
      .setVisible(false)
      .setDepth(100000)
    this.f2Key = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F2)

    const spawnX = data?.spawnX ?? DEFAULT_SPAWN.x
    const spawnY = data?.spawnY ?? DEFAULT_SPAWN.y
    this.player = new Player(this, spawnX, spawnY, 'women')
    this.player.on('attack', (payload: { damageMultiplier: number }) =>
      this.handlePlayerAttack(payload.damageMultiplier)
    )

    this.cameras.main.startFollow(this.player, true)
    syncCombatHudToRegistry(this)
    this.hotbar = new SkillHotbar(this, combatManager.getWeaponSkillClass())
    bindSkillHotbarInput(this, this.hotbar, this.player)
    this.scene.launch('UIScene')

    this.add
      .text(
        8,
        8,
        'Map 2 — Đồng Cỏ (thử nghiệm). Space: đòn thường | 1-5: chọn chiêu, Enter: đánh chiêu | F2: đổi mục tiêu. Bước vào cổng dịch chuyển để quay lại Farm.',
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

    if (!this.isTransitioning) {
      this.player.update()
      for (const monster of this.monsters)
        monster.updateAi(this.player.x, this.player.y, this.time.now)
    }

    if (Phaser.Input.Keyboard.JustDown(this.f2Key)) this.targetSelector.cycleNext(this.monsters)
    const target = this.targetSelector.update(this.monsters, this.player.x, this.player.y)
    if (target) {
      this.targetReticle.setPosition(target.x, target.y).setVisible(true)
    } else {
      this.targetReticle.setVisible(false)
    }

    if (!this.isTransitioning) {
      const exit = checkExitZones(this.player.x, this.player.y, GRASSLAND_EXIT_ZONES)
      if (exit) {
        this.isTransitioning = true
        fadeOutToScene(this, exit.targetScene, exit.entryPoint)
      }
    }
  }

  /** `skillMultiplier` = 1 cho đòn thường (Space), hoặc `damage_multiplier` của chiêu đang chọn trong hotbar
   * nếu đánh bằng Enter — nhân THÊM vào `weaponMultiplier` của vũ khí đang cầm (2 hệ số độc lập, xem
   * `CombatManager.getWeaponMultiplier()`). */
  private handlePlayerAttack(skillMultiplier: number) {
    const hitbox = this.player.getAttackHitboxBounds()
    const atk = combatManager.getTotalAtk()
    const totalMultiplier = skillMultiplier * combatManager.getWeaponMultiplier()
    for (const monster of this.monsters) {
      if (!monster.isAlive() || !Phaser.Geom.Rectangle.Overlaps(hitbox, monster.getBounds()))
        continue
      const result = computeDamage(
        atk,
        totalMultiplier,
        monster.getDef(),
        PLAYER_BASIC_ATTACK_CRIT_CHANCE
      )
      monster.takeDamage(result.damage)
    }
  }

  private handlePlayerDeath() {
    if (this.isTransitioning) return
    this.isTransitioning = true
    combatManager.respawnAtVillage()
    fadeOutToScene(this, FARM_SCENE_KEY, DEATH_RESPAWN_POINT)
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
