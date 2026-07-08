/** Giếng nước trên map Farm — công trình tự động tưới các ô đất gần nó mỗi sáng, đúng
 * `docs/gameplay/farming.md` mục "Trang trí nông trại": *"Giếng nước — Tự động tưới 3×3 ô xung quanh mỗi
 * sáng"*. Farm không phải 1 lưới ô liền mạch mà chia 3 cụm rời (`data/farmTiles.ts`), nên "3×3 xung quanh"
 * không thể tính theo lưới thật — đặt giếng sát cụm ô dưới (2×4 = 8 ô, gần nhất với tinh thần "3×3") và chọn
 * `AUTO_WATER_RADIUS` (world-px) vừa đủ phủ HẾT cụm đó, không lan sang 2 cụm trên (đã verify bằng script, xem
 * `docs/planning/progress.md`). Vị trí (780, 600) là khoảnh cỏ mở duy nhất sát cụm ô dưới còn trống — 2 cụm
 * trên bị kín cả 2 bên bởi đường mòn/nhà, không còn chỗ đặt thêm công trình.
 * Chưa có sprite thật (`art-refs/world/buildings.md` đã có prompt "Giếng Làng") — dùng texture vẽ bằng code
 * tạm, xem `GameScene.createWellTexture()`. */
export const WELL_PLACEMENT = {
  x: 780,
  y: 600,
  width: 40,
  height: 40,
  /** Đáy giếng (world y) dùng làm depth Y-sort, giống house/fence — player đứng dưới giếng thì bị che, đứng
   * trên thì che giếng. */
  bottomY: 600 + 20
}

/** Bán kính hiệu lực tự động tưới (world-px, đo từ tâm giếng) — xem giải thích chọn số ở comment trên. */
export const WELL_AUTO_WATER_RADIUS = 85
