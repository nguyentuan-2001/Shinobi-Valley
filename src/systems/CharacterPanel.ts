import Phaser from 'phaser'
import type { ArmorSlot } from '../data/types'
import { GameData } from '../data/DataLoader'
import { combatManager, type PotentialStat } from './CombatManager'
import { inventoryManager } from './InventoryManager'

/** Nổi trên MỌI panel khác của mọi scene (menu hạt giống/túi đồ cũ/bảng công cụ nông trại ở GameScene đều dùng
 * depth < 1_000_003) — bảng này dùng chung cho cả Farm/Bãi Tập Luyện/Đồng Cỏ nên không đụng hằng số depth
 * riêng của từng scene, cứ đặt hẳn lên rất cao cho chắc. */
const PANEL_DEPTH = 2_000_000
const PANEL_WIDTH = 620
const PANEL_HEIGHT = 460
const TAB_BAR_HEIGHT = 34
const CONTENT_TOP = -PANEL_HEIGHT / 2 + TAB_BAR_HEIGHT + 14
const PLACEHOLDER_ICON_TEXTURE = 'character_panel_placeholder_icon'

type TabKey = 'inventory' | 'potential' | 'skills' | 'info' | 'equipment'
const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'inventory', label: 'Hành trang' },
  { key: 'potential', label: 'Tiềm năng' },
  { key: 'skills', label: 'Kỹ năng' },
  { key: 'info', label: 'Thông tin' },
  { key: 'equipment', label: 'Trang bị' }
]

const ARMOR_SLOTS: readonly ArmorSlot[] = ['head', 'chest', 'hands', 'feet', 'ring', 'necklace']
const ARMOR_SLOT_LABELS: Record<ArmorSlot, string> = {
  head: 'Mũ',
  chest: 'Giáp thân',
  hands: 'Bao tay',
  feet: 'Giày',
  ring: 'Nhẫn',
  necklace: 'Dây chuyền'
}

const POTENTIAL_ROWS: Array<{ stat: PotentialStat; label: string; getTotal: () => number }> = [
  { stat: 'hp', label: 'HP tối đa', getTotal: () => combatManager.getTotalMaxHp() },
  { stat: 'mp', label: 'MP tối đa', getTotal: () => combatManager.getTotalMaxMp() },
  { stat: 'atk', label: 'Tấn công (ATK)', getTotal: () => combatManager.getTotalAtk() },
  { stat: 'def', label: 'Phòng thủ (DEF)', getTotal: () => combatManager.getTotalDef() },
  {
    stat: 'move_speed',
    label: 'Tốc độ di chuyển',
    getTotal: () => combatManager.getTotalMoveSpeed()
  },
  { stat: 'crit', label: 'Chí mạng (%)', getTotal: () => combatManager.getTotalCrit() },
  {
    stat: 'attack_speed',
    label: 'Tốc độ đánh (%)',
    getTotal: () => Math.round(combatManager.getTotalAttackSpeed() * 100)
  },
  { stat: 'luck', label: 'May mắn (Luck)', getTotal: () => combatManager.getTotalLuck() }
]

interface ClickRegion {
  x: number
  y: number
  width: number
  height: number
  onClick: () => void
}

/** Bảng nhân vật gộp 5 tab (Hành trang/Tiềm năng/Kỹ năng/Thông tin/Trang bị) theo tham khảo UI 1 game khác
 * (user cung cấp ảnh chụp màn hình) — dùng CHUNG cho cả `GameScene`/`GrasslandScene`/`TrainingGroundScene`
 * (giống cách `SkillHotbar` đã tách ra dùng chung), vì chỉ số/trang bị/túi đồ đều là singleton sống xuyên suốt
 * mọi scene, không có lý do gì để bảng xem chỉ mở được ở Farm.
 *
 * **Vì sao KHÔNG dùng `.setInteractive()` cho từng nút/slot**: object tương tác lồng trong Container
 * `scrollFactor(0)` bị lệch hit-test ngay khi camera đã cuộn khỏi world (0,0) — hạn chế đã biết của Phaser, bug
 * thật gặp khi làm bảng Công Cụ Nông Trại ở `GameScene.ts` (xem comment ở `createBulkActionsUI()`). Dùng lại
 * đúng cách đã chọn ở đó: tự ghi lại toạ độ từng vùng bấm (`ClickRegion`) rồi tự hit-test thủ công trong
 * `handlePointerDown()`, scene gọi vào từ 1 listener `pointerdown` chung.
 *
 * **"Trang bị" hiện chưa có nguồn item thật** (chưa có shop/craft/drop cho giáp) — coi như đã "unlock" hết,
 * click vào 1 slot XOAY VÒNG qua toàn bộ item hợp lệ của slot đó (kể cả "gỡ ra" với slot giáp), đúng tinh thần
 * "chưa có cơ chế chặn theo cấp độ/sở hữu thật" đã áp dụng cho menu hạt giống Farm (`PLANTABLE_CROP_IDS`). */
