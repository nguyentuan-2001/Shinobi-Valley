import Phaser from 'phaser'
import type { ControlEntry } from '../data/controlsHelp'

/** Cao hơn `CharacterPanel` (2_000_000) một chút — nếu lỡ mở cùng lúc (không nên xảy ra, `UIScene` chặn nhau ở
 * `bindControlsHelpInput`) thì bảng phím tắt vẫn nổi lên trên, dễ đóng hơn là kẹt dưới. */
const PANEL_DEPTH = 2_000_001
const PANEL_WIDTH = 560
const PADDING_X = 16
const PADDING_Y = 16
const TITLE_HEIGHT = 28
const ROW_GAP = 6
const KEY_COLUMN_WIDTH = 150

/** Bảng liệt kê phím tắt, mở/đóng bằng phím Z (xem `bindControlsHelpInput`). Sống ở `UIScene` (không phải scene
 * gameplay) giống `CharacterPanel` — vì nội dung khác nhau tuỳ scene đang chạy (Farm/chiến đấu/Làng), danh sách
 * phím KHÔNG cố định trong class này mà đọc động qua registry `controlsHelpEntries` do từng scene gameplay tự
 * ghi vào trước khi `launch('UIScene')` (xem cách làm tương tự `selectedSeedName`/`gameTimeText` ở đó) — nhờ vậy
 * không phải tạo lại panel mỗi lần đổi scene, và luôn hiện đúng bộ phím của scene đang active. */
export class ControlsHelpPanel {
  private readonly scene: Phaser.Scene
  private container?: Phaser.GameObjects.Container
  private opened = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  get isOpen(): boolean {
    return this.opened
  }

  toggle(entries: ControlEntry[]): void {
    if (this.opened) this.close()
    else this.open(entries)
  }

  open(entries: ControlEntry[]): void {
    this.close()

    // 2 lượt: lượt 1 tạo text ở gốc (0,0) để đo `actionText.height` THẬT SAU KHI wordWrap (dòng mô tả dài như
    // của Enter/F/hotbar sẽ tự xuống dòng) — không thể biết chiều cao panel trước khi biết dòng nào bị wrap
    // xuống 2+ dòng. Lượt 2 mới định vị lại theo toạ độ tâm container khi đã biết tổng `height`. Nếu chỉ dùng
    // `index * LINE_HEIGHT` cố định (cách làm ban đầu), dòng mô tả dài bị wrap sẽ đè lên dòng kế tiếp — bug thật
    // gặp khi test bằng Puppeteer với mô tả phím Enter ở Farm (quá dài, chữ chồng lên dòng "← →").
    const actionWidth = PANEL_WIDTH - PADDING_X * 2 - KEY_COLUMN_WIDTH
    const keyTexts: Phaser.GameObjects.Text[] = []
    const actionTexts: Phaser.GameObjects.Text[] = []
    const rowOffsetsY: number[] = []
    let cursorY = 0
    for (const entry of entries) {
      rowOffsetsY.push(cursorY)
      const actionText = this.scene.add
        .text(0, 0, entry.action, {
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#e8e8e8',
          wordWrap: { width: actionWidth }
        })
        .setOrigin(0, 0)
      const keyText = this.scene.add
        .text(0, 0, entry.key, {
          fontSize: '12px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#8fe0ff'
        })
        .setOrigin(0, 0)
      keyTexts.push(keyText)
      actionTexts.push(actionText)
      cursorY += Math.max(actionText.height, keyText.height) + ROW_GAP
    }
    const contentHeight = cursorY - ROW_GAP
    const height = PADDING_Y * 2 + TITLE_HEIGHT + contentHeight

    const contentTop = -height / 2 + PADDING_Y + TITLE_HEIGHT
    entries.forEach((_entry, index) => {
      const y = contentTop + rowOffsetsY[index]
      keyTexts[index].setPosition(-PANEL_WIDTH / 2 + PADDING_X, y)
      actionTexts[index].setPosition(-PANEL_WIDTH / 2 + PADDING_X + KEY_COLUMN_WIDTH, y)
    })

    const background = this.scene.add.graphics()
    background.fillStyle(0x1a1410, 0.95)
    background.fillRoundedRect(-PANEL_WIDTH / 2, -height / 2, PANEL_WIDTH, height, 12)
    background.lineStyle(2, 0xd9b15c, 0.9)
    background.strokeRoundedRect(-PANEL_WIDTH / 2, -height / 2, PANEL_WIDTH, height, 12)

    const title = this.scene.add
      .text(0, -height / 2 + PADDING_Y, 'Phím tắt', {
        fontSize: '15px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffd963'
      })
      .setOrigin(0.5, 0)

    const hint = this.scene.add
      .text(0, height / 2 - 12, 'Z / Esc: đóng bảng', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#a08860'
      })
      .setOrigin(0.5)

    this.container = this.scene.add
      .container(this.scene.scale.width / 2, this.scene.scale.height / 2, [
        background,
        title,
        ...keyTexts,
        ...actionTexts,
        hint
      ])
      .setScrollFactor(0)
      .setDepth(PANEL_DEPTH)
    this.opened = true
  }

  close(): void {
    this.container?.destroy()
    this.container = undefined
    this.opened = false
  }
}

/** Z toggle bảng — `getEntries()` gọi LẠI mỗi lần bấm (không snapshot lúc bind) để luôn đọc đúng registry hiện
 * tại, phòng trường hợp scene gameplay đổi registry giữa chừng (vd. rời Farm sang Làng) mà chưa bấm Z lần nào
 * để refresh. */
export function bindControlsHelpInput(
  scene: Phaser.Scene,
  panel: ControlsHelpPanel,
  getEntries: () => ControlEntry[]
): void {
  scene.input.keyboard!.on('keydown-Z', (event: KeyboardEvent) => {
    if (event.repeat) return
    event.preventDefault()
    panel.toggle(getEntries())
  })
}
