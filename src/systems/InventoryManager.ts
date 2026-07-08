import { GameData } from '../data/DataLoader'

/** 1 ô trong túi đồ — luôn chứa 1 loại item, số lượng không bao giờ vượt `getStackMax(itemId)`. */
export interface InventorySlot {
  itemId: string
  quantity: number
}

/** Chưa có entry `Item` cho nông sản trong `items.json` (mới chỉ có 1 item mẫu) — dùng số này làm mặc định cho
 * bất kỳ itemId nào không tra được `stack_max` thật (nông sản thu hoạch, vật phẩm chưa định nghĩa...). */
const DEFAULT_STACK_MAX = 99

/** Quản lý túi đồ của người chơi — cấu trúc dạng danh sách ô (không giới hạn số ô ở V1, UI tự cuộn/hiện theo
 * lưới cố định, xem `GameScene`). Tách biệt khỏi rendering, giống triết lý `FarmManager`. Sprint 5: túi đồ phải
 * là 1 instance DUY NHẤT dùng chung mọi scene (giống `CombatManager`) — quái ở `GrasslandScene` rớt đồ phải
 * cộng vào ĐÚNG túi đồ đang dùng ở Farm, không phải 1 túi rỗng mới tạo riêng cho scene đó. */
export class InventoryManager {
  private readonly slots: InventorySlot[] = []

  getSlots(): readonly InventorySlot[] {
    return this.slots
  }

  /** Tra `stack_max` thật từ `items.json` nếu có entry khớp id; nông sản/vật phẩm chưa có entry thì dùng mặc
   * định — không chặn cộng đồ vào túi chỉ vì thiếu data item, vì crop.json không tự có field này. */
  getStackMax(itemId: string): number {
    const item = GameData.items.find((i) => i.id === itemId)
    return item?.stack_max ?? DEFAULT_STACK_MAX
  }

  /** Cộng `quantity` item vào túi — lấp đầy các stack đang có chỗ trống trước (đúng cùng itemId, chưa đầy),
   * hết chỗ mới tạo stack mới. Không có giới hạn tổng số ô ở V1 (chưa cần — sẽ thêm khi có lý do gameplay thật
   * đòi hỏi, ví dụ giới hạn túi đồ mua mở rộng). */
  addItem(itemId: string, quantity: number): void {
    if (quantity <= 0) return
    const stackMax = this.getStackMax(itemId)
    let remaining = quantity

    for (const slot of this.slots) {
      if (remaining <= 0) return
      if (slot.itemId !== itemId || slot.quantity >= stackMax) continue
      const space = stackMax - slot.quantity
      const add = Math.min(space, remaining)
      slot.quantity += add
      remaining -= add
    }

    while (remaining > 0) {
      const add = Math.min(stackMax, remaining)
      this.slots.push({ itemId, quantity: add })
      remaining -= add
    }
  }
}

/** Instance DUY NHẤT dùng chung mọi scene — xem docstring class phía trên. */
export const inventoryManager = new InventoryManager()
