import type { HouseLevel } from '../housePlacement'

/** **Nơi lưu TOÀN BỘ vị trí vật phẩm/công trình đặt tĩnh trên map Farm cho BẢN NGÀY** — Nhà chính, Giếng nước,
 * hàng rào, và 6 công trình mới (cửa hàng hạt giống/tổng hợp, kho chứa, lò rèn, nhà giả kim, quầy thu mua).
 * User yêu cầu gộp về đúng 1 chỗ (trước đó nằm rải rác ở `housePlacement.ts`/`wellPlacement.ts`/
 * `fencePlacements.ts`/`farmBuildingPlacements.ts`) để dễ theo dõi + để `BuildingEditorScene` (phím P, phím N
 * chuyển ngày/đêm) đọc/ghi từ 1 nguồn duy nhất. Nhà chính + Giếng nước gộp THẲNG vào `FARM_BUILDING_PLACEMENTS`
 * (id `'nha_chinh'`/`'gieng_nuoc'`) thay vì giữ 2 const riêng — cùng là "cơ quan" đặt trên map, chỉ khác vài
 * trường (`level` chỉ Nhà chính mới có, để `?` optional). Sống trong thư mục riêng `data/mapPlacements/` (tách
 * khỏi các file data khác trong `data/`) cho dễ nhận biết — đây LÀ nơi lưu vị trí map, khác các file config
 * (`housePlacement.ts`/`wellPlacement.ts`...) ở ngay cấp `data/` cha.
 *
 * Có file song sinh `mapPlacements/night.ts` (BẢN ĐÊM) — TÁCH RIÊNG vị trí vì `BaseMap.png`/`BaseMap_night.png`
 * là 2 ẢNH KHÁC NHAU (không phải cùng 1 ảnh chỉnh tối đi), địa hình/tiểu tiết (đường mòn, bụi cây, cối xay
 * gió...) có thể lệch pixel giữa 2 bản — 1 vị trí DUY NHẤT dùng chung cho cả 2 dễ đúng ở bản này nhưng lệch/đè
 * lên gì đó ở bản kia. Cả 2 file xuất CÙNG TÊN biến (phân biệt bằng chính tên file lúc import, ví dụ
 * `import { FARM_BUILDING_PLACEMENTS as FARM_BUILDING_PLACEMENTS_DAY } from '../data/mapPlacements/day'`) — xem
 * cách `GameScene.ts` import cả 2 file cùng lúc.
 *
 * Cấu hình KHÔNG phải vị trí (texture theo cấp nhà, bán kính tưới giếng, cỡ canvas ảnh...) vẫn nằm ở
 * `housePlacement.ts`/`wellPlacement.ts` — 2 file đó giờ chỉ còn giữ đúng phần cấu hình, không còn giữ vị trí. */

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

export interface FarmBuildingPlacement {
  id: string
  x: number
  y: number
  /** Kích thước FOOTPRINT thật (dùng cho collision zone ở `collisionZones.ts` + tính `bottomY`) — ĐÚNG BẰNG
   * kích thước bounding-box alpha gốc của ảnh (không co/giãn gì cả — user yêu cầu giữ nguyên size ảnh gốc thay
   * vì tự ý thu nhỏ về 1 khung cỡ tương tự nhau như bản trước). KHÔNG phải kích thước truyền cho
   * `setDisplaySize()` (xem `canvasSize`). */
  width: number
  height: number
  /** Dùng làm depth Y-sort, giống nhà/hàng rào/giếng. */
  bottomY: number
  /** Cạnh ảnh VUÔNG truyền cho `.setDisplaySize(canvasSize, canvasSize)` — mỗi ảnh bright/night là 1 canvas
   * 250x250 CÓ VIỀN TRONG SUỐT quanh nội dung thật (không phải ảnh đã crop khít). Đặt ĐÚNG BẰNG 250 (cỡ canvas
   * gốc, không co/giãn) để nội dung thật hiển thị ĐÚNG bằng kích thước pixel gốc trong file — nếu
   * `setDisplaySize(width, height)` (kích thước NỘI DUNG, nhỏ hơn 250 nhiều) sẽ vô tình scale luôn viền trong
   * suốt đó xuống theo, làm nội dung thật hiện ra nhỏ hơn hẳn kích thước gốc (bug thật gặp khi verify bằng
   * Puppeteer ở bản thu nhỏ trước đó — giếng nước gần như biến mất vì bounding box chỉ chiếm ~31% canvas). */
  canvasSize: number
  /** CHỈ có ở Nhà chính (`id: 'nha_chinh'`) — cấp nhà hiện tại, quyết định texture dùng qua
   * `HOUSE_LEVEL_TEXTURES`/`HOUSE_LEVEL_NIGHT_TEXTURES`/`HOUSE_LEVEL_DISPLAY_SIZE` ở `housePlacement.ts`. Mọi
   * công trình khác không có trường này. */
  level?: HouseLevel
}

