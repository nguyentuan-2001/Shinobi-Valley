import Phaser from 'phaser'
import { FARM_TILE_PLACEMENTS } from '../data/farmTiles'
import { FENCE_PLACEMENTS } from '../data/fencePlacements'
import { PLAYER_HOUSE, HOUSE_LEVEL_TEXTURES } from '../data/housePlacement'

const FARM_TILE_DEPTH = -1
/** Texture bóng đổ dùng chung — do `GameScene.createShadowTexture()` tạo, luôn chạy trước vì EditorScene chỉ
 * mở được từ trong GameScene (phím Q) nên texture chắc chắn đã tồn tại (Phaser TextureManager dùng chung toàn
 * game, không riêng theo scene) — không cần tạo lại ở đây. */
const SHADOW_TEXTURE = 'shadow_oval'

/** Vẽ TĨNH (không tương tác, không gắn `FarmManager`) toàn bộ ô đất/hàng rào/nhà lên 1 scene bất kỳ — dùng cho
 * `EditorScene` để có ngữ cảnh xung quanh khi chỉnh vùng va chạm (trước đây Editor chỉ có mỗi nền trơn, không
 * thấy nhà/hàng rào/ruộng nên khó canh vùng chặn cho khớp thực tế). Luôn vẽ ô đất ở trạng thái "chưa cuốc" —
 * Editor không cần biết trạng thái cuốc/trồng thật (đó là việc runtime của `FarmManager`, chỉ tồn tại trong
 * `GameScene`). Cố tình KHÔNG dùng chung code với `GameScene.placeFarmTiles/placeFence/placeHouse` — những hàm
 * đó đã verify kỹ và gắn chặt vào state riêng của `GameScene` (soilImages map, Y-sort...), tách riêng bản tĩnh
 * ở đây để không rủi ro đụng vỡ code đã chạy đúng bên đó. */
export function renderStaticWorldDecorations(scene: Phaser.Scene): void {
  for (const tile of FARM_TILE_PLACEMENTS) {
    const textureKey = tile.type === 'water_pot' ? 'farm_soil_water_pot' : 'farm_soil_untilled'
    scene.add
      .image(tile.x, tile.y, textureKey)
      .setDisplaySize(tile.width, tile.height)
      .setDepth(FARM_TILE_DEPTH)
  }

  for (const fence of FENCE_PLACEMENTS) {
    renderGroundShadow(scene, fence.x, fence.bottomY, fence.width * 0.85, fence.bottomY - 0.5)
    scene.add
      .image(fence.x, fence.y, fence.texture)
      .setDisplaySize(fence.width, fence.height)
      .setDepth(fence.bottomY)
  }

  const houseTexture = HOUSE_LEVEL_TEXTURES[PLAYER_HOUSE.level]
  renderGroundShadow(
    scene,
    PLAYER_HOUSE.x,
    PLAYER_HOUSE.bottomY,
    PLAYER_HOUSE.width * 0.95,
    PLAYER_HOUSE.bottomY - 0.5
  )
  scene.add
    .image(PLAYER_HOUSE.x, PLAYER_HOUSE.y, houseTexture)
    .setDisplaySize(PLAYER_HOUSE.width, PLAYER_HOUSE.height)
    .setDepth(PLAYER_HOUSE.bottomY)
}

function renderGroundShadow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  depth: number
): void {
  const height = width * (20 / 48) // giữ đúng tỉ lệ khung hình gốc của SHADOW_TEXTURE (48x20)
  scene.add.image(x, y, SHADOW_TEXTURE).setDisplaySize(width, height).setAlpha(0.85).setDepth(depth)
}