export class CharacterPanel {
  private readonly scene: Phaser.Scene
  private readonly container: Phaser.GameObjects.Container
  private readonly contentContainer: Phaser.GameObjects.Container
  private readonly tabTexts = new Map<TabKey, Phaser.GameObjects.Text>()
  private readonly tabClickRegions: ClickRegion[] = []
  private contentClickRegions: ClickRegion[] = []
  private activeTab: TabKey = 'inventory'
  private opened = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createPlaceholderIconTexture()

    const background = scene.add.graphics()
    background.fillStyle(0x2a1810, 0.95)
    background.fillRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 12)
    background.lineStyle(2, 0xd9b15c, 0.9)
    background.strokeRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 12)

    const tabBarY = -PANEL_HEIGHT / 2 + TAB_BAR_HEIGHT / 2
    const tabWidth = PANEL_WIDTH / TABS.length
    const tabObjects: Phaser.GameObjects.GameObject[] = []
    TABS.forEach((tab, index) => {
      const x = -PANEL_WIDTH / 2 + tabWidth * (index + 0.5)
      const text = scene.add
        .text(x, tabBarY, tab.label, {
          fontSize: '13px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#cccccc'
        })
        .setOrigin(0.5)
      this.tabTexts.set(tab.key, text)
      tabObjects.push(text)
      this.tabClickRegions.push({
        x,
        y: tabBarY,
        width: tabWidth,
        height: TAB_BAR_HEIGHT,
        onClick: () => this.selectTab(tab.key)
      })
    })
    const tabBarDivider = scene.add.graphics()
    tabBarDivider.lineStyle(1, 0xd9b15c, 0.6)
    tabBarDivider.lineBetween(
      -PANEL_WIDTH / 2 + 8,
      -PANEL_HEIGHT / 2 + TAB_BAR_HEIGHT,
      PANEL_WIDTH / 2 - 8,
      -PANEL_HEIGHT / 2 + TAB_BAR_HEIGHT
    )

    const hint = scene.add
      .text(0, PANEL_HEIGHT / 2 - 12, 'C / Esc: đóng bảng', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#a08860'
      })
      .setOrigin(0.5)

    this.contentContainer = scene.add.container(0, 0)

    this.container = scene.add
      .container(scene.scale.width / 2, scene.scale.height / 2, [
        background,
        ...tabObjects,
        tabBarDivider,
        hint,
        this.contentContainer
      ])
      .setScrollFactor(0)
      .setDepth(PANEL_DEPTH)
      .setVisible(false)
  }

  get isOpen(): boolean {
    return this.opened
  }

  open(tab?: TabKey): void {
    this.opened = true
    if (tab) this.activeTab = tab
    this.container.setVisible(true)
    this.renderActiveTab()
  }

  close(): void {
    this.opened = false
    this.container.setVisible(false)
  }

  toggle(): void {
    if (this.opened) this.close()
    else this.open()
  }

  /** Scene gọi từ 1 listener `pointerdown` chung — trả `true` nếu bảng đang mở và đã xử lý click này (kể cả
   * click ra ngoài để đóng), để scene biết KHÔNG xử lý click đó cho việc gì khác (đúng pattern đã dùng cho
   * seed menu/túi đồ cũ ở `GameScene.ts`). */
  handlePointerDown(pointer: Phaser.Input.Pointer): boolean {
    if (!this.opened) return false
    if (!this.isPointerInside(pointer)) {
      this.close()
      return true
    }
    const localX = pointer.x - this.container.x
    const localY = pointer.y - this.container.y
    for (const region of [...this.tabClickRegions, ...this.contentClickRegions]) {
      if (
        localX >= region.x - region.width / 2 &&
        localX <= region.x + region.width / 2 &&
        localY >= region.y - region.height / 2 &&
        localY <= region.y + region.height / 2
      ) {
        region.onClick()
        break
      }
    }
    return true
  }

  private isPointerInside(pointer: Phaser.Input.Pointer): boolean {
    const dx = Math.abs(pointer.x - this.container.x)
    const dy = Math.abs(pointer.y - this.container.y)
    return dx <= PANEL_WIDTH / 2 && dy <= PANEL_HEIGHT / 2
  }

  private selectTab(tab: TabKey): void {
    this.activeTab = tab
    this.renderActiveTab()
  }

  private renderActiveTab(): void {
    this.contentContainer.removeAll(true)
    this.contentClickRegions = []
    for (const [key, text] of this.tabTexts) {
      text.setColor(key === this.activeTab ? '#ffd963' : '#cccccc')
    }
    switch (this.activeTab) {
      case 'inventory':
        this.renderInventoryTab()
        break
      case 'potential':
        this.renderPotentialTab()
        break
      case 'skills':
        this.renderSkillsTab()
        break
      case 'info':
        this.renderInfoTab()
        break
      case 'equipment':
        this.renderEquipmentTab()
        break
    }
  }

  /** Hành trang — lưới chỉ để XEM (không click), dùng lại đúng texture `crop_<id>_item` đã load nếu có, nếu
   * không (vd vật phẩm rớt từ quái `monster_core`/`rabbit_fur` — chưa có icon riêng nào được load, xem
   * `PreloadScene.ts`) thì hiện icon placeholder xám thay vì để trống/vỡ hình. */
  private renderInventoryTab(): void {
    const columns = 8
    const slotSize = 40
    const gap = 6
    const slots = inventoryManager.getSlots()
    const gridWidth = columns * slotSize + (columns - 1) * gap
    const startX = -gridWidth / 2 + slotSize / 2
    const startY = CONTENT_TOP + slotSize / 2

    const objects: Phaser.GameObjects.GameObject[] = []
    slots.forEach((slot, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)
      const x = startX + col * (slotSize + gap)
      const y = startY + row * (slotSize + gap)
      objects.push(
        this.scene.add
          .rectangle(x, y, slotSize, slotSize, 0x1a1006, 0.7)
          .setStrokeStyle(1, 0xd9b15c, 0.5)
      )
      const iconKey = this.resolveItemIconTexture(slot.itemId)
      objects.push(
        this.scene.add.image(x, y, iconKey).setDisplaySize(slotSize * 0.72, slotSize * 0.72)
      )
      objects.push(
        this.scene.add
          .text(x + slotSize / 2 - 3, y + slotSize / 2 - 3, String(slot.quantity), {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#ffffff'
          })
          .setOrigin(1, 1)
      )
    })
    if (slots.length === 0) {
      objects.push(
        this.scene.add
          .text(0, CONTENT_TOP + 40, 'Túi đồ trống', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#a08860'
          })
          .setOrigin(0.5)
      )
    }
    this.contentContainer.add(objects)
  }

  private resolveItemIconTexture(itemId: string): string {
    const cropKey = `crop_${itemId}_item`
    return this.scene.textures.exists(cropKey) ? cropKey : PLACEHOLDER_ICON_TEXTURE
  }

  /** Tiềm năng — 1 dòng/chỉ số, nút `[+]` bên phải để phân bổ (chi phí 1 hoặc 10 điểm tuỳ chỉ số, xem
   * `POTENTIAL_ALLOCATIONS` trong `CombatManager.ts`). Nút vẫn hiện nhưng MỜ đi (không đăng ký click) khi
   * không đủ điểm — người chơi biết cần bao nhiêu điểm mà không cần đoán, thay vì ẩn hẳn nút. */
  private renderPotentialTab(): void {
    const stats = combatManager.getStats()
    const objects: Phaser.GameObjects.GameObject[] = []
    objects.push(
      this.scene.add
        .text(0, CONTENT_TOP, `Điểm tiềm năng chưa dùng: ${stats.free_points}`, {
          fontSize: '14px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#ffd963'
        })
        .setOrigin(0.5)
    )

    const rowHeight = 34
    const startY = CONTENT_TOP + 34
    const labelX = -PANEL_WIDTH / 2 + 30
    const valueX = 40
    const buttonX = PANEL_WIDTH / 2 - 70

    POTENTIAL_ROWS.forEach((row, index) => {
      const y = startY + index * rowHeight
      const cost = COMBAT_MANAGER_ALLOCATION_COST(row.stat)
      const canAfford = stats.free_points >= cost

      objects.push(
        this.scene.add.text(labelX, y, row.label, {
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#e8d9b5'
        })
      )
      objects.push(
        this.scene.add
          .text(labelX + valueX + 130, y, String(row.getTotal()), {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#ffffff'
          })
          .setOrigin(1, 0)
      )
      const buttonText = this.scene.add
        .text(buttonX, y, `[ +1 · ${cost}đ ]`, {
          fontSize: '12px',
          fontFamily: 'monospace',
          color: canAfford ? '#8be07a' : '#665a4a'
        })
        .setOrigin(0, 0)
      objects.push(buttonText)
      if (canAfford) {
        this.contentClickRegions.push({
          x: buttonX + buttonText.width / 2,
          y: y + buttonText.height / 2,
          width: buttonText.width + 10,
          height: rowHeight,
          onClick: () => {
            combatManager.allocatePoint(row.stat)
            this.renderActiveTab()
          }
        })
      }
    })
    this.contentContainer.add(objects)
  }

  /** Kỹ năng — chỉ liệt kê, không tương tác (chọn/gán chiêu vào ô hotbar vẫn dùng phím 1-5 ở `SkillHotbar`,
   * xem giải thích lý do 2 hệ tách biệt ở đầu file). Lọc theo đúng hệ vũ khí đang cầm, giống
   * `getHotbarSkills()`. */
  private renderSkillsTab(): void {
    const stats = combatManager.getStats()
    const skillClass = combatManager.getWeaponSkillClass()
    const skills = GameData.skills
      .filter((s) => s.class === skillClass)
      .sort((a, b) => a.skill_index - b.skill_index)

    const objects: Phaser.GameObjects.GameObject[] = []
    const rowHeight = 40
    skills.forEach((skill, index) => {
      const y = CONTENT_TOP + index * rowHeight
      const unlocked = stats.level >= skill.unlock_level
      const color = unlocked ? '#ffffff' : '#7a6a55'
      objects.push(
        this.scene.add.text(-PANEL_WIDTH / 2 + 30, y, skill.name, {
          fontSize: '14px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color
        })
      )
      const detail = unlocked
        ? `MP: ${skill.mp_cost} · CD: ${skill.cooldown}s · Dame ×${skill.damage_multiplier}`
        : `Yêu cầu cấp ${skill.unlock_level}`
      objects.push(
        this.scene.add.text(-PANEL_WIDTH / 2 + 30, y + 18, detail, {
          fontSize: '11px',
          fontFamily: 'monospace',
          color: unlocked ? '#a08860' : '#5a5040'
        })
      )
    })
    if (skills.length === 0) {
      objects.push(
        this.scene.add
          .text(0, CONTENT_TOP + 40, 'Chưa có chiêu nào cho hệ vũ khí này', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#a08860'
          })
          .setOrigin(0.5)
      )
    }
    this.contentContainer.add(objects)
  }

  /** Thông tin — bảng chỉ số tổng hợp (gốc + bonus trang bị/vũ khí, đúng `getTotal*()` của `CombatManager`),
   * khác tab Tiềm năng ở chỗ CHỈ XEM, không có nút phân bổ (dù hiện cùng vài chỉ số). */
  private renderInfoTab(): void {
    const stats = combatManager.getStats()
    const weapon = GameData.weapons.find((w) => w.id === stats.weapon_id)
    const rows: Array<[string, string]> = [
      ['Cấp độ', `${stats.level}`],
      ['EXP', `${stats.exp} / ${stats.exp_to_next}`],
      ['Đồng', `${stats.gold.toLocaleString('vi-VN')}`],
      ['HP', `${stats.hp} / ${combatManager.getTotalMaxHp()}`],
      ['MP', `${stats.mp} / ${combatManager.getTotalMaxMp()}`],
      ['Tấn công (ATK)', `${combatManager.getTotalAtk()}`],
      ['Phòng thủ (DEF)', `${combatManager.getTotalDef()}`],
      ['Chí mạng', `${combatManager.getTotalCrit()}%`],
      ['Tốc độ đánh', `${Math.round(combatManager.getTotalAttackSpeed() * 100)}%`],
      ['Tốc độ di chuyển', `${combatManager.getTotalMoveSpeed()}`],
      ['May mắn', `${combatManager.getTotalLuck()}`],
      ['Vũ khí đang cầm', weapon?.name ?? stats.weapon_id]
    ]

    const objects: Phaser.GameObjects.GameObject[] = []
    const rowHeight = 30
    rows.forEach(([label, value], index) => {
      const y = CONTENT_TOP + index * rowHeight
      objects.push(
        this.scene.add.text(-PANEL_WIDTH / 2 + 30, y, label, {
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#e8d9b5'
        })
      )
      objects.push(
        this.scene.add
          .text(PANEL_WIDTH / 2 - 30, y, value, {
            fontSize: '13px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#ffffff'
          })
          .setOrigin(1, 0)
      )
    })
    this.contentContainer.add(objects)
  }

  /** Trang bị — cột trái 7 ô slot (Vũ khí + 6 slot giáp), click 1 ô XOAY VÒNG qua toàn bộ item hợp lệ (kể cả
   * "gỡ ra" với slot giáp) — xem giải thích lý do không làm picker list riêng ở docstring class. Cột phải hiện
   * tổng hợp toàn bộ bonus đang có từ trang bị đang mặc, để thấy rõ tác dụng ngay sau khi đổi. */
  private renderEquipmentTab(): void {
    const stats = combatManager.getStats()
    const weapon = GameData.weapons.find((w) => w.id === stats.weapon_id)
    const objects: Phaser.GameObjects.GameObject[] = []

    const slotBoxWidth = 240
    const slotBoxHeight = 44
    const slotGap = 6
    const slotX = -PANEL_WIDTH / 2 + 30 + slotBoxWidth / 2
    let y = CONTENT_TOP + slotBoxHeight / 2 - 6

    const drawSlotBox = (label: string, itemName: string, onClick: () => void): void => {
      objects.push(
        this.scene.add
          .rectangle(slotX, y, slotBoxWidth, slotBoxHeight, 0x1a1006, 0.7)
          .setStrokeStyle(1, 0xd9b15c, 0.6)
      )
      objects.push(
        this.scene.add.text(slotX - slotBoxWidth / 2 + 10, y - 12, label, {
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#a08860'
        })
      )
      objects.push(
        this.scene.add.text(slotX - slotBoxWidth / 2 + 10, y + 3, itemName, {
          fontSize: '13px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#ffffff'
        })
      )
      this.contentClickRegions.push({
        x: slotX,
        y,
        width: slotBoxWidth,
        height: slotBoxHeight,
        onClick
      })
      y += slotBoxHeight + slotGap
    }

    drawSlotBox('Vũ khí', weapon?.name ?? stats.weapon_id, () => {
      this.cycleWeapon()
      this.renderActiveTab()
    })
    for (const slot of ARMOR_SLOTS) {
      const equippedId = stats.equipped_armor[slot]
      const equipped = equippedId ? GameData.armor.find((a) => a.id === equippedId) : null
      drawSlotBox(ARMOR_SLOT_LABELS[slot], equipped?.name ?? '(trống)', () => {
        this.cycleArmorSlot(slot)
        this.renderActiveTab()
      })
    }

    // Cột phải — tổng hợp bonus đang có từ trang bị đang mặc.
    const summaryX = 40
    let summaryY = CONTENT_TOP
    objects.push(
      this.scene.add.text(summaryX, summaryY, 'Tổng cộng từ trang bị đang mặc:', {
        fontSize: '13px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffd963'
      })
    )
    summaryY += 26
    const summaryLines = [
      `ATK: +${combatManager.getTotalAtk() - stats.atk}`,
      `DEF: +${combatManager.getTotalDef() - stats.def}`,
      `HP tối đa: +${combatManager.getTotalMaxHp() - stats.max_hp}`,
      `MP tối đa: +${combatManager.getTotalMaxMp() - stats.max_mp}`,
      `Tốc độ di chuyển: +${combatManager.getTotalMoveSpeed() - stats.move_speed}`,
      `Chí mạng: +${(combatManager.getTotalCrit() - stats.crit).toFixed(1)}%`,
      `May mắn: +${combatManager.getTotalLuck() - stats.luck}`
    ]
    for (const line of summaryLines) {
      objects.push(
        this.scene.add.text(summaryX, summaryY, line, {
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#e8d9b5'
        })
      )
      summaryY += 20
    }

    this.contentContainer.add(objects)
  }

  private cycleWeapon(): void {
    const ids = GameData.weapons.map((w) => w.id)
    if (ids.length === 0) return
    const current = combatManager.getStats().weapon_id
    const next = ids[(ids.indexOf(current) + 1) % ids.length]
    combatManager.equipWeapon(next)
  }

  private cycleArmorSlot(slot: ArmorSlot): void {
    const candidates: Array<string | null> = [
      null,
      ...GameData.armor.filter((a) => a.slot === slot).map((a) => a.id)
    ]
    const current = combatManager.getStats().equipped_armor[slot]
    const next = candidates[(candidates.indexOf(current) + 1) % candidates.length]
    combatManager.equipArmor(slot, next)
  }

  /** Icon xám đơn giản cho item chưa có texture riêng (vd vật phẩm rớt từ quái) — chỉ 1 ô vuông bo góc, đủ
   * phân biệt "có item nhưng chưa vẽ icon" với "ô trống hẳn". */
  private createPlaceholderIconTexture(): void {
    if (this.scene.textures.exists(PLACEHOLDER_ICON_TEXTURE)) return
    const size = 28
    const canvasTexture = this.scene.textures.createCanvas(PLACEHOLDER_ICON_TEXTURE, size, size)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    ctx.fillStyle = '#5a5040'
    ctx.fillRect(2, 2, size - 4, size - 4)
    ctx.strokeStyle = '#a08860'
    ctx.lineWidth = 1.5
    ctx.strokeRect(2, 2, size - 4, size - 4)
    canvasTexture.refresh()
  }
}

/** Chi phí (điểm) của 1 lượt phân bổ — chỉ để hiện số trong nút `[+1 · Nđ]`, không lặp lại toàn bộ bảng
 * `POTENTIAL_ALLOCATIONS` (private trong `CombatManager.ts`) ở đây. HP/MP/ATK/DEF/MoveSpeed = 1 điểm,
 * Crit/AttackSpeed/Luck = 10 điểm — khớp đúng `docs/planning/progression.md`. */
function COMBAT_MANAGER_ALLOCATION_COST(stat: PotentialStat): number {
  return stat === 'crit' || stat === 'attack_speed' || stat === 'luck' ? 10 : 1
}

/** Bind phím C (mở/đóng bảng, mặc định tab Hành trang) — dùng chung cho cả 3 scene. `event.repeat` guard theo
 * đúng convention mọi phím tắt dạng bấm-1-lần trong dự án (xem giải thích ở `GameScene.ts`). */
export function bindCharacterPanelInput(scene: Phaser.Scene, panel: CharacterPanel): void {
  scene.input.keyboard!.on('keydown-C', (event: KeyboardEvent) => {
    if (event.repeat) return
    event.preventDefault()
    panel.toggle()
  })
}
