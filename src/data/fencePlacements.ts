/** Hàng rào gỗ bao quanh khu đất trồng cây — ảnh nguồn `public/images/BaseMap/Farm/Fence.png`, đã cắt sẵn 2
 * mảnh: `fence_horizontal.png` (đoạn ngang, có sẵn trụ ở 2 đầu) và `fence_vertical.png` (đoạn dọc, có sẵn trụ
 * ở 2 đầu). Đặt theo kiểu lặp lại nhiều đoạn dọc theo cạnh (giống cách `farmTiles.ts` lặp ô theo `cols`/`rows`)
 * thay vì kéo giãn 1 ảnh duy nhất cho cả cạnh — kéo giãn độc lập width/height làm ảnh chữ nhật gốc bị méo thành
 * gần vuông, còn lặp lại nhiều đoạn nhỏ đúng tỉ lệ gốc thì giữ được hình dạng thật của gỗ/rào.
 * `FENCE_RECT` là khung bao quanh cụm thảm đất hiện tại ở `farmTiles.ts` ((805,405)-(965,664), cộng biên đệm
 * ~10px mỗi phía) — nếu `farmTiles.ts` đổi vị trí/kích thước thảm, cần chỉnh lại `FENCE_RECT`/`FENCE_RUNS` cho
 * khớp (không tự động bám theo). */
export type FenceTexture = 'fence_horizontal' | 'fence_vertical'

export interface FencePlacement {
  x: number
  y: number
  width: number
  height: number
  texture: FenceTexture
  /** Dùng làm depth Y-sort (điểm thấp nhất của từng đoạn, để so với player.y). */
  bottomY: number
}

interface FenceRun {
  x: number
  y: number
  count: number
  texture: FenceTexture
}

/** Bề dày hiển thị của rào — khớp `cellWidth`/`cellHeight` (21) ở farmTiles.ts để cùng tỉ lệ với ô đất. */
const THICKNESS = 21

/** Kích thước gốc (px) của từng ảnh đã cắt — dùng để suy ra chiều còn lại theo đúng tỉ lệ khung hình, không
 * ép width/height độc lập như bản trước. */
const NATIVE_SIZE: Record<FenceTexture, { width: number; height: number }> = {
  fence_horizontal: { width: 240, height: 140 },
  fence_vertical: { width: 103, height: 350 }
}

function segmentSize(texture: FenceTexture): { width: number; height: number } {
  const native = NATIVE_SIZE[texture]
  // fence_horizontal lấy `height` làm bề dày (đoạn nằm ngang), fence_vertical lấy `width` làm bề dày (đoạn dọc).
  const scale =
    texture === 'fence_horizontal' ? THICKNESS / native.height : THICKNESS / native.width
  return { width: native.width * scale, height: native.height * scale }
}

function generateRun(run: FenceRun): FencePlacement[] {
  const { width, height } = segmentSize(run.texture)
  const tiles: FencePlacement[] = []
  for (let i = 0; i < run.count; i++) {
    const x = run.texture === 'fence_horizontal' ? run.x + i * width + width / 2 : run.x
    const y = run.texture === 'fence_vertical' ? run.y + i * height + height / 2 : run.y
    tiles.push({ x, y, width, height, texture: run.texture, bottomY: y + height / 2 })
  }
  return tiles
}

const FENCE_RECT = { x: 1005, y: 395, width: 318, height: 130 }

/** 5 đoạn ngang (36px/đoạn) vừa khít 180px cạnh trên/dưới; 4 đoạn dọc (~71px/đoạn) cho cạnh trái/phải — lố
 * nhẹ ~6px so với 279px chiều cao thảm (chấp nhận được, xem nguyên tắc "không tự khớp khít viền" ở farmTiles.ts). */
const FENCE_RUNS: FenceRun[] = [
  { x: FENCE_RECT.x, y: FENCE_RECT.y, count: 9, texture: 'fence_horizontal' },
  { x: FENCE_RECT.x, y: FENCE_RECT.y + FENCE_RECT.height, count: 9, texture: 'fence_horizontal' },
  { x: FENCE_RECT.x + 5, y: FENCE_RECT.y, count: 1, texture: 'fence_vertical' },
  { x: FENCE_RECT.x + FENCE_RECT.width, y: FENCE_RECT.y, count: 2, texture: 'fence_vertical' }
]

export const FENCE_PLACEMENTS: FencePlacement[] = FENCE_RUNS.flatMap(generateRun)
