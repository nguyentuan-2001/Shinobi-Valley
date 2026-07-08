# Dev Schedule — Lịch trình phát triển V1.0

> Lịch trình chi tiết cho 1 người làm (solo dev + AI pair-programming), bám sát phạm vi đã chốt trong [v1-scope.md](v1-scope.md). Chia theo **Sprint** (1 sprint = 1 khối công việc hoàn chỉnh, có thể test được ngay sau khi xong — không tính theo ngày lịch vì tốc độ mỗi người khác nhau). Cột **Size** là ước lượng độ lớn tương đối: `S` (1-2 buổi), `M` (3-5 buổi), `L` (1-2 tuần làm buổi tối/cuối tuần).

**Nguyên tắc xuyên suốt:**

1. **Vertical slice trước, mở rộng nội dung sau** — Alpha dựng đủ 1 vòng loop chơi được (di chuyển → trồng → thu hoạch → đánh quái → lưu game) với nội dung tối thiểu, rồi mới nhân rộng số lượng cây/quái/map ở Beta.
2. **Data-driven đúng như `data-schema.md`** — mọi nội dung mới (cây, quái, item...) thêm vào file JSON tương ứng, không hardcode trong code scene.
3. **Asset là AI-generated placeholder → final** — vì chưa có artist, dùng đúng prompt trong `art-refs/` để gen ảnh bằng công cụ AI (Midjourney/ChatGPT Images/Ideogram...), theo pipeline ở [Phụ lục A](#phụ-lục-a--pipeline-tạo-asset). Nếu 1 sprint chưa có asset thật, dùng hình khối màu (rectangle/placeholder) để không bị nghẽn — thay asset sau, không chặn code.
4. **Mỗi sprint có "Done when"** — tiêu chí rõ ràng để biết khi nào chuyển sang sprint kế tiếp.

---

## Tổng quan các Phase

| Phase | Tương ứng roadmap.md    | Nội dung                                                                   | Số sprint |
| ----- | ----------------------- | -------------------------------------------------------------------------- | --------- |
| 0     | (mới, hạ tầng kỹ thuật) | Data loader, pipeline asset, cấu trúc thư mục                              | 1         |
| 1     | Alpha                   | Movement, Inventory, Combat cơ bản, Planting, Harvest, Save                | 6         |
| 2     | Beta                    | Nội dung đầy đủ: crop, chăn nuôi, câu cá, NPC, 5 map, boss, crafting, nghề | 10        |
| 3     | V1.0                    | Cốt truyện, gacha, kinh tế, UI polish, làng hoàn chỉnh, playtest, demo     | 7         |

---

## Phase 0 — Hạ tầng kỹ thuật

### Sprint 0: Data pipeline & project structure

**Size: S**

| Loại     | Việc cần làm                                                                                                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code     | `src/data/` — loader load các file JSON lúc `PreloadScene`; TypeScript interfaces khớp từng schema trong `data-schema.md` (Crop, Item, Weapon, Armor, Skill, Monster, Npc, Quest, Recipe, Fish, Profession, GachaPool) |
| Code     | `src/systems/SaveManager.ts` — khung serialize/deserialize theo `save_state.json`, dùng `localStorage` (browser) làm nơi lưu tạm                                                                                       |
| Cấu trúc | Tạo `public/data/*.json` (file rỗng/mẫu ban đầu), `public/assets/tilesets/`, `public/assets/sprites/`, `public/assets/ui/`, `public/assets/sfx/`                                                                       |
| Asset    | Không cần asset thật — chỉ cần 1 tile màu đặc (32×32) để test render tilemap                                                                                                                                           |

**Done when:** `PreloadScene` load được JSON mẫu và log ra console không lỗi; `GameScene` render được 1 tilemap test từ Tiled JSON.

---

## Phase 1 — Alpha

_(Roadmap: Movement, Inventory, Combat, Planting, Harvest, Save)_

### Sprint 1: Player movement + tilemap nông trại

**Size: M**

| Loại  | Việc cần làm                                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `Player` entity (Arcade Physics), state machine 4 hướng (idle/walk), input WASD/Arrow, camera follow player, collision layer từ tilemap |
| Code  | Dựng Map 1 (Nông trại, 30×20 tile) bằng Tiled, export JSON, load vào `GameScene` thay placeholder rectangle                             |
| Asset | **Player sprite sheet** — 1 class trước (đề xuất Kiếm sĩ/Swordsman), 4 hướng × idle+walk, theo `art-refs/characters/player.md`          |
| Asset | **Tileset nông trại** — cỏ, đất, đường, nước, hàng rào (~15-20 tile 32×32), theo `art-refs/world/maps.md`                               |

**Done when:** Di chuyển nhân vật 4 hướng trong farm map, có animation, không đi xuyên hàng rào/nước.

### Sprint 2: Hệ thống ô đất (farm tile state machine)

**Size: M**

| Loại  | Việc cần làm                                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `FarmTile` grid overlay lên tilemap (state: `empty/tilled/planted/ready/withered`), công cụ Cuốc (hoe) — tương tác đổi `empty→tilled`  |
| Code  | Tương tác trồng hạt: `tilled + seed item → planted`, lưu `crop_id`, `planted_at_timestamp`                                             |
| Data  | `crops.json` — 3 cây Tier Cơ Bản đầu (Hành lá, Cà rốt, Khoai tây — theo thứ tự trong `farming.md`)                                     |
| Asset | 3 cây đầu đã có `<id>_seed/_sprout/_growing.png` + `<id>.png` (item icon). **Còn thiếu `<id>_harvest.png`** (giai đoạn chín-còn-trên-đất, hiện trên map trước khi hái — tách riêng khỏi item icon) và overlay đất đã cuốc (tilled soil) — xem `asset-manifest.md` mục 7 |

**Done when:** Cuốc đất → trồng hạt → cây hiển thị đúng giai đoạn theo thời gian thực trôi qua (test bằng cách tăng tốc thời gian debug).

### Sprint 3: Game Clock (chu kỳ ngày/đêm) — _tiền đề cho moisture & combat đêm_

**Size: S**

| Loại  | Việc cần làm                                                                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `TimeManager` — ánh xạ giờ trong game vào giây thực (chọn tỷ lệ, ví dụ 1 giờ game = X giây thực), đếm ngày, event bus `onHourTick`/`onDayChange`/`onNightStart` |
| Code  | Overlay tint màu tối dần khi vào đêm (không cần asset, dùng `Graphics` phủ màu alpha)                                                                           |
| Asset | Không cần                                                                                                                                                       |

**Done when:** HUD hiển thị giờ:ngày hiện tại, chuyển ngày/đêm đúng chu kỳ, các hệ thống khác subscribe được event.

### Sprint 4: Tưới nước, độ ẩm (moisture), thu hoạch, Inventory

**Size: L**

| Loại  | Việc cần làm                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | Công cụ Bình tưới — tương tác tăng `moisture`; `moisture_decay_per_hour` chạy theo `TimeManager.onHourTick`                                                   |
| Code  | Thu hoạch: `yield = base × moisture/100`, random trong `[yield_min, yield_max]`, xử lý `multi_harvest`/`regrow_hours`                                         |
| Code  | `Inventory` — cấu trúc data (stack, `stack_max`), UI grid kéo/click để dùng item, phím tắt mở/đóng                                                            |
| Asset | Icon Bình tưới, overlay đất ẩm (đổi màu/độ bóng theo % moisture), icon item thu hoạch (nông sản), khung slot inventory + panel nền (theo `art-refs/ui/ui.md`) |

**Done when:** Trồng → tưới đều → thu hoạch cho sản lượng cao hơn không tưới; item thu hoạch vào đúng inventory, stack đúng số lượng.

### Sprint 5: Combat cơ bản — 1 hệ vũ khí, quái, HP/damage thật

**Size: L**

| Loại  | Việc cần làm                                                                                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `Weapon` component (đang cầm), đòn đánh thường (hitbox melee, cooldown ngắn)                                                                                                            |
| Code  | `Monster` entity base (HP/ATK/DEF, di chuyển AI đơn giản — patrol/chase), công thức damage `ATK × multiplier × 100/(100+DEF)`, crit ×1.5, dmg tối thiểu 1                               |
| Code  | Chết/respawn: quái chết→despawn+drop, player chết→mất 10% Đồng rơi ra (despawn 5 phút), respawn 50% HP/MP tại làng                                                                      |
| Code  | Nối `UIScene` HP/MP/EXP vào state thật của player (bỏ số giả)                                                                                                                           |
| Data  | `weapons.json` (1 vũ khí: Kiếm sắt), `monsters.json` (1-2 quái Đồng Cỏ: Thỏ hoang...), `skills.json` (skill 1: Chém nhanh)                                                              |
| Asset | Animation đánh cho player (thêm state `attack` vào sprite sheet), sprite 1-2 quái (32×32, theo `art-refs/enemies/monsters.md`), hiệu ứng chém cơ bản (theo `art-refs/combat/skills.md`) |

**Done when:** Đánh chết quái nhận EXP/gold/drop đúng bảng; player chết thì respawn đúng vị trí/HP, rơi đúng % Đồng.

### Sprint 6: Save/Load hoàn chỉnh — chốt Alpha

**Size: M**

| Loại  | Việc cần làm                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `SaveManager` serialize toàn bộ: `farm_tiles`, player stats/level/exp, inventory, vị trí, thời gian game — theo đúng field `save_state.json` |
| Code  | Autosave (theo khoảng thời gian hoặc theo hành động quan trọng) + Load khi khởi động game (màn hình "Continue" nếu có save)                  |
| Asset | Không cần                                                                                                                                    |

**✅ Done when — ALPHA HOÀN THÀNH:** Di chuyển, cuốc/trồng/tưới/thu hoạch 1 cây, đánh 1 loại quái, tắt game mở lại giữ đúng trạng thái farm + inventory + stats.

---

## Phase 2 — Beta

_(Roadmap: 20→14 cây (theo v1-scope), 5 map, boss, NPC, quest, crafting)_

### Sprint 7: Đầy đủ 14 cây trồng V1 + phân bón (fertilizer)

**Size: M**

| Loại  | Việc cần làm                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------- |
| Code  | Hệ thống phân bón: item `fertilizer_applied` trên tile, ảnh hưởng tốc độ lớn/moisture decay theo `farming.md` |
| Data  | Hoàn thiện `crops.json` — 11 cây còn lại (Tier Trung Cấp + Cao Cấp, tới Sâm đỏ)                               |
| Asset | 11 cây còn lại đã có `<id>_seed/_sprout/_growing.png` + `<id>.png`. Còn thiếu `<id>_harvest.png` (như Sprint 2) và icon 2-3 loại phân bón |

**Done when:** Toàn bộ 14 cây trồng được, lớn đúng thời gian riêng, phân bón có tác dụng đo được.

### Sprint 8: Chăn nuôi (gà/vịt/bò/cừu) + chuồng trại

**Size: M**

| Loại  | Việc cần làm                                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `Animal` entity (cho ăn hằng ngày, không chết nếu quên — chỉ ngưng sản xuất), building placement: Chuồng gà/Chuồng lớn                  |
| Data  | Bổ sung `items.json` cho sản phẩm chăn nuôi (trứng, sữa, lông...)                                                                       |
| Asset | 4 sprite động vật (idle/walk), building Chuồng (theo `art-refs/world/buildings.md`), icon sản phẩm (theo `art-refs/items/livestock.md`) |

**Done when:** Cho ăn đủ → vật nuôi sinh sản phẩm đúng chu kỳ; bỏ đói → không có sản phẩm nhưng vật không chết.

### Sprint 9: Câu cá (fishing mini-game)

**Size: M**

| Loại  | Việc cần làm                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | Tương tác cần câu tại tile nước, UI mini-game "sweet zone" (giữ/thả đúng lúc), kết quả theo `catch_time`, `sweet_zone_size`, `luck_required` |
| Data  | `fish.json` — Common + Rare + Epic (theo giới hạn V1)                                                                                        |
| Asset | Icon cần câu, icon từng loại cá, UI thanh mini-game câu cá, theo `art-refs/items/fish.md`                                                    |

**Done when:** Câu được ít nhất 1 cá mỗi bậc hiếm, tỷ lệ ra cá cao hơn khi Luck cao hơn.

### Sprint 10: NPC, dialogue, quan hệ (relationship), shop

**Size: L**

| Loại  | Việc cần làm                                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `NPC` entity + prompt tương tác, UI hộp thoại (dialogue box), lưu điểm quan hệ 0-10/NPC, Shop UI (mua/bán, giảm giá 5% khi quan hệ cao) |
| Data  | `npc.json` — đủ 10 NPC theo `world/npc.md`                                                                                              |
| Asset | 10 sprite sheet NPC (theo `art-refs/characters/npcs.md`), khung dialogue box + portrait, theo `art-refs/ui/ui.md`                       |

**Done when:** Nói chuyện với cả 10 NPC ra đúng dialogue mặc định; mua/bán tại đúng shop NPC tương ứng; tăng quan hệ qua tặng quà/nói chuyện mỗi ngày.

### Sprint 11: 4 hệ vũ khí còn lại + hệ thống skill/status effect

**Size: L**

| Loại  | Việc cần làm                                                                                                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | `Skill` component (cooldown, mp cost, damage multiplier, effect), status effect system (poison/bleed/slow/stun/burn/def_down — refresh không stack), đổi vũ khí/class tại nhà |
| Data  | Hoàn thiện `weapons.json` (5 hệ), `skills.json` (6 skill/hệ cho V1 = 30 skill)                                                                                                |
| Asset | 4 sprite sheet class còn lại (Song kiếm/Thương/Cung/Ninja) + animation đánh riêng, 30 icon skill + hiệu ứng, theo `art-refs/combat/weapons.md` + `art-refs/combat/skills.md`  |

**Done when:** Đổi được cả 5 hệ vũ khí, dùng đủ 6 skill/hệ, status effect áp dụng và refresh đúng (không cộng dồn).

### Sprint 12: Map 2-7 (Đồng Cỏ→Rừng Cổ) + cơ chế riêng từng map

**Size: L**

**Quyết định kiến trúc map ngoài (chốt trong phiên trao đổi với user, tham khảo Ninja School Online/Ngọc Rồng Online):** Farm/Village dùng 1 ảnh nền tĩnh vẽ nguyên khối vì đủ nhỏ để thấy cả map. 6 map chiến đấu (Map 2-7) sẽ **KHÔNG** làm 1 ảnh khổng lồ duy nhất — chia mỗi map thành **nhiều khu vực/phòng nhỏ nối tiếp** (kích cỡ mỗi khu vực ~ tầm nhìn camera hiện tại của Farm), đi tới rìa khu vực thì chuyển sang khu vực kế (transition nhanh hoặc ghép liền trong 1 Tiled map lớn nếu muốn camera mở rộng tự nhiên). Mỗi khu vực dựng từ: layer nền trời/núi xa (đứng yên hoặc parallax chậm, dùng chung/tái sử dụng giữa các khu vực cùng map) + layer đất/tile foreground cuộn theo camera (build từ tile đã cắt sẵn trong `public/assets/tilesets/<map>/`, xem `docs/data/asset-manifest.md` mục 17 — hiện đang có sẵn nhưng CHƯA dùng tới, chỉ mới dùng ảnh `background.png` nguyên khối). Vài quái spawn rải rác mỗi khu vực (giống cách đặt vị trí ô đất ở `data/farmTiles.ts`), 1 khu vực riêng lớn hơn cuối map cho mini-boss. **Cơ chế đánh quái không đổi** — dùng lại đúng hệ combat Sprint 5 (Weapon + hitbox cận chiến, quái patrol/chase), logic entity không phụ thuộc map to/nhỏ hay 1 ảnh/nhiều tile. Giữ nguyên di chuyển top-down 4 hướng đã có — chỉ mượn kỹ thuật chia lớp nền của NRO/Ninja School, không mượn cơ chế camera/di chuyển góc nghiêng của họ.

| Loại  | Việc cần làm                                                                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | Hệ thống khu vực/phòng nối tiếp + transition (xem quyết định kiến trúc trên), loader map theo level-gate, cơ chế Hang Động (đèn lồng/lantern giới hạn vùng nhìn), Núi Tuyết (giảm move speed), Rừng Thiêng (corruption tile trừ 1HP/s trừ khi dùng Bùa Thanh Tẩy) |
| Data  | `monsters.json` đầy đủ quái theo bảng chỉ số trong `data-schema.md` (~24 quái thường + 1 quái cốt truyện Hoàng), item nguyên liệu theo zone trong `items.json`                                                |
| Asset | Tileset/tilemap từng khu vực dựng từ tile đã cắt theo map, ~20 sprite quái còn lại (32×32) + 6 mini-boss (64×64), icon Đèn lồng + Bùa Thanh Tẩy, theo `art-refs/enemies/monsters.md` + `art-refs/world/maps.md` |

**Done when:** Vào được cả 6 map theo đúng level-gate, cơ chế riêng từng map hoạt động (đo được: HP mất trong Rừng Thiêng nếu không có bùa, tối trong hang không có đèn).

### Sprint 13: 6 Mini-boss

**Size: M**

| Loại  | Việc cần làm                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------- |
| Code  | Boss AI (nhiều đòn đánh cơ bản, có thể thêm 1 "enrage phase" ở % HP thấp), cổng vào arena boss (trigger/gate) |
| Data  | `monsters.json` — 6 entry `is_boss: true`, 1 mini-boss mỗi map (Map 2-7)                                                |
| Asset | 6 sprite boss 64×64, theo `art-refs/enemies/monsters.md`                                                      |

**Done when:** Đánh bại được cả 6 mini-boss, mỗi boss có ít nhất 1 pattern đánh khác quái thường.

### Sprint 14: Crafting (fixed + random) + cường hóa

**Size: L**

| Loại  | Việc cần làm                                                                                                                                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | UI trạm chế tạo (Lò rèn/Alchemist/Bếp/Khung dệt/Ruộng), craft cố định (trừ nguyên liệu, ra item), Random Craft "Lò Hỗn Nguyên" (roll rarity theo bảng %, đếm Lucky pity), UI cường hóa +1→+8 (tỷ lệ thành công giảm dần, rank-down khi fail từ +6, Protection Stone) |
| Data  | `recipes.json` (Common→Legendary, theo v1-scope không có Mythic), sub-stat pool trong `armor.json`/`weapons.json`                                                                                                                                                    |
| Asset | UI trạm chế tạo từng loại, icon nguyên liệu (theo `art-refs/items/materials.md`), icon đá cường hóa + Protection Stone, icon trang bị theo rank (5 tier × slot)                                                                                                      |

**Done when:** Craft ra được item theo đúng recipe, random craft ra rarity theo đúng tỷ lệ kỳ vọng khi test nhiều lần, cường hóa +8 thành công tăng đúng % stat, fail từ +6 có rank-down đúng logic.

### Sprint 15: Hệ thống nghề nghiệp (professions)

**Size: M**

| Loại  | Việc cần làm                                                                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | XP nghề theo hành động (chính 100%/phụ 50%), áp `level_rewards` vào hệ thống liên quan (giảm moisture decay, giảm giá craft, tăng drop rate...), UI đổi nghề tại Dojo (tốn 500 bạc) |
| Data  | `professions.json` — 6 nghề, chỉ Lv1-7 (giới hạn V1)                                                                                                                                |
| Asset | Icon 6 nghề, nội thất Dojo (nếu chưa có ở building set)                                                                                                                             |

**Done when:** Lên cấp nghề đúng theo hành động, hiệu ứng cấp độ áp dụng đo được (ví dụ moisture decay giảm rõ khi là Farmer Lv5).

### Sprint 16: Hệ thống Quest (main + side + daily)

**Size: L**

| Loại  | Việc cần làm                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | State machine quest (available/active/complete), objective tracking (gather/kill/talk), Quest Log UI (tối đa 10 active), marker trên map, xem trước reward trước khi nhận quest |
| Data  | `quests.json` — MQ-01→MQ-08, 8 side quest, pool 5 daily quest (chọn 3/ngày)                                                                                                     |
| Asset | Icon marker quest, panel Quest Log, theo `art-refs/ui/ui.md`                                                                                                                    |

**Done when:** Nhận/hoàn thành được cả 8 main quest theo đúng thứ tự prerequisite, side quest và daily quest hoạt động độc lập.

---

## Phase 3 — V1.0: Nội dung hoàn chỉnh, polish, playtest

### Sprint 17: Nội dung cốt truyện Act 1 + Act 2 (dialogue, cutscene cơ bản)

**Size: L**

| Loại  | Việc cần làm                                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| Code  | Trình tự dialogue/cutscene đơn giản (di chuyển camera, hiện dialogue theo script), story flag/trigger gắn vào quest MQ tương ứng |
| Data  | Nội dung dialogue thật cho MQ-01→08 (Elder Trần thú nhận, tìm Hoàng, rèn Kiếm Hư Vô...)                                          |
| Asset | Portrait/sprite riêng cho Linh (linh hồn cây), cảnh cutscene nếu cần, icon lore fragment (10 mảnh)                               |

**Done when:** Chơi hết Act 1 + Act 2 (MQ-01→08) có dialogue đầy đủ, thu thập được lore fragment, kết thúc bằng cliffhanger Act 3.

### Sprint 18: Gacha chuẩn (Standard Gacha)

**Size: M**

| Loại  | Việc cần làm                                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code  | Logic quay gacha + pity (guaranteed rare @10, soft pity @40, hard pity legendary @60/mythic @120), UI quay + hiệu ứng reveal, quy đổi vật phẩm trùng → Gacha Essence |
| Data  | `gacha.json` — `standard_pool`                                                                                                                                       |
| Asset | UI banner gacha, hiệu ứng mở hòm/reveal rarity, theo `art-refs/ui/ui.md`                                                                                             |

**Done when:** Quay đủ 120 lần test ra đúng phân phối rarity kỳ vọng ± pity mốc đúng.

### Sprint 19: Kinh tế & cân bằng giá (Đồng + Bạc)

**Size: M**

| Loại  | Việc cần làm                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------- |
| Code  | Nối giá mua/bán thật ở toàn bộ shop NPC, gold drop quái theo bảng, quy đổi 100 Đồng = 1 Bạc tại nơi cần |
| Asset | Icon Đồng/Bạc (theo `art-refs/items/currency.md`) nếu chưa làm ở Sprint 4/HUD                           |

**Done when:** Đi hết 1 vòng farm→bán→mua gear→đánh quái mà không bug số liệu (không âm tiền, giá đúng bảng trong `currency.md`/`economy.md`).

### Sprint 20: Polish UI/UX toàn diện

**Size: M**

| Loại  | Việc cần làm                                                                                  |
| ----- | --------------------------------------------------------------------------------------------- |
| Code  | Menu chính, Settings, Minimap, hoàn thiện toàn bộ HUD (thay hết placeholder text ở `UIScene`) |
| Asset | Bộ UI kit đầy đủ theo `art-refs/ui/ui.md` (khung, nút, icon trạng thái, minimap frame)        |

**Done when:** Không còn UI placeholder (text giả HP/MP/EXP ở `UIScene` hiện tại đã thay hết bằng UI thật).

### Sprint 21: Hoàn thiện làng (13 địa điểm) + giờ hoạt động NPC

**Size: M**

| Loại  | Việc cần làm                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------- |
| Code  | Toàn bộ 13 building/location theo `world/village.md`, logic giờ mở/đóng (NPC di chuyển hoặc ẩn ngoài giờ) |
| Asset | Building/decoration còn thiếu theo `art-refs/world/buildings.md` + `decorations.md`                       |

**Done when:** Đi hết làng, mọi NPC đúng vị trí/giờ hoạt động như spec.

### Sprint 22: Playtest, cân bằng số liệu, sửa bug

**Size: L**

| Loại | Việc cần làm                                                                                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Việc | Chơi thử full Lv1→50, ghi nhận điểm khó/dễ bất hợp lý (đường EXP, tỷ lệ rớt đồ, độ khó boss), sửa số liệu trong JSON (không cần sửa code vì data-driven), fix bug phát sinh |

**Done when:** Hoàn thành 1 playthrough Lv1→50 không gặp blocker, cảm giác độ khó hợp lý theo đường cong trong `progression.md`.

### Sprint 23: Build demo & thu thập phản hồi

**Size: S**

| Loại | Việc cần làm                                                                           |
| ---- | -------------------------------------------------------------------------------------- |
| Việc | `vite build`, đóng gói, đăng demo (itch.io hoặc tương tự), chuẩn bị kênh nhận feedback |

**✅ Done when — V1.0 HOÀN THÀNH:** Đủ checklist trong `v1-scope.md`, demo public chơi được Lv1-50, Act 1+2.

---

## Phụ lục A — Pipeline tạo asset

Vì chưa có artist, toàn bộ art dùng AI-generate theo đúng prompt đã soạn sẵn trong `art-refs/`. Quy trình cho mỗi asset:

1. Mở [`docs/data/asset-manifest.md`](../data/asset-manifest.md) để lấy đúng **id/tên file** cho item cần gen, rồi mở file `art-refs/` tương ứng (ví dụ `art-refs/items/crops.md` cho cây trồng) để lấy prompt.
2. Copy **style prefix chung** (`art-refs/README.md`): `2D pixel art, 32x32, top-down view, clean outlines, vibrant colors, white background, RPG game asset —` + nội dung prompt riêng của item đó.
3. Gen bằng công cụ AI image (Midjourney/ChatGPT Images/Ideogram...) — **dùng cùng model + cùng seed** cho cả nhóm asset để đồng bộ style.
4. Kiểm tra outline/màu/tương phản, xóa nền nếu cần, xuất PNG 32×32 (hoặc 64×64 mini-boss, 128×128 boss cuối).
5. Đặt vào `public/assets/sprites/<category>/<id>.png`, cập nhật đường dẫn trong `preload()` hoặc file JSON tương ứng.

**Lưu ý:** Tôi (Claude) không tự generate hình ảnh — ở mỗi sprint có nhu cầu asset, tôi sẽ soạn sẵn danh sách prompt cụ thể (ghép từ art-refs) để bạn đưa vào tool AI image, sau đó tôi code phần load/hiển thị khi bạn có file ảnh.

---

## Phụ lục B — Nơi lưu tài nguyên

public/assets/
├── sprites/
│ ├── player/ → art-refs/characters/player.md
│ ├── npcs/ → art-refs/characters/npcs.md
│ ├── monsters/ → art-refs/enemies/monsters.md (quái thường)
│ ├── bosses/ → art-refs/enemies/monsters.md (mini-boss 64×64, boss cuối 128×128)
│ ├── weapons/ → art-refs/combat/weapons.md
│ ├── skills/ → art-refs/combat/skills.md (icon + effect)
│ ├── equipment/ → art-refs/combat/equipment.md
│ ├── crops/ → art-refs/items/crops.md (đã có carrot.png mẫu)
│ ├── livestock/ → art-refs/items/livestock.md
│ ├── fish/ → art-refs/items/fish.md
│ ├── tools/ → art-refs/items/tools.md
│ ├── consumables/ → art-refs/items/consumables.md
│ ├── materials/ → art-refs/items/materials.md
│ ├── currency/ → art-refs/items/currency.md
│ ├── buildings/ → art-refs/world/buildings.md
│ └── decorations/ → art-refs/world/decorations.md
├── tilesets/ (ảnh tileset nền cho từng map, theo art-refs/world/maps.md)
│ ├── village/ farm/ grassland/ bamboo_forest/ cave/
│ └── snow_mountain/ sacred_forest/ ancient_forest/ sanctuary/
├── tilemaps/ (file JSON export từ Tiled)
├── ui/
│ ├── hud/ (HP/MP bar, status bar)
│ ├── icons/ (inventory, quest, shop... theo art-refs/ui/ui.md)
│ └── frames/ (khung panel, dialogue box, slot frame)
├── sfx/ (âm thanh hiệu ứng)
└── bgm/ (nhạc nền)

---

## Phụ lục C — Theo dõi tiến độ

Đánh dấu khi hoàn thành từng sprint:

- [ ] Sprint 0 — Data pipeline & project structure
- [ ] Sprint 1 — Player movement + tilemap nông trại
- [ ] Sprint 2 — Hệ thống ô đất
- [ ] Sprint 3 — Game Clock
- [ ] Sprint 4 — Tưới nước, moisture, thu hoạch, Inventory
- [ ] Sprint 5 — Combat cơ bản
- [ ] Sprint 6 — Save/Load (chốt Alpha)
- [ ] Sprint 7 — Đủ 14 cây + phân bón
- [ ] Sprint 8 — Chăn nuôi
- [ ] Sprint 9 — Câu cá
- [ ] Sprint 10 — NPC, dialogue, relationship, shop
- [ ] Sprint 11 — 4 hệ vũ khí còn lại + skill/status
- [ ] Sprint 12 — Map 2-5 + cơ chế riêng
- [ ] Sprint 13 — 5 Mini-boss
- [ ] Sprint 14 — Crafting + cường hóa
- [ ] Sprint 15 — Professions
- [ ] Sprint 16 — Quest system
- [ ] Sprint 17 — Cốt truyện Act 1+2
- [ ] Sprint 18 — Gacha chuẩn
- [ ] Sprint 19 — Kinh tế & cân bằng giá
- [ ] Sprint 20 — Polish UI/UX
- [ ] Sprint 21 — Hoàn thiện làng
- [ ] Sprint 22 — Playtest & cân bằng
- [ ] Sprint 23 — Build demo (chốt V1.0)
