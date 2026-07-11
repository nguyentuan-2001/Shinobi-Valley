# Hệ thống chiến đấu

## Vũ khí & Hệ chiêu thức

5 loại vũ khí = 5 hệ riêng biệt, mỗi hệ có **10 chiêu thức: 6 Chủ động (Active) + 4 Bị động (Passive)**.

Mỗi 10 cấp mở khóa 1 chiêu mới, theo đúng thứ tự chiêu 1-10 (bảng mở khóa ở cuối file).

### Chủ động (Active) vs Bị động (Passive)

- **Active** (bao gồm cả loại `buff`/`debuff`/`ultimate` — 4 loại này đều cần bấm để kích hoạt): tốn MP, có cooldown riêng theo `skills.json`, người chơi tự chọn lúc nào dùng.
- **Passive** (4 chiêu/hệ, luôn nằm ở chiêu #3/#5/#7/#9 — mở ở Lv20/40/60/80): **không tốn MP, không cooldown**, tự động có hiệu lực ngay khi đủ cấp mở khóa, miễn đang cầm đúng vũ khí của hệ đó. Đổi hệ vũ khí khác (tại nhà) → passive hệ cũ mất hiệu lực ngay, passive hệ mới có hiệu lực ngay, không cần thao tác kích hoạt gì thêm.
- 4 Passive của mỗi hệ theo đúng **4 vai trò cố định** để cân bằng độ mạnh giữa 5 hệ (nội dung cụ thể khác nhau theo phong cách từng hệ):
  1. **Sinh tồn** (Lv20) — sống lâu hơn (DEF/HP/né đòn/giảm dmg nhận...)
  2. **Sát thương** (Lv40) — tăng damage output theo điều kiện gắn với phong cách hệ
  3. **Tiện ích** (Lv60) — tăng tốc (attack speed/move speed/tầm đánh/giảm cooldown chiêu Active)
  4. **Hiệu ứng ngẫu nhiên** (Lv80) — proc effect mạnh nhất, gắn liền dấu ấn riêng của hệ

| Hệ | Vũ khí | Phong cách |
|---|---|---|
| Kiếm sĩ | Kiếm | Cận chiến, sát thương cao |
| Song Kiếm | Song kiếm | Tốc độ, đa đòn |
| Thương sĩ | Giáo | Tầm dài, khống chế |
| Cung thủ | Cung | Tầm xa, AOE |
| Ninja | Phi tiêu | Cơ động, ám sát |

---

## Thuộc tính nhân vật

| Thuộc tính | Ký hiệu | Mô tả |
|---|---|---|
| HP | Máu | Chết khi về 0 |
| MP | Mana | Chi phí dùng chiêu |
| ATK | Tấn công | Sát thương cơ bản |
| DEF | Phòng thủ | Giảm sát thương nhận vào |
| Crit | Chí mạng | % xác suất chí mạng (×1.5 sát thương) |
| Attack Speed | Tốc độ đánh | Số đòn / giây |
| Move Speed | Tốc độ di chuyển | Pixel / giây |
| Luck | May mắn | Tăng drop rate, tỉ lệ may |

---

## Hệ thống điểm thuộc tính

Mỗi lần lên cấp nhận **10 điểm thuộc tính tự do**.

### Quy đổi: 1 điểm =

| Thuộc tính | Giá trị |
|---|---|
| HP | +100 |
| MP | +100 |
| ATK | +10 |
| DEF | +5 |
| Move Speed | +2 |

### Quy đổi: 10 điểm =

| Thuộc tính | Giá trị |
|---|---|
| Crit | +1% |
| Attack Speed | +1% |
| Luck | +1 |

> Ví dụ: Dùng 5 điểm vào HP (+500 máu), 3 điểm vào ATK (+30 tấn công), 20 điểm vào Crit (+2%).

---

## Hệ Kiếm Sĩ

Phong cách: Cận chiến chắc chắn, sát thương bùng nổ đơn mục tiêu.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Chém nhanh | Lv 1 | Active | Một nhát chém cơ bản, tốc độ cao | 120% ATK |
| 2 | Chém xoáy | Lv 10 | Active | Xoay người, tấn công vùng xung quanh | 150% ATK |
| 3 | Thiết Cốt Kiếm Tâm | Lv 20 | **Passive** (Sinh tồn) | Cơ thể luôn bao phủ 1 lớp kiếm khí mỏng khi cầm Kiếm | +15% DEF |
| 4 | Đâm xuyên | Lv 30 | Active | Đâm thẳng xuyên qua hàng quái | 160% ATK |
| 5 | Trọng Kiếm Tích Lực | Lv 40 | **Passive** (Sát thương) | Đòn đánh thường thứ 3 liên tiếp tự động nặng hơn | +40% ATK vào đòn thứ 3 combo |
| 6 | Vũ kiếm | Lv 50 | Active | Quay tròn liên tục 2 giây, hit nhiều lần | 60% ATK / hit |
| 7 | Kiếm Tâm Bất Diệt | Lv 60 | **Passive** (Tiện ích) | Tâm kiếm vững vàng, chiêu nào cũng sẵn sàng nhanh hơn | -15% cooldown mọi chiêu Active hệ Kiếm Sĩ |
| 8 | Hào quang kiếm | Lv 70 | Buff (Active) | Bao phủ thân kiếm khí, tăng sát thương | +50% ATK trong 10s |
| 9 | Sát Ý Kiếm Khách | Lv 80 | **Passive** (Proc) | Đòn chí mạng mang theo sát ý làm địch tê cứng | Đòn Crit: 30% cơ hội Stun 1s |
| 10 | Vô ảnh kiếm | Lv 90 | Ultimate | Tàng hình tức thời, xuất hiện chém chí mạng | 800% ATK, Crit 100% |

---

## Hệ Song Kiếm

Phong cách: Tốc độ đánh cao, combo nhiều đòn, hút sinh lực.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Chém kép | Lv 1 | Active | 2 nhát nhanh liên tiếp | 70%+70% ATK |
| 2 | Liên hoàn chém | Lv 10 | Active | 5 nhát nhanh, không thể bị ngắt | 50%×5 ATK |
| 3 | Thân Pháp Khinh Vũ | Lv 20 | **Passive** (Sinh tồn) | Bước chân nhẹ nhàng nhờ song kiếm nhẹ, né đòn tốt hơn | +10% tỉ lệ né đòn |
| 4 | Song long xuất hải | Lv 30 | Active | Đâm 2 kiếm cùng lúc, knockback | 280% ATK |
| 5 | Song Đao Cuồng Loạn | Lv 40 | **Passive** (Sát thương) | Combo đánh thường tự thêm 1 nhát cuối chuỗi | +1 hit cuối combo, +10% ATK tổng combo |
| 6 | Huyết kiếm | Lv 50 | Active | Gây chảy máu (Bleed), hút 15% sát thương | 30% ATK/s × 5s |
| 7 | Tốc Kiếm Liên Hoàn | Lv 60 | **Passive** (Tiện ích) | Hai tay kiếm phối hợp nhuần nhuyễn, ra đòn nhanh hơn | +15% Attack Speed |
| 8 | Ảo ảnh | Lv 70 | Active | Triệu hồi phân thân tấn công đồng thời | 2 phân thân × 200% ATK |
| 9 | Huyết Vũ Song Đao | Lv 80 | **Passive** (Proc) | Mỗi nhát chém có cơ hội rút máu địch nuôi bản thân | Đòn thường: 20% cơ hội hút 5% sát thương thành HP |
| 10 | Thiên địa song kiếm | Lv 90 | Ultimate | Tối thượng chiêu — tạo ra 2 cơn lốc kiếm bao phủ màn hình | 1000% ATK tổng |

---

## Hệ Thương Sĩ

Phong cách: Tầm đánh dài nhất, khống chế, giảm phòng thủ địch.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Đâm thẳng | Lv 1 | Active | Đâm thẳng, tầm dài nhất trong các hệ | 130% ATK |
| 2 | Quét ngang | Lv 10 | Active | Quét giáo ngang, đẩy lùi hàng quái | 150% ATK, Knockback |
| 3 | Thương Sĩ Kiên Trận | Lv 20 | **Passive** (Sinh tồn) | Trụ vững tuyến đầu nhờ tầm giáo dài, khó bị đẩy lùi | +200 HP tối đa, +10% giảm knockback bị đẩy lùi |
| 4 | Đâm xoáy | Lv 30 | Active | Xoay giáo đâm liên tục tốc độ cao | 60% ATK × 5 hit |
| 5 | Trường Thương Xuyên Giáp | Lv 40 | **Passive** (Sát thương) | Giáo đâm mạnh hơn vào kẻ địch đã lộ sơ hở | +15% ATK lên mục tiêu đang bị giảm DEF |
| 6 | Phá giáp | Lv 50 | Debuff (Active) | Đòn đánh giảm DEF địch mạnh | -30% DEF địch trong 8s |
| 7 | Thương Pháp Quảng Vực | Lv 60 | **Passive** (Tiện ích) | Thân pháp thương pháp mở rộng tầm kiểm soát | +20% tầm đánh mọi chiêu Active |
| 8 | Thiên hà thương | Lv 70 | Active | Phóng giáo đi xa, phát nổ khi đến nơi | 450% ATK, AOE |
| 9 | Long Thương Khống Chế | Lv 80 | **Passive** (Proc) | Mỗi cú đâm mang theo dư chấn làm chậm địch | Đòn thường: 15% cơ hội Slow 30% trong 3s |
| 10 | Vạn lý thương pháp | Lv 90 | Ultimate | Đâm xuyên toàn màn hình, tất cả kẻ địch nhận sát thương | 900% ATK |

---

## Hệ Cung Thủ

Phong cách: Tầm xa, an toàn, AOE mạnh, kiểm soát đám đông.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Bắn thẳng | Lv 1 | Active | Bắn 1 tên cơ bản, tầm xa | 120% ATK |
| 2 | Bắn xuyên | Lv 10 | Active | Tên xuyên qua nhiều kẻ địch theo đường thẳng | 140% ATK |
| 3 | Cung Thủ Thủ Thế | Lv 20 | **Passive** (Sinh tồn) | Đứng xa an toàn hơn, hạn chế sát thương từ khoảng cách xa | -15% sát thương nhận khi khoảng cách tới mục tiêu > tầm trung |
| 4 | Liên hoàn tiễn | Lv 30 | Active | Bắn 5 tên nhanh liên tiếp | 60%×5 ATK |
| 5 | Nhãn Lực Tập Trung | Lv 40 | **Passive** (Sát thương) | Ngắm kỹ trước khi bắn cho chí mạng chuẩn hơn | +20% Crit chance khi đứng yên ≥ 1s trước khi bắn |
| 6 | Tên lửa | Lv 50 | Active | Tên tốc độ gấp đôi, gây Burn 3 giây | 350% ATK + Burn |
| 7 | Cung Pháp Tốc Xạ | Lv 60 | **Passive** (Tiện ích) | Vừa lùi vừa bắn nhanh hơn, đúng phong cách kiting | +15% Attack Speed khi đang di chuyển ra xa mục tiêu |
| 8 | Xạ điêu thủ | Lv 70 | Buff (Active) | Vào tư thế, tăng Crit mạnh trong thời gian ngắn | +50% Crit trong 15s |
| 9 | Bách Xạ Quán Nhật | Lv 80 | **Passive** (Proc) | Tích lũy đủ số đòn, tự động bắn thêm 1 mũi tên miễn phí | Mỗi 10 đòn đánh thường: tự bắn thêm 1 tên 100% ATK, không tốn MP |
| 10 | Thánh cung tiễn | Lv 90 | Ultimate | Cung phát sáng, bắn 1 tên hủy diệt xuyên thấu tất cả | 1000% ATK, không thể tránh |

---

## Hệ Ninja

Phong cách: Cơ động cao nhất, ám sát, gây độc, phân thân.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Phi tiêu | Lv 1 | Active | Phóng 1 phi tiêu chính xác, tầm xa | 110% ATK |
| 2 | Phi tiêu kép | Lv 10 | Active | Phóng 3 phi tiêu cùng lúc theo hình rẻ quạt | 80%×3 ATK |
| 3 | Ẩn Thân Bộ Pháp | Lv 20 | **Passive** (Sinh tồn) | Bộ pháp ninja nhẹ nhàng, di chuyển nhanh hơn hẳn | +15% Move Speed |
| 4 | Dịch chuyển | Lv 30 | Active | Biến mất và xuất hiện ở vị trí chỉ định tức thì | Teleport + 150% ATK |
| 5 | Độc Ảnh Thích Sát | Lv 40 | **Passive** (Sát thương) | Đánh mạnh hơn vào kẻ địch đã trúng độc/hiệu ứng | +25% sát thương lên mục tiêu đang bị debuff (poison/bleed/slow/stun/burn) |
| 6 | Bóng tối | Lv 50 | Buff (Active) | Ẩn vào bóng tối, tăng Crit khi ra đòn đầu tiên | Tàng hình 5s + Crit 100% |
| 7 | Thân Ảnh Bất Định | Lv 60 | **Passive** (Tiện ích) | Ra đòn chí mạng giúp tinh thần ám sát trỗi lên, chiêu hồi nhanh hơn | Đòn Crit: -15% cooldown chiêu Active đang hồi |
| 8 | Phân thân đại chiến | Lv 70 | Active | Triệu hồi 4 phân thân, mỗi phân thân đánh độc lập | 4 phân thân × 150% ATK |
| 9 | Vô Ảnh Phân Thân | Lv 80 | **Passive** (Proc) | Sắp gục thì bản năng ninja tự tạo phân thân hút đòn thế thân | HP < 30%: tự tạo 1 phân thân hút toàn bộ đòn đánh trong 3s (cooldown riêng 60s) |
| 10 | Vô ảnh sát | Lv 90 | Ultimate | Tàng hình hoàn toàn rồi kết liễu mục tiêu yếu nhất | 1200% ATK, không thể bị phát hiện |

---

## Bảng mở khóa chiêu thức

| Cấp độ | Chiêu mở khóa | Loại |
|---|---|---|
| Lv 1 | Chiêu 1 (tất cả hệ) | Active |
| Lv 10 | Chiêu 2 | Active |
| Lv 20 | Chiêu 3 | **Passive** (Sinh tồn) |
| Lv 30 | Chiêu 4 | Active |
| Lv 40 | Chiêu 5 | **Passive** (Sát thương) |
| Lv 50 | Chiêu 6 | Active |
| Lv 60 | Chiêu 7 | **Passive** (Tiện ích) |
| Lv 70 | Chiêu 8 | Active |
| Lv 80 | Chiêu 9 | **Passive** (Proc) |
| Lv 90 | Chiêu 10 (Ultimate) | Active |

→ Mọi hệ đều theo đúng nhịp này: 6 Active (chiêu 1,2,4,6,8,10) + 4 Passive (chiêu 3,5,7,9). Trùng đúng vị trí 4/5 hệ đã có Buff/Debuff sẵn ở thiết kế cũ (Hào quang kiếm Lv70, Phá giáp Lv50, Xạ điêu thủ Lv70, Bóng tối Lv50) — xác nhận nhịp Active/Passive này tự nhiên khớp với thiết kế gốc, không cần đảo lộn các chiêu Active đã có.

---

## Case xử lý khi chiến đấu

Danh sách đầy đủ các trường hợp cần xử lý đúng trước khi code Sprint 5 — tránh phát hiện thiếu case giữa lúc code (giống các lỗ hổng logic nông trại đã gặp ở Sprint 4).

### Sát thương & hit

1. **Đòn trúng bình thường**: `damage = ATK × damage_multiplier × 100/(100+DEF)`, roll Crit riêng (×1.5 nếu trúng), dmg tối thiểu luôn ≥ 1 dù DEF cao tới đâu.
2. **Chiêu nhiều `hits`** (vd Vũ Kiếm 60% ATK × nhiều hit trong 2s): mỗi hit tính sát thương + roll Crit + roll proc passive **độc lập**, không tính chung 1 lần cho cả chiêu.
3. **Chiêu AOE trúng nhiều mục tiêu cùng lúc**: mỗi mục tiêu nhận sát thương/hiệu ứng/proc riêng, không chia sẻ hay giảm theo số lượng mục tiêu trúng.
4. **Đánh trúng mục tiêu đã chết/đang despawn** (vd AOE lan tới đúng lúc mục tiêu vừa chết bởi hit trước trong cùng chiêu multi-hit): bỏ qua, không tính thêm sát thương/EXP/drop.
5. **Đánh khi không có gì trong tầm/hitbox** (hệ này không dùng target-lock, đánh theo hướng/vùng cố định): vẫn tốn MP + vào cooldown như bình thường (giống hành động thật ngoài đời, không phải né phí tài nguyên vì bấm hụt).
6. **DOT (Poison/Bleed/Burn) đang tick mà mục tiêu chết** (do damage khác hoặc do chính DOT): dừng tick ngay, không tính nốt sát thương còn lại của hiệu ứng.

### Trạng thái & tài nguyên

7. **Dùng chiêu khi đang cooldown**: chặn hoàn toàn, không tốn MP, không có tác dụng gì (tương tự bấm phím khi ô hotbar đang hiện đồng hồ đếm ngược).
8. **Dùng chiêu không đủ MP**: chặn tương tự case 7, không trừ MP âm.
9. **Status effect cùng loại áp lại trong lúc đang tồn tại**: chỉ **làm mới thời gian** (refresh duration), không cộng dồn sát thương/độ mạnh — theo đúng bảng đã có ở `docs/gameplay/mechanics.md` mục "Quy tắc Hiệu ứng Trạng thái".
10. **Nhiều Passive cùng loại proc trên 1 đòn đánh** (vd Ninja có Độc Ảnh Thích Sát + Thân Ảnh Bất Định cùng lúc đủ điều kiện): mỗi Passive roll `proc_chance` **độc lập**, không loại trừ nhau.
11. **Đổi hệ vũ khí/class**: chỉ thực hiện được tại nhà (Ngôi Nhà Nông Trại, theo `dev-schedule.md` Sprint 11) — không đổi được giữa lúc đang ở map chiến đấu/đang trong combat. Đổi hệ → mất toàn bộ Active đang cooldown của hệ cũ (reset sạch), Passive hệ mới có hiệu lực ngay.

### Chết & hồi sinh

12. **Quái thường chết**: despawn, cộng EXP/gold theo bảng, roll loot table, hồi sinh lại sau **10 giây thực** kể từ lúc chết (theo `mechanics.md` mục "Cơ chế Kẻ Địch" — đổi từ mốc "5 phút/30 phút thực" ban đầu theo yêu cầu thực tế lúc chơi thử).
13. **Người chơi chết**: mất 10% Đồng đang cầm (rơi ra ngoài, despawn sau 5 phút nếu không nhặt lại), respawn 50% HP/MP tại làng (Map 0).
14. **Boss chết**: không hồi sinh (trừ boss sự kiện theo lịch) — khác hẳn quái thường.
15. **Người Rơm (Training Dummy) chết** — hoàn toàn khác 3 case trên, xem đầy đủ ở `docs/gameplay/mechanics.md` mục "Người Rơm (Training Dummy)": không dùng công thức damage, chỉ đếm đủ **5 lần trúng** (mỗi hit tính riêng theo case 2/3) → despawn, không EXP/gold/drop, không tính kill-count quest, hồi sinh sau đúng **10 giây thực** tại đúng vị trí ban đầu (cùng nhịp với quái thường). Đã chết thì không có hitbox tới lúc hồi sinh xong (case 4 áp dụng).

### Va chạm bản đồ

16. **Tấn công xuyên tường/vật cản** (hitbox chiêu có tầm dài như Đâm xuyên/Long thương): hitbox chặn tại điểm va collision polygon gần nhất, không xuyên qua tường dù tầm chiêu còn dài hơn.
17. **Người chơi đi vào Exit Zone giữa lúc đang tấn công/combo**: hoàn tất chuyển màn ngay (theo `mechanics.md` mục "Hệ thống Chuyển Màn"), huỷ combo/animation đang chạy, không mang theo cooldown đang tính dở sang map mới (cooldown vẫn tính bình thường, chỉ animation/hitbox bị huỷ).
