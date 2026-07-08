# Cơ chế game cốt lõi

---

## Công thức sát thương

- **Đòn thường:** `ATK × 1.0 × (100 / (100 + DEF))`
- **Đòn kỹ năng:** `ATK × skill_damage_multiplier × (100 / (100 + DEF))`
- **Chí mạng:** nhân kết quả × 1.5; kích hoạt theo xác suất Crit%
- **Kỹ năng đa đòn:** mỗi đòn tính công thức độc lập
- **Hiệu ứng trạng thái (Độc / Bỏng / Chảy máu):** sát thương phẳng mỗi giây, bỏ qua DEF
- **Sát thương tối thiểu:** luôn là 1

---

## Hành động chiến đấu

| Hành động | MP tiêu thụ | Chi tiết |
|---|---|---|
| Đòn thường | 0 MP | Cooldown 0.5 giây (chỉ số Tốc độ tấn công giảm thời gian này) |
| Né / Lăn | 20 MP | Cửa sổ bất tử 0.3 giây; cooldown 1.5 giây |
| Đỡ đòn *(chỉ hệ Thương sĩ)* | 5 MP/giây | Giữ phím để duy trì; giảm 50% sát thương nhận vào |
| Kỹ năng | Theo định nghĩa trong combat.md | Cooldown tùy từng kỹ năng |

**Hồi MP:**
- Ngoài chiến đấu (không có kẻ địch trong vòng 8 ô): **+5 MP/giây**
- Trong chiến đấu: **+1 MP/giây**

---

## Chết & Hồi sinh

- **Khi HP về 0:** màn hình mờ dần; **mất 10% Đồng hiện có**, số Đồng đó rơi xuống đất tại vị trí chết (không mất vĩnh viễn — có thể nhặt lại)
- **Hồi sinh:** tại làng với **50% HP** và **50% MP**
- Đồng rơi trên đất **biến mất sau 5 phút** nếu không được nhặt
- **Không mất vật phẩm hay trang bị** khi chết

---

## Kho đồ (Inventory)

- **Mặc định:** 30 ô vật phẩm + 6 ô trang bị (Đầu / Ngực / Tay / Chân / Nhẫn / Vòng cổ) + 1 ô vũ khí
- Mỗi ô vật phẩm chứa tối đa **99 đơn vị** đối với nguyên liệu / tiêu hao; trang bị không xếp chồng
- Vật phẩm tràn vào **túi tràn tạm thời 10 ô**; phải giải phóng trước khi nhặt thêm

**Nâng cấp kho đồ** tại tòa nhà *Kho nâng cấp*:

| Cấp | Số ô | Chi phí |
|---|---|---|
| Lv 1 (mặc định) | 30 ô | Miễn phí |
| Lv 2 | 50 ô | 5.000đ + 50 Gỗ + 20 Đá |
| Lv 3 | 70 ô | 20.000đ + 100 Gỗ + 50 Đá + 10 Pha Lê |

---

## Chu kỳ Ngày / Đêm

- **1 ngày trong game = 24 phút thực** (12 phút ban ngày + 12 phút ban đêm)
- **Ban ngày (06:00–18:00 giờ game):** canh tác bình thường, cửa hàng mở, tầm nhìn đầy đủ
- **Ban đêm (18:00–06:00 giờ game):** *Hoa ánh trăng* có thể thu hoạch, kẻ địch mạnh hơn xuất hiện, cửa hàng đóng
- Giao diện hiển thị biểu tượng đồng hồ kèm chỉ báo ngày/đêm

---

## Cơ chế Đặc biệt theo Bản Đồ

### Hang Động — Cơ chế Đèn Lồng

Một phần Hang Động (địa đạo ngầm) tối hoàn toàn — không nhìn thấy kẻ địch, vật phẩm hay lối đi nếu không có đèn.

| Đèn | Bán kính sáng | Lấy từ |
|---|---|---|
| Đèn lồng gỗ | 3 ô | Được cấp khi nhận MQ-04 |
| Đèn lồng sắt | 5 ô | Craft: 5 Iron Ore + 1 Crystal tại Lò rèn |

