# Hệ thống nhiệm vụ (Quest)

> **Shinobi Valley** — Game nông trại + hành động nhập vai ninja 2D pixel art góc nhìn trên xuống, bối cảnh Làng Ẩn Nhân bị phong ấn bởi Ma Khí.

---

## Tổng quan

Hệ thống nhiệm vụ là xương sống dẫn dắt người chơi qua hành trình từ một học trò ninja mới vào nghề cho đến người giải phóng ngôi làng khỏi lời nguyền Ma Khí. Nhiệm vụ được phân thành bốn loại, kết hợp cốt truyện chính, nội dung phụ và hoạt động hằng ngày.

| Loại nhiệm vụ | Số lượng | Mục đích |
|---|---|---|
| Nhiệm vụ chính (Main Story) | 10 | Dẫn dắt cốt truyện từ Lv 1 → Lv 80 |
| Nhiệm vụ phụ (Side Quests) | 8 | Nội dung tùy chọn, gắn với NPC |
| Nhiệm vụ hằng ngày (Daily Quests) | 5 (xoay vòng, chọn 3/ngày) | Phần thưởng hằng ngày, reset mỗi 24 giờ |
| Nhiệm vụ nghề nghiệp (Profession Quests) | 6 | Mở khóa nghề nghiệp |

---

## Các loại nhiệm vụ

### Nhiệm vụ chính (Main Story Quests)

Chuỗi 10 nhiệm vụ cốt lõi. Mỗi nhiệm vụ tiếp theo chỉ mở khóa sau khi hoàn thành nhiệm vụ trước. Cốt truyện xoay quanh bí ẩn phong ấn của ngôi làng và hành trình rèn Kiếm Hư Vô để thanh tẩy Linh Thụ Cổ Đại.

### Nhiệm vụ phụ (Side Quests)

Nhiệm vụ một lần, không bắt buộc, do từng NPC giao. Cung cấp bối cảnh nhân vật, phần thưởng hiếm và nội dung bổ sung ngoài cốt truyện chính.

### Nhiệm vụ hằng ngày (Daily Quests)

Hệ thống quay vòng 5 nhiệm vụ, người chơi chọn hoàn thành 3 nhiệm vụ mỗi ngày. Reset lúc 00:00 (giờ máy chủ). Khuyến khích hoạt động đều đặn mỗi ngày.

### Nhiệm vụ nghề nghiệp (Profession Quests)

Mỗi nghề nghiệp có một nhiệm vụ mở khóa duy nhất. Hoàn thành nhiệm vụ này mới kích hoạt cây kỹ năng và cơ chế chuyên sâu của nghề đó.

---

## Nhiệm vụ chính (Main Story Quests)

---

### MQ-01 — Mảnh Đất Đầu Tiên

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-01 |
| Tên | Mảnh Đất Đầu Tiên |
| Cấp độ mở khóa | Lv 1 |
| NPC giao nhiệm vụ | Cô Nông (Seed Seller) |
| Điều kiện trước | Không có (nhiệm vụ đầu tiên) |

**Bối cảnh:**
Ngay sau khi tỉnh dậy trong Làng Ẩn Nhân bị phong ấn, Cô Nông tiếp cận người chơi. Bà giải thích rằng để sống sót trong làng, người chơi cần tự tay trồng lương thực — điều đầu tiên mọi ninja trẻ phải học là kiên nhẫn với đất.

**Mục tiêu:**
1. Trồng 5 Hành Lá vào ô đất nông trại
2. Tưới nước cho 5 Hành Lá (dùng Bình tưới gỗ được cấp sẵn)
3. Đợi cây trưởng thành và thu hoạch đủ 5 Hành Lá

**Phần thưởng:**
- 200 XP
- 300đ (đồng Làng)
- 1 Bình tưới gỗ (nếu chưa có)
- Mở khóa: hệ thống nông trại cơ bản

---

### MQ-02 — Ngôi Làng Bị Cô Lập

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-02 |
| Tên | Ngôi Làng Bị Cô Lập |
| Cấp độ mở khóa | Lv 3 |
| NPC giao nhiệm vụ | Lão Làng (Village Chief) |
| Điều kiện trước | Hoàn thành MQ-01 |

**Bối cảnh:**
Lão Làng triệu tập người chơi và giải thích sơ lược về tình trạng phong ấn. Ông yêu cầu người chơi đi gặp từng người trong làng — để hiểu rõ ngôi làng, trước tiên phải biết những con người sống trong đó.

