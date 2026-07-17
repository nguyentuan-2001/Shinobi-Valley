# Asset Manifest — Id & Tên File

Bảng tra cứu **id chuẩn + tên file** cho từng asset được mô tả trong `art-refs/`. Dùng file này để biết đặt tên gì khi gen ảnh xong.

**Quy tắc:**
- `id` = snake_case tiếng Anh, sẽ dùng lại trong các file JSON ở `docs/data/data-schema.md` (crops.json, items.json, weapons.json...) — đặt tên ảnh đúng theo `id` để sau này nối vào JSON không phải đổi tên lại.
- Tên file ảnh = `<id>.png` (trừ khi ghi chú khác, ví dụ seed vs harvest).
- Thư mục đích = theo cấu trúc đã tạo ở `public/assets/`.
- Cột **Nguồn prompt** trỏ tới đúng mục trong `art-refs/` để lấy prompt gen ảnh.

---

## 1. Player (`public/assets/sprites/player/<gender>/`)

Nguồn: `art-refs/characters/player.md`. Game có 2 giới tính chọn lúc tạo nhân vật (`gender` field, xem `data-schema.md`) — **mọi asset player đều tách theo `men/` và `women/`**, cùng id, chỉ khác thư mục.

### Nhân vật gốc — đã cắt xong (từ `public/images/Characters/men.png` + `women.png`)

Mỗi action lưu **từng frame riêng** (`<action>_<số>.png`) + 1 bản ghép sẵn Phaser-ready (`<action>_strip.png`, đã pad cùng cell size, canh đáy).

**Chuẩn mới: 8 frame/hành động/hướng** (xem "Nguyên tắc gen 1 bộ animation" ở đầu `art-refs/characters/player.md`). **`women` đã gen lại đủ 8 frame cho toàn bộ 5 hành động** (idle_front, walk_front, walk_back, walk_side, attack) theo chuẩn mới — animation mượt, không còn lệch hướng/biên độ/mũ giáp/biểu cảm xấu. **`men` vẫn còn bộ cũ** (7/3/3/3/4 frame, kích thước 164×213/frame), code đang dùng tạm 2/3 frame hợp lệ cho men (bỏ frame lỗi) — cần gen lại đủ 8 frame cho men theo đúng prompt mới khi có thời gian. **Gameplay mặc định hiện dùng `women`** (`GameScene.ts`) vì asset mượt hơn hẳn.

| Action | `women` (đã xong) | `men` (chưa cập nhật) |
|---|---|---|
| `idle_front` | 8 frame, 162×334 | 7 frame cũ, 164×213 |
| `walk_back` | 8 frame, 162×334 | 3 frame cũ (dùng tạm frame 2,3), 164×213 |
| `walk_front` | 8 frame, 162×334 | 3 frame cũ (dùng tạm frame 1,3), 164×213 |
| `walk_side` | 8 frame, 162×334 (hướng phải — trái dùng `flipX`) | 3 frame cũ (dùng tạm frame 1,3), 164×213 |
| `attack` | 8 frame, 170×335 (chỉ hướng trước) | 4 frame cũ, 164×213 |

Tên file không đổi: `<action>_01..08.png` (hoặc `_01..04` cho attack) + `<action>_strip.png`. Nguồn gốc `women` 8-frame: `public/images/Characters/Women/none-bg/women-{dung-yen,huong-truoc,huong-sau,nghiêng-phai}.png` (đã xóa nền sẵn), cắt theo cell 176px/frame, crop về 162×334.

**Còn thiếu (chưa gen):** `idle_back`, `idle_left`, `idle_right` (hiện chỉ có idle hướng trước), `attack_back`, `attack_side` (hiện chỉ có attack hướng trước) — cả 2 giới tính. Có thể tạm dùng frame đầu của walk cùng hướng làm idle thay thế, hoặc dùng chung `attack_front` cho mọi hướng ở bản Alpha — xem prompt cần gen thêm ở `art-refs/characters/player.md`.

### Theo hệ vũ khí (chưa gen — cần theo đúng prompt Nam/Nữ mới trong player.md)

| id | Diễn giải | File |
|---|---|---|
| `sword_base` / `sword_elite` | Kiếm sĩ Lv1-30 / Lv60-90 | `player/men/sword_base.png`, `player/women/sword_base.png` (tương tự `_elite`) |
| `dual_base` / `dual_elite` | Song kiếm sĩ | như trên |
| `spear_base` / `spear_elite` | Thương sĩ | như trên |
| `bow_base` / `bow_elite` | Cung thủ | như trên |
| `ninja_base` / `ninja_elite` | Ninja (phi tiêu) | như trên |
| `portrait_normal/determined/surprised/happy/hurt` | Biểu cảm dialogue | `player/men/portrait_<tên>.png`, `player/women/portrait_<tên>.png` |

