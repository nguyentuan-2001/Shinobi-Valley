/** 1 điểm câu cá duy nhất cho V1 (Sprint 9) — đặt ngay bờ sông cạnh cầu gỗ gần nông trại (toạ độ dò/verify
 * bằng Puppeteer teleport thật, không bị `resolvePolygonCollision` đẩy ra — an toàn, đứng ngoài `FARM_COLLISION_
 * ZONES` "Sông - đoạn phải"). `fish.json` mọi cá đều gắn `location: ["river"]` vì V1 chỉ có đúng 1 vùng nước
 * (chưa có Ao làng/hang động ngầm riêng — Map 2-5 làm ở Sprint 12), nên 1 điểm câu là đủ thoả "Done when: câu
 * được ít nhất 1 cá mỗi bậc hiếm". */
export interface FishingSpotPlacement {
  x: number
  y: number
  interactRadius: number
}

export const FISHING_SPOT: FishingSpotPlacement = {
  x: 1000,
  y: 645,
  interactRadius: 55
}