// ─── Hàng rào gỗ bao quanh khu chuồng gà/vịt ────────────────────────────────────────────────────────────────
// Ảnh nguồn `public/images/BaseMap/Farm/Fence.png`, đã cắt sẵn 2 mảnh: `fence_horizontal.png` (đoạn ngang, có
// sẵn trụ ở 2 đầu) và `fence_vertical.png` (đoạn dọc, có sẵn trụ ở 2 đầu). Đặt theo kiểu lặp lại nhiều đoạn dọc
// theo cạnh (giống cách `farmTiles.ts` lặp ô theo `cols`/`rows`) thay vì kéo giãn 1 ảnh duy nhất cho cả cạnh —
// kéo giãn độc lập width/height làm ảnh chữ nhật gốc bị méo thành gần vuông, còn lặp lại nhiều đoạn nhỏ đúng tỉ
// lệ gốc thì giữ được hình dạng thật của gỗ/rào. `FENCE_RECT` là khung bao quanh khu chuồng gà/vịt
// (`data/animalPens.ts`) — nếu đổi vị trí/kích thước khu đó, cần chỉnh lại `FENCE_RECT`/`FENCE_RUNS` cho khớp
// (không tự động bám theo). Hàng rào KHÔNG có art riêng cho ban đêm (chỉ 1 texture, không đổi theo giờ) — vẫn
// tách vị trí ngày/đêm cho đồng nhất với các công trình khác, dù hiện `FENCE_PLACEMENTS` ở 2 file giống hệt nhau.
interface FenceRun {
  x: number
  y: number
  count: number
  texture: FenceTexture
}

/** Bề dày hiển thị của rào — khớp `cellWidth`/`cellHeight` (21) ở farmTiles.ts để cùng tỉ lệ với ô đất. */
const FENCE_THICKNESS = 21

/** Kích thước gốc (px) của từng ảnh đã cắt — dùng để suy ra chiều còn lại theo đúng tỉ lệ khung hình, không
 * ép width/height độc lập như bản trước. */
const FENCE_NATIVE_SIZE: Record<FenceTexture, { width: number; height: number }> = {
  fence_horizontal: { width: 240, height: 140 },
  fence_vertical: { width: 103, height: 350 }
}

function fenceSegmentSize(texture: FenceTexture): { width: number; height: number } {
  const native = FENCE_NATIVE_SIZE[texture]
  // fence_horizontal lấy `height` làm bề dày (đoạn nằm ngang), fence_vertical lấy `width` làm bề dày (đoạn dọc).
  const scale =
    texture === 'fence_horizontal'
      ? FENCE_THICKNESS / native.height
      : FENCE_THICKNESS / native.width
  return { width: native.width * scale, height: native.height * scale }
}

function generateFenceRun(run: FenceRun): FencePlacement[] {
  const { width, height } = fenceSegmentSize(run.texture)
  const tiles: FencePlacement[] = []
  for (let i = 0; i < run.count; i++) {
    const x = run.texture === 'fence_horizontal' ? run.x + i * width + width / 2 : run.x
    const y = run.texture === 'fence_vertical' ? run.y + i * height + height / 2 : run.y
    tiles.push({ x, y, width, height, texture: run.texture, bottomY: y + height / 2 })
  }
  return tiles
}