`spritesheet_4x4` (bố cục gộp cũ) không cần nữa — đã có cấu trúc frame-rời + strip chi tiết hơn ở trên.

---

## 2. NPC (`public/assets/sprites/npcs/`)

Nguồn: `art-refs/characters/npcs.md`

| id | NPC |
|---|---|
| `village_chief` | Trưởng Làng |
| `seed_seller` | Người Bán Hạt Giống |
| `general_shop` | Chủ Cửa Hàng |
| `blacksmith` | Thợ Rèn |
| `alchemist` | Nhà Giả Kim |
| `fisherman` | Người Câu Cá |
| `merchant` | Người Thu Mua |
| `dojo_master` | Giáo Viên Võ Thuật |
| `scholar` | Nhà Nghiên Cứu |
| `gacha_keeper` | Cô Gái Gacha |

File: `<id>.png`. Khớp field `id` trong `public/data/npc.json` thật (5 id trước đây ghi theo tên đoán từ `data-schema.md` — lệch với id thật đã dùng lúc code Sprint 10: `seed_merchant`→`seed_seller`, `shopkeeper`→`general_shop`, `item_buyer`→`merchant`, `martial_arts_teacher`→`dojo_master`, `researcher`→`scholar`).

**NPC cốt truyện** (không có shop/quest cố định, không nằm trong `npc.json`): `linh` (Thiếu Nữ Rừng) — xem `art-refs/characters/npcs.md` mục "NPC Cốt Truyện". Hoàng (bị Ma Khí kiểm soát) KHÔNG phải NPC, xem mục 6 (Quái vật & Boss).

---

## 3. Vũ khí (`public/assets/sprites/weapons/`)

Nguồn: `art-refs/combat/weapons.md`

| id | Vũ khí |
|---|---|
| `sword` | Kiếm (Katana) |
| `dual_swords` | Song Kiếm |
| `spear` | Giáo |
| `bow` | Cung |
| `shuriken` | Phi Tiêu |

Ghi chú: đây là icon **base weapon_class**. Vũ khí cụ thể theo rank/tên riêng trong `weapons.json` (ví dụ `iron_sword`) có thể tái dùng icon này hoặc gen icon riêng nếu muốn khác biệt theo rank.

---

## 4. Trang bị (`public/assets/sprites/equipment/`)

Nguồn: `art-refs/combat/equipment.md`. Đặt tên `<slot>_<rank>.png`.

| Slot | common | rare | epic | legendary | mythic |
|---|---|---|---|---|---|
| Helmet | `helmet_common` | `helmet_rare` | `helmet_epic` | `helmet_legendary` | `helmet_mythic` |
| Chest | `chest_common` | `chest_rare` | `chest_epic` | `chest_legendary` | `chest_mythic` |
| Gloves | — | `gloves_rare` | `gloves_epic` | `gloves_legendary` | — |
| Boots | — | `boots_rare` | `boots_epic` | `boots_legendary` | — |

Phụ kiện (accessories, mỗi cái 1 rank riêng theo art-refs):

| id | Tên | Rank |
|---|---|---|
| `accessory_gem_necklace` | Vòng Cổ Đá Quý | Rare |
| `accessory_warrior_ring` | Nhẫn Chiến Binh | Epic |
| `accessory_dragon_amulet` | Bùa Rồng | Legendary |
| `accessory_void_ring` | Nhẫn Hư Vô | Mythic |

Đá cường hóa (trùng với `materials`, chỉ cần 1 bản, để ở `materials/`):
`enhancement_stone_common`, `enhancement_stone_rare`, `enhancement_stone_legendary`.

---

## 5. Skill icon + effect (`public/assets/sprites/skills/`)

Nguồn: `art-refs/combat/skills.md`. Mỗi skill có 2 file: `<id>_icon.png` và `<id>_effect.png`. Id pattern: `<class>_<số thứ tự 2 chữ số>` — khớp `skill_index` trong `skills.json`.

**class code:** `sword`, `dual`, `spear`, `bow`, `ninja`