**Mục tiêu:**
1. Nói chuyện với đủ 10 NPC trong Làng Ẩn Nhân:
   - Lão Làng *(đã nói chuyện khi nhận nhiệm vụ)*
   - Cô Nông
   - Thợ Rèn Kim
   - Nhà Giả Kim Bí Ẩn
   - Thầy Dạy Võ
   - Lính canh cổng Bắc
   - Lính canh cổng Nam
   - Bà hàng xén chợ
   - Trẻ em chơi ở quảng trường (2 nhân vật)

**Phần thưởng:**
- 300 XP
- 500đ
- Mở khóa: bản đồ đầy đủ của Làng Ẩn Nhân

---

### MQ-03 — Tiếng Gọi Từ Rừng Tre

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-03 |
| Tên | Tiếng Gọi Từ Rừng Tre |
| Cấp độ mở khóa | Lv 10 |
| NPC giao nhiệm vụ | Lão Làng (Village Chief) |
| Điều kiện trước | Hoàn thành MQ-02 |

**Bối cảnh:**
Tiếng động lạ vọng về từ Rừng Tre phía Đông. Lão Làng tin rằng Ma Khí đã bắt đầu biến đổi các sinh vật trong rừng. Người chơi được giao nhiệm vụ do thám và làm sạch khu vực.

**Mục tiêu:**
1. Tiêu diệt 10 kẻ thù trong khu vực Rừng Tre
2. Thu thập 3 Tre Già (rơi từ kẻ thù hoặc nhặt trong rừng)

**Phần thưởng:**
- 500 XP
- 800đ
- 1 Kiếm sắt
- Mở khóa: hệ thống Boss Hunt cơ bản

---

### MQ-04 — Hang Động Bí Ẩn

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-04 |
| Tên | Hang Động Bí Ẩn |
| Cấp độ mở khóa | Lv 20 |
| NPC giao nhiệm vụ | Thầy Dạy Võ (Dojo Master) |
| Điều kiện trước | Hoàn thành MQ-03 |

**Bối cảnh:**
Thầy Dạy Võ nghe tin về một hang động cổ đại xuất hiện sau khi Ma Khí lan rộng. Ông tin rằng bên trong có di vật của những ninja thế hệ trước — và cũng có nguy hiểm lớn. Đây là bài kiểm tra thực chiến đầu tiên.

**Mục tiêu:**
1. Khám phá toàn bộ Hang Động (mở sương mù ở 3 khu vực trong hang)
2. Tiêu diệt mini-boss: Golem Đá Hang Động *(cấp độ 22)*
3. Mang về 1 Pha Lê Hang Động (rơi từ mini-boss)

**Phần thưởng:**
- 1000 XP
- 1500đ
- 1 Giáp Da (Armor hạng vừa)
- Mở khóa: hệ thống Boss Hunt

---

### MQ-05 — Bí Mật Niêm Phong

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-05 |
| Tên | Bí Mật Niêm Phong |
| Cấp độ mở khóa | Lv 25 |
| NPC giao nhiệm vụ | Lão Làng (Village Chief) |
| Điều kiện trước | Hoàn thành MQ-04 |

**Bối cảnh:**
Lão Làng nhắn người chơi gặp ông vào lúc nửa đêm tại Đài Quan Sát Cổ. Ông cuối cùng quyết định tiết lộ toàn bộ sự thật về nguồn gốc của lời nguyền Ma Khí và vai trò của Linh Thụ Cổ Đại. Đây là nhiệm vụ hội thoại thuần túy — không chiến đấu, chỉ lắng nghe.

**Mục tiêu:**
1. Đến Đài Quan Sát Cổ vào khung giờ 22:00–02:00 (giờ trong game)
2. Nói chuyện với Lão Làng — lắng nghe toàn bộ 5 đoạn hội thoại

**Phần thưởng:**
- 1500 XP
- 2000đ
- Mở khóa: mục Lore "Nguồn Gốc Phong Ấn" trong Nhật Ký
- Mở khóa: đoạn hội thoại mới với Thợ Rèn Kim (liên quan đến MQ-06)

---

### MQ-06 — Thanh Kiếm Đã Mất

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-06 |
| Tên | Thanh Kiếm Đã Mất |
| Cấp độ mở khóa | Lv 30 |
| NPC giao nhiệm vụ | Thợ Rèn Kim (Blacksmith) |
| Điều kiện trước | Hoàn thành MQ-05 |

