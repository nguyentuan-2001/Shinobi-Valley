import type { FarmTileState } from '../data/types'
import type { FarmTilePlacement, FarmTileType } from '../data/farmTiles'
import { GameData } from '../data/DataLoader'

/** Giai đoạn hiển thị của cây đang trồng — khác với `FarmTileState` (state chỉ có 'planted' xuyên suốt từ lúc
 * gieo tới lúc chín, còn giai đoạn hiển thị đổi dần theo % thời gian đã trôi qua so với `growth_hours`). */
export type CropVisualStage = 'seed' | 'sprout' | 'growing' | 'harvest'

/** Độ ẩm không bao giờ xuống dưới mốc này hoặc vượt mốc này, đúng `docs/gameplay/farming.md`. */
const MOISTURE_MIN = 50
const MOISTURE_MAX = 100

/** Cây `night_only` (Hoa Ánh Trăng) chỉ hái được trong khung giờ này — đúng farming.md: "chỉ thu hoạch được
 * vào ban đêm (sau 18:00 game time)". Cố tình KHÔNG dùng `TimeManager.getIsNight()` (dựng cho hiệu ứng hoàng
 * hôn/bình minh dần, mốc 19-21h/4-6h) vì lệch với mốc "18:00" ghi rõ trong spec — 2 khái niệm "đêm" khác nhau,
 * dùng nhầm sẽ trễ 1 giờ hái được so với thiết kế. */
const NIGHT_ONLY_HARVEST_START_HOUR = 18
const NIGHT_ONLY_HARVEST_END_HOUR = 6

export interface FarmTileRuntime {
  id: number
  x: number
  y: number
  width: number
  height: number
  /** Loại ô đất gốc (`untilled` thường hay `water_pot` chậu nước cho cây thuỷ sinh) — cố định từ lúc tạo,
   * không đổi theo runtime. Dùng để chặn trồng sai loại cây lên sai loại ô, xem `plant()`. */
  tileType: FarmTileType
  state: FarmTileState
  cropId: string | null
  /** Mốc thời gian thực (`Date.now()`, ms) lúc gieo hạt (lần đầu) hoặc lúc bắt đầu chu kỳ hái lại (regrow) —
   * dùng tính % lớn theo `cycleHours`. */
  plantedAt: number | null
  /** Mốc thời gian thực lúc tưới lần gần nhất (hoặc lúc gieo — trồng cũng tính như tưới, về 100% ngay).
   * `null` khi ô không có cây. Độ ẩm hiện tại luôn tính LẠI từ mốc này (`getMoisture()`), không lưu số % trực
   * tiếp — tránh lệch/trôi số khi nhiều nơi cùng đọc/ghi, giống cách `getVisualStage()` tính lại từ `plantedAt`. */
  lastWateredAt: number | null
  /** Còn bao nhiêu lần hái nữa trước khi cây héo/về `empty` — cây thường luôn là 1, cây `multi_harvest` theo
   * `crop.harvest_count`, giảm dần mỗi lần hái. */
  harvestCountRemaining: number
  /** Độ dài 1 chu kỳ lớn hiện tại, tính bằng giờ — `crop.growth_hours` ở lần trồng đầu, đổi sang
   * `crop.regrow_hours` từ lần hái thứ 2 trở đi (cây `multi_harvest`). */
  cycleHours: number
  /** `true` từ lần hái thứ 2 trở đi của cây `multi_harvest` — cây hái lại không "nảy mầm" từ đầu, bỏ qua giai
   * đoạn seed/sprout, chỉ hiện `growing` liên tục tới khi chín lại (xem `getVisualStage()`). */
  isRegrowCycle: boolean
}

/** Quản lý trạng thái CUỐC/TRỒNG/TƯỚI/LỚN/THU HOẠCH/HÉO của từng ô đất trồng cây — tách biệt khỏi rendering
 * (GameScene chỉ đọc state từ đây để vẽ, không tự giữ state riêng). Áp dụng cho cả ô `untilled` (đất thường)
 * và `water_pot` (chậu nước cho cây thuỷ sinh như Hoa Sen — bắt đầu sẵn ở state `tilled`, không cần cuốc vì
 * đã là nước sẵn) trong `farmTiles.ts`.
 * Thời gian lớn/độ ẩm tính theo GIỜ THỰC trôi qua (đúng theo `docs/gameplay/farming.md` — "Đơn vị thời gian:
 * mọi thời gian tính bằng giờ thực"), KHÔNG ăn theo đồng hồ game gia tốc của `TimeManager` (chủ đích, xem
 * comment trong `TimeManager.ts` — 2 hệ thống thời gian tách biệt hoàn toàn). Riêng kiểm tra `night_only` ở
 * `harvest()` cần biết giờ trong ngày hiện tại — nhận qua tham số `currentHour` (do `GameScene` truyền vào từ
 * `TimeManager.getHour()`), không tự import `TimeManager` để giữ 2 hệ thống độc lập như thiết kế.
 * `debugFastForward()` dùng để test nhanh (phím G ở GameScene) — không phải cơ chế gameplay thật. */
