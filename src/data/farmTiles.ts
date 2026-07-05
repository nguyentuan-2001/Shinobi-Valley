/** Vị trí đặt các ô đất trồng cây trên map Farm (BaseMap.png) — đặt lên 3 thảm cỏ mở phía trên (ngăn bởi
 * đường mòn) cho ô "chưa cuốc", và 1 thảm cỏ nhỏ phía dưới cho ô "chậu nước" (trồng cây dưới nước như sen).
 * Toạ độ 3 thảm cỏ trên + 1 thảm dưới lấy từ soi màu pixel thật của BaseMap.png (script tạm dùng `pngjs`,
 * không lưu lại repo) để tránh tràn ra ngoài lên đường mòn.
 * Bố cục theo dạng "luống cày": mỗi cột là 1 luống dài `rows` ô xếp chồng theo chiều dọc. Kích thước MỖI Ô
 * (`cellWidth`/`cellHeight`) được khai báo trực tiếp, không suy ra từ chia `width`/`height` thảm cho `cols`/
 * `rows` nữa — chia như vậy khiến ô méo thành chữ nhật bất cứ khi nào `cols !== rows`, kể cả khi thảm là
 * hình vuông. Tổng vùng chiếm = `cols * cellWidth` x `rows * cellHeight`, tính từ góc trên-trái (`x`, `y`) —
 * không tự khớp khít viền thảm, cần tự chỉnh `cellWidth`/`cellHeight`/`cols`/`rows` cho vừa.
 * Ô "đã cuốc" (`tilled`) là texture hiển thị tĩnh — trạng thái cuốc/trồng/lớn THẬT của từng ô do
 * `systems/FarmManager.ts` quản lý runtime (không nằm trong file này, file này chỉ định nghĩa VỊ TRÍ đặt ban
 * đầu). Mỗi ô có `id` ổn định (theo thứ tự sinh ra, không đổi giữa các lần chạy) để `FarmManager` map trạng
 * thái theo đúng ô. */
export type FarmTileType = 'untilled' | 'tilled' | 'water_pot'

interface FarmTilePlacementDraft {
  x: number
  y: number
  width: number
  height: number
  type: FarmTileType
}

export interface FarmTilePlacement extends FarmTilePlacementDraft {
  id: number
}

interface PlotGrid {
  x: number
  y: number
  cellWidth: number
  cellHeight: number
  cols: number
  rows: number
  type: FarmTileType
}

const GAP = 2 // khe hở giữa các ô để tách bạch, không dính liền 1 khối

function generateGrid(plot: PlotGrid): FarmTilePlacementDraft[] {
  const tiles: FarmTilePlacementDraft[] = []
  for (let row = 0; row < plot.rows; row++) {
    for (let col = 0; col < plot.cols; col++) {
      tiles.push({
        x: plot.x + col * plot.cellWidth + plot.cellWidth / 2,
        y: plot.y + row * plot.cellHeight + plot.cellHeight / 2,
        width: plot.cellWidth - GAP,
        height: plot.cellHeight - GAP,
        type: plot.type
      })
    }
  }
  return tiles
}

/** 3 thảm cỏ trên cùng hàng, giữa 2 đường mòn ngang, ngăn bởi 2 đường mòn dọc — mỗi thảm chia thành nhiều
 * cột luống, mỗi cột 5 ô xếp dọc. `cellWidth`/`cellHeight` bằng nhau nên ô luôn vuông bất kể `cols`/`rows`. */
const UNTILLED_PLOTS: PlotGrid[] = [
  { x: 790, y: 405, cellWidth: 26, cellHeight: 26, cols: 3, rows: 4, type: 'untilled' },
  { x: 885, y: 405, cellWidth: 26, cellHeight: 26, cols: 3, rows: 4, type: 'untilled' },
  { x: 805, y: 555, cellWidth: 26, cellHeight: 26, cols: 2, rows: 4, type: 'untilled' }
]

/** 1 thảm cỏ nhỏ ở hàng dưới (giữa đường mòn dọc thứ 3 và thứ 4) — 4x3 = 12 ô chậu nước. */
const WATER_POT_PLOT: PlotGrid[] = [
  { x: 863, y: 580, cellWidth: 26, cellHeight: 26, cols: 1, rows: 3, type: 'water_pot' },
  { x: 890, y: 606, cellWidth: 26, cellHeight: 26, cols: 1, rows: 2, type: 'water_pot' },
  { x: 915, y: 606, cellWidth: 26, cellHeight: 26, cols: 1, rows: 2, type: 'water_pot' },
  { x: 941, y: 580, cellWidth: 26, cellHeight: 26, cols: 1, rows: 3, type: 'water_pot' }
]

export const FARM_TILE_PLACEMENTS: FarmTilePlacement[] = [...UNTILLED_PLOTS, ...WATER_POT_PLOT]
  .flatMap(generateGrid)
  .map((tile, id) => ({ ...tile, id }))