**Bối cảnh:**
Sau khi Lão Làng tiết lộ bí mật, Thợ Rèn Kim — người vốn lầm lì và khó tính — bất ngờ chủ động tìm đến người chơi. Ông thú nhận rằng ông đã từng rèn một thanh kiếm nghi lễ dùng để phong ấn Linh Thụ, nhưng thanh kiếm đó bị gãy và mảnh vỡ thất lạc trên đỉnh Núi Tuyết. Không có mảnh vỡ đó, không thể rèn lại kiếm mới.

**Mục tiêu:**
1. Đến khu vực Núi Tuyết (mở khóa sau khi nhận nhiệm vụ)
2. Tiêu diệt trùm phòng boss tại Núi Tuyết: Băng Linh Thú *(cấp độ 32)*
3. Nhặt Mảnh Kiếm Nghi Lễ từ rơi vật của boss
4. Mang Mảnh Kiếm Nghi Lễ về cho Thợ Rèn Kim

**Phần thưởng:**
- 2000 XP
- 3000đ
- 5 Đá Nâng Cấp Cấp 2
- Mở khóa: Lò rèn Lv 3 (yêu cầu nguyên liệu từ Hang Động và Núi Tuyết — Silver Ore, Crystal)

---

### MQ-07 — Thuốc Giải Cứu

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-07 |
| Tên | Thuốc Giải Cứu |
| Cấp độ mở khóa | Lv 35 |
| NPC giao nhiệm vụ | Nhà Giả Kim Bí Ẩn (Mysterious Alchemist) |
| Điều kiện trước | Hoàn thành MQ-06 |

**Bối cảnh:**
Ma Khí bắt đầu lan ra khỏi rừng và gây bệnh cho một số dân làng. Nhà Giả Kim Bí Ẩn — người ít khi xuất hiện — đích thân tìm đến người chơi. Ông nói rằng có thể chế thuốc làm chậm quá trình lan rộng của Ma Khí, nhưng cần nguyên liệu đặc biệt mà chỉ có thể tự trồng hoặc đi tìm.

**Mục tiêu:**
1. Trồng và thu hoạch 5 Dược Thảo (cây dược liệu cấp 1)
2. Trồng và thu hoạch 3 Nhân Sâm (cây dược liệu cấp 2)
3. Chế tạo 3 Thuốc Hồi Mana Vừa tại bàn giả kim thuật

**Phần thưởng:**
- 4000 XP
- 5000đ
- Bản thiết kế: Nhà Kính (Greenhouse Blueprint) — tăng tốc độ trồng cây trong điều kiện xấu
- Mở khóa: hệ thống cây dược liệu cấp cao

---

### MQ-08 — Cô Gái Linh Hồn

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-08 |
| Tên | Cô Gái Linh Hồn |
| Cấp độ mở khóa | Lv 40 |
| NPC giao nhiệm vụ | Thiếu Nữ Rừng (Forest Girl) |
| Điều kiện trước | Hoàn thành MQ-07 |

**Bối cảnh:**
Linh dẫn người chơi vào sâu bên trong Rừng Thiêng — khu vực đang bị Ma Khí nhiễm nặng nhất, nơi các sinh vật đã biến đổi hoàn toàn. Tại đây, Mist phát hiện ra một chiến binh bị Ma Khí kiểm soát: đó chính là Hoàng — con trai Cô Nông Lan, mất tích 3 năm trước. Hoàng không còn nhận ra ai, tấn công theo bản năng. Để giúp Linh lấy lại đủ sức mạnh chỉ đường đến Thánh Điện Cổ, Mist phải làm sạch khu vực và đối mặt với thủ lĩnh Ma Thú.

**Mục tiêu:**
1. Tiêu diệt 20 kẻ thù bên trong Rừng Thiêng
2. Thu thập 5 Linh Khí (rơi từ kẻ thù Rừng Thiêng, tỉ lệ 30%)
3. Đánh bại Hoàng bị Ma Khí kiểm soát *(không thể giết — khi HP về 0, Hoàng bất tỉnh và tỉnh lại trong chốc lát)*
4. Tiêu diệt Ma Thú Trưởng *(cấp độ 45)*, thu thập 1 Boss Core