### Hệ Kiếm Sĩ (`sword_01` → `sword_10`)
| # | Tên chiêu | id |
|---|---|---|
| 1 | Chém Nhanh | `sword_01` |
| 2 | Chém Xoáy | `sword_02` |
| 3 | Kiếm Khí | `sword_03` |
| 4 | Đâm Xuyên | `sword_04` |
| 5 | Tam Liên Chém | `sword_05` |
| 6 | Vũ Kiếm | `sword_06` |
| 7 | Bão Kiếm | `sword_07` |
| 8 | Hào Quang Kiếm | `sword_08` |
| 9 | Thiên Sát Kiếm | `sword_09` |
| 10 | Vô Ảnh Kiếm (Ultimate) | `sword_10` |

### Hệ Song Kiếm (`dual_01` → `dual_10`)
| # | Tên chiêu | id |
|---|---|---|
| 1 | Chém Kép | `dual_01` |
| 2 | Liên Hoàn Chém | `dual_02` |
| 3 | Xoáy Lốc | `dual_03` |
| 4 | Song Long Xuất Hải | `dual_04` |
| 5 | Vũ Điệu Lưỡi Dao | `dual_05` |
| 6 | Huyết Kiếm | `dual_06` |
| 7 | Bão Song Kiếm | `dual_07` |
| 8 | Ảo Ảnh | `dual_08` |
| 9 | Song Long Phá Thiên | `dual_09` |
| 10 | Thiên Địa Song Kiếm (Ultimate) | `dual_10` |

### Hệ Thương Sĩ (`spear_01` → `spear_10`)
| # | Tên chiêu | id |
|---|---|---|
| 1 | Đâm Thẳng | `spear_01` |
| 2 | Quét Ngang | `spear_02` |
| 3 | Long Thương | `spear_03` |
| 4 | Đâm Xoáy | `spear_04` |
| 5 | Thương Vũ | `spear_05` |
| 6 | Phá Giáp | `spear_06` |
| 7 | Long Quyển Phong | `spear_07` |
| 8 | Thiên Hà Thương | `spear_08` |
| 9 | Rồng Giáng Thế | `spear_09` |
| 10 | Vạn Lý Thương Pháp (Ultimate) | `spear_10` |

### Hệ Cung Thủ (`bow_01` → `bow_10`)
| # | Tên chiêu | id |
|---|---|---|
| 1 | Bắn Thẳng | `bow_01` |
| 2 | Bắn Xuyên | `bow_02` |
| 3 | Mưa Tên | `bow_03` |
| 4 | Liên Hoàn Tiễn | `bow_04` |
| 5 | Tên Bùng Nổ | `bow_05` |
| 6 | Tên Lửa | `bow_06` |
| 7 | Phong Tiễn | `bow_07` |
| 8 | Xạ Điêu Thủ | `bow_08` |
| 9 | Vạn Tiễn Quy Tông | `bow_09` |
| 10 | Thánh Cung Tiễn (Ultimate) | `bow_10` |

### Hệ Ninja (`ninja_01` → `ninja_10`)
| # | Tên chiêu | id |
|---|---|---|
| 1 | Phi Tiêu | `ninja_01` |
| 2 | Phi Tiêu Kép | `ninja_02` |
| 3 | Phân Thân | `ninja_03` |
| 4 | Dịch Chuyển | `ninja_04` |
| 5 | Độc Tiêu | `ninja_05` |
| 6 | Bóng Tối | `ninja_06` |
| 7 | Liên Hoàn Phi Tiêu | `ninja_07` |
| 8 | Phân Thân Đại Chiến | `ninja_08` |
| 9 | Ám Sát | `ninja_09` |
| 10 | Vô Ảnh Sát (Ultimate) | `ninja_10` |

V1 chỉ cần skill 01→06 mỗi hệ (theo `v1-scope.md`), 07→10 làm sau.

---

## 6. Quái vật & Boss (`public/assets/sprites/monsters/` + `public/assets/sprites/bosses/`)

Nguồn: `art-refs/enemies/monsters.md`. Mini-boss và Boss cuối → thư mục `bosses/`.

| Map | Quái thường (`monsters/`) | Mini-boss (`bosses/`, 64×64) |
|---|---|---|
| Map 2 — Đồng Cỏ | `wild_rabbit`, `fire_fox`, `wild_boar`, `grass_wolf` | `giant_wolf` |
| Map 3 — Rừng Tre | `black_wolf`, `bamboo_bear`, `small_spider`, `lynx_spirit` | `great_bamboo_bear` |
| Map 4 — Hang Động | `poison_spider`, `skeleton_warrior`, `stone_golem`, `vampire_bat` | `crystal_golem` |
| Map 5 — Núi Tuyết | `ice_wolf`, `ice_spirit`, `small_ice_dragon`, `snowman_monster` | `great_ice_spirit` |
| Map 6 — Rừng Thiêng | `spirit_fox`, `night_ghost_moth`, `corrupted_beast`, `monster_tree` | `corrupted_beast_leader` |
| Map 7 — Rừng Cổ | `small_ancient_dragon`, `enraged_spirit_kin`, `ancient_stone_person`, `death_wraith` | `ancient_dragon_guardian` |

