/** Vị trí 10 NPC chính trên Map 0 — Làng Ẩn Nhân (Sprint 10), xem `docs/world/npc.md`/`docs/world/maps.md`.
 * Bố cục đơn giản 2 hàng 5 cột (chưa có bản đồ làng thật — `art-refs/` chưa có prompt riêng cho Map 0, đang vẽ
 * nền bằng code y hệt cách `TrainingGroundScene` làm với Bãi Tập Luyện). `buildingLabel` lấy từ cột "Vị trí"
 * trong `npc.md`, chỉ để hiển thị cho có ngữ cảnh — không phải toạ độ building thật nào. */
export interface NpcPlacement {
  npcId: string
  x: number
  y: number
  buildingLabel: string
  /** Màu placeholder (hex số) — mỗi NPC 1 màu riêng để phân biệt khi chưa có sprite thật. */
  color: number
}

export const NPC_PLACEMENTS: NpcPlacement[] = [
  { npcId: 'village_chief', x: 150, y: 170, buildingLabel: 'Nhà Trưởng Làng', color: 0x8b5a2b },
  { npcId: 'seed_seller', x: 300, y: 170, buildingLabel: 'Cửa Hàng Hạt Giống', color: 0x4caf50 },
  { npcId: 'blacksmith', x: 450, y: 170, buildingLabel: 'Lò Rèn', color: 0xb0413e },
  { npcId: 'alchemist', x: 600, y: 170, buildingLabel: 'Nhà Giả Kim', color: 0x7e57c2 },
  { npcId: 'dojo_master', x: 750, y: 170, buildingLabel: 'Võ Đường', color: 0xe0a11e },
  { npcId: 'fisherman', x: 150, y: 430, buildingLabel: 'Bến Câu Cá', color: 0x2e93c7 },
  { npcId: 'merchant', x: 300, y: 430, buildingLabel: 'Chợ Làng', color: 0xd48a3a },
  { npcId: 'scholar', x: 450, y: 430, buildingLabel: 'Thư Viện', color: 0x5c6bc0 },
  { npcId: 'general_shop', x: 600, y: 430, buildingLabel: 'Tạp Hóa', color: 0xef6c9e },
  { npcId: 'gacha_keeper', x: 750, y: 430, buildingLabel: 'Nhà Gacha', color: 0xffca28 }
]