**Phần thưởng:**
- 8000 XP
- 10000đ
- Tiết lộ vị trí Thánh Điện Cổ trên bản đồ thế giới
- Mở khóa: chuỗi hội thoại đặc biệt với Linh + chuỗi "Tìm Hoàng" của Cô Nông Lan

---

### MQ-09 — Rèn Kiếm Hư Vô

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-09 |
| Tên | Rèn Kiếm Hư Vô |
| Cấp độ mở khóa | Lv 60 |
| NPC giao nhiệm vụ | Thợ Rèn Kim (Blacksmith) |
| Điều kiện trước | Hoàn thành MQ-08 |

**Bối cảnh:**
Thợ Rèn Kim, sau nhiều năm mang theo tội lỗi vì đã gián tiếp gây ra thảm họa phong ấn, quyết định dốc toàn bộ bí kíp rèn kiếm mà ông đã giữ kín cả đời. Để rèn Kiếm Hư Vô — thanh kiếm duy nhất có thể thanh tẩy Linh Thụ — cần nguyên liệu từ khắp nơi trong thế giới và lò rèn phải đạt cấp độ cao nhất.

**Mục tiêu:**
1. Thu thập 5 Dragon Scale (rơi từ boss Rừng Cổ / Rừng Thiêng)
2. Thu thập 10 Crystal (khai thác hang động, drop boss)
3. Thu thập 5 Boss Core (từ 5 boss khác nhau)
4. Craft 3 Tinh Hoa Thiên Nhiên (3 Nhân sâm + 3 Sâm đỏ + 5 Linh Khí tại Nhà Giả Kim)
5. Nâng cấp Lò Rèn lên Lv 4 (cần 50000đ và nguyên liệu xây dựng)
6. Thực hiện nghi thức rèn Kiếm Hư Vô tại Lò Rèn Lv 4

**Phần thưởng:**
- 15000 XP
- 20000đ
- Kiếm Hư Vô (Mythic Weapon) — vũ khí đặc biệt dùng để đánh trận cuối

---

### MQ-10 — Trận Chiến Cuối

| Thuộc tính | Thông tin |
|---|---|
| ID | MQ-10 |
| Tên | Trận Chiến Cuối |
| Cấp độ mở khóa | Lv 70 |
| NPC giao nhiệm vụ | Lão Làng (Village Chief) |
| Điều kiện trước | Hoàn thành MQ-09 (trang bị Kiếm Hư Vô) |

**Bối cảnh:**
Lão Làng triệu tập toàn bộ dân làng. Ông thông báo rằng giờ khắc quyết định đã đến. Linh Thụ Cổ Đại — nguồn sống của ngôi làng — đã hoàn toàn bị Ma Khí hóa và đang trở thành cửa mở cho bóng tối xâm nhập. Người chơi phải đến Thánh Điện Cổ, đối mặt với Linh Thụ Ma Hóa và sử dụng Kiếm Hư Vô để thực hiện nghi lễ thanh tẩy.

**Mục tiêu:**
1. Tiến vào Thánh Điện Cổ
2. Đánh bại Linh Thụ Ma Hóa — trùm cuối *(cấp độ 75, 3 giai đoạn)*
   - Giai đoạn 1: Thụ Ma Bảo Vệ (phòng thủ cao, tấn công diện rộng)
   - Giai đoạn 2: Thụ Ma Phẫn Nộ (tốc độ tăng, triệu hồi tiểu quái)
   - Giai đoạn 3: Ma Khí Hóa Toàn Thân (sử dụng thanh kiếm để phá kết giới)
3. Thực hiện nghi lễ thanh tẩy bằng Kiếm Hư Vô sau khi đánh bại boss

**Phần thưởng:**
- 50000 XP
- 100000đ
- Danh hiệu đặc biệt: **"Người Giải Phóng"** (hiển thị trên tên nhân vật)
- Cảnh kết (Ending Cutscene): phong ấn tan rã, Làng Ẩn Nhân kết nối lại với thế giới bên ngoài
- Mở khóa: chế độ Sau Kết Thúc (New Game+)

---

## Nhiệm vụ phụ (Side Quests)

---

### SQ-01 — Hạt Giống Quý

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-01 |
| Tên | Hạt Giống Quý |
| Cấp độ mở khóa | Lv 5 |
| NPC giao nhiệm vụ | Cô Nông (Seed Seller) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Cô Nông muốn thử nghiệm một giống dâu tây đặc biệt mà bà mang từ trước khi làng bị phong ấn. Bà nhờ người chơi trồng thử để xem chúng có thể sinh trưởng được không trong điều kiện hiện tại.