Quái cốt truyện đặc biệt (không lặp lại, không phải mini-boss): `hoang_corrupted` (Hoàng bị Ma Khí kiểm soát, Map 6) — xem `art-refs/enemies/monsters.md`.

Boss cuối (`bosses/`, 128×128, 3 file riêng theo phase — **Linh Thụ Ma Hóa**, KHÔNG phải rồng):
`corrupted_tree_phase1.png`, `corrupted_tree_phase2.png`, `corrupted_tree_phase3.png`

---

## 7. Cây trồng (`public/assets/sprites/crops/`)

Nguồn: `art-refs/items/crops.md`. Mỗi cây **5 file** — khớp đúng cách `FarmManager.getVisualStage()` + `PreloadScene.ts` đang load (`crop_<id>_seed/_sprout/_growing/_harvest`):

| File | Ý nghĩa | Có đất/nước? |
|---|---|---|
| `<id>_seed.png` | Hạt giống mới trồng (0–33% `growth_hours`) | Có (mô đất) |
| `<id>_sprout.png` | Nảy mầm (33–66%) | Có (cùng mô đất) |
| `<id>_growing.png` | Đang lớn (66–100%) | Có (cùng mô đất) |
| `<id>_harvest.png` | **Chín/Thu hoạch** — hiện trên ô đất khi đủ `growth_hours` (`_harvest`), cây vẫn gắn trên mô đất | Có (cùng mô đất) |
| `<id>.png` | **Item icon** — hiển thị khi đã hái vào inventory/UI (chưa preload ở `PreloadScene.ts`, để dành Sprint 4), khớp `id` trong `crops.json` | Không |

| Tier | id |
|---|---|
| Cơ Bản | `carrot`, `potato`, `cabbage`, `green_onion`, `pumpkin` |
| Trung Cấp | `strawberry`, `tomato`, `watermelon`, `corn`, `mushroom` |
| Cao Cấp | `green_tea`, `ginseng`, `lotus`, `red_ginseng`, `medicinal_herb` |
| Hiếm | `moonlight_flower`, `sunflower`, `spirit_energy_plant`, `ancient_seed`, `natures_essence` |

**⚠️ Đã xong 4/5 file cho 20/20 cây = 80 file** (`seed/sprout/growing` + item icon `<id>.png`, cắt từ `basic/intermediate/high.png` + `-1`). **Còn thiếu `<id>_harvest.png` cho toàn bộ 20 cây** — giai đoạn Harvest mới tách riêng khỏi item icon (trước đây dùng chung 1 file `_ready`, nay đổi lại thành file riêng theo yêu cầu), prompt đã có sẵn trong `art-refs/items/crops.md`. Code (`FarmManager.ts`/`PreloadScene.ts`) đã trỏ sẵn tới `_harvest.png` — **cho tới khi gen xong, ô đất cây chín trên map sẽ hiện ảnh lỗi/thiếu**.

V1 chỉ cần 14 cây đầu (Cơ Bản + Trung Cấp + Cao Cấp) nhưng tier Hiếm cũng đã có sẵn đủ, dùng được ngay khi làm V2.

---

## 8. Chăn nuôi & sản phẩm (`public/assets/sprites/livestock/`)

Nguồn: `art-refs/items/livestock.md`

| id | Loại |
|---|---|
| `chicken`, `duck`, `cow`, `sheep` | Động vật |
| `egg`, `golden_egg`, `milk`, `wool` | Sản phẩm |

---

## 9. Cá (`public/assets/sprites/fish/`)

Nguồn: `art-refs/items/fish.md`

| Độ hiếm | id |
|---|---|
| Common | `crucian_carp`, `perch`, `carp` |
| Rare | `trout`, `goldfish_large`, `eel` |
| Epic | `swordfish`, `arowana`, `butterfly_fish` |
| Legendary | `golden_dragon_fish`, `moonfish`, `fairy_fish` |

---

## 10. Nông cụ (`public/assets/sprites/tools/`)

