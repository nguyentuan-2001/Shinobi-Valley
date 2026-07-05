import Phaser from 'phaser'

/** Kiểm tra & chặn va chạm giữa 1 Arcade sprite và danh sách polygon tuỳ ý (Arcade Physics không hỗ trợ polygon
 * body nên phải tự làm thủ công, dùng chung cho cả `GameScene` lẫn `EditorScene`).
 *
 * Kiểm theo TỪNG TRỤC riêng biệt trước (không phải cả điểm đích cùng lúc) để player vẫn trượt được dọc biên
 * khi đi chéo — đây là cách làm gốc. NHƯNG khi biên đa giác lõm sâu kiểu răng cưa (ví dụ viền hàng cây vẽ zigzag
 * nhọn), 2 kiểm tra trục riêng lẻ có thể ĐỀU pass (đường ngang ổn, đường dọc ổn) trong khi đường CHÉO giữa
 * chúng lại cắt thẳng qua đúng cái mũi nhọn lõm đó — không kiểm thêm điểm đích chéo thì player "lách chéo" lọt
 * hẳn vào trong mũi nhọn. Sau khi xử lý từng trục, kiểm thêm 1 lần điểm đích CHÉO (cả X lẫn Y cùng lúc) — nếu
 * vẫn lọt vào polygon thì huỷ nốt trục Y (giữ lại trượt ngang, chặn trượt chéo xuyên qua khe hẹp không thật sự
 * tồn tại).
 *
 * Nếu vị trí HIỆN TẠI đã lỡ nằm trong 1 polygon (không nên xảy ra sau khi có kiểm tra chéo ở trên, nhưng phòng
 * còn sót góc lạ chưa lường tới) — **ĐẨY NGAY RA mép polygon gần nhất** (`pushOutOfPolygon`) thay vì bỏ qua
 * chặn hoàn toàn. Bản trước từng thử "bỏ qua chặn, cho đi tự do tới khi tự thoát ra" — sửa được bug kẹt cứng
 * nhưng tạo ra bug MỚI nghiêm trọng hơn: hễ lỡ lọt vào 1 lần là được đi xuyên tự do vĩnh viễn trong cả vùng đó
 * (user báo + gửi ảnh: đi lại thoải mái giữa vùng sông đáng lẽ phải chặn), vì mỗi frame vẫn "đang ở trong" nên
 * cứ bỏ qua chặn mãi. Đẩy ra ngay lập tức giải quyết cả 2 vấn đề: không kẹt cứng (thoát ngay trong 1 frame) và
 * không cho đi xuyên tự do (bị đẩy ra trước khi kịp di chuyển thêm). */
export function resolvePolygonCollision(
  sprite: Phaser.Physics.Arcade.Sprite,
  polygons: Phaser.Geom.Polygon[],
  deltaMs: number
): void {
  const body = sprite.body as Phaser.Physics.Arcade.Body
  const feetX = body.center.x
  const feetY = body.bottom

  const containingPolygon = polygons.find((poly) =>
    Phaser.Geom.Polygon.Contains(poly, feetX, feetY)
  )
  if (containingPolygon) {
    pushOutOfPolygon(sprite, body, containingPolygon, feetX, feetY)
    return
  }

  const dt = deltaMs / 1000
  const insideAny = (x: number, y: number) =>
    polygons.some((poly) => Phaser.Geom.Polygon.Contains(poly, x, y))

  let vx = body.velocity.x
  let vy = body.velocity.y

  if (vx !== 0 && insideAny(feetX + vx * dt, feetY)) vx = 0
  if (vy !== 0 && insideAny(feetX, feetY + vy * dt)) vy = 0
  if (vx !== 0 && vy !== 0 && insideAny(feetX + vx * dt, feetY + vy * dt)) vy = 0

  if (vx !== body.velocity.x) body.setVelocityX(vx)
  if (vy !== body.velocity.y) body.setVelocityY(vy)
}

/** Đẩy `sprite` ra khỏi `polygon` — tìm điểm gần nhất trên BIÊN polygon tính từ (feetX, feetY) (duyệt qua từng
 * cạnh, không chỉ từng đỉnh, vì điểm gần nhất thường nằm giữa 1 cạnh chứ không phải đúng đỉnh), rồi dịch sprite
 * theo đúng hướng đó thêm 1 đoạn nhỏ (`PUSH_MARGIN`) để chắc chắn ra hẳn ngoài (không dừng lại đúng trên biên,
 * dễ bị tính "vẫn còn trong" lại ở frame sau do sai số làm tròn số thực). Dùng `sprite.x/y` (không đụng thẳng
 * vào `body.x/y`) — đúng theo bài học "dùng setPosition thay vì body.reset() khi cần dịch chuyển tức thời" đã
 * rút ra trước đó trong dự án. */
function pushOutOfPolygon(
  sprite: Phaser.Physics.Arcade.Sprite,
  body: Phaser.Physics.Arcade.Body,
  polygon: Phaser.Geom.Polygon,
  feetX: number,
  feetY: number
): void {
  const points = polygon.points
  let closestX = feetX
  let closestY = feetY
  let closestDistanceSquared = Infinity

  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const candidate = closestPointOnSegment(feetX, feetY, a.x, a.y, b.x, b.y)
    const dx = candidate.x - feetX
    const dy = candidate.y - feetY
    const distanceSquared = dx * dx + dy * dy
    if (distanceSquared < closestDistanceSquared) {
      closestDistanceSquared = distanceSquared
      closestX = candidate.x
      closestY = candidate.y
    }
  }

  const dx = closestX - feetX
  const dy = closestY - feetY
  const distance = Math.hypot(dx, dy) || 1
  const PUSH_MARGIN = 2
  const targetFeetX = closestX + (dx / distance) * PUSH_MARGIN
  const targetFeetY = closestY + (dy / distance) * PUSH_MARGIN

  sprite.x += targetFeetX - feetX
  sprite.y += targetFeetY - feetY
  body.setVelocity(0, 0)
}

function closestPointOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { x: number; y: number } {
  const abx = bx - ax
  const aby = by - ay
  const lengthSquared = abx * abx + aby * aby
  const t =
    lengthSquared === 0
      ? 0
      : Phaser.Math.Clamp(((px - ax) * abx + (py - ay) * aby) / lengthSquared, 0, 1)
  return { x: ax + abx * t, y: ay + aby * t }
}