**Mục tiêu:**
- Trồng và thu hoạch 3 Dâu Tây

**Phần thưởng:**
- 800 XP
- 1000đ
- 1 Túi Hạt Giống Hiếm (chứa ngẫu nhiên 3–5 hạt giống cấp hiếm)

---

### SQ-02 — Vũ Khí Đầu Tiên

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-02 |
| Tên | Vũ Khí Đầu Tiên |
| Cấp độ mở khóa | Lv 8 |
| NPC giao nhiệm vụ | Thợ Rèn Kim (Blacksmith) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Dù lầm lì khó tính, Thợ Rèn Kim nhận ra tiềm năng của người chơi. Ông giao thử thách đầu tiên: tự tay chế tạo một vũ khí bất kỳ tại lò rèn — dù chỉ là một con dao thô sơ, điều quan trọng là trải nghiệm quá trình rèn.

**Mục tiêu:**
- Chế tạo bất kỳ 1 vũ khí nào tại Lò Rèn

**Phần thưởng:**
- 600 XP
- 500đ
- 2 Đá Nâng Cấp Cấp 1

---

### SQ-03 — Thử Nghiệm Phân Bón

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-03 |
| Tên | Thử Nghiệm Phân Bón |
| Cấp độ mở khóa | Lv 15 |
| NPC giao nhiệm vụ | Cô Nông (Seed Seller) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Cô Nông đang nghiên cứu ảnh hưởng của Ma Khí lên đất nông trại. Bà cần người chơi thử nghiệm loại phân bón đặc biệt mà bà pha chế, xem nó có giúp cây trồng chống lại ảnh hưởng tiêu cực không.

**Mục tiêu:**
- Sử dụng phân bón trên 10 ô đất nông trại khác nhau

**Phần thưởng:**
- 1200 XP
- 2000đ
- 5 Phân Bón Thần Kỳ (Magic Fertilizer — tăng 100% tốc độ trồng trong 24 giờ)

---

### SQ-04 — Câu Cá Huyền Thoại

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-04 |
| Tên | Câu Cá Huyền Thoại |
| Cấp độ mở khóa | Lv 20 |
| NPC giao nhiệm vụ | Lão làng (thông qua bảng thông báo chợ) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Tin đồn lan rộng trong làng về một loài cá kỳ lạ xuất hiện tại Hồ Ẩn Nhân kể từ khi Ma Khí xuất hiện. Người nào câu được nó sẽ nhận phần thưởng từ quỹ làng.

**Mục tiêu:**
- Câu được 1 con cá hạng Epic hoặc cao hơn tại bất kỳ địa điểm câu cá nào

**Phần thưởng:**
- 2000 XP
- 5000đ
- Bản thiết kế: Cần Câu Vàng (Golden Rod Blueprint) — cần câu cấp cao nhất trong game

---

### SQ-05 — Hội Chợ Làng

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-05 |
| Tên | Hội Chợ Làng |
| Cấp độ mở khóa | Lv 10 |
| NPC giao nhiệm vụ | Lão Làng (Village Chief) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Lão Làng muốn duy trì sinh khí của ngôi làng dù đang bị phong ấn. Ông tổ chức một phiên chợ nhỏ và yêu cầu người chơi đóng góp bằng cách bán nông sản — vừa giúp kinh tế làng, vừa giúp người chơi học cách giao dịch.

**Mục tiêu:**
- Bán nông sản đạt tổng giá trị 100đ hoặc hơn tại Chợ Làng

**Phần thưởng:**
- 500 XP
- 1000đ
- Mở khóa: ô bán hàng thêm tại chợ (+2 slot bán hàng)

---

### SQ-06 — Yêu Cầu Bí Ẩn

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-06 |
| Tên | Yêu Cầu Bí Ẩn |
| Cấp độ mở khóa | Lv 25 |
| NPC giao nhiệm vụ | Nhà Giả Kim Bí Ẩn (Mysterious Alchemist) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Nhà Giả Kim Bí Ẩn nói rằng muốn kiểm tra xem người chơi có thực sự thành thạo nghề giả kim hay không. Ông yêu cầu chế tạo nhiều loại thuốc khác nhau — không phải để dùng, mà để ông "nghiên cứu công thức".

