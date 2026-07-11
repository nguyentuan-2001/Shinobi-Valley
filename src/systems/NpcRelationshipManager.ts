import { GameData } from '../data/DataLoader'
import { NPC_FAVORITE_GIFTS } from '../data/npcGifts'

/** 24 giờ THỰC — "nói chuyện mỗi ngày"/"tặng quà" tính theo giờ THỰC trôi qua (Date.now()), giống hệt quy ước
 * `AnimalManager.isFed()`/`FarmManager` — KHÔNG dùng ngày của `TimeManager` (đồng hồ game gia tốc) vì
 * `TimeManager` là state RIÊNG của từng lần `GameScene.create()` (mất đi khi rời Farm sang scene khác, xem
 * `docs/planning/progress.md` Sprint 10), không có sẵn ở `VillageScene`. Dùng mốc giờ thực tránh phụ thuộc
 * ngược vào 1 scene cụ thể — người chơi rời Farm sang Làng thì `TimeManager` dừng lại (không tick), nhưng giờ
 * thực vẫn trôi bình thường nên mốc "hôm nay đã nói chuyện chưa" vẫn đúng logic dù đi vòng qua nhiều scene. */
const ONE_DAY_MS = 24 * 3_600_000

/** Ngưỡng quan hệ mở khoá giảm giá 5% ở shop — đúng "Done when" Sprint 10, chọn mốc 5 vì `npc.md` cũng dùng
 * ngưỡng "≥5" cho nhiều mốc mở khoá khác của các NPC (Lão Ngư, Nhà Giả Kim, Thầy Dạy Võ). */
const SHOP_DISCOUNT_THRESHOLD = 5
const SHOP_DISCOUNT_RATE = 0.05

const RELATIONSHIP_MAX = 10
const TALK_POINTS = 1
const GIFT_POINTS = 2

export interface NpcRelationshipRuntime {
  npcId: string
  points: number
  lastTalkedAt: number | null
  lastGiftAt: number | null
}

export type GiftResult = 'not_favorite' | 'already_today' | 'success'

/** Quản lý điểm quan hệ 0-10/NPC (Sprint 10) — tách biệt khỏi rendering/dialogue UI, đúng triết lý
 * `FarmManager`/`AnimalManager`. Instance DUY NHẤT dùng chung mọi scene (giống `combatManager`/
 * `inventoryManager`) vì NPC sống ở `VillageScene` nhưng state phải lưu/tải qua `GameScene` (nơi duy nhất gọi
 * `saveGame()`/`loadGame()`, xem Sprint 6). */
export class NpcRelationshipManager {
  private readonly states = new Map<string, NpcRelationshipRuntime>()

  private getOrCreate(npcId: string): NpcRelationshipRuntime {
    let state = this.states.get(npcId)
    if (!state) {
      state = { npcId, points: 0, lastTalkedAt: null, lastGiftAt: null }
      this.states.set(npcId, state)
    }
    return state
  }

  getPoints(npcId: string): number {
    return this.states.get(npcId)?.points ?? 0
  }

  hasTalkedToday(npcId: string, now: number = Date.now()): boolean {
    const state = this.states.get(npcId)
    return state?.lastTalkedAt !== null && state?.lastTalkedAt !== undefined
      ? now - state.lastTalkedAt < ONE_DAY_MS
      : false
  }

  /** Nói chuyện — cộng điểm CHỈ lần đầu trong ngày (giờ thực), gọi lại nhiều lần trong cùng 1 ngày không cộng
   * thêm. Trả `true` nếu vừa cộng điểm (để UI biết mà báo "+1 quan hệ"). */
  talk(npcId: string, now: number = Date.now()): boolean {
    const state = this.getOrCreate(npcId)
    if (state.lastTalkedAt !== null && now - state.lastTalkedAt < ONE_DAY_MS) {
      state.lastTalkedAt = now
      return false
    }
    state.lastTalkedAt = now
    state.points = Math.min(RELATIONSHIP_MAX, state.points + TALK_POINTS)
    return true
  }

  /** Tặng quà — chỉ nhận đúng item trong `NPC_FAVORITE_GIFTS[npcId]`, tối đa 1 lần/ngày (giờ thực, tách biệt
   * mốc với `talk()` — tặng quà và nói chuyện là 2 hành động độc lập trong cùng 1 ngày). KHÔNG tự trừ item khỏi
   * túi đồ (nơi gọi ở `VillageScene` tự trừ TRƯỚC khi gọi hàm này, giống cách `GameScene` tự trừ `animal_feed`
   * trước khi gọi `AnimalManager.feed()`). */
  giveGift(npcId: string, itemId: string, now: number = Date.now()): GiftResult {
    const favorites = NPC_FAVORITE_GIFTS[npcId] ?? []
    if (!favorites.includes(itemId)) return 'not_favorite'

    const state = this.getOrCreate(npcId)
    if (state.lastGiftAt !== null && now - state.lastGiftAt < ONE_DAY_MS) return 'already_today'

    state.lastGiftAt = now
    state.points = Math.min(RELATIONSHIP_MAX, state.points + GIFT_POINTS)
    return 'success'
  }

  /** `true` nếu quan hệ đủ cao để hưởng giảm giá 5% ở shop NPC này (Sprint 10 "Done when"). */
  hasShopDiscount(npcId: string): boolean {
    return this.getPoints(npcId) >= SHOP_DISCOUNT_THRESHOLD
  }

  /** Áp giảm giá (nếu đủ điều kiện) vào 1 mức giá gốc, làm tròn xuống — dùng cho cả mua (giá phải trả ít hơn)
   * lẫn bán (giá nhận được KHÔNG đổi, discount chỉ áp cho chiều mua theo đúng "Done when": "giảm giá 5% khi
   * quan hệ cao" chỉ nói tới mua, không nói bán được giá tốt hơn). */
  applyDiscount(npcId: string, price: number): number {
    if (!this.hasShopDiscount(npcId)) return price
    return Math.floor(price * (1 - SHOP_DISCOUNT_RATE))
  }

  /** Sprint 10 — chụp lại state để `SaveManager` lưu, giống `AnimalManager.serialize()`. Chỉ lưu NPC nào đã có
   * tương tác (đã nói chuyện/tặng quà ít nhất 1 lần) — NPC chưa từng gặp thì không cần chiếm chỗ trong save. */
  serialize(): NpcRelationshipRuntime[] {
    return [...this.states.values()].map((s) => ({ ...s }))
  }

  /** Sprint 10 — áp state đã lưu, giống `AnimalManager.loadState()`. Chỉ nạp NPC có thật trong `npc.json` (bỏ
   * qua id lạ nếu save cũ từ 1 phiên bản data khác). `saved` có thể là `undefined` — save cũ lưu TRƯỚC khi
   * field `npc_relationships` tồn tại trong `SaveState` (bug thật gặp lúc verify: `JSON.parse()` từ
   * `localStorage` không tự thêm field thiếu, TypeScript không kiểm tra được lúc runtime) — coi như mảng rỗng,
   * không throw. */
  loadState(saved: readonly NpcRelationshipRuntime[] | undefined): void {
    this.states.clear()
    if (!saved) return
    for (const entry of saved) {
      if (!GameData.npcs.some((n) => n.id === entry.npcId)) continue
      this.states.set(entry.npcId, { ...entry })
    }
  }
}

/** Instance DUY NHẤT dùng chung mọi scene — xem docstring class phía trên. */
export const npcRelationshipManager = new NpcRelationshipManager()
