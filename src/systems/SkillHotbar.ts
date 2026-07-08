import Phaser from 'phaser'
import type { Skill } from '../data/types'
import { GameData } from '../data/DataLoader'
import { combatManager } from './CombatManager'
import type { Player } from '../entities/Player'

const SLOT_COUNT = 5
const SLOT_SIZE = 44
const SLOT_GAP = 10
const HOTBAR_DEPTH = 3000

/** Danh sách chiêu hiện trong hotbar — lấy TẤT CẢ chiêu Active/Buff/Debuff (bỏ Passive, vì passive tự động có
 * hiệu lực không cần bấm, xem `docs/gameplay/combat.md`) thuộc đúng hệ vũ khí đang cầm, sắp theo `skill_index`,
 * đệm thêm `null` cho đủ 5 ô nếu chưa đủ chiêu (V1 mới chỉ có `quick_slash` cho hệ Kiếm Sĩ — 4 ô còn lại để
 * trống, tự lấp đầy khi Sprint 11 thêm chiêu 2-6 mà không cần sửa gì ở đây). */
function getHotbarSkills(weaponSkillClass: string): Array<Skill | null> {
  const skills = GameData.skills
    .filter((s) => s.class === weaponSkillClass && s.type !== 'passive')
    .sort((a, b) => a.skill_index - b.skill_index)
    .slice(0, SLOT_COUNT)
  const padded: Array<Skill | null> = [...skills]
  while (padded.length < SLOT_COUNT) padded.push(null)
  return padded
}

/** Thanh 5 ô chiêu thức (Sprint 5, user yêu cầu thêm theo mẫu game tham khảo) — phím SỐ 1-5 chọn ô (chỉ tô
 * sáng, KHÔNG đánh ngay), phím Enter đánh chiêu của ô đang chọn. Tách khỏi `GameScene`/scene chiến đấu vì cả
 * `TrainingGroundScene` lẫn `GrasslandScene` đều cần y hệt — 1 class dùng chung, scene chỉ cần tạo + gọi
 * `trySelectByKey()`/`tryCast()` đúng lúc. */
export class SkillHotbar {
  private readonly scene: Phaser.Scene
  private readonly skills: Array<Skill | null>
  private selectedIndex = 0
  private readonly slotBg: Phaser.GameObjects.Rectangle[] = []
  private readonly slotLabel: Phaser.GameObjects.Text[] = []
  private readonly cooldownOverlay: Phaser.GameObjects.Rectangle[] = []
  private readonly cooldownText: Phaser.GameObjects.Text[] = []
  /** Mốc thời gian (ms, theo `scene.time.now`) mà từng ô hết cooldown — 0 nghĩa là sẵn sàng ngay. Case 7
   * combat.md: "dùng chiêu khi đang cooldown" phải chặn hoàn toàn, không trừ MP. */
  private readonly cooldownReadyAt: number[] = new Array(SLOT_COUNT).fill(0)

  constructor(scene: Phaser.Scene, weaponSkillClass: string) {
    this.scene = scene
    this.skills = getHotbarSkills(weaponSkillClass)
    this.createUI()
  }

