import Phaser from 'phaser'
import { FARM_COLLISION_ZONES, type CollisionZone, type Point } from '../data/collisionZones'
import { renderStaticWorldDecorations } from '../systems/WorldDecorations'
import { resolvePolygonCollision } from '../systems/CollisionUtils'
import { Player } from '../entities/Player'

const BACKGROUND_KEY = 'farm_background'
const HANDLE_SIZE = 12
const MID_HANDLE_SIZE = 9
const MIN_ZONE_SIZE = 8
/** Spawn trùng với `GameScene` cho quen — không quan trọng vì camera sẽ theo chân player ngay khi di chuyển. */
const PLAYER_SPAWN = { x: 890, y: 430 }

interface EditableZone {
  data: CollisionZone
  graphics: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  vertexHandles: Phaser.GameObjects.Rectangle[]
  midHandles: Phaser.GameObjects.Rectangle[]
}

type ActiveDrag =
  | { kind: 'vertex'; zone: EditableZone; index: number }
  | { kind: 'body'; zone: EditableZone; startPointer: Point; startPoints: Point[] }
  | { kind: 'draw'; start: Point }

/** Công cụ chỉnh tay vùng va chạm — mở bằng phím Q từ GameScene. Mỗi vùng là 1 đa giác tuỳ ý (>=3 điểm),
 * không giới hạn hình chữ nhật:
 * - Click 1 khối để chọn (hiện handle góc vàng + handle giữa cạnh cam).
 * - Kéo thân khối đã chọn để di chuyển cả khối; kéo 1 handle góc để di chuyển riêng điểm đó.
 * - Kéo 1 handle cam ở giữa cạnh để CHÈN điểm mới ngay tại đó — biến cạnh thẳng thành 2 đoạn, tạo hình dạng bất kỳ.
 * - Phải-chuột 1 handle góc để xoá riêng điểm đó ngay lập tức (giữ tối thiểu 3 điểm).
 * - Click trái 1 handle góc để CHỌN riêng điểm đó (viền đỏ) rồi bấm Delete/Backspace để xoá — cách thứ 2 làm
 *   y hệt phải-chuột, tiện cho chuột không có nút phải/touchpad.
 * - Kéo trên vùng trống để vẽ khối mới (bắt đầu là hình chữ nhật 4 điểm, thêm điểm sau bằng handle cam).
 * - Delete/Backspace: xoá điểm đang chọn (nếu có) — nếu không có điểm nào đang chọn thì xoá cả khối đang chọn.
 * - Mũi tên: di chuyển nhân vật để TEST va chạm ngay với các vùng đang chỉnh (kể cả chưa export) — camera tự
 *   theo chân nhân vật, bấm mũi tên bất kỳ lúc nào cũng kéo camera về lại theo chân ngay (kể cả sau khi vừa
 *   kéo bản đồ tự do). Lăn chuột: zoom. Kéo chuột GIỮA: kéo bản đồ tự do (tạm ngưng theo chân) để xem chỗ khác
 *   mà không cần đi bộ tới, thả ra là camera đứng yên tại đó tới khi bấm mũi tên lại.
 * - E: xuất toạ độ hiện tại ra 1 ô text (dán đè lại vào src/data/collisionZones.ts). Q: quay lại GameScene.
 * Có vẽ thêm ô đất/hàng rào/nhà (tĩnh, xem `systems/WorldDecorations.ts`) để có ngữ cảnh xung quanh khi canh
 * vùng chặn — trước đây chỉ có nền trơn, khó biết vùng chặn có khớp với địa hình/công trình thật hay không. */
