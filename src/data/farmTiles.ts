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
  texture: string
  nightX: number
  nightY: number
}

interface PlotGrid {
  x: number
  y: number
  cellWidth: number
  cellHeight: number
  cols: number
  rows: number
  type: FarmTileType
  colGap?: number
  rowGap?: number
}

const DEFAULT_COL_GAP = 4
const DEFAULT_ROW_GAP = 4

function generateGrid(plot: PlotGrid): FarmTilePlacementDraft[] {
  const colGap = plot.colGap ?? DEFAULT_COL_GAP
  const rowGap = plot.rowGap ?? DEFAULT_ROW_GAP
  const tiles: FarmTilePlacementDraft[] = []
  for (let row = 0; row < plot.rows; row++) {
    for (let col = 0; col < plot.cols; col++) {
      tiles.push({
        x: plot.x + col * (plot.cellWidth + colGap) + plot.cellWidth / 2,
        y: plot.y + row * (plot.cellHeight + rowGap) + plot.cellHeight / 2,
        width: plot.cellWidth,
        height: plot.cellHeight,
        type: plot.type
      })
    }
  }
  return tiles
}

/** 3 thảm cỏ trên cùng hàng, giữa 2 đường mòn ngang, ngăn bởi 2 đường mòn dọc — mỗi thảm chia thành nhiều
 * cột luống, mỗi cột 5 ô xếp dọc. `cellWidth`/`cellHeight` bằng nhau nên ô luôn vuông bất kể `cols`/`rows`.
 * Bản ngày và bản đêm có thể đặt ở vị trí khác nhau vì nền `BaseMap.png` và `BaseMap_night.png` là 2 ảnh
 * khác nhau (không chỉ tối mà còn địa hình/tiểu tiết khác), nên tách riêng tọa độ cho mỗi bản giống
 * `FARM_BUILDING_PLACEMENTS_DAY`/`_NIGHT` ở `data/mapPlacements/day.ts`/`night.ts`. */
const UNTILLED_PLOTS_DAY: PlotGrid[] = [
  { x: 820, y: 369, cellWidth: 25, cellHeight: 25, cols: 3, rows: 4, type: 'untilled' },
  { x: 920, y: 369, cellWidth: 25, cellHeight: 25, cols: 3, rows: 4, type: 'untilled' },
  { x: 1020, y: 369, cellWidth: 25, cellHeight: 25, cols: 3, rows: 4, type: 'untilled' }
]

const UNTILLED_PLOTS_NIGHT: PlotGrid[] = [
  { x: 820, y: 355, cellWidth: 25, cellHeight: 25, cols: 3, rows: 4, type: 'untilled' },
  { x: 920, y: 355, cellWidth: 25, cellHeight: 25, cols: 3, rows: 4, type: 'untilled' },
  { x: 1020, y: 355, cellWidth: 25, cellHeight: 25, cols: 3, rows: 4, type: 'untilled' }
]

const WATER_POT_PLOT_NIGHT: PlotGrid[] = [
  { x: 690, y: 560, cellWidth: 25, cellHeight: 25, cols: 4, rows: 3, type: 'water_pot' },
  { x: 805, y: 503, cellWidth: 25, cellHeight: 25, cols: 2, rows: 5, type: 'water_pot' }
]

const WATER_POT_PLOT_DAY: PlotGrid[] = [
  { x: 690, y: 570, cellWidth: 25, cellHeight: 25, cols: 4, rows: 3, type: 'water_pot' },
  { x: 805, y: 513, cellWidth: 25, cellHeight: 25, cols: 2, rows: 5, type: 'water_pot' }
]

const FARM_TILE_TEXTURES: Record<FarmTileType, string> = {
  untilled: 'farm_soil_untilled',
  tilled: 'farm_soil_tilled',
  water_pot: 'farm_soil_water_pot'
}

const DAY_GRID = [...UNTILLED_PLOTS_DAY, ...WATER_POT_PLOT_DAY]
  .flatMap(generateGrid)
  .map((tile, id) => ({ ...tile, id }))
const NIGHT_GRID = [...UNTILLED_PLOTS_NIGHT, ...WATER_POT_PLOT_NIGHT]
  .flatMap(generateGrid)
  .map((tile, id) => ({ ...tile, id }))
const NIGHT_BY_ID = new Map(NIGHT_GRID.map((t) => [t.id, t]))

export const FARM_TILE_PLACEMENTS: FarmTilePlacement[] = DAY_GRID.map((dayTile) => {
  const nightTile = NIGHT_BY_ID.get(dayTile.id) ?? dayTile
  return {
    ...dayTile,
    id: dayTile.id,
    texture: FARM_TILE_TEXTURES[dayTile.type],
    nightX: nightTile.x,
    nightY: nightTile.y
  }
})