  private createUI(): void {
    const totalWidth = SLOT_COUNT * SLOT_SIZE + (SLOT_COUNT - 1) * SLOT_GAP
    const startX = this.scene.scale.width / 2 - totalWidth / 2 + SLOT_SIZE / 2
    const y = this.scene.scale.height - 40

    for (let i = 0; i < SLOT_COUNT; i++) {
      const x = startX + i * (SLOT_SIZE + SLOT_GAP)
      const skill = this.skills[i]

      const bg = this.scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, skill ? 0x1d2b3a : 0x14181f, 0.88)
        .setStrokeStyle(2, 0x555f6e)
        .setScrollFactor(0)
        .setDepth(HOTBAR_DEPTH)
      this.slotBg.push(bg)

      // Chưa có icon riêng cho từng chiêu (`<id>_icon.png` chưa gen, xem asset-manifest.md mục 5) — dùng tạm
      // tên chiêu viết tắt + số phím (1-5) làm nhãn, đủ để phân biệt ô nào có chiêu/ô nào trống.
      const label = this.scene.add
        .text(x, y, skill ? skill.name : '—', {
          fontSize: '10px',
          color: skill ? '#e8f0ff' : '#555f6e',
          fontFamily: 'monospace',
          align: 'center',
          wordWrap: { width: SLOT_SIZE - 6 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(HOTBAR_DEPTH + 1)
      this.slotLabel.push(label)

      this.scene.add
        .text(x, y - SLOT_SIZE / 2 - 10, `${i + 1}`, {
          fontSize: '11px',
          color: '#ffe9a8',
          fontFamily: 'monospace'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(HOTBAR_DEPTH + 1)

      const overlay = this.scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x000000, 0.65)
        .setScrollFactor(0)
        .setDepth(HOTBAR_DEPTH + 2)
        .setVisible(false)
      this.cooldownOverlay.push(overlay)

      const cdText = this.scene.add
        .text(x, y, '', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(HOTBAR_DEPTH + 3)
      this.cooldownText.push(cdText)
    }

    this.refreshHighlight()
  }

  selectSlot(index: number): void {
    if (index < 0 || index >= SLOT_COUNT) return
    this.selectedIndex = index
    this.refreshHighlight()
  }

  private refreshHighlight(): void {
    this.slotBg.forEach((bg, i) =>
      bg.setStrokeStyle(
        i === this.selectedIndex ? 3 : 2,
        i === this.selectedIndex ? 0xffd963 : 0x555f6e
      )
    )
  }

  /** Case 7+8 (combat.md): trả `null` nếu ô trống/đang cooldown/không đủ MP — scene không được đánh gì cả khi
   * `null`, không phải "đánh chay miễn phí". Đủ điều kiện thì tự trừ MP + bắt đầu cooldown LUÔN trong hàm này
   * (đúng "cooldown bắt đầu tính ngay sau khi kích hoạt", không phải sau khi hiệu ứng kết thúc). */
  tryCast(spendMp: (amount: number) => boolean): Skill | null {
    const skill = this.skills[this.selectedIndex]
    if (!skill) return null
    if (this.scene.time.now < this.cooldownReadyAt[this.selectedIndex]) return null
    if (!spendMp(skill.mp_cost)) return null

    this.cooldownReadyAt[this.selectedIndex] = this.scene.time.now + skill.cooldown * 1000
    return skill
  }

  /** Gọi mỗi frame từ scene — chỉ cần cập nhật đồng hồ đếm ngược hiển thị, không có logic gameplay gì ở đây. */
  update(): void {
    for (let i = 0; i < SLOT_COUNT; i++) {
      const remainingMs = this.cooldownReadyAt[i] - this.scene.time.now
      const onCooldown = remainingMs > 0
      this.cooldownOverlay[i].setVisible(onCooldown)
      this.cooldownText[i].setText(onCooldown ? Math.ceil(remainingMs / 1000).toString() : '')
    }
  }
}

const SLOT_SELECT_KEYS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'] as const

/** Gắn phím tắt dùng chung cho mọi scene chiến đấu có hotbar — phím SỐ 1-5 chỉ CHỌN ô (không đánh ngay), Enter
 * đánh chiêu của ô đang chọn. Tách khỏi `SkillHotbar` (thuần UI/state) để scene không phải tự lặp lại y hệt
 * đoạn bind phím này ở cả `TrainingGroundScene` lẫn `GrasslandScene`. */
export function bindSkillHotbarInput(
  scene: Phaser.Scene,
  hotbar: SkillHotbar,
  player: Player
): void {
  SLOT_SELECT_KEYS.forEach((key, index) => {
    scene.input.keyboard!.on(`keydown-${key}`, (event: KeyboardEvent) => {
      if (event.repeat) return
      event.preventDefault()
      hotbar.selectSlot(index)
    })
  })

  scene.input.keyboard!.on('keydown-ENTER', (event: KeyboardEvent) => {
    if (event.repeat) return
    event.preventDefault()
    if (!player.canAttack()) return
    const skill = hotbar.tryCast((amount) => combatManager.spendMp(amount))
    if (!skill) return
    player.startAttack({ damageMultiplier: skill.damage_multiplier })
  })
}