Nguồn: `art-refs/items/tools.md`

| id | Công cụ |
|---|---|
| `hoe_wood`, `hoe_iron`, `hoe_gold` | Cuốc |
| `axe_wood`, `axe_iron` | Rìu |
| `watering_can_basic`, `watering_can_enchanted` | Bình tưới |
| `sickle_basic`, `scythe_upgraded` | Liềm / Lưỡi hái |
| `fishing_rod_bamboo`, `fishing_rod_upgraded`, `fishing_rod_legendary` | Cần câu |
| `forge_hammer` | Búa rèn |
| `seed_bag_common`, `seed_bag_rare`, `seed_bag_legendary` | Túi hạt giống |
| `fertilizer_basic`, `fertilizer_magic`, `pesticide` | Phân bón / thuốc trừ sâu |

---

## 11. Vật phẩm tiêu thụ (`public/assets/sprites/consumables/`)

Nguồn: `art-refs/items/consumables.md`

| id | Vật phẩm |
|---|---|
| `potion_hp_small/medium/large` | Thuốc hồi máu |
| `potion_mp_small/medium/large` | Thuốc hồi mana |
| `antidote` | Thuốc giải độc |
| `elixir_full_restore` | Hồi đầy HP+MP |
| `food_rice`, `food_fried_rice`, `food_grilled_meat`, `food_herb_soup`, `food_sweet_cake` | Thức ăn |
| `buff_wolf_meat`, `buff_milk`, `buff_green_tea`, `buff_ginseng_stew`, `buff_speed_potion`, `buff_power_potion` | Buff food/potion |
| `scroll_town_portal` | Cuộn hồi phố |
| `lantern` | Đèn lồng (mang theo) |
| `trap_monster` | Bẫy quái |
| `ticket_event` | Vé sự kiện |

---

## 12. Nguyên liệu chế tạo (`public/assets/sprites/materials/`)

Nguồn: `art-refs/items/materials.md`

| id | Nhóm |
|---|---|
| `ore_iron`, `crystal`, `coal`, `ore_gold`, `moonstone` | Khoáng sản |
| `wood`, `bamboo`, `wood_ancient` | Gỗ |
| `monster_core`, `wolf_fur`, `bone_fragment`, `spider_silk`, `dragon_scale`, `boss_core` | Drop quái |
| `herb`, `poison_sac` | Dược liệu (mushroom dùng chung `crops/mushroom.png`) |
| `enhancement_stone_common/rare/epic/legendary`, `enhancement_scroll` | Cường hóa |
| `key_fragment`, `ancient_relic`, `leather`, `lore_fragment` | Đặc biệt (`lore_fragment` dùng chung 1 sprite cho cả 10 mảnh ký ức, xem `docs/design/story.md`) |

---

## 13. Tiền tệ (`public/assets/sprites/currency/`)

Nguồn: `art-refs/items/currency.md`

| id | Loại |
|---|---|
| `copper_coin`, `copper_coin_stack`, `copper_pouch` | Đồng |
| `silver_coin`, `silver_coin_stack`, `silver_pouch` | Bạc |
| `gold_coin`, `gold_coin_stack`, `gold_pouch`, `gold_gem` | Vàng |
| `hud_copper`, `hud_silver`, `hud_gold` | Icon HUD nhỏ (16-20px) |

---

## 14. UI (`public/assets/ui/`)

Nguồn: `art-refs/ui/ui.md`

**`ui/hud/`:** `bar_hp`, `bar_mp`, `bar_exp`, `icon_heart`, `icon_mana_crystal`, `icon_star_exp`

**`ui/icons/`** (menu icon): `menu_inventory`, `menu_quest`, `menu_map`, `menu_shop`, `menu_settings`, `menu_bag`, `menu_mail`, `menu_skill`, `menu_gacha`, `menu_craft`, `menu_pet`, `menu_friend`, `menu_leaderboard`, `menu_event`, `menu_close`

**`ui/icons/`** (status buff/debuff, 16×16): `status_poison`, `status_bleed`, `status_slow`, `status_stun`, `status_atk_buff`, `status_def_buff`, `status_atk_debuff`, `status_def_debuff`

**`ui/frames/`:** `dialogue_box`, `item_slot`, `skill_slot`, `button_confirm`, `button_cancel`, `quality_frame_common`, `quality_frame_rare`, `quality_frame_epic`, `quality_frame_legendary`, `quality_frame_mythic`, `menu_panel` (khung bảng menu chính, dùng chung cho mọi menu mở ra kể cả Quest Log), `minimap_frame`

