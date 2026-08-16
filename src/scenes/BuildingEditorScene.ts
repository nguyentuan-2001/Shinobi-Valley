import Phaser from 'phaser'
import { renderStaticWorldDecorations } from '../systems/WorldDecorations'
import { Player } from '../entities/Player'
import { HOUSE_LEVEL_NIGHT_TEXTURES, type HouseLevel } from '../data/housePlacement'
import {
  FARM_BUILDING_PLACEMENTS as FARM_BUILDING_PLACEMENTS_DAY,
  type FarmBuildingPlacement
} from '../data/mapPlacements/day'
import { FARM_BUILDING_PLACEMENTS as FARM_BUILDING_PLACEMENTS_NIGHT } from '../data/mapPlacements/night'

const BACKGROUND_KEY = 'farm_background'
const BACKGROUND_NIGHT_KEY = 'farm_background_night'
/** Spawn trùng với `EditorScene` cho quen. */
const PLAYER_SPAWN = { x: 890, y: 430 }

type EditorMode = 'day' | 'night'

interface EditablePosition {
  x: number
  y: number
}

interface EditableBuilding {
  /** id thật trong `FARM_BUILDING_PLACEMENTS` (`mapPlacements/day.ts`) — 'nha_chinh'/'gieng_nuoc' sống chung
   * mảng với 6 công trình mới, không còn tách riêng. */
  id: string
  width: number
  height: number
  canvasSize: number
  /** Chỉ Nhà chính (`id: 'nha_chinh'`) mới có — quyết định texture qua `HOUSE_LEVEL_NIGHT_TEXTURES`. */
  level?: HouseLevel
  /** Vị trí ngày/đêm TÁCH RIÊNG (user yêu cầu, xem `mapPlacements/day.ts`) — kéo ở chế độ nào chỉ đổi đúng vị
   * trí của chế độ đó, không đụng tới vị trí còn lại. */
  day: EditablePosition
  night: EditablePosition
  image: Phaser.GameObjects.Image
  label: Phaser.GameObjects.Text
}

/** Công cụ kéo-thả đặt vị trí công trình nông trại — mở bằng phím P từ GameScene, tương tự cách `EditorScene`
 * (phím Q) chỉnh vùng va chạm. KHÔNG chỉnh kích thước/collision (đó là việc của `EditorScene`) — chỉ kéo đổi
 * `x`/`y` của 8 công trình (Nhà chính, Giếng nước, 6 công trình mới), width/height/canvasSize giữ nguyên vì đó
 * là kích thước THẬT theo ảnh gốc (xem `mapPlacements/day.ts`), không phải thứ nên chỉnh tay ở đây.
 *
 * **Chế độ ngày/đêm (phím N)** — `BaseMap.png`/`BaseMap_night.png` là 2 ảnh khác nhau (không phải cùng 1 ảnh
 * chỉnh tối đi), nên vị trí đặt đẹp ở bản ngày chưa chắc đã khớp ở bản đêm. Bấm N để đổi cả nền LẪN texture
 * từng công trình sang bản đêm, đồng thời chuyển sang kéo/hiện đúng toạ độ ĐÊM (tách biệt hoàn toàn khỏi toạ độ
 * ngày) — canh xong bản này thì bấm N lại để quay về canh bản kia.
 * - Kéo 1 công trình để di chuyển (dùng thẳng `setInteractive({ draggable: true })` của Phaser — khác
 *   `EditorScene` phải tự hit-test thủ công vì đó là UI `scrollFactor(0)`, ở đây toàn bộ là world object nên
 *   drag gốc của Phaser hoạt động bình thường, không cần tự làm lại).
 * - Mũi tên: đi lại để so sánh tỉ lệ với người chơi (camera tự theo, giống `EditorScene`).
 * - E: xuất TOÀN BỘ toạ độ (cả ngày lẫn đêm, không chỉ chế độ đang xem) ra 1 ô text. P: quay lại GameScene. */
export class BuildingEditorScene extends Phaser.Scene {
  private buildings: EditableBuilding[] = []
  private mode: EditorMode = 'day'
  private background!: Phaser.GameObjects.Image
  private modeText!: Phaser.GameObjects.Text
  private player!: Player
  private exportBox: HTMLTextAreaElement | null = null
  private isPanningCamera = false
  private panStart = { x: 0, y: 0 }
  private panStartScroll = { x: 0, y: 0 }

  constructor() {
    super({ key: 'BuildingEditorScene' })
  }