export class EditorScene extends Phaser.Scene {
  private zones: EditableZone[] = []
  private selected: EditableZone | null = null
  /** Điểm (vertex) đang được chọn riêng trong `selected` — click trái 1 handle góc để chọn, Delete/Backspace
   * xoá đúng điểm này thay vì cả khối. `null` nghĩa là chưa chọn điểm nào (Delete/Backspace lúc đó xoá cả khối). */
  private selectedVertexIndex: number | null = null
  private drawPreview!: Phaser.GameObjects.Rectangle
  private activeDrag: ActiveDrag | null = null
  private exportBox: HTMLTextAreaElement | null = null
  private nextZoneId = 1
  private player!: Player
  /** Đang kéo chuột giữa để pan camera tự do (tạm ngưng `startFollow`) — xem `onPointerDown/Move/Up`. */
  private isPanningCamera = false
  private panStart = { x: 0, y: 0 }
  private panStartScroll = { x: 0, y: 0 }

  constructor() {
    super({ key: 'EditorScene' })
  }

  create() {
    const background = this.add.image(0, 0, BACKGROUND_KEY).setOrigin(0, 0)
    this.cameras.main.setBounds(0, 0, background.displayWidth, background.displayHeight)
    // Player cần world bounds đúng kích thước nền để không bị chặn cứng ở góc trên-trái (bug thật đã gặp ở
    // GameScene, xem progress.md) — Editor trước đây không có player nên chưa cần set, giờ thì cần.
    this.physics.world.setBounds(0, 0, background.displayWidth, background.displayHeight)

    renderStaticWorldDecorations(this)

    this.player = new Player(this, PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'women')
    this.cameras.main.startFollow(this.player, true)

    this.drawPreview = this.add
      .rectangle(0, 0, 1, 1, 0x00ff00, 0.25)
      .setStrokeStyle(2, 0x00ff00)
      .setVisible(false)
      .setDepth(1000)

    for (const data of FARM_COLLISION_ZONES) this.createZoneVisual(cloneZone(data))

    this.input.on('wheel', (_p: unknown, _go: unknown, _dx: number, dy: number) => {
      const cam = this.cameras.main
      cam.setZoom(Phaser.Math.Clamp(cam.zoom - dy * 0.001, 0.3, 3))
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onPointerDown(pointer))
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.onPointerMove(pointer))
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.onPointerUp(pointer))

    const bindKey = (key: string, handler: () => void) => {
      this.input.keyboard!.on(`keydown-${key}`, (event: KeyboardEvent) => {
        event.preventDefault()
        handler()
      })
    }
    bindKey('DELETE', () => this.deleteSelectedVertexOrZone())
    bindKey('BACKSPACE', () => this.deleteSelectedVertexOrZone())
    bindKey('E', () => this.showExport())
    bindKey('ESC', () => this.closeExport())
    bindKey('Q', () => {
      this.closeExport()
      this.scene.stop()
      this.scene.start('GameScene')
    })
    // Bấm mũi tên bất kỳ lúc nào cũng kéo camera về theo chân player ngay — kể cả sau khi vừa kéo chuột giữa
    // pan tự do (xem onPointerDown/Move/Up) làm camera dừng theo (`stopFollow`).
    for (const key of ['LEFT', 'RIGHT', 'UP', 'DOWN']) {
      bindKey(key, () => this.cameras.main.startFollow(this.player, true))
    }

