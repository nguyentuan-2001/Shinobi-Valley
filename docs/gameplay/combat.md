# Hệ thống chiến đấu

## Vũ khí & Hệ chiêu thức

5 loại vũ khí = 5 hệ riêng biệt, mỗi hệ có **10 chiêu thức**.

Mỗi 10 cấp mở khóa 1 chiêu mới.

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
| 3 | Kiếm khí | Lv 20 | Active | Phóng lưỡi khí về phía trước, tầm xa | 180% ATK |
| 4 | Đâm xuyên | Lv 30 | Active | Đâm thẳng xuyên qua hàng quái | 160% ATK |
| 5 | Tam liên chém | Lv 40 | Active | 3 cú chém liên tiếp cực nhanh | 100%+100%+120% ATK |
| 6 | Vũ kiếm | Lv 50 | Active | Quay tròn liên tục 2 giây, hit nhiều lần | 60% ATK / hit |
| 7 | Bão kiếm | Lv 60 | Active | Tạo vùng bão kiếm lớn xung quanh | 350% ATK, AOE |
| 8 | Hào quang kiếm | Lv 70 | Buff | Bao phủ thân kiếm khí, tăng sát thương | +50% ATK trong 10s |
| 9 | Thiên sát kiếm | Lv 80 | Active | Nhảy lên cao rồi đập xuống, AOE lớn | 500% ATK |
| 10 | Vô ảnh kiếm | Lv 90 | Ultimate | Tàng hình tức thời, xuất hiện chém chí mạng | 800% ATK, Crit 100% |

---

## Hệ Song Kiếm

Phong cách: Tốc độ đánh cao, combo nhiều đòn, hút sinh lực.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Chém kép | Lv 1 | Active | 2 nhát nhanh liên tiếp | 70%+70% ATK |
| 2 | Liên hoàn chém | Lv 10 | Active | 5 nhát nhanh, không thể bị ngắt | 50%×5 ATK |
| 3 | Xoáy lốc | Lv 20 | Active | Quay tròn 2 tay kiếm, AOE vừa | 200% ATK |
| 4 | Song long xuất hải | Lv 30 | Active | Đâm 2 kiếm cùng lúc, knockback | 280% ATK |
| 5 | Vũ điệu lưỡi dao | Lv 40 | Active | Di chuyển tự do trong lúc tấn công liên tục | 320% ATK |
| 6 | Huyết kiếm | Lv 50 | Active | Gây chảy máu (Bleed), hút 15% sát thương | 30% ATK/s × 5s |
| 7 | Bão song kiếm | Lv 60 | Active | Bão kiếm kép, vùng lớn hơn kiếm đơn | 400% ATK, AOE |
| 8 | Ảo ảnh | Lv 70 | Active | Triệu hồi phân thân tấn công đồng thời | 2 phân thân × 200% ATK |
| 9 | Song long phá thiên | Lv 80 | Active | Kết hợp 2 tay vào cú đánh bùng nổ | 600% ATK |
| 10 | Thiên địa song kiếm | Lv 90 | Ultimate | Tối thượng chiêu — tạo ra 2 cơn lốc kiếm bao phủ màn hình | 1000% ATK tổng |

---

## Hệ Thương Sĩ

Phong cách: Tầm đánh dài nhất, khống chế, giảm phòng thủ địch.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Đâm thẳng | Lv 1 | Active | Đâm thẳng, tầm dài nhất trong các hệ | 130% ATK |
| 2 | Quét ngang | Lv 10 | Active | Quét giáo ngang, đẩy lùi hàng quái | 150% ATK, Knockback |
| 3 | Long thương | Lv 20 | Active | Đâm xuyên qua nhiều kẻ địch liên tiếp | 170% ATK / kẻ địch |
| 4 | Đâm xoáy | Lv 30 | Active | Xoay giáo đâm liên tục tốc độ cao | 60% ATK × 5 hit |
| 5 | Thương vũ | Lv 40 | Active | Múa giáo vòng tròn, AOE đầy đủ 360° | 250% ATK |
| 6 | Phá giáp | Lv 50 | Debuff | Đòn đánh giảm DEF địch mạnh | -30% DEF địch trong 8s |
| 7 | Long quyển phong | Lv 60 | Active | Cắm giáo xuống, tạo cơn lốc hút địch vào | 350% ATK, Pull |
| 8 | Thiên hà thương | Lv 70 | Active | Phóng giáo đi xa, phát nổ khi đến nơi | 450% ATK, AOE |
| 9 | Rồng giáng thế | Lv 80 | Active | Đập giáo xuống đất, sóng chấn lan ra | 550% ATK, Stun 2s |
| 10 | Vạn lý thương pháp | Lv 90 | Ultimate | Đâm xuyên toàn màn hình, tất cả kẻ địch nhận sát thương | 900% ATK |