export class FarmManager {
  private readonly tiles: FarmTileRuntime[]

  constructor(placements: readonly FarmTilePlacement[]) {
    this.tiles = placements
      .filter((placement) => placement.type === 'untilled' || placement.type === 'water_pot')
      .map((placement) => ({
        id: placement.id,
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        tileType: placement.type,
        // Chậu nước coi như đã "cuốc" sẵn (là nước, không phải đất cần xới) — bỏ qua nấc empty->tilled.
        state: placement.type === 'water_pot' ? 'tilled' : 'empty',
        cropId: null,
        plantedAt: null,
        lastWateredAt: null,
        harvestCountRemaining: 0,
        cycleHours: 0,
        isRegrowCycle: false
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

  /** Cuốc đất: chỉ áp dụng được lên ô đang `empty` — chậu nước (`water_pot`) không bao giờ ở state này (bắt
   * đầu sẵn ở `tilled`) nên tự động không cuốc được, không cần check riêng. */
  till(tile: FarmTileRuntime): boolean {
    if (tile.state !== 'empty') return false
    tile.state = 'tilled'
    return true
  }

  /** Trồng hạt: chỉ áp dụng được lên ô đã `tilled`, cần `cropId` hợp lệ trong crops.json VÀ đúng loại đất theo
   * `crop.needs_water_tile` (Hoa Sen `needs_water_tile: true` chỉ trồng được lên `water_pot`, mọi cây khác chỉ
   * trồng được lên `untilled` — đúng farming.md: "Hoa sen phải trồng trên ô đất cạnh nước"). Trồng xong độ ẩm
   * về 100% ngay (đúng farming.md: "Khi trồng hoặc tưới nước → Độ ẩm về 100%"). */
  plant(tile: FarmTileRuntime, cropId: string): boolean {
    if (tile.state !== 'tilled') return false
    const crop = GameData.crops.find((c) => c.id === cropId)
    if (!crop) return false
    const isWaterTile = tile.tileType === 'water_pot'
    if (crop.needs_water_tile !== isWaterTile) return false
    const now = Date.now()
    tile.state = 'planted'
    tile.cropId = cropId
    tile.plantedAt = now
    tile.lastWateredAt = now
    tile.harvestCountRemaining = crop.harvest_count
    tile.cycleHours = crop.growth_hours
    tile.isRegrowCycle = false
    return true
  }

  /** Tưới nước: chỉ áp dụng được lên ô đang `planted` (đang có cây sống, chưa chín) — về 100% ngay, không
   * quan tâm độ ẩm hiện tại là bao nhiêu. Bình tưới gỗ mặc định (1 ô/lần) — bình sắt/thần (3×3/5×5) là nâng cấp
   * sau này, chưa có trong scope Sprint 4. */
  water(tile: FarmTileRuntime): boolean {
    if (tile.state !== 'planted') return false
    tile.lastWateredAt = Date.now()
    return true
  }

  /** Độ ẩm hiện tại (50-100), tính LẠI từ `lastWateredAt` mỗi lần gọi — `null` nếu ô không có cây đang sống để
   * tính (state khác `planted`/`ready`, hoặc thiếu data). Tốc độ giảm dùng đúng `crop.moisture_decay_per_hour`
   * (đã tính sẵn = 50/growth_hours trong data, khớp công thức farming.md). */
  getMoisture(tile: FarmTileRuntime, now: number = Date.now()): number | null {
    if (tile.lastWateredAt === null || tile.cropId === null) return null
    const crop = GameData.crops.find((c) => c.id === tile.cropId)
    if (!crop) return null
    const elapsedHours = (now - tile.lastWateredAt) / 3_600_000
    const decayed = MOISTURE_MAX - crop.moisture_decay_per_hour * elapsedHours
    return Math.min(MOISTURE_MAX, Math.max(MOISTURE_MIN, decayed))
  }

  /** Thu hoạch: chỉ áp dụng được lên ô đang `ready`. Cây `night_only` (Hoa Ánh Trăng) còn cần đang trong
   * khung giờ đêm (`currentHour`, do gọi truyền vào từ `TimeManager.getHour()`) — không đúng giờ thì trả `null`
   * giống như chưa chín, farming.md: "chỉ thu hoạch được vào ban đêm (sau 18:00 game time)". Sản lượng = random
   * trong [yield_min, yield_max] × (độ ẩm TẠI THỜI ĐIỂM HÁI / 100), tối thiểu 1 (đúng công thức + ví dụ
   * farming.md: "Cà rốt gốc 4 củ, Độ ẩm 70% → thu được 2-3 củ"). Cây `multi_harvest` còn lượt hái thì tile quay
   * lại `planted` với chu kỳ `regrow_hours` (bỏ qua giai đoạn seed/sprout — xem `isRegrowCycle`); hết lượt thì
   * HÉO (`withered`, xem `clearWithered()`) chứ không về `empty` ngay — đúng farming.md: "một số cây thu hoạch
   * nhiều lần trước khi héo". Cây thường (không multi-harvest) hái 1 lần rồi về `empty` thẳng, không héo. */
  harvest(tile: FarmTileRuntime, currentHour: number): { cropId: string; quantity: number } | null {
    if (tile.state !== 'ready' || tile.cropId === null) return null
    const crop = GameData.crops.find((c) => c.id === tile.cropId)
    if (!crop) return null
    if (crop.night_only && !FarmManager.isWithinNightHarvestWindow(currentHour)) return null

    const moisture = this.getMoisture(tile) ?? MOISTURE_MIN
    const baseYield =
      crop.yield_min + Math.floor(Math.random() * (crop.yield_max - crop.yield_min + 1))
    const quantity = Math.max(1, Math.round(baseYield * (moisture / 100)))
    const cropId = tile.cropId

    if (crop.multi_harvest && tile.harvestCountRemaining > 1) {
      tile.harvestCountRemaining -= 1
      tile.state = 'planted'
      tile.plantedAt = Date.now()
      tile.cycleHours = crop.regrow_hours
      tile.isRegrowCycle = true
    } else if (crop.multi_harvest) {
      // Hết lượt hái cuối — héo chứ không về trống ngay, giữ `cropId` để biết vẽ cây héo của loại nào
      // (`getVisualStage()` trả `growing`, GameScene tự tint xám), xoá mốc thời gian vì không còn gì để tính.
      tile.state = 'withered'
      tile.plantedAt = null
      tile.lastWateredAt = null
      tile.harvestCountRemaining = 0
      tile.cycleHours = 0
      tile.isRegrowCycle = false
    } else {
      tile.state = 'empty'
      tile.cropId = null
      tile.plantedAt = null
      tile.lastWateredAt = null
      tile.harvestCountRemaining = 0
      tile.cycleHours = 0
      tile.isRegrowCycle = false
    }

    return { cropId, quantity }
  }

  /** Dọn cây héo: chỉ áp dụng được lên ô đang `withered` — về hẳn `empty`, giống cuốc lại từ đầu. */
  clearWithered(tile: FarmTileRuntime): boolean {
    if (tile.state !== 'withered') return false
    tile.state = 'empty'
    tile.cropId = null
    return true
  }

  private static isWithinNightHarvestWindow(hour: number): boolean {
    return hour >= NIGHT_ONLY_HARVEST_START_HOUR || hour < NIGHT_ONLY_HARVEST_END_HOUR
  }

  /** Gọi mỗi frame (GameScene.update) — ô nào đã trồng đủ `cycleHours` thì chuyển sang `ready`. */
  update(now: number): void {
    for (const tile of this.tiles) {
      if (tile.state !== 'planted' || tile.plantedAt === null) continue
      const elapsedHours = (now - tile.plantedAt) / 3_600_000
      if (elapsedHours >= tile.cycleHours) tile.state = 'ready'
    }
  }

  /** Giai đoạn hiển thị hiện tại của cây trên 1 ô (null nếu ô không có cây gì để vẽ). Chu kỳ hái lại
   * (`isRegrowCycle`) bỏ qua seed/sprout — cây đã có sẵn từ trước, chỉ cần lớn lại quả/lá mới. Ô `withered`
   * dùng lại đúng sprite `growing` (chưa có sprite héo riêng cho 20 cây) — GameScene tự tint xám để phân biệt
   * với cây đang lớn thật, xem `syncFarmVisuals()`. */
  getVisualStage(tile: FarmTileRuntime): CropVisualStage | null {
    if (tile.state === 'ready') return 'harvest'
    if (tile.state === 'withered') return 'growing'
    if (tile.state !== 'planted' || tile.cropId === null || tile.plantedAt === null) return null
    if (tile.isRegrowCycle) return 'growing'
    const progress = (Date.now() - tile.plantedAt) / (tile.cycleHours * 3_600_000)
    if (progress >= 0.66) return 'growing'
    if (progress >= 0.33) return 'sprout'
    return 'seed'
  }

  /** DEBUG: đẩy lùi mốc thời gian gieo trồng VÀ tưới nước để giả lập trôi qua N giờ (cả lớn cây lẫn giảm độ ẩm
   * cùng lúc, đúng thực tế thời gian trôi qua) — test lớn/chín/độ ẩm mà không phải chờ thật. */
  debugFastForward(hours: number): void {
    const ms = hours * 3_600_000
    for (const tile of this.tiles) {
      if (tile.plantedAt !== null) tile.plantedAt -= ms
      if (tile.lastWateredAt !== null) tile.lastWateredAt -= ms
    }
  }
}
