/** Quà yêu thích theo đúng bảng "Hệ thống Quan Hệ NPC" trong `docs/world/npc.md` — CHỈ liệt kê item nào ĐÃ THẬT
 * SỰ có trong game (`crops.json`/`items.json`), lược bỏ item chưa tồn tại (vd "Trà xanh pha"/"Nhân sâm hầm" là
 * đồ chế biến — chưa có hệ crafting theo trạm Sprint 14; "Wolf Fur"/"Boss Core" — chưa có quái Sói/Boss nào rớt
 * đồ đó; "Crystal"/"Spider Silk"/"Đá cường hóa" — chưa có Hang Động Sprint 12/hệ cường hóa). 2 NPC (`alchemist`,
 * `dojo_master`) vì vậy tạm thời KHÔNG có quà nào tặng được — mảng rỗng, không phải lỗi thiếu sót. Bổ sung tiếp
 * khi các hệ thống liên quan được code. */
export const NPC_FAVORITE_GIFTS: Record<string, string[]> = {
  village_chief: ['red_ginseng'],
  seed_seller: ['carrot'],
  blacksmith: ['iron_ore'],
  alchemist: [],
  dojo_master: [],
  fisherman: ['salmon', 'squid'],
  merchant: [],
  scholar: [],
  general_shop: [],
  gacha_keeper: []
}