- Đèn lồng không cần nhiên liệu — luôn sáng khi trang bị.
- Tắt/bật đèn bằng phím tắt; tắt đèn giảm tầm nhìn nhưng giảm aggro một số loại quái bóng tối.
- Một số cửa bí mật trong hang chỉ nhìn thấy khi đèn sáng đủ 5 ô trở lên.

### Rừng Thiêng — Cơ chế Ô Nhiễm

Một số ô đất trong Rừng Thiêng bị nhiễm Ma Khí nặng — bước vào gây **1 HP/giây** thiệt hại liên tục.

**Cuộn Giấy Tẩy Uế:** Tạo trường bảo vệ cá nhân 10 phút, miễn dịch hoàn toàn với sát thương ô nhiễm.

| Thuộc tính | Giá trị |
|---|---|
| Thời gian hiệu lực | 10 phút thực |
| Craft | 3 Crystal + 2 Dược thảo (Nhà giả kim Lv 1) |
| Mua | 500đ bạc tại Nhà Giả Kim NPC |
| Xếp chồng | Tối đa 20 cuộn |

> **Nông dân Lv 10:** Bonus giảm tốc độ mất Độ ẩm không áp dụng cho Cuộn Giấy Tẩy Uế.

---

## Thuộc Tính Phụ — Định Nghĩa Chi Tiết

| Sub-stat | Cơ chế |
|---|---|
| Life Steal | X% sát thương vật lý gây ra được chuyển thành HP hồi phục (không áp dụng với sát thương trạng thái) |
| Gold Find | Kẻ địch rơi thêm X% Đồng (làm tròn lên, không ảnh hưởng Bạc) |
| Bonus Exp | Nhận thêm X% kinh nghiệm từ mọi nguồn |
| Bonus Farm Yield | Sản lượng thu hoạch tăng X% (cộng trước khi tính Độ ẩm) |
| Skill CD Reduction | Cooldown kỹ năng giảm X% (cộng dồn với sub-stat, tối đa 30%) |
| AOE Bonus | Tăng bán kính AOE của kỹ năng X% |
| Double Strike Chance | X% cơ hội đòn thường đánh 2 lần với 50% sát thương mỗi lần |
| Invincibility Frame | Kéo dài cửa sổ bất tử khi Né/Lăn thêm X giây |

---

## Khai thác & Thu hoạch

**Công cụ yêu cầu:**
- Cuốc chim (Pickaxe): khai thác quặng
- Rìu / Liềm: chặt gỗ và tre

**Hiệu suất theo cấp công cụ:**

| Cấp công cụ | Số lần chạm / quặng |
|---|---|
| Gỗ (Wooden) | 1 lần (rất chậm) |
| Sắt (Iron) | 3 lần |
| Vàng (Golden) | 5 lần (nhanh hơn) |

- Mỗi mỏ tài nguyên thả **2–4 vật phẩm** tùy cấp công cụ và chỉ số May mắn (Luck)
- **Hồi sinh tài nguyên:** mỗi 30 phút thực theo từng khu vực (không theo từng mỏ riêng lẻ)

**Phân bố tài nguyên theo khu vực:**

| Tài nguyên | Khu vực |
|---|---|
| Quặng Sắt | Đồng Cỏ, Rừng Tre |
| Quặng Bạc | Hang Động, Núi Tuyết |
| Quặng Vàng | Rừng Cổ, Rừng Thiêng |
| Pha Lê | Tất cả hang động |
| Than Đá | Hang Động trở lên |
| Gỗ Thường | Tất cả khu vực |
| Tre | Rừng Tre |
| Gỗ Cổ Đại | Rừng Cổ trở lên |

---

## Mini-game Câu Cá

1. Bấm phím hành động tại ô nước bất kỳ (hồ, sông, ao hang động) để thả cần
2. Chờ **3–10 giây** để có cá cắn câu (thời gian ngắn hơn với Luck cao hơn và cần tốt hơn)
3. Khi cá cắn: thanh định thời xuất hiện với kim chỉ di chuyển và **vùng xanh (sweet zone)** hiển thị phạm vi mục tiêu
4. Bấm phím hành động khi kim nằm trong vùng xanh → bắt được cá; trượt → mất cá, phải thả lại