**Mục tiêu:**
- Chế tạo 5 loại thuốc khác nhau (mỗi loại ít nhất 1 lọ)

**Phần thưởng:**
- 3000 XP
- 8000đ
- Mở khóa: 1 công thức giả kim ngẫu nhiên (hiếm hoặc sử thi)

---

### SQ-07 — Huấn Luyện Đặc Biệt

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-07 |
| Tên | Huấn Luyện Đặc Biệt |
| Cấp độ mở khóa | Lv 30 |
| NPC giao nhiệm vụ | Thầy Dạy Võ (Dojo Master) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Thầy Dạy Võ đặt ra một thử thách đặc biệt cho những học trò xuất sắc nhất: gây đủ 10000 điểm sát thương tích lũy trong chiến đấu. Hoàn thành thử thách này sẽ được mở khóa thêm một khe năng lực chiến đấu.

**Mục tiêu:**
- Gây tổng cộng 10000 điểm sát thương (tích lũy qua nhiều trận chiến)

**Phần thưởng:**
- 4000 XP
- Mở khóa sớm: Khe Kỹ Năng Số 4 (thường chỉ mở ở Lv 40)

---

### SQ-08 — Của Hồi Môn

| Thuộc tính | Thông tin |
|---|---|
| ID | SQ-08 |
| Tên | Của Hồi Môn |
| Cấp độ mở khóa | Lv 50 |
| NPC giao nhiệm vụ | Lão Làng (Village Chief) |
| Loại | Một lần, tùy chọn |

**Mô tả:** Lão Làng tiết lộ rằng ngôi làng đang trong tình trạng nguy kịch về cơ sở vật chất sau bao năm bị phong ấn. Ông kêu gọi đóng góp tự nguyện cho Quỹ Phục Hưng Làng. Đây không phải nghĩa vụ — nhưng những người đóng góp sẽ được ghi nhớ mãi.

**Mục tiêu:**
- Quyên góp 50000đ vào Quỹ Phục Hưng Làng (tại bàn quyên góp trong nhà Lão Làng)

**Phần thưởng:**
- 8000 XP
- Nâng cấp mỹ quan làng (cosmetic): thêm đèn lồng, hoa trang trí, bảng hiệu mới
- 1 Mũ Đặc Biệt: **Nón Lá Trưởng Làng** (cosmetic độc quyền, không thể mua)

---

## Nhiệm vụ hằng ngày (Daily Quests)

Mỗi ngày người chơi có thể thấy 5 nhiệm vụ từ danh sách xoay vòng và chọn hoàn thành **3 nhiệm vụ bất kỳ**. Phần thưởng chỉ nhận được một lần mỗi ngày. Reset lúc **00:00 giờ máy chủ**.

---

### DQ-01 — Thu Hoạch Hàng Ngày

| Thuộc tính | Thông tin |
|---|---|
| ID | DQ-01 |
| Tên | Thu Hoạch Hàng Ngày |
| Loại | Daily, xoay vòng |

**Mô tả:** Công việc cơ bản nhất của người nông dân ninja — ra đồng thu hoạch mỗi sáng.

**Mục tiêu:**
- Thu hoạch 10 cây nông sản bất kỳ

**Phần thưởng:**
- 200 XP
- 500đ

---

### DQ-02 — Thợ Săn Ngày

| Thuộc tính | Thông tin |
|---|---|
| ID | DQ-02 |
| Tên | Thợ Săn Ngày |
| Loại | Daily, xoay vòng |

**Mô tả:** Giữ cho các khu vực xung quanh làng được an toàn bằng cách tiêu diệt những kẻ thù bị Ma Khí biến đổi.

**Mục tiêu:**
- Tiêu diệt 20 kẻ thù tại bất kỳ khu vực nào

**Phần thưởng:**
- 200 XP
- 300đ
- 3 Lõi Quái Vật (Monster Core)

---

### DQ-03 — Thợ Câu Ngày

| Thuộc tính | Thông tin |
|---|---|
| ID | DQ-03 |
| Tên | Thợ Câu Ngày |
| Loại | Daily, xoay vòng |

**Mô tả:** Mỗi buổi chiều, hồ Ẩn Nhân lại rộn ràng tiếng cá quẫy. Một ngư dân ninja giỏi không bao giờ bỏ lỡ cơ hội.

**Mục tiêu:**
- Câu được 5 con cá bất kỳ

**Phần thưởng:**
- 200 XP
- 400đ