---

## Hệ Cung Thủ

Phong cách: Tầm xa, an toàn, AOE mạnh, kiểm soát đám đông.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Bắn thẳng | Lv 1 | Active | Bắn 1 tên cơ bản, tầm xa | 120% ATK |
| 2 | Bắn xuyên | Lv 10 | Active | Tên xuyên qua nhiều kẻ địch theo đường thẳng | 140% ATK |
| 3 | Mưa tên | Lv 20 | Active | Bắn loạt tên lên trời, rơi xuống vùng chỉ định | 200% ATK, AOE |
| 4 | Liên hoàn tiễn | Lv 30 | Active | Bắn 5 tên nhanh liên tiếp | 60%×5 ATK |
| 5 | Tên bùng nổ | Lv 40 | Active | Tên phát nổ khi trúng mục tiêu, AOE vừa | 280% ATK |
| 6 | Tên lửa | Lv 50 | Active | Tên tốc độ gấp đôi, gây Burn 3 giây | 350% ATK + Burn |
| 7 | Phong tiễn | Lv 60 | Active | Tên mang sức gió, đẩy lùi và làm chậm địch | 400% ATK, Slow 50% |
| 8 | Xạ điêu thủ | Lv 70 | Buff | Vào tư thế, tăng Crit mạnh trong thời gian ngắn | +50% Crit trong 15s |
| 9 | Vạn tiễn quy tông | Lv 80 | Active | Bắn 20 tên tỏa ra tất cả hướng rồi quay về mục tiêu | 500% ATK tổng |
| 10 | Thánh cung tiễn | Lv 90 | Ultimate | Cung phát sáng, bắn 1 tên hủy diệt xuyên thấu tất cả | 1000% ATK, không thể tránh |

---

## Hệ Ninja

Phong cách: Cơ động cao nhất, ám sát, gây độc, phân thân.

| # | Chiêu | Mở ở | Loại | Mô tả | Hệ số |
|---|---|---|---|---|---|
| 1 | Phi tiêu | Lv 1 | Active | Phóng 1 phi tiêu chính xác, tầm xa | 110% ATK |
| 2 | Phi tiêu kép | Lv 10 | Active | Phóng 3 phi tiêu cùng lúc theo hình rẻ quạt | 80%×3 ATK |
| 3 | Phân thân | Lv 20 | Active | Tạo 2 phân thân tấn công song song | 2 phân thân × 100% ATK |
| 4 | Dịch chuyển | Lv 30 | Active | Biến mất và xuất hiện ở vị trí chỉ định tức thì | Teleport + 150% ATK |
| 5 | Độc tiêu | Lv 40 | Active | Phi tiêu gây độc, sát thương theo thời gian | 20% ATK/s × 5s |
| 6 | Bóng tối | Lv 50 | Buff | Ẩn vào bóng tối, tăng Crit khi ra đòn đầu tiên | Tàng hình 5s + Crit 100% |
| 7 | Liên hoàn phi tiêu | Lv 60 | Active | Phóng 10 phi tiêu liên tiếp siêu nhanh | 50%×10 ATK |
| 8 | Phân thân đại chiến | Lv 70 | Active | Triệu hồi 4 phân thân, mỗi phân thân đánh độc lập | 4 phân thân × 150% ATK |
| 9 | Ám sát | Lv 80 | Active | Tức thời xuất hiện sau lưng địch, đòn chí tử | 700% ATK, 50% chance Stun |
| 10 | Vô ảnh sát | Lv 90 | Ultimate | Tàng hình hoàn toàn rồi kết liễu mục tiêu yếu nhất | 1200% ATK, không thể bị phát hiện |

---

## Bảng mở khóa chiêu thức

| Cấp độ | Chiêu mở khóa |
|---|---|
| Lv 1 | Chiêu 1 (tất cả hệ) |
| Lv 10 | Chiêu 2 |
| Lv 20 | Chiêu 3 |
| Lv 30 | Chiêu 4 |
| Lv 40 | Chiêu 5 |
| Lv 50 | Chiêu 6 |
| Lv 60 | Chiêu 7 |
| Lv 70 | Chiêu 8 |
| Lv 80 | Chiêu 9 |
| Lv 90 | Chiêu 10 (Ultimate) |
