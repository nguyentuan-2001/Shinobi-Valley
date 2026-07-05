/** Nhà chính người chơi trên map Farm — ảnh nguồn `public/images/BaseMap/Home/Home.png` (3 cấp độ độ vẽ sẵn
 * theo mô tả ở `art-refs/world/buildings.md`), đã cắt thành `player_house_1/2/3.png` ở
 * `public/assets/sprites/buildings/`. Giá nâng cấp xem `docs/gameplay/economy.md` (Lv2: 10.000đ, Lv3: 50.000đ).
 * Hiện chỉ đặt nhà cấp 1 lên map — đổi `level`/texture khi có logic nâng cấp nhà thật (chưa nằm trong
 * dev-schedule.md, xem docs/planning/progress.md). Vị trí lấy từ khoảnh cỏ trống ngay bên trái cụm ô đất
 * ở `farmTiles.ts` (dò qua debug click-log toạ độ world ở GameScene, không đoán chừng). */
export type HouseLevel = 1 | 2 | 3

export const HOUSE_LEVEL_TEXTURES: Record<HouseLevel, string> = {
  1: 'player_house_1',
  2: 'player_house_2',
  3: 'player_house_3'
}

export interface HousePlacement {
  x: number
  y: number
  width: number
  height: number
  level: HouseLevel
  /** Dùng làm depth Y-sort (điểm thấp nhất của nhà, để so với player.y — player đứng phía sau nhà thì bị che). */
  bottomY: number
}

const HOUSE_WIDTH = 100
const HOUSE_HEIGHT = 128 // giữ đúng tỉ lệ khung hình gốc của player_house_1.png (234x316)
const HOUSE_CENTER = { x: 700, y: 420 }

export const PLAYER_HOUSE: HousePlacement = {
  x: HOUSE_CENTER.x,
  y: HOUSE_CENTER.y,
  width: HOUSE_WIDTH,
  height: HOUSE_HEIGHT,
  level: 1,
  bottomY: HOUSE_CENTER.y + HOUSE_HEIGHT / 2
}
