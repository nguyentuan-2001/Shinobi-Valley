import { GameData } from '../data/DataLoader'
import { inventoryManager } from './InventoryManager'

export interface ShopCatalogEntry {
  itemId: string
  name: string
  price: number
}

/** Cửa hàng hạt giống (Cô Nông Lan) — lấy thẳng TOÀN BỘ hạt trong `crops.json` có `seed_cost > 0` (4 cây
 * `seed_cost: 0` là hàng chỉ rớt từ Boss/Dungeon theo `docs/gameplay/economy.md`, không bán ở shop — lọc bằng
 * đúng field có sẵn, không cần thêm cờ "purchasable" riêng). Không lọc theo `unlock_level` — đúng tinh thần
 * "chưa có cơ chế chặn theo cấp độ thật" đã áp dụng cho menu hạt giống ở `GameScene.getCompatibleCropIds()`. */
function getSeedCatalog(): ShopCatalogEntry[] {
  return GameData.crops
    .filter((c) => c.seed_cost > 0)
    .map((c) => ({ itemId: c.id, name: c.name, price: c.seed_cost }))
}

/** Cửa hàng vũ khí (Thợ Rèn Kim) — lấy vũ khí trong `weapons.json` có `buy_price` (khác `null`/`undefined`,
 * dành cho vũ khí Epic+ chỉ chế tạo được — chưa có hệ crafting theo trạm Sprint 14). Hiện chỉ có đúng 1 vũ khí
 * (`iron_sword`) vì Sprint 11 (4 hệ vũ khí còn lại) chưa làm — shop sẽ tự đầy thêm khi `weapons.json` có thêm
 * entry, không cần sửa gì ở đây. */
function getWeaponCatalog(): ShopCatalogEntry[] {
  return GameData.weapons
    .filter((w) => typeof w.buy_price === 'number')
    .map((w) => ({ itemId: w.id, name: w.name, price: w.buy_price as number }))
}

/** Danh mục MUA của 1 NPC theo `shop_type` — trả mảng rỗng nếu NPC không có shop hoặc `shop_type` chưa có
 * catalog thật (vd `"sell_all"` của Người Thu Mua không bán gì, chỉ MUA — xem `getSellableInventory()`). */
export function getBuyCatalog(shopType: string | null): ShopCatalogEntry[] {
  if (shopType === 'seed') return getSeedCatalog()
  if (shopType === 'weapon') return getWeaponCatalog()
  return []
}

/** Tra giá bán 1 item — kiểm `items.json` (đồ chăn nuôi/cá) trước, không có thì kiểm `crops.json` (nông sản).
 * Trả `null` nếu không tra được (không nên xảy ra với đồ trong túi hợp lệ, nhưng vẫn phòng hờ). */
export function resolveSellPrice(itemId: string): number | null {
  const item = GameData.items.find((i) => i.id === itemId)
  if (item) return item.sell_price
  const crop = GameData.crops.find((c) => c.id === itemId)
  if (crop) return crop.sell_price
  return null
}

/** Danh mục BÁN động của Người Thu Mua (`shop_type: "sell_all"`) — TOÀN BỘ item đang có trong túi đồ mà tra
 * được giá bán, không phải danh sách cố định (đúng "mua nông sản, nguyên liệu, drop quái" — chấp nhận bất kỳ
 * thứ gì bán được, không giới hạn loại). */
export function getSellableInventory(): ShopCatalogEntry[] {
  const catalog: ShopCatalogEntry[] = []
  for (const slot of inventoryManager.getSlots()) {
    const price = resolveSellPrice(slot.itemId)
    if (price === null) continue
    const item = GameData.items.find((i) => i.id === slot.itemId)
    const crop = GameData.crops.find((c) => c.id === slot.itemId)
    catalog.push({ itemId: slot.itemId, name: item?.name ?? crop?.name ?? slot.itemId, price })
  }
  return catalog
}
