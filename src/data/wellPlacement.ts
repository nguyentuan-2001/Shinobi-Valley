/** Cấu hình giếng nước trên map Farm — KHÔNG chứa vị trí (x/y), xem `data/mapPlacements/day.ts`/`night.ts`
 * (entry `id: 'gieng_nuoc'` trong `FARM_BUILDING_PLACEMENTS`, gộp chung với nhà chính/hàng rào/6 công trình
 * mới thành 1 nơi lưu vị trí duy nhất theo yêu cầu user).
 *
 * Giếng nước tự động tưới các ô đất gần nó mỗi sáng, đúng `docs/gameplay/farming.md` mục "Trang trí nông
 * trại": *"Giếng nước — Tự động tưới 3×3 ô xung quanh mỗi sáng"*. Farm không phải 1 lưới ô liền mạch mà chia 3
 * cụm rời (`data/farmTiles.ts`), nên "3×3 xung quanh" không thể tính theo lưới thật — `AUTO_WATER_RADIUS`
 * (world-px) chọn vừa đủ phủ HẾT cụm ô dưới (gần nhất với tinh thần "3×3"), không lan sang 2 cụm trên (đã
 * verify bằng script, xem `docs/planning/progress.md`).
 * `WELL_AUTO_WATER_RADIUS`/`GameScene.autoWaterNearWell()` (gameplay, không phải hiển thị) dùng CỐ ĐỊNH vị trí
 * NGÀY (entry `'gieng_nuoc'` ở `mapPlacements/day.ts`) làm mốc — vị trí ngày/đêm chỉ nên lệch vài chục px để
 * canh khớp pixel nền, không ảnh hưởng đáng kể tới bán kính tưới. */
export const WELL_AUTO_WATER_RADIUS = 85

/** Kích thước VUÔNG thật truyền cho `.setDisplaySize()` — khác `width`/`height` của entry `'gieng_nuoc'` ở
 * `data/mapPlacements/day.ts` (footprint) vì ảnh là canvas 250x250 có viền trong suốt quanh nội dung (bounding
 * box giếng chỉ chiếm 78/250 ≈ 31% canvas) — đặt ĐÚNG BẰNG 250 (cỡ canvas gốc, không co/giãn) để nội dung thật
 * hiện đúng kích thước pixel gốc. Giải thích đầy đủ xem `mapPlacements/day.ts` (`canvasSize`, cùng 1 bug). */
export const WELL_CANVAS_SIZE = 250
