/** Cấu hình texture/kích thước hiển thị nhà chính người chơi trên map Farm — KHÔNG chứa vị trí (x/y), xem
 * `data/mapPlacements/day.ts`/`night.ts` (entry `id: 'nha_chinh'` trong `FARM_BUILDING_PLACEMENTS`, gộp chung
 * với giếng nước/hàng rào/6 công trình mới thành 1 nơi lưu vị trí duy nhất theo yêu cầu user).
 *
 * Cấp 1 dùng art THẬT bản ngày/đêm (`building_nha_chinh_bright`/`_night`, user tự tách 2 thư mục `bright`/
 * `night`, xem `PreloadScene.ts`) — thay cho `player_house_1.png` cũ (giữ lại file cũ, không xoá, chỉ không còn
 * tham chiếu tới nữa). Cấp 2/3 (`player_house_2/3.png`) CHƯA có bản đêm riêng — giữ nguyên art cũ,
 * `GameScene.placeHouse()` fallback dùng thẳng bản ngày cả lúc đêm cho 2 cấp này (chấp nhận được vì chưa có
 * logic nâng cấp nhà thật, chỉ cấp 1 từng được đặt lên map). Giá nâng cấp xem `docs/gameplay/economy.md`
 * (Lv2: 10.000đ, Lv3: 50.000đ). */
export type HouseLevel = 1 | 2 | 3

export const HOUSE_LEVEL_TEXTURES: Record<HouseLevel, string> = {
  1: 'building_nha_chinh_bright',
  2: 'player_house_2',
  3: 'player_house_3'
}

/** Chỉ cấp 1 có bản đêm thật — xem comment đầu file. */
export const HOUSE_LEVEL_NIGHT_TEXTURES: Partial<Record<HouseLevel, string>> = {
  1: 'building_nha_chinh_night'
}

/** Kích thước THẬT truyền cho `.setDisplaySize()` — khác `width`/`height` của entry `'nha_chinh'` ở
 * `data/mapPlacements/day.ts` (footprint, chỉ dùng cho cấp 1 vì đó là cấp DUY NHẤT từng được đặt lên map) vì
 * art cấp 1 (`building_nha_chinh_*`) là canvas 250x250 VUÔNG có viền trong suốt quanh nội dung (không phải ảnh
 * đã crop khít) — đặt ĐÚNG BẰNG 250 (cỡ canvas gốc, không co/giãn) để nội dung thật hiện đúng kích thước pixel
 * gốc, xem giải thích chi tiết ở `mapPlacements/day.ts` (`canvasSize`, cùng 1 bug/công thức). Cấp 2/3 dùng
 * `player_house_2/3.png` — ảnh CŨ đã crop khít sẵn (bbox ≈ cỡ file gốc, verify bằng Pillow), không bị lỗi này —
 * giữ nguyên khung 100x128 đã dùng trước khi có art cấp 1 mới (chưa từng render thật, chỉ preload sẵn, xem
 * comment đầu file). */
export const HOUSE_LEVEL_DISPLAY_SIZE: Record<HouseLevel, { width: number; height: number }> = {
  1: { width: 250, height: 250 },
  2: { width: 100, height: 128 },
  3: { width: 100, height: 128 }
}