---

### DQ-04 — Nguyên Liệu Gấp

| Thuộc tính | Thông tin |
|---|---|
| ID | DQ-04 |
| Tên | Nguyên Liệu Gấp |
| Loại | Daily, xoay vòng |

**Mô tả:** Thợ Rèn Kim gửi thông báo khẩn: kho nguyên liệu của ông gần cạn. Cần người thu thập nguyên liệu thô trước khi ông có thể nhận thêm đơn hàng.

**Mục tiêu:**
- Thu thập 10 Quặng Sắt **hoặc** 8 Gỗ (chọn một, hoặc kết hợp tùy ý đủ số lượng)

**Phần thưởng:**
- 150 XP
- 250đ

---

### DQ-05 — Bếp Núc

| Thuộc tính | Thông tin |
|---|---|
| ID | DQ-05 |
| Tên | Bếp Núc |
| Loại | Daily, xoay vòng |

**Mô tả:** Bà hàng xén chợ cần thêm đồ ăn để bán cho dân làng. Mỗi bữa nấu được là một đóng góp nhỏ cho tinh thần cả làng.

**Mục tiêu:**
- Nấu 3 món ăn bất kỳ tại Bếp

**Phần thưởng:**
- 200 XP
- 500đ

---

## Nhiệm vụ nghề nghiệp (Profession Quests)

Mỗi nghề nghiệp trong game được mở khóa thông qua một nhiệm vụ giới thiệu đơn giản. Hoàn thành nhiệm vụ này kích hoạt cây kỹ năng và các cơ chế chuyên biệt của nghề đó. Các nhiệm vụ nghề nghiệp không có phần thưởng XP hay tiền riêng — phần thưởng chính là bản thân nghề nghiệp được mở khóa.

---

### PQ-01 — Nghề Nông Dân (Nông Dân)

| Thuộc tính | Thông tin |
|---|---|
| ID | PQ-01 |
| Nghề | Nông Dân |
| Mở khóa khi | Tự động — trồng tổng cộng 10 cây nông sản bất kỳ |

**Mô tả:** Đất làng nuôi dưỡng mọi người. Khi đã quen với cuốc, xẻng và bình tưới, người chơi chính thức trở thành Nông Dân.

**Điều kiện:** Trồng tổng cộng 10 cây nông sản (bất kỳ loại nào, tự động theo dõi từ đầu game).

**Mở khóa:** Cây kỹ năng Nông Dân, khả năng trồng cây cấp 2, công thức phân bón cơ bản.

---

### PQ-02 — Nghề Thợ Rèn (Thợ Rèn)

| Thuộc tính | Thông tin |
|---|---|
| ID | PQ-02 |
| Nghề | Thợ Rèn |
| Mở khóa khi | Chế tạo vũ khí đầu tiên tại Lò Rèn |

**Mô tả:** Tiếng búa đập kim loại là âm thanh của sức mạnh. Một khi đã tự tay tạo ra thứ gì đó từ quặng thô, không ai có thể phủ nhận tay nghề của bạn.

**Điều kiện:** Chế tạo 1 vũ khí bất kỳ tại Lò Rèn (bất kể chất lượng).

**Mở khóa:** Cây kỹ năng Thợ Rèn, công thức vũ khí cấp 2, khả năng nâng cấp lò rèn.

---

### PQ-03 — Nghề Thợ Săn (Thợ Săn)

| Thuộc tính | Thông tin |
|---|---|
| ID | PQ-03 |
| Nghề | Thợ Săn |
| Mở khóa khi | Tiêu diệt tổng cộng 50 kẻ thù |

**Mô tả:** Chiến đấu không phải chỉ để sống sót — đó là một nghề. Khi đã hạ đủ 50 kẻ thù, người chơi hiểu rằng mình đã chọn con đường của kiếm và bóng tối.

**Điều kiện:** Tiêu diệt tổng cộng 50 kẻ thù (bất kỳ loại, tích lũy qua toàn bộ thời gian chơi).

**Mở khóa:** Cây kỹ năng Thợ Săn, khả năng nhặt nguyên liệu đặc biệt từ kẻ thù, hệ thống theo dõi Boss.

---

### PQ-04 — Nghề Đầu Bếp (Đầu Bếp)

| Thuộc tính | Thông tin |
|---|---|
| ID | PQ-04 |
| Nghề | Đầu Bếp |
| Mở khóa khi | Nấu tổng cộng 5 món ăn bất kỳ |

