import type { AnimalPenSlot } from '../data/animalPens'
import { GameData } from '../data/DataLoader'

/** 24 giờ THỰC — đúng "mỗi ngày thực" trong `docs/gameplay/farming.md` mục Chăn nuôi, cùng hệ thời gian với
 * `FarmManager` (giờ thực trôi qua, tách biệt hoàn toàn khỏi đồng hồ game gia tốc của `TimeManager`). */
const ONE_DAY_MS = 24 * 3_600_000

export interface AnimalRuntime {
  id: number
  penType: string
  x: number
  y: number
  /** `null` = chỗ trống, chưa có con nào — chưa có shop mua con giống thật (Sprint 8 chưa làm), test bằng
   * `assignAnimal()` gọi thẳng qua console, giống cách Sprint 7 test phân bón bằng `inventoryManager.addItem()`. */
  animalType: string | null
  lastFedAt: number | null
  /** Mốc bắt đầu chu kỳ sản xuất hiện tại — `null` nghĩa là CHƯA cho ăn từ sau lần thu hoạch gần nhất, chu kỳ
   * chưa chạy (đúng "Done when": bỏ đói thì không sản xuất, nhưng con vật không biến mất/không chết). */
  cycleStartAt: number | null
}

/** Quản lý trạng thái CHO ĂN/SẢN XUẤT của từng chỗ nuôi trong khu đất rào kín (Sprint 8) — tách biệt khỏi rendering,
 * đúng triết lý `FarmManager`. Mô hình đơn giản hoá so với bảng "Chăn nuôi" đầy đủ trong `farming.md` (vốn đòi
 * hỏi cho ăn liên tục MỖI NGÀY THỰC kể cả giữa chu kỳ sản xuất dài như Bò 24h/Cừu 48h): ở đây chỉ cần cho ăn
 * ĐÚNG 1 LẦN để BẮT ĐẦU 1 chu kỳ, chu kỳ tự chạy tới khi đủ giờ rồi tự sẵn sàng thu hoạch — thu hoạch xong phải
 * cho ăn LẠI mới bắt đầu chu kỳ kế tiếp. Vẫn đúng "Done when": cho ăn → sản xuất đúng chu kỳ; bỏ đói (không bao
 * giờ cho ăn) → `cycleStartAt` mãi mãi `null`, không bao giờ có sản phẩm, nhưng con vật không chết/không mất. */
export class AnimalManager {
  private readonly slots: AnimalRuntime[]

  constructor(slotDefs: readonly AnimalPenSlot[]) {
    this.slots = slotDefs.map((def, index) => ({
      id: index,
      penType: def.penType,
      x: def.x,
      y: def.y,
      animalType: null,
      lastFedAt: null,
      cycleStartAt: null
    }))
  }

  getSlots(): readonly AnimalRuntime[] {
    return this.slots
  }

  findNearestOccupiedSlot(x: number, y: number, maxDistance: number): AnimalRuntime | undefined {
    let nearest: AnimalRuntime | undefined
    let nearestDistance = maxDistance
    for (const slot of this.slots) {
      if (slot.animalType === null) continue
      const distance = Math.hypot(slot.x - x, slot.y - y)
      if (distance <= nearestDistance) {
        nearest = slot
        nearestDistance = distance
      }
    }
    return nearest
  }

  /** Gần nhất KHÔNG PHÂN BIỆT trống hay có con — dùng cho con trỏ tương tác/text gợi ý (`GameScene`) để người
   * chơi biết "đứng đây trỏ được vào chuồng" ngay cả khi chỗ đó đang trống (chưa có API mua con giống thật nên
   * cần gợi ý rõ "đứng đây bấm N để thả thử", xem `debugAssignNearestEmptyPen()`). */
  findNearestSlot(x: number, y: number, maxDistance: number): AnimalRuntime | undefined {
    let nearest: AnimalRuntime | undefined
    let nearestDistance = maxDistance
    for (const slot of this.slots) {
      const distance = Math.hypot(slot.x - x, slot.y - y)
      if (distance <= nearestDistance) {
        nearest = slot
        nearestDistance = distance
      }
    }
    return nearest
  }