  create() {
    this.background = this.add.image(0, 0, BACKGROUND_KEY).setOrigin(0, 0)
    this.cameras.main.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight)
    this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight)

    // skipHouse: true — nhà chính vẽ riêng bên dưới thành 1 EditableBuilding kéo được, tránh vẽ tĩnh chồng lên.
    renderStaticWorldDecorations(this, { skipHouse: true })

    this.player = new Player(this, PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'women')
    this.cameras.main.startFollow(this.player, true)

    // Tất cả 8 công trình (Nhà chính, Giếng nước, 6 công trình mới) giờ sống chung 1 mảng — 1 vòng lặp duy nhất.
    for (const day of FARM_BUILDING_PLACEMENTS_DAY) {
      const night = FARM_BUILDING_PLACEMENTS_NIGHT.find((n) => n.id === day.id) ?? day
      this.createBuilding(day, night)
    }

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      const building = this.buildings.find((b) => b.image === gameObject)
      if (!building) return
      // Tâm ảnh LUÔN đi thẳng theo vị trí con trỏ hiện tại (không dùng `dragX`/`dragY` mặc định của Phaser —
      // 2 giá trị đó giữ nguyên offset lúc bấm xuống so với tâm ảnh, tiện cho kéo tự nhiên nhưng khó biết
      // chính xác toạ độ đang đặt). Ở đây ưu tiên canh toạ độ chính xác hơn là cảm giác kéo tự nhiên.
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      gameObject.setPosition(world.x, world.y)
      const pos = this.mode === 'day' ? building.day : building.night
      pos.x = world.x
      pos.y = world.y
      building.label.setPosition(world.x, world.y - building.height / 2 - 12)
    })

    this.input.on('wheel', (_p: unknown, _go: unknown, _dx: number, dy: number) => {
      const cam = this.cameras.main
      cam.setZoom(Phaser.Math.Clamp(cam.zoom - dy * 0.001, 0.3, 3))
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.middleButtonDown()) return
      this.cameras.main.stopFollow()
      this.isPanningCamera = true
      this.panStart = { x: pointer.x, y: pointer.y }
      this.panStartScroll = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY }
    })
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPanningCamera) return
      const cam = this.cameras.main
      cam.setScroll(
        this.panStartScroll.x - (pointer.x - this.panStart.x) / cam.zoom,
        this.panStartScroll.y - (pointer.y - this.panStart.y) / cam.zoom
      )
    })
    this.input.on('pointerup', () => {
      this.isPanningCamera = false
    })

    const bindKey = (key: string, handler: () => void) => {
      this.input.keyboard!.on(`keydown-${key}`, (event: KeyboardEvent) => {
        event.preventDefault()
        handler()
      })
    }
    bindKey('E', () => this.showExport())
    bindKey('ESC', () => this.closeExport())
    bindKey('N', () => this.toggleMode())
    bindKey('P', () => {
      this.closeExport()
      this.scene.stop()
      this.scene.start('GameScene')
    })
    for (const key of ['LEFT', 'RIGHT', 'UP', 'DOWN']) {
      bindKey(key, () => this.cameras.main.startFollow(this.player, true))
    }

    this.add
      .text(
        8,
        8,
        'Kéo 1 công trình để di chuyển | Mũi tên: đi lại so tỉ lệ (camera tự theo)\n' +
          'Kéo chuột GIỮA: pan bản đồ tự do | Lăn chuột: zoom | N: đổi ngày/đêm | E: xuất toạ độ | P: quay lại',
        {
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 6, y: 4 }
        }
      )
      .setScrollFactor(0)
      .setDepth(2000)

    this.modeText = this.add
      .text(0, 0, '', { fontSize: '16px', color: '#ffe9a8', backgroundColor: '#000000aa' })
      .setScrollFactor(0)
      .setDepth(2000)
    this.updateModeText()
  }

  update() {
    this.player.update()
  }

  /** Texture bright của 1 công trình — Nhà chính (`level` có giá trị) dùng key khác cho cấp 2/3
   * (`player_house_2/3`, không theo pattern `building_<id>_bright`), còn lại (kể cả Giếng nước) đều theo đúng
   * pattern chung. Cấp 2/3 chưa từng render thật (luôn ở cấp 1, xem `housePlacement.ts`) nhưng vẫn xử lý cho
   * đủ, phòng khi cấp nhà đổi. */
  private brightTexture(id: string, level?: HouseLevel): string {
    if (id === 'nha_chinh' && (level ?? 1) !== 1) {
      return level === 2 ? 'player_house_2' : 'player_house_3'
    }
    return `building_${id}_bright`
  }

  /** Texture đêm của 1 công trình — chỉ Nhà chính có thể KHÔNG có bản đêm thật (cấp 2/3, xem
   * `HOUSE_LEVEL_NIGHT_TEXTURES` ở `housePlacement.ts`), fallback về bản ngày khi đó. */
  private nightTexture(id: string, level?: HouseLevel): string {
    if (id === 'nha_chinh')
      return HOUSE_LEVEL_NIGHT_TEXTURES[level ?? 1] ?? this.brightTexture(id, level)
    return `building_${id}_night`
  }

  private createBuilding(day: FarmBuildingPlacement, night: FarmBuildingPlacement) {
    const start = this.mode === 'day' ? day : night
    const texture =
      this.mode === 'day'
        ? this.brightTexture(day.id, day.level)
        : this.nightTexture(day.id, day.level)
    const image = this.add
      .image(start.x, start.y, texture)
      .setDisplaySize(day.canvasSize, day.canvasSize)
      .setDepth(start.y)
      .setInteractive({ draggable: true, useHandCursor: true })
    this.input.setDraggable(image)
    const label = this.add
      .text(start.x, start.y - day.height / 2 - 12, day.id, {
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 3, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(100_000)
    this.buildings.push({
      id: day.id,
      width: day.width,
      height: day.height,
      canvasSize: day.canvasSize,
      level: day.level,
      day: { x: day.x, y: day.y },
      night: { x: night.x, y: night.y },
      image,
      label
    })
  }

  /** Đổi nền + texture/vị trí từng công trình sang bản ngày hoặc đêm — xem giải thích ở JSDoc đầu class. */
  private toggleMode() {
    this.mode = this.mode === 'day' ? 'night' : 'day'
    this.background.setTexture(this.mode === 'day' ? BACKGROUND_KEY : BACKGROUND_NIGHT_KEY)
    for (const b of this.buildings) {
      const pos = this.mode === 'day' ? b.day : b.night
      const texture =
        this.mode === 'day' ? this.brightTexture(b.id, b.level) : this.nightTexture(b.id, b.level)
      b.image.setTexture(texture).setPosition(pos.x, pos.y).setDepth(pos.y)
      b.label.setPosition(pos.x, pos.y - b.height / 2 - 12)
    }
    this.updateModeText()
  }

  private updateModeText() {
    this.modeText.setText(
      this.mode === 'day'
        ? '☀ ĐANG XEM/CHỈNH BẢN NGÀY (N để đổi)'
        : '🌙 ĐANG XEM/CHỈNH BẢN ĐÊM (N để đổi)'
    )
    this.modeText.setPosition(this.scale.width / 2 - this.modeText.width / 2, 40)
  }

  /** In toạ độ hiện tại (cả ngày lẫn đêm, làm tròn số nguyên) thành code TS, hiện trong 1 <textarea> đè lên
   * canvas để copy dán lại vào `mapPlacements/day.ts`/`mapPlacements/night.ts` (dán đè `FARM_BUILDING_PLACEMENTS`)
   * — không dùng clipboard API vì cần quyền trình duyệt riêng, giống cách `EditorScene.showExport()` đã làm. */
  private showExport() {
    if (this.exportBox) return

    const arrayBlock = (mode: EditorMode) => {
      const source = mode === 'day' ? FARM_BUILDING_PLACEMENTS_DAY : FARM_BUILDING_PLACEMENTS_NIGHT
      const blocks = this.buildings.map((b) => {
        const original = source.find((f) => f.id === b.id)!
        const pos = mode === 'day' ? b.day : b.night
        const x = Math.round(pos.x)
        const y = Math.round(pos.y)
        const levelLine = original.level !== undefined ? `\n    level: ${original.level},` : ''
        return (
          `  {\n` +
          `    id: '${b.id}',\n` +
          `    x: ${x},\n` +
          `    y: ${y},\n` +
          `    width: ${original.width},\n` +
          `    height: ${original.height},\n` +
          `    bottomY: ${y} + ${original.height} / 2,\n` +
          `    canvasSize: ${original.canvasSize},${levelLine}\n` +
          `  }`
        )
      })
      return `export const FARM_BUILDING_PLACEMENTS: FarmBuildingPlacement[] = [\n${blocks.join(',\n')}\n]`
    }

    const code =
      `// --- mapPlacements/day.ts: dán đè FARM_BUILDING_PLACEMENTS ---\n${arrayBlock('day')}\n\n` +
      `// --- mapPlacements/night.ts: dán đè FARM_BUILDING_PLACEMENTS ---\n${arrayBlock('night')}`

    const textarea = document.createElement('textarea')
    textarea.value = code
    textarea.style.position = 'fixed'
    textarea.style.top = '50%'
    textarea.style.left = '50%'
    textarea.style.transform = 'translate(-50%, -50%)'
    textarea.style.width = '640px'
    textarea.style.height = '440px'
    textarea.style.zIndex = '9999'
    textarea.style.fontFamily = 'monospace'
    textarea.style.fontSize = '12px'
    textarea.style.padding = '8px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    this.exportBox = textarea
  }

  private closeExport() {
    if (!this.exportBox) return
    this.exportBox.remove()
    this.exportBox = null
  }

  shutdown() {
    this.closeExport()
  }
}