const FENCE_RECT = { x: 895, y: 510, width: 210, height: 130 }

/** 5 đoạn ngang (36px/đoạn) vừa khít 180px cạnh trên/dưới; 4 đoạn dọc (~71px/đoạn) cho cạnh trái/phải — lố
 * nhẹ ~6px so với 279px chiều cao thảm (chấp nhận được, xem nguyên tắc "không tự khớp khít viền" ở farmTiles.ts). */
const FENCE_RUNS: FenceRun[] = [
  { x: FENCE_RECT.x, y: FENCE_RECT.y, count: 6, texture: 'fence_horizontal' },
  { x: FENCE_RECT.x, y: FENCE_RECT.y + FENCE_RECT.height, count: 6, texture: 'fence_horizontal' },
  { x: FENCE_RECT.x + 8, y: FENCE_RECT.y, count: 1, texture: 'fence_vertical' },
  { x: FENCE_RECT.x + FENCE_RECT.width, y: FENCE_RECT.y, count: 2, texture: 'fence_vertical' }
]

export const FENCE_PLACEMENTS: FencePlacement[] = FENCE_RUNS.flatMap(generateFenceRun)

// ─── Nhà chính + Giếng nước + 6 công trình mới ─────────────────────────────────────────────────────────────
// width/height = bounding-box alpha ĐO THẬT bằng Pillow `Image.getbbox()` trên từng ảnh bright gốc (không làm
// tròn/co giãn theo 1 khung chung) — giữ đúng size ảnh gốc theo yêu cầu, khác hẳn cách chọn 1 "kích thước mục
// tiêu" rồi suy ngược ở bản trước (khiến các công trình bị ép về cỡ gần giống nhau, không đúng tỉ lệ thật giữa
// công trình to/nhỏ trong bộ art gốc). Toạ độ x/y do user tự kéo bằng BuildingEditorScene (phím P), không phải
// đoán chừng. 6 công trình mới thuần TRANG TRÍ (chưa có shop/tương tác thật — tên trùng NPC nào đó trong
// `npcPlacements.ts` chỉ là trùng hợp đặt tên, KHÔNG liên kết logic gì với NPC/shop của `VillageScene`).
export const FARM_BUILDING_PLACEMENTS: FarmBuildingPlacement[] = [
  {
    id: 'nha_chinh',
    x: 684,
    y: 393,
    width: 214,
    height: 181,
    bottomY: 393 + 181 / 2,
    canvasSize: 250,
    level: 1
  },
  {
    id: 'gieng_nuoc',
    x: 763,
    y: 513,
    width: 78,
    height: 83,
    bottomY: 513 + 83 / 2,
    canvasSize: 250
  },
  {
    id: 'cua_hang_hat_giong',
    x: 1192,
    y: 607,
    width: 120,
    height: 129,
    bottomY: 607 + 129 / 2,
    canvasSize: 250
  },
  {
    id: 'kho_chua',
    x: 408,
    y: 249,
    width: 135,
    height: 153,
    bottomY: 249 + 153 / 2,
    canvasSize: 250
  },
  {
    id: 'quay_thu_mua',
    x: 1373,
    y: 277,
    width: 117,
    height: 133,
    bottomY: 277 + 133 / 2,
    canvasSize: 250
  },
  {
    id: 'lo_ren',
    x: 1254,
    y: 443,
    width: 215,
    height: 199,
    bottomY: 443 + 199 / 2,
    canvasSize: 250
  },
  {
    id: 'nha_gia_kim',
    x: 296,
    y: 461,
    width: 184,
    height: 151,
    bottomY: 461 + 151 / 2,
    canvasSize: 250
  },
  {
    id: 'cua_hang_tong_hop',
    x: 1200,
    y: 221,
    width: 243,
    height: 216,
    bottomY: 221 + 216 / 2,
    canvasSize: 250
  }
]