  /** Gán 1 con vật vào chỗ trống — chỉ dùng để TEST (chưa có shop mua con giống thật). Từ chối nếu sai loại
   * chuồng (`animalType` không khớp `pen_type` của chỗ đó) hoặc chỗ đã có con khác. */
  assignAnimal(slotId: number, animalType: string): boolean {
    const slot = this.slots.find((s) => s.id === slotId)
    if (!slot || slot.animalType !== null) return false
    const def = GameData.animals.find((a) => a.id === animalType)
    if (!def || def.pen_type !== slot.penType) return false
    slot.animalType = animalType
    slot.lastFedAt = null
    slot.cycleStartAt = null
    return true
  }

  /** Cho ăn 1 chỗ — chỉ áp dụng được nếu đang có con vật. Nếu chưa có chu kỳ nào đang chạy (`cycleStartAt ===
   * null`, tức mới nuôi hoặc vừa thu hoạch xong) thì BẮT ĐẦU chu kỳ mới tính từ lúc này; nếu chu kỳ đang chạy
   * rồi thì chỉ cập nhật `lastFedAt` (không có tác dụng rút ngắn chu kỳ). Không tự trừ `animal_feed` trong túi
   * đồ — nơi gọi (GameScene) tự kiểm/trừ TRƯỚC khi gọi hàm này, giống cách `FarmManager.applyFertilizer()`
   * không tự đụng vào inventory. */
  feed(slotId: number, now: number = Date.now()): boolean {
    const slot = this.slots.find((s) => s.id === slotId)
    if (!slot || slot.animalType === null) return false
    if (slot.cycleStartAt === null) slot.cycleStartAt = now
    slot.lastFedAt = now
    return true
  }

  /** `true` nếu chỗ này đã cho ăn trong vòng 24h thực gần nhất — chỉ để HIỂN THỊ (UI biết "đã cho ăn hôm nay"
   * chưa), không quyết định việc sản xuất (xem giải thích mô hình đơn giản hoá ở docstring class). */
  isFed(slot: AnimalRuntime, now: number = Date.now()): boolean {
    return slot.lastFedAt !== null && now - slot.lastFedAt < ONE_DAY_MS
  }

  /** `true` nếu chu kỳ hiện tại đã đủ giờ, sẵn sàng thu hoạch. */
  isProductReady(slot: AnimalRuntime, now: number = Date.now()): boolean {
    if (slot.animalType === null || slot.cycleStartAt === null) return false
    const def = GameData.animals.find((a) => a.id === slot.animalType)
    if (!def) return false
    return now - slot.cycleStartAt >= def.cycle_hours * 3_600_000
  }

  /** Thu hoạch: chỉ thành công nếu `isProductReady()`. Reset cả `cycleStartAt` LẪN `lastFedAt` về `null` — phải
   * cho ăn lại từ đầu mới bắt đầu chu kỳ kế tiếp, đúng tinh thần "cho ăn mỗi chu kỳ" dù không mô phỏng đúng
   * nghĩa đen "mỗi ngày thực" cho chu kỳ dài (Bò/Cừu). */
  collectProduct(slotId: number, now: number = Date.now()): { productItem: string } | null {
    const slot = this.slots.find((s) => s.id === slotId)
    if (!slot || !this.isProductReady(slot, now)) return null
    const def = GameData.animals.find((a) => a.id === slot.animalType)
    if (!def) return null
    slot.cycleStartAt = null
    slot.lastFedAt = null
    return { productItem: def.product_item }
  }

  /** Sprint 8 — chụp lại state để `SaveManager` lưu, giống `FarmManager.serialize()`. */
  serialize(): Array<{
    id: number
    animalType: string | null
    lastFedAt: number | null
    cycleStartAt: number | null
  }> {
    return this.slots.map((s) => ({
      id: s.id,
      animalType: s.animalType,
      lastFedAt: s.lastFedAt,
      cycleStartAt: s.cycleStartAt
    }))
  }

  /** Sprint 8 — áp state đã lưu lên đúng chỗ khớp `id`, giống `FarmManager.loadState()`. */
  loadState(
    saved: readonly {
      id: number
      animalType: string | null
      lastFedAt: number | null
      cycleStartAt: number | null
    }[]
  ): void {
    const savedById = new Map(saved.map((entry) => [entry.id, entry]))
    for (const slot of this.slots) {
      const entry = savedById.get(slot.id)
      if (!entry) continue
      slot.animalType = entry.animalType
      slot.lastFedAt = entry.lastFedAt
      slot.cycleStartAt = entry.cycleStartAt
    }
  }
}