**`ui/icons/`** (nghề nghiệp, 32×32): `profession_farmer`, `profession_blacksmith`, `profession_hunter`, `profession_chef`, `profession_fisherman`, `profession_alchemist`

**`ui/icons/`**: `quest_marker` (world marker, 24×24)

**`ui/gacha/`:** `banner_standard`, `banner_premium`, `reveal_burst`

---

## 15. Buildings (`public/assets/sprites/buildings/`)

Nguồn: `art-refs/world/buildings.md`

| id | Công trình |
|---|---|
| `player_house_1/2/3` | Nhà chính người chơi (3 cấp) |
| `shop_general`, `shop_seed` | Cửa hàng tổng hợp / hạt giống |
| `blacksmith_forge`, `alchemist_shop`, `market_stall` | Lò rèn / giả kim / chợ |
| `chicken_coop`, `barn`, `storage_shed`, `greenhouse`, `village_well` | Công trình nông trại — `village_well` đã đặt lên map Farm thật (`data/wellPlacement.ts`, tự động tưới 3×3 xung quanh mỗi sáng, xem `progress.md` Sprint 4), hiện dùng texture vẽ bằng code tạm vì chưa gen ảnh thật |
| `chief_house`, `notice_board`, `dojo`, `research_hall` | Công trình công cộng |
| `fishing_dock` | Bến Câu Cá |
| `village_square`, `ancient_tree_memorial` | Quảng Trường Làng, Linh Thụ Cổ Đại (chưa tha hóa — bản tha hóa là boss cuối, xem mục 6) |
| `east_gate_sealed`, `boss_gate` | Cổng (đổi tên từ `village_gate` — cổng làng thật là cổng bị phong ấn, không phải cổng chào) |

---

## 16. Decorations (`public/assets/sprites/decorations/`)

Nguồn: `art-refs/world/decorations.md` + prop cắt ra từ `public/images/BaseMap/*.png` (xem mục 17). **Đã có** — rất nhiều, liệt kê theo map nguồn:

**Từ ảnh Gemini gen riêng ban đầu:** `rock_small/medium/large`, `grass_tuft_a/b/c/d`, `fence_single`, `fence_long_a/b`, `bamboo_pole`, `tree_stump_a/b/c/d/e`.

**Từ `BaseMap/Grassland.png`:** `grass_tuft_tall_a..h`, `tree_stump_round_a..f`, `rock_cluster_a..e`, `rock_round_single`, `grass_mound_a/b/c`, `fence_straight_a/b`, `fence_gate`, `fence_short`, `fence_long`, `bamboo_pole_a/b/c`. (Lưu ý: trùng vai trò với batch Gemini ở trên — 2 bộ khác style, giữ cả 2 để đa dạng, có thể xóa bớt 1 bộ nếu muốn đồng bộ style tuyệt đối.)

**Từ `BaseMap/Bamboo-Forest.png`:** `bamboo_stalk_cluster_a/b/c`, `bamboo_stalk_thin_a/b/c`, `bamboo_stalk_single_a/b`, `bamboo_log_a/b`, `bamboo_log_mossy_a..d`, `bamboo_leaf_pile_a/b`, `bush_moss_a/b`, `stone_lantern_a/b`, `spider_web_a/b`, `stone_marker_a/b/c/d`, `stone_marker_pillar_a..d`, `fern_bush_a/b/c`, `rock_cluster_bamboo`, `rock_mossy_a`, `sticks_bundle`.

**Từ `BaseMap/Dungeon.png`:** `crystal_cluster_blue/purple/green/teal`, `crystal_shard_blue/green/purple_a/purple_b`, `bone_pile_a/b`, `torch_wall_sconce_unlit/lit_a/lit_b`, `treasure_chest_closed_a/b`, `rock_debris_small_a/medium/cluster_a/cluster_b`, `wood_logs_pile_a/b`, `support_beam_post_a/b`, `support_beam_frame`, `support_beam_horizontal`.

**Từ `BaseMap/Snow-Mountain.png`:** `snow_boulder_a..d`, `snowdrift_strip/mound_a/b/c`, `snowball_a/b/small_cluster`, `pine_tree_snow_a..d`, `ice_crystal_formation_a`, `ice_rock_formation`, `icicle_a..d`, `icicle_formation_ground`, `frosty_cave_entrance_a..d`, `igloo_a..d`, `frozen_log_a..d`, `snow_rock_pile_a..e`, `snow_pyramid_pile`, `broken_branch`.

