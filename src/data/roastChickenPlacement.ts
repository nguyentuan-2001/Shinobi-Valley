/** Gà Quay ở nông trại — vật phẩm hồi phục toàn phần đứng cố định 1 chỗ (không phải item trong túi đồ), ăn tại
 * chỗ bằng Enter khi đứng gần. Vị trí (550,420) là khoảnh cỏ mở giữa nhà và bờ sông tây, không đè lên ô đất/
 * hàng rào/cổng dịch chuyển nào — đã verify walkable bằng Puppeteer, đúng phương pháp dùng cho
 * `data/mapTransitions.ts`. Chỉ 1 chỗ đặt cố định nên để phẳng ở đây thay vì mảng, giống `wellPlacement.ts`. */
export const ROAST_CHICKEN_PLACEMENT = {
  x: 550,
  y: 420,
  width: 34,
  height: 28,
  bottomY: 420 + 14
}

/** Bán kính (world-px) tính là "đứng đủ gần để ăn" — cùng tinh thần `FARM_TILE_INTERACT_RADIUS`, chọn rộng hơn
 * 1 chút vì đây là điểm đơn lẻ (không phải lưới ô dày đặc cần bán kính hẹp để tránh lẫn ô bên cạnh). */
export const ROAST_CHICKEN_INTERACT_RADIUS = 40