**Mô tả:** Lửa, dao và nguyên liệu tươi — từng đó là đủ để nuôi cả làng. Người hiểu nghề bếp hiểu rằng sức mạnh thực sự đến từ việc nuôi dưỡng những người xung quanh.

**Điều kiện:** Nấu tổng cộng 5 món ăn tại Bếp (bất kỳ công thức nào).

**Mở khóa:** Cây kỹ năng Đầu Bếp, công thức nấu cấp 2, hiệu ứng buff thức ăn mạnh hơn.

---

### PQ-05 — Nghề Ngư Dân (Ngư Dân)

| Thuộc tính | Thông tin |
|---|---|
| ID | PQ-05 |
| Nghề | Ngư Dân |
| Mở khóa khi | Câu tổng cộng 10 con cá |

**Mô tả:** Hồ Ẩn Nhân giấu nhiều bí mật dưới mặt nước tĩnh lặng. Người câu cá giỏi không chỉ cần kiên nhẫn — họ cần biết lắng nghe nhịp điệu của nước.

**Điều kiện:** Câu tổng cộng 10 con cá (bất kỳ loại, tích lũy qua toàn bộ thời gian chơi).

**Mở khóa:** Cây kỹ năng Ngư Dân, khả năng câu cá ở địa điểm đặc biệt, công thức cần câu nâng cấp.

---

### PQ-06 — Nghề Nhà Giả Kim (Nhà Giả Kim)

| Thuộc tính | Thông tin |
|---|---|
| ID | PQ-06 |
| Nghề | Nhà Giả Kim |
| Mở khóa khi | Pha chế tổng cộng 3 loại thuốc khác nhau |

**Mô tả:** Giả kim thuật là nghệ thuật biến đổi bản chất của vật chất. Ba loại thuốc khác nhau — ba nguyên lý khác nhau của thế giới này. Khi hiểu được ba nguyên lý đó, cánh cửa của tri thức cổ đại mới thực sự mở ra.

**Điều kiện:** Pha chế 3 loại thuốc khác nhau tại Bàn Giả Kim (mỗi loại ít nhất 1 lọ, 3 công thức khác nhau).

**Mở khóa:** Cây kỹ năng Nhà Giả Kim, công thức thuốc cấp 2, khả năng tạo nguyên liệu đặc biệt.

---

## Giao diện hệ thống nhiệm vụ (Quest UI)

### Nhật Ký Nhiệm Vụ (Quest Log)

- Hiển thị tối đa **10 nhiệm vụ đang hoạt động** cùng lúc
- Phân tab: **Đang thực hiện** / **Đã hoàn thành** / **Đã thất bại**
- Mỗi nhiệm vụ hiển thị: tên, cấp độ yêu cầu, NPC giao, tiến độ mục tiêu hiện tại
- Nhiệm vụ hằng ngày hiển thị đồng hồ đếm ngược đến giờ reset

### Chỉ Dẫn Trên Bản Đồ (Map Markers)

- Biểu tượng dấu chấm than `!` màu vàng: NPC có nhiệm vụ mới chưa nhận
- Biểu tượng dấu chấm than `!` màu xanh: NPC cần gặp để nộp nhiệm vụ
- Biểu tượng mục tiêu `◎` màu trắng: vị trí khu vực cần đến (khám phá, tiêu diệt)
- Biểu tượng hộp `◻` màu cam: vật phẩm nhiệm vụ cần nhặt

### Vật Phẩm Nhiệm Vụ (Quest Items)

- Vật phẩm nhiệm vụ phát sáng nhẹ màu vàng trong túi đồ
- Không thể bán, bỏ vào kho dài hạn hoặc vứt bỏ khi đang có nhiệm vụ liên quan
- Tự động biến mất sau khi nộp nhiệm vụ hoặc hủy nhiệm vụ

### Xem Trước Phần Thưởng (Reward Preview)

- Trước khi chấp nhận nhiệm vụ, màn hình xác nhận hiển thị:
  - Danh sách mục tiêu đầy đủ
  - Phần thưởng XP, đồng và vật phẩm
  - Những nội dung được mở khóa (nếu có)
- Người chơi có thể chọn **Nhận** hoặc **Bỏ qua** mà không bị phạt

---

*Tài liệu này thuộc hệ thống thiết kế game Shinobi Valley. Phiên bản: 1.0*