**Từ `BaseMap/Ancient-Forest.png`:** `glowing_mushroom_*` (nhiều biến thể single/cluster/trio, màu blue/purple/teal/pink/red), `spirit_wisp_cluster_a/dark_a/dark_b`, `ancient_tree_small_a/b/c`, `ancient_tree_medium_a`, `ancient_tree_large_a/mossy`, `ancient_tree_root_a..d`, `tree_stump_hollow`, `mossy_rock_a..d`, `bush_glow_teal_a/b`, `bush_flower_pink_purple`, `dense_undergrowth_bush_a/b/c`, `mossy_flower_patch_*`, `mossy_flower_mushroom_cluster_a`, `altar_stone_a`, `stone_altar_b`, `stone_statue_ruin_a`, `stone_pillar_marker_a`.

**Từ `BaseMap/Ancient-Temple.png`:** `pillar_torch_a/b/c`, `pillar_plain_a/b/c`, `pillar_thin_pedestal`, `fire_brazier_pedestal_a/b`, `brazier_standalone_lit`, `rubble_rock_a..i`, `rubble_rock_round_a/b`, `rubble_pile_large`, `dragon_relief_carving_a..d`, `stone_altar_dragon`, `decorative_border_strip_a`.

Còn thiếu (chưa có prop từ nguồn nào), cần gen thêm:

| id | Decoration |
|---|---|
| `lantern`, `lantern_lit` | Đèn lồng cầm tay/treo trong làng (khác `stone_lantern_a/b` — bản đó là đèn đá kiểu vườn) |
| `fish_pond` | Hồ cá đặt lẻ trong làng (khác `tilesets/grassland/pond.png` — bản đó là tile map) |
| `statue_ninja`, `statue_shrine` | Tượng ninja / tượng thờ |
| `table_chairs`, `bonsai`, `potted_flower` | Nội thất ngoài trời |
| `stone_well` | Giếng nước làng (khác building `village_well`) |
| `bed`, `wardrobe`, `lamp_desk`, `lamp_floor`, `table_simple`, `table_decorated`, `chair`, `bookshelf`, `storage_chest`, `rug` | Nội thất trong nhà |

---

## 17. Tilesets theo map (`public/assets/tilesets/<map>/`)

Nguồn: `public/images/BaseMap/*.png` (6 sheet đã tách nền + cắt lẻ) theo `art-refs/world/maps.md`. Mỗi map có `background.png` (tranh minh họa/thumbnail, giữ nguyên không cắt) + các tile texture rời (autotile nền/đường/tường — prop rời đã chuyển qua mục 16 Decorations).

**⚠️ Quyết định kiến trúc mới (xem `dev-schedule.md` Sprint 12 + `art-refs/world/maps.md`):** chỉ Map 0/1/8 (Hub/Farm/Boss Arena) dùng `background.png` nguyên khối làm nền thật trong game. **Map 2-7 (6 map chiến đấu) đổi sang backdrop parallax (nền xa, không vẽ mặt đất) + tile foreground** — 5 file `background.png` đã cắt cho `grassland/`, `bamboo_forest/`, `cave/`, `snow_mountain/`, `ancient_forest/` hiện tại là ảnh scene ĐẦY ĐỦ (vẽ theo hướng cũ, trước khi có quyết định này) — **cần gen lại thành `backdrop.png`** (chỉ trời/núi/rừng xa, không có mặt đất) + thêm `thumbnail.png` riêng (64×64, cho menu chọn map) khi tới Sprint 12, prompt mới đã có sẵn trong `art-refs/world/maps.md`. `sacred_forest/` (Map 6) chưa gen gì cả nên làm đúng theo kiến trúc mới ngay từ đầu, không cần sửa lại.

