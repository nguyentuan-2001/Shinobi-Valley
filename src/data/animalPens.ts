import type { PenType } from './types'

/** Chỗ đứng của từng con vật (Sprint 8) — TẤT CẢ gộp chung vào 1 khu đất rào kín có sẵn trên map (hàng rào vẽ
 * bằng `placeFence()`/`fencePlacements.ts` FENCE_RECT (1005,395,318,130), va chạm theo polygon "Khu mới 3" ở
 * `collisionZones.ts`). Bản đầu của Sprint 8 tự vẽ thêm 2 khung chuồng bằng code (`createPenTexture()`) tại
 * (420,540)/(380,300) — đã BỎ vì map đã có sẵn đúng 1 khu rào kín dùng cho việc này, vẽ thêm khung riêng sẽ tạo
 * 2 "chuồng" chồng chéo, không khớp hình ảnh thật trong game. Khu vực đi lại được bên trong hàng rào (đã trừ độ
 * dày viền rào) ~ x:1022-1312, y:407-512 — 6 chỗ đứng bên dưới đặt cách viền đủ xa để ảnh con vật (26x26) không
 * đè lên hàng rào. */
export interface AnimalPenSlot {
  penType: PenType
  x: number
  y: number
}

export const ANIMAL_PEN_SLOTS: AnimalPenSlot[] = [
  { penType: 'chicken_coop', x: 1052, y: 427 },
  { penType: 'chicken_coop', x: 1167, y: 427 },
  { penType: 'chicken_coop', x: 1052, y: 492 },
  { penType: 'chicken_coop', x: 1167, y: 492 },
  { penType: 'large_pen', x: 1282, y: 427 },
  { penType: 'large_pen', x: 1282, y: 492 }
]