    this.add
      .text(
        8,
        8,
        'Click chọn khối, kéo thân: di chuyển | kéo góc vàng: sửa điểm | kéo giữa cạnh (cam): thêm điểm mới\n' +
          'Click góc: chọn điểm (viền đỏ) | Phải-chuột góc: xoá điểm ngay | Delete: xoá điểm đang chọn, hoặc cả khối nếu chưa chọn điểm\n' +
          'Kéo vùng trống: vẽ khối mới | E: xuất | Q: quay lại\n' +
          'Mũi tên: đi lại để test va chạm (camera tự theo) | Kéo chuột GIỮA: pan bản đồ tự do | Lăn chuột: zoom',
        {
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 6, y: 4 }
        }
      )
      .setScrollFactor(0)
      .setDepth(2000)
  }

  update(_time: number, delta: number) {
    this.player.update()
    this.checkPolygonCollisions(delta)
  }

  /** Y hệt `GameScene.checkPolygonCollisions()` (dùng chung `resolvePolygonCollision`, xem
   * `systems/CollisionUtils.ts`) nhưng lấy polygon trực tiếp từ `this.zones` (dữ liệu đang chỉnh tay trong
   * Editor, có thể chưa export) thay vì từ `FARM_COLLISION_ZONES` tĩnh — để test va chạm được ngay khi vừa kéo
   * sửa 1 khối, không cần xuất/dán lại rồi quay về GameScene mới thấy hiệu quả. */
  private checkPolygonCollisions(delta: number) {
    const polygons = this.zones.map((zone) => new Phaser.Geom.Polygon(zone.data.points))
    resolvePolygonCollision(this.player, polygons, delta)
  }

  private worldPoint(pointer: Phaser.Input.Pointer): Point {
    const p = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    return { x: p.x, y: p.y }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (pointer.middleButtonDown()) {
      this.cameras.main.stopFollow()
      this.isPanningCamera = true
      this.panStart = { x: pointer.x, y: pointer.y }
      this.panStartScroll = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY }
      return
    }

    const world = this.worldPoint(pointer)

    if (this.selected) {
      const vertexIndex = this.hitVertexHandle(this.selected, world)
      if (vertexIndex !== null) {
        if (pointer.rightButtonDown()) {
          this.removeVertex(this.selected, vertexIndex)
          return
        }
        // Click trái: vừa CHỌN riêng điểm này (viền đỏ, Delete/Backspace sẽ xoá đúng điểm này) vừa cho kéo di
        // chuyển ngay — click thả ra không nhúc nhích thì coi như chỉ chọn, không đổi vị trí điểm.
        this.selectedVertexIndex = vertexIndex
        this.rebuildZoneHandles(this.selected)
        this.activeDrag = { kind: 'vertex', zone: this.selected, index: vertexIndex }
        return
      }
      const midIndex = this.hitMidHandle(this.selected, world)
      if (midIndex !== null && !pointer.rightButtonDown()) {
        // Chèn điểm mới ngay sau điểm midIndex (cạnh midIndex -> midIndex+1), rồi tiếp tục kéo chính điểm đó.
        this.selected.data.points.splice(midIndex + 1, 0, { x: world.x, y: world.y })
        this.selectedVertexIndex = midIndex + 1
        this.rebuildZoneHandles(this.selected)
        this.activeDrag = { kind: 'vertex', zone: this.selected, index: midIndex + 1 }
        return
      }
    }

    if (pointer.rightButtonDown()) return

    const hitZone = this.zones.find((z) =>
      Phaser.Geom.Polygon.Contains(new Phaser.Geom.Polygon(z.data.points), world.x, world.y)
    )
    if (hitZone) {
      this.select(hitZone)
      this.activeDrag = {
        kind: 'body',
        zone: hitZone,
        startPointer: world,
        startPoints: hitZone.data.points.map((p) => ({ ...p }))
      }
      return
    }

    this.select(null)
    this.activeDrag = { kind: 'draw', start: world }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (this.isPanningCamera) {
      const cam = this.cameras.main
      cam.setScroll(
        this.panStartScroll.x - (pointer.x - this.panStart.x) / cam.zoom,
        this.panStartScroll.y - (pointer.y - this.panStart.y) / cam.zoom
      )
      return
    }

    if (!this.activeDrag) return
    const world = this.worldPoint(pointer)

    if (this.activeDrag.kind === 'vertex') {
      const { zone, index } = this.activeDrag
      zone.data.points[index] = { x: world.x, y: world.y }
      this.redrawZone(zone)
      return
    }

    if (this.activeDrag.kind === 'body') {
      const { zone, startPointer, startPoints } = this.activeDrag
      const dx = world.x - startPointer.x
      const dy = world.y - startPointer.y
      zone.data.points = startPoints.map((p) => ({ x: p.x + dx, y: p.y + dy }))
      this.rebuildZoneHandles(zone)
      return
    }

    if (this.activeDrag.kind === 'draw') {
      const { start } = this.activeDrag
      const x = Math.min(start.x, world.x)
      const y = Math.min(start.y, world.y)
      const w = Math.abs(world.x - start.x)
      const h = Math.abs(world.y - start.y)
      this.drawPreview
        .setPosition(x + w / 2, y + h / 2)
        .setSize(w, h)
        .setVisible(true)
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (this.isPanningCamera) {
      this.isPanningCamera = false
      return
    }

    if (!this.activeDrag) return

    if (this.activeDrag.kind === 'draw') {
      const world = this.worldPoint(pointer)
      const { start } = this.activeDrag
      const x = Math.min(start.x, world.x)
      const y = Math.min(start.y, world.y)
      const w = Math.abs(world.x - start.x)
      const h = Math.abs(world.y - start.y)
      this.drawPreview.setVisible(false)
      if (w >= MIN_ZONE_SIZE && h >= MIN_ZONE_SIZE) {
        const zone = this.createZoneVisual({
          label: `Khu mới ${this.nextZoneId++}`,
          points: [
            { x, y },
            { x: x + w, y },
            { x: x + w, y: y + h },
            { x, y: y + h }
          ]
        })
        this.select(zone)
      }
    }

    this.activeDrag = null
  }

  private hitVertexHandle(zone: EditableZone, world: Point): number | null {
    for (let i = 0; i < zone.data.points.length; i++) {
      const p = zone.data.points[i]
      if (Math.abs(world.x - p.x) <= HANDLE_SIZE && Math.abs(world.y - p.y) <= HANDLE_SIZE) return i
    }
    return null
  }

  private hitMidHandle(zone: EditableZone, world: Point): number | null {
    const pts = zone.data.points
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2
      if (Math.abs(world.x - mx) <= MID_HANDLE_SIZE && Math.abs(world.y - my) <= MID_HANDLE_SIZE)
        return i
    }
    return null
  }

  private removeVertex(zone: EditableZone, index: number) {
    if (zone.data.points.length <= 3) return
    zone.data.points.splice(index, 1)
    // Điểm bị xoá không còn tồn tại nữa, chỉ số các điểm sau nó cũng lệch đi 1 — đơn giản nhất là bỏ chọn
    // hẳn thay vì cố gắng tính lại đúng chỉ số mới.
    this.selectedVertexIndex = null
    this.rebuildZoneHandles(zone)
  }

  private createZoneVisual(data: CollisionZone): EditableZone {
    const graphics = this.add.graphics().setDepth(500)
    const label = this.add
      .text(0, 0, data.label, { fontSize: '12px', color: '#ffffff', backgroundColor: '#000000aa' })
      .setDepth(1001)
    const zone: EditableZone = { data, graphics, label, vertexHandles: [], midHandles: [] }
    this.zones.push(zone)
    this.rebuildZoneHandles(zone)
    return zone
  }

  /** Xây lại toàn bộ handle (góc + giữa cạnh) từ đầu theo đúng số điểm hiện tại — gọi mỗi khi thêm/bớt/di
   * chuyển cả khối, vì số lượng điểm có thể đã đổi (thêm điểm mới qua handle giữa cạnh). */
  private rebuildZoneHandles(zone: EditableZone) {
    zone.vertexHandles.forEach((h) => h.destroy())
    zone.midHandles.forEach((h) => h.destroy())
    zone.vertexHandles = []
    zone.midHandles = []

    const showHandles = this.selected === zone
    for (let i = 0; i < zone.data.points.length; i++) {
      const p = zone.data.points[i]
      // Điểm đang được chọn riêng (chờ Delete/Backspace) tô đỏ + viền trắng dày hơn, phân biệt với các handle
      // vàng còn lại (chỉ chọn được KHỐI, chưa chọn điểm nào).
      const isSelectedVertex = showHandles && this.selectedVertexIndex === i
      const h = this.add
        .rectangle(p.x, p.y, HANDLE_SIZE, HANDLE_SIZE, isSelectedVertex ? 0xff3355 : 0xffff00, 0.9)
        .setStrokeStyle(isSelectedVertex ? 2 : 1, isSelectedVertex ? 0xffffff : 0x000000)
        .setDepth(1002)
        .setVisible(showHandles)
      zone.vertexHandles.push(h)
    }
    const pts = zone.data.points
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      const h = this.add
        .rectangle(
          (a.x + b.x) / 2,
          (a.y + b.y) / 2,
          MID_HANDLE_SIZE,
          MID_HANDLE_SIZE,
          0xff8800,
          0.9
        )
        .setStrokeStyle(1, 0x000000)
        .setDepth(1002)
        .setVisible(showHandles)
      zone.midHandles.push(h)
    }

    this.redrawZone(zone)
  }

  private redrawZone(zone: EditableZone) {
    const pts = zone.data.points
    const isSelected = this.selected === zone

    zone.graphics.clear()
    zone.graphics.fillStyle(0xff0000, 0.35)
    zone.graphics.lineStyle(isSelected ? 3 : 2, isSelected ? 0x00ffff : 0xff0000, 1)
    zone.graphics.beginPath()
    zone.graphics.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) zone.graphics.lineTo(pts[i].x, pts[i].y)
    zone.graphics.closePath()
    zone.graphics.fillPath()
    zone.graphics.strokePath()

    const minY = Math.min(...pts.map((p) => p.y))
    const minX = Math.min(...pts.map((p) => p.x))
    zone.label.setPosition(minX, minY - 16).setText(zone.data.label)

    zone.vertexHandles.forEach((h, i) => h.setPosition(pts[i].x, pts[i].y))
    zone.midHandles.forEach((h, i) => {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      h.setPosition((a.x + b.x) / 2, (a.y + b.y) / 2)
    })
  }

  private select(zone: EditableZone | null) {
    const previous = this.selected
    this.selected = zone
    // Đổi/bỏ chọn khối (vd bắt đầu kéo cả thân, hoặc bấm ra vùng trống) thì điểm đang chọn riêng không còn
    // ý nghĩa gì nữa (có thể thuộc khối khác hoặc khối cũ không còn được chọn).
    this.selectedVertexIndex = null
    if (previous) this.rebuildZoneHandles(previous)
    if (zone) this.rebuildZoneHandles(zone)
  }

  /** Delete/Backspace: ưu tiên xoá điểm đang chọn riêng (nếu có) trước, chỉ xoá cả khối khi chưa chọn điểm nào. */
  private deleteSelectedVertexOrZone() {
    if (this.selected && this.selectedVertexIndex !== null) {
      this.removeVertex(this.selected, this.selectedVertexIndex)
      return
    }
    this.deleteSelectedZone()
  }

  private deleteSelectedZone() {
    if (!this.selected) return
    const zone = this.selected
    zone.graphics.destroy()
    zone.label.destroy()
    zone.vertexHandles.forEach((h) => h.destroy())
    zone.midHandles.forEach((h) => h.destroy())
    this.zones = this.zones.filter((z) => z !== zone)
    this.selected = null
    this.selectedVertexIndex = null
  }

  /** In mảng toạ độ hiện tại (làm tròn số nguyên) thành code TS, hiện trong 1 <textarea> đè lên canvas để
   * copy dán thẳng vào src/data/collisionZones.ts — không dùng clipboard API vì cần quyền trình duyệt riêng. */
  private showExport() {
    if (this.exportBox) return
    const zoneBlocks = this.zones.map((z) => {
      const pointsCode = z.data.points
        .map((p) => `      { x: ${Math.round(p.x)}, y: ${Math.round(p.y)} }`)
        .join(',\n')
      return `  {\n    label: '${z.data.label.replace(/'/g, "\\'")}',\n    points: [\n${pointsCode}\n    ]\n  }`
    })
    const code = `export const FARM_COLLISION_ZONES: CollisionZone[] = [\n${zoneBlocks.join(',\n')}\n]`

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

function cloneZone(zone: CollisionZone): CollisionZone {
  return { label: zone.label, points: zone.points.map((p) => ({ ...p })) }
}