**Kích thước vùng xanh theo độ hiếm:**

| Độ hiếm cá | Kích thước vùng xanh |
|---|---|
| Thường (Common) | 30% thanh |
| Hiếm (Rare) | Nhỏ hơn |
| Huyền thoại (Legendary) | 8% thanh |

- **Chuỗi bắt liên tiếp:** 3+ lần bắt thành công không trượt → độ hiếm cá tiếp theo tăng 1 bậc

---

## Hệ thống Phân Bón

> Phân bón phải được bón vào **đất trống đã cày** trước khi gieo hạt; không thể bón sau khi đã trồng cây.
> Mỗi ô đất chỉ áp dụng được **1 lần phân bón** mỗi chu kỳ trồng trọt.

| Loại phân bón | Hiệu quả | Nguồn |
|---|---|---|
| Phân bón thường | +25% sản lượng thu hoạch | Mua tại Cô Nông Lan — 200đ |
| Phân bón ma thuật | +50% sản lượng + tốc độ sinh trưởng nhanh hơn 20% (nhân `growth_hours × 0.8`) | Craft tại Nhà giả kim Lv 1 |
| Phân hữu cơ | +15% sản lượng + phục hồi 20% độ ẩm ô đất | Craft: 5 phế phẩm cây trồng tại nhà |
| Phân Bón Thần Kỳ | Tốc độ sinh trưởng tăng 100% (nhân `growth_hours × 0.5`) trong **24 giờ**, áp dụng toàn bộ nông trại | Phần thưởng SQ-03 (5 cuộn); không bán ở shop |

---

## Nâng cấp Trạm Chế Tạo

### Lò rèn *(Blacksmith Forge)* — yêu cầu để chế tạo trang bị cấp cao hơn

| Cấp | Yêu cầu nhân vật | Chi phí |
|---|---|---|
| Lv 1 (mặc định) | Lv 1 | Miễn phí (tặng ngay khi bắt đầu) |
| Lv 2 | Lv 10 | 2.000đ + 20 Quặng Sắt + 10 Đá |
| Lv 3 | Lv 30 | 10.000đ + 15 Quặng Bạc + 20 Quặng Sắt + 5 Pha Lê |
| Lv 4 | Lv 60 | 50.000đ + 10 Quặng Vàng + 30 Pha Lê + 5 Vảy Rồng |

### Nhà giả kim *(Alchemist Lab)*

| Cấp | Yêu cầu nhân vật | Chi phí |
|---|---|---|
| Lv 1 | Lv 5 | 500đ + 10 Pha Lê |
| Lv 2 | Lv 25 | 5.000đ + 20 Pha Lê + 10 Thảo Dược |
| Lv 3 | Lv 50 | 30.000đ + 5 Lõi Trùm + 20 Pha Lê |

---

## Cơ chế Kẻ Địch

- **Tầm phát hiện:** 5–8 ô tùy loại kẻ địch (kẻ địch tầm xa phát hiện ở 8 ô, tầm gần ở 5 ô)
- **Aggro:** khi vào tầm phát hiện, đuổi theo người chơi cho đến khi cách xa 12 ô hoặc kẻ địch chết
- **Hồi sinh kẻ địch:** toàn bộ kẻ địch trong khu vực hồi sinh **5 phút sau khi vào lại khu vực** (hoặc sau 30 phút thực)
- **Cấp độ cố định:** kẻ địch có cấp cố định theo khu vực, không tự điều chỉnh theo cấp người chơi
- **Trùm (Boss):** không hồi sinh sau khi chết, ngoại trừ trùm sự kiện theo lịch

### Người Rơm (Training Dummy) — ngoại lệ, không phải kẻ địch thật

Đứng ở Bãi Tập Luyện (xem `docs/world/maps.md`), dùng cơ chế **hoàn toàn khác** mọi kẻ địch thật ở trên — không dùng `monsters.json`, không có HP/ATK/DEF:

