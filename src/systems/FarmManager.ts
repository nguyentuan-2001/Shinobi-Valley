import type { FarmTileState } from '../data/types'
import type { FarmTilePlacement } from '../data/farmTiles'
import { GameData } from '../data/DataLoader'

/** Giai đoạn hiển thị của cây đang trồng — khác với `FarmTileState` (state chỉ có 'planted' xuyên suốt từ lúc
 * gieo tới lúc chín, còn giai đoạn hiển thị đổi dần theo % thời gian đã trôi qua so với `growth_hours`). */
export type CropVisualStage = 'seed' | 'sprout' | 'growing' | 'harvest'

export interface FarmTileRuntime {
  id: number
  x: number
  y: number
  width: number
  height: number
  state: FarmTileState
  cropId: string | null
  /** Mốc thời gian thực (`Date.now()`, ms) lúc gieo hạt — dùng tính % lớn theo `crop.growth_hours`. */
  plantedAt: number | null
}

/** Quản lý trạng thái CUỐC/TRỒNG/LỚN của từng ô đất trồng cây — tách biệt khỏi rendering (GameScene chỉ đọc
 * state từ đây để vẽ, không tự giữ state riêng). Chỉ áp dụng cho ô loại `untilled` trong `farmTiles.ts` — ô
 * `water_pot` (dành cho cây dưới nước như sen) chưa có logic tương tác ở Sprint này.
 * Thời gian lớn tính theo GIỜ THỰC trôi qua (đúng theo `docs/gameplay/farming.md`) — vì chưa có `TimeManager`
 * (Sprint 3), cây ngắn giờ nhất (Hành lá, 2h) vẫn mất 2 giờ thực mới chín. `debugFastForward()` dùng để test
 * nhanh (phím G ở GameScene) — không phải cơ chế gameplay thật, xoá khi có game clock đàng hoàng ở Sprint 3. */
export class FarmManager {
  private readonly tiles: FarmTileRuntime[]

  constructor(placements: readonly FarmTilePlacement[]) {
    this.tiles = placements
      .filter((placement) => placement.type === 'untilled')
      .map((placement) => ({
        id: placement.id,
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        state: 'empty',
        cropId: null,
        plantedAt: null
      }))
  }

  getTiles(): readonly FarmTileRuntime[] {
    return this.tiles
  }

  /** Tìm ô đất GẦN NHẤT trong bán kính `maxDistance` tính từ (x,y) — không cần đứng chính xác lên trên ô mới
   * tính là "gần" (trước đây dùng point-in-box nên phải đứng đúng hệt lên ô, user phản hồi khó dùng vì ô khá
   * nhỏ ~21px). Dùng chung 1 hàm này cho cả con trỏ báo (`findInteractionTarget`) lẫn tương tác Enter thật
   * (`interactWithFarmTile`) ở GameScene — để "thấy mũi tên trỏ vào" và "bấm Enter có tác dụng" luôn khớp
   * nhau, không bao giờ lệch giữa 2 chỗ. */
  findNearestTile(x: number, y: number, maxDistance: number): FarmTileRuntime | undefined {
    let nearest: FarmTileRuntime | undefined
    let nearestDistance = maxDistance
    for (const tile of this.tiles) {
      const distance = Math.hypot(tile.x - x, tile.y - y)
      if (distance <= nearestDistance) {
        nearest = tile
        nearestDistance = distance
      }
    }
    return nearest
  }

  /** Cuốc đất: chỉ áp dụng được lên ô đang `empty`. */
  till(tile: FarmTileRuntime): boolean {
    if (tile.state !== 'empty') return false
    tile.state = 'tilled'
    return true
  }

  /** Trồng hạt: chỉ áp dụng được lên ô đã `tilled`, cần `cropId` hợp lệ trong crops.json. */
  plant(tile: FarmTileRuntime, cropId: string): boolean {
    if (tile.state !== 'tilled') return false
    if (!GameData.crops.some((crop) => crop.id === cropId)) return false
    tile.state = 'planted'
    tile.cropId = cropId
    tile.plantedAt = Date.now()
    return true
  }

  /** Thu hoạch: chỉ áp dụng được lên ô đang `ready`. Trả về `cropId` vừa thu hoạch (để GameScene biết dùng
   * icon nào cho hiệu ứng bay lên) hoặc `null` nếu ô chưa chín. Ô đất trả về `empty` (chưa cuốc lại) — chưa
   * cộng vào inventory/tính sản lượng theo `moisture` vì Inventory/vật phẩm thật thuộc scope Sprint 4. */
  harvest(tile: FarmTileRuntime): string | null {
    if (tile.state !== 'ready') return null
    const cropId = tile.cropId
    tile.state = 'empty'
    tile.cropId = null
    tile.plantedAt = null
    return cropId
  }

  /** Gọi mỗi frame (GameScene.update) — ô nào đã trồng đủ `growth_hours` thì chuyển sang `ready`. */
  update(now: number): void {
    for (const tile of this.tiles) {
      if (tile.state !== 'planted' || tile.plantedAt === null) continue
      const crop = GameData.crops.find((c) => c.id === tile.cropId)
      if (!crop) continue
      const elapsedHours = (now - tile.plantedAt) / 3_600_000
      if (elapsedHours >= crop.growth_hours) tile.state = 'ready'
    }
  }

  /** Giai đoạn hiển thị hiện tại của cây trên 1 ô (null nếu ô không có cây gì để vẽ). */
  getVisualStage(tile: FarmTileRuntime): CropVisualStage | null {
    if (tile.state === 'ready') return 'harvest'
    if (tile.state !== 'planted' || tile.cropId === null || tile.plantedAt === null) return null
    const crop = GameData.crops.find((c) => c.id === tile.cropId)
    if (!crop) return null
    const progress = (Date.now() - tile.plantedAt) / (crop.growth_hours * 3_600_000)
    if (progress >= 0.66) return 'growing'
    if (progress >= 0.33) return 'sprout'
    return 'seed'
  }

  /** DEBUG: đẩy lùi mốc thời gian gieo trồng để giả lập trôi qua N giờ, test lớn/chín mà không phải chờ thật. */
  debugFastForward(hours: number): void {
    const ms = hours * 3_600_000
    for (const tile of this.tiles) {
      if (tile.plantedAt !== null) tile.plantedAt -= ms
    }
  }
}