| Thư mục | Map | Texture tile đã cắt |
|---|---|---|
| `village/` | Map 0 — Làng Ẩn Nhân (Hub), prompt nay đã có ở `art-refs/world/maps.md` (trước đây ghi nhầm "không có prompt riêng") | — chưa gen/cắt, mới có prompt |
| `farm/` | Map 1 — Nông Trại, prompt ở `art-refs/world/maps.md` | **Đã đổi kiến trúc**: không còn ghép tile-grid nữa, dùng thẳng `BaseMap.png` làm ảnh nền tĩnh toàn cảnh (xem `docs/planning/progress.md`). Toàn bộ tile lẻ cũ (`grass_plain`, `soil_tilled_dry/wet`, `dirt_path_*`, `fence_*`, `pond_water_tile`, `signpost`, `hay_bale`, `wood_pile`, `grass_tuft`, `tileset.png`) đã xoá vì không còn dùng. |
| `grassland/` | Map 2 — Đồng Cỏ | `background.png`, `grass_plain(_b)`, `path_autotile_01..16`, `grass_autotile_01`, `flower_patch_{red,yellow,pink}_a/b/c`, `dirt_patch_oval`, `dirt_path_strip`, `pond`, `water_tile_a/b` |
| `bamboo_forest/` | Map 3 — Rừng Tre | `background.png`, `moss_patch_texture_a/b`, `stone_path_corner/straight/cross` |
| `cave/` | Map 4 — Hang Động | `background.png`, `stone_floor_a..e`, `cracked_stone_floor_a/b`, `cracked_stone_ground_overlay`, `cave_wall_a..m`, `cave_wall_corner_a`, `cave_wall_edge_a..d`, `cave_wall_gap`, `cave_wall_curve_a..d`, `cave_wall_diagonal_a/b`, `support_beam_wall_a/b/c`, `underground_pool_a..d` |
| `snow_mountain/` | Map 5 — Núi Tuyết | `background.png`, `snow_ground_a..g`, `snow_ground_notch_a`, `ice_patch_a`, `ice_patch_cracked_dark`, `snow_wall_corner_a/b/c`, `snow_wall_edge_jagged`, `ice_tile_diagonal_crack`, `ice_tile_crack_row`, `ice_tile_crack_checker`, `ice_wall_brick_a/corner/straight` |
| `sacred_forest/` | Map 6 — Rừng Thiêng, prompt mới thêm ở `art-refs/world/maps.md` | — chưa gen/cắt gì, map hoàn toàn mới |
| `ancient_forest/` | Map 7 — Rừng Cổ | `background.png`, `mossy_hedge_plain_a..d`, `mossy_hedge_corner_a/b`, `mossy_hedge_path_corner_a/b`, `mossy_hedge_arch_a`, `stone_ruin_moss_texture_a`, `stone_ruin_moss_patch_a`, `stone_ruin_moss_edge_a`, `stone_ruin_wall_vine_a/b/c`, `stone_ruin_wall_mossy_a`, `stone_ruin_wall_brick_a`, `stone_ruin_wall_broken_a`, `stone_ruin_wall_stair`, `stone_ruin_wall_vine_texture_a..d`, `glowing_flower_patch_a/b` |
| `sanctuary/` | Map 8 — Thánh Điện Cổ (Boss Arena — Linh Thụ Ma Hóa, không phải rồng) | `background.png`, `map_select_icon` (64×64), `floor_plain_a/b/c`, `floor_cracked_a..i`, `lava_crack_floor_a/b`, `lava_crack_floor_diagonal_a/b`, `rune_circle_fragment_a..j` (⚠️ mảnh rời của 1 vòng tròn rune lớn ghép từ nhiều tile, cần tự ghép lại trong Tiled nếu muốn dùng nguyên vòng) |

**Lưu ý cắt ảnh:** một vài piece bị bỏ qua vì là mảnh vỡ/nhiễu quá nhỏ không dùng được (chủ yếu ở `sanctuary/` do hoa văn rune chồng lấp làm gãy liên kết pixel khi tách). Nếu cần đúng nguyên vẹn phần đó, nên cắt tay lại từ `public/images/BaseMap/Ancient-Temple.png`.
| `sanctuary/` | Map 8 — Thánh Điện Cổ | `background.png`, `arena_floor`, `stone_column`, `fire_brazier`, `rubble`, `dragon_relief` (⚠️ tên cũ theo lore rồng sai — thật ra nên là root/tree relief, xem `art-refs/world/maps.md`), `lava_crack`, `map_select_icon` (64×64, riêng) |

---

## Ghi chú

- File này chỉ liệt kê asset đã có prompt sẵn trong `art-refs/`. Nếu gen thêm asset mới chưa có trong danh sách, tự đặt id snake_case tiếng Anh theo đúng pattern ở trên rồi bổ sung vào bảng tương ứng.
- Khi 1 item có nhiều biến thể theo rank/tier, dùng hậu tố `_<rank>` hoặc `_<tier>` (ví dụ `helmet_epic`, `enhancement_stone_rare`).
- Id ở đây sẽ là giá trị `id` dùng trong các file JSON (`crops.json`, `items.json`, `weapons.json`...) khi làm Sprint dữ liệu — đặt đúng từ đầu để khỏi phải đổi tên lại.