- **Không phát hiện/aggro** — đứng yên tuyệt đối, không bao giờ tự tấn công người chơi, không có tầm phát hiện.
- **Không dùng công thức damage** (`ATK × multiplier × 100/(100+DEF)`) — chỉ **đếm số lần bị trúng đòn** (mỗi `hit` tính riêng theo `skills.json.hits`, không tính theo số lần bấm chiêu). Đủ **5 lần trúng** → "chết" (despawn + hiệu ứng rơm vỡ tung), bất kể ATK người chơi cao hay thấp.
- **Hồi sinh sau đúng 15 giây thực** (không phải 5 phút như kẻ địch thường) — respawn lại đúng vị trí ban đầu, reset về 0 lần trúng.
- **Không rớt EXP/gold/drop**, không tính vào bất kỳ kill-count của quest/achievement nào.
- Đã chết (đang trong 15s chờ respawn) thì không có hitbox — chiêu AOE/piercing lan tới vị trí cũ không tính gì.
- 1 chiêu trúng nhiều Người Rơm cùng lúc (AOE) → mỗi Người Rơm đếm độc lập, không dùng chung 1 bộ đếm.

---

## Hệ thống Chuyển Màn (Map Transition)

Lần đầu cần tới ở Bãi Tập Luyện (map phụ đầu tiên nối với Map 1 — Nông Trại, xem `docs/world/maps.md`) — dùng lại được cho mọi lần chuyển map sau này (Village, Map 2-7):

- Mỗi map định nghĩa 1 hoặc nhiều **Exit Zone** (vùng hình chữ nhật/polygon ở rìa bản đồ, giống pattern `collisionZones.ts` đã có) — khi player entity chạm vùng này, kích hoạt chuyển màn.
- Chuyển màn: fade-out màn hình (khoảng 300-500ms) → dừng scene/tải background + collision của map đích → đặt player tại **Entry Point** tương ứng của map đích (toạ độ cố định, không phải toạ độ Exit Zone vừa rời) → fade-in.
- Mỗi Exit Zone biết trước map đích + Entry Point tương ứng (định nghĩa 2 chiều — Exit Zone ở Farm dẫn tới Entry Point ở Bãi Tập Luyện, và ngược lại).
- Trong lúc fade (cả fade-out và fade-in) khóa input di chuyển/tấn công của người chơi, giống cách khóa input khi menu hạt giống/túi đồ/bảng công cụ nông trại đang mở (đã có sẵn pattern này ở `GameScene.update()`).

---

## Quy tắc Hiệu ứng Trạng thái

Mỗi hiệu ứng có thời gian tồn tại riêng và **không thể chồng chất** — chỉ làm mới thời gian:

| Hiệu ứng | Sát thương | Thời gian | Quy tắc ghi đè |
|---|---|---|---|
| Độc (Poison) | 5 HP/giây | 10 giây | Làm mới khi áp dụng lại |
| Bỏng (Burn) | 8 HP/giây | 6 giây | Ghi đè Độc |
| Chảy máu (Bleed) | 12 HP/giây | 4 giây | Không chồng; chỉ làm mới |
| Chậm (Slow) | Tốc độ di chuyển -30% | 5 giây | Hiệu ứng chậm mạnh hơn sẽ ghi đè |
| Choáng (Stun) | Không thể di chuyển / tấn công | 1–2 giây | Không thể áp lại trong 5 giây sau khi hết |
| Giảm giáp (DEF Down) | DEF -30% | 8 giây | Làm mới khi áp dụng lại |

---

## Hệ thống Cooldown Kỹ năng

- Mọi kỹ năng có cooldown > 0 giây đều hiển thị **đồng hồ đếm ngược** trực quan trên ô hotbar tương ứng
- Cooldown bắt đầu tính ngay **sau khi kích hoạt kỹ năng** (không phải sau khi hiệu ứng kết thúc)
- Chỉ số phụ **"Giảm CD Kỹ năng"** làm giảm toàn bộ cooldown đang hoạt động theo % đó (tối đa **30% giảm** từ chỉ số phụ)
- **Không có Global Cooldown:** có thể sử dụng nhiều kỹ năng liên tiếp miễn đủ MP
