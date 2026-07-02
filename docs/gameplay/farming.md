# Hệ thống nông trại

> **Đơn vị thời gian:** Mọi thời gian tính bằng **giờ thực** (real time). Cây nhanh nhất chín sau **2 giờ**, chậm nhất sau **48 giờ (2 ngày)**.

---

## Trồng trọt

### Cơ chế chung

- Mỗi ô đất trồng được **1 cây**.
- Một số cây **thu hoạch nhiều lần** (multi-harvest) trước khi héo.
- **Hoa ánh trăng** chỉ thu hoạch được vào ban đêm (sau 18:00 game time).
- **Hoa sen** phải trồng trên ô đất cạnh nước.

---

### Cơ chế tưới nước — Thanh Độ Ẩm

Mỗi cây có một thanh **Độ Ẩm** từ **50% → 100%**.

**Quy tắc:**

- Khi trồng hoặc tưới nước → Độ ẩm về **100%**.
- Mỗi giờ không tưới → Độ ẩm **giảm dần** (không bao giờ xuống dưới 50%).
- **Sản lượng khi thu hoạch = tỉ lệ với Độ ẩm tại thời điểm đó.**

```
Sản lượng thực = Sản lượng gốc × (Độ ẩm / 100)

Ví dụ: Cà rốt gốc 4 củ, Độ ẩm 70% → thu được 2–3 củ
```

**Tốc độ giảm Độ ẩm:**

Tỉ lệ với thời gian chín của cây. Cây chín nhanh → thanh giảm nhanh hơn → cần tưới thường xuyên hơn.

```
Giảm mỗi giờ = 50 / thời_gian_chín_giờ (%)
```

| Cây | Thời gian chín | Giảm/giờ | Về 50% sau |
|---|---|---|---|
| Hành lá | 2h | 25%/h | 2h |
| Cà rốt | 4h | 12.5%/h | 4h |
| Khoai tây | 6h | 8.3%/h | 6h |
| Nấm | 6h | 8.3%/h | 6h |
| Bắp cải | 8h | 6.3%/h | 8h |
| Dâu tây | 8h | 6.3%/h | 8h |
| Bí đỏ | 10h | 5%/h | 10h |
| Cà chua | 10h | 5%/h | 10h |
| Ngô | 12h | 4.2%/h | 12h |
| Dưa hấu | 14h | 3.6%/h | 14h |
| Dược thảo | 14h | 3.6%/h | 14h |
| Trà xanh | 16h | 3.1%/h | 16h |
| Hoa sen | 20h | 2.5%/h | 20h |
| Nhân sâm | 24h | 2.1%/h | 24h |
| Sâm đỏ | 30h | 1.7%/h | 30h |
| Hoa mặt trời | 30h | 1.7%/h | 30h |
| Hoa ánh trăng | 36h | 1.4%/h | 36h |
| Cây linh khí | 42h | 1.2%/h | 42h |
| Hạt giống cổ đại | 48h | 1.0%/h | 48h |

> **Kết luận thiết kế:** Cây ngắn giờ (Hành lá, Cà rốt) cần tưới thường xuyên để đủ sản lượng. Cây dài giờ (Nhân sâm, Cây linh khí) rất khoan nhượng — bỏ vài giờ không ảnh hưởng nhiều.

**Công cụ tưới nước:**

| Công cụ | Ô tưới mỗi lần | Phục hồi Độ ẩm |
|---|---|---|
| Bình tưới gỗ | 1 ô | +100% (về tối đa) |
| Bình tưới sắt | 3×3 ô | +100% (về tối đa) |
| Bình tưới thần | 5×5 ô | +100% + tốc lớn +10% |
| Giếng nước (công trình) | 3×3 tự động mỗi sáng | +100% khu vực xung quanh |

**Bonus Nghề Nông dân:**

- **Lv 1:** Tốc độ giảm Độ ẩm chậm hơn **10%**.
- **Lv 5:** Tốc độ giảm chậm hơn **25%**.
- **Lv 10:** Tốc độ giảm chậm hơn **50%** — gần như không cần tưới cây dài giờ.

---

### Bảng cây trồng

#### Tier Cơ Bản — Mở từ Lv 1

| Cây | Hạt giống | Thời gian | Multi-harvest | Sản lượng | Giá bán | Doanh thu | Lợi nhuận | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| Hành lá | 40đ | 2h | Không | 5 bó | 20đ/bó | 100đ | **+60đ** | Nhanh nhất, vốn thấp |
| Cà rốt | 50đ | 4h | Không | 4 củ | 25đ/củ | 100đ | **+50đ** | Cơ bản nhất |
| Khoai tây | 60đ | 6h | Không | 4 củ | 30đ/củ | 120đ | **+60đ** | Nguyên liệu nấu ăn |
| Bắp cải | 80đ | 8h | Không | 1 cây | 150đ | 150đ | **+70đ** | Bán được giá |
| Bí đỏ | 120đ | 10h | Không | 2 quả | 100đ/quả | 200đ | **+80đ** | Nguyên liệu bánh |

#### Tier Trung Cấp — Mở từ Lv 10

| Cây | Hạt giống | Thời gian | Multi-harvest | Sản lượng | Giá bán | Ghi chú |
|---|---|---|---|---|---|---|
| Nấm | 300đ | 6h (lần đầu) | Có — 3 lần (mỗi 3h) | 2 nấm | 100đ/nấm | Nguyên liệu thuốc |
| Dâu tây | 400đ | 8h (lần đầu) | Có — 4 lần (mỗi 4h) | 5 quả | 60đ/quả | ROI cao theo thời gian |
| Cà chua | 500đ | 10h (lần đầu) | Có — 3 lần (mỗi 5h) | 4 quả | 80đ/quả | Craft thức ăn |
| Ngô | 600đ | 12h (lần đầu) | Có — 2 lần (mỗi 6h) | 3 bắp | 120đ/bắp | Nguyên liệu bánh ngô |
| Dưa hấu | 800đ | 14h | Không | 1 quả | 1.200đ | Cao nhất tier này |

> **ROI Dâu tây:** 400đ vốn → 4×5×60 = 1.200đ thu về → lời **800đ** trong ~20 giờ (**40đ/h**).

#### Tier Cao Cấp — Mở từ Lv 25

| Cây | Hạt giống | Thời gian | Multi-harvest | Sản lượng | Giá bán | Ghi chú |
|---|---|---|---|---|---|---|
| Dược thảo | 1.500đ | 14h (lần đầu) | Có — 4 lần (mỗi 7h) | 5 lá | 150đ/lá | Quan trọng cho crafting thuốc |
| Trà xanh | 2.000đ | 16h (lần đầu) | Có — 5 lần (mỗi 8h) | 3 lá | 400đ/lá | Nguyên liệu hồi mana |
| Hoa sen | 2.500đ | 20h (lần đầu) | Có — 3 lần (mỗi 10h) | 2 hoa | 800đ/hoa | **Cần ô đất cạnh nước** |
| Nhân sâm | 3.000đ | 24h | Không | 1 củ | 2.500đ | Nguyên liệu thuốc mạnh (dùng để craft) |
| Sâm đỏ | 5.000đ | 30h | Không | 1 củ | 5.000đ | Nguyên liệu craft cao cấp |

#### Tier Hiếm — Lv 40+, hạt giống không bán ở cửa hàng thường

| Cây | Hạt giống | Thời gian | Thu hoạch | Giá bán | Điều kiện đặc biệt |
|---|---|---|---|---|---|
| Hoa mặt trời | 4.000đ (chợ đặc biệt) | 30h | 1 hoa + 10 hạt | 6.000đ/hoa | Tự sản xuất hạt giống |
| Hoa ánh trăng | Drop từ Boss / Sự kiện | 36h | 2 hoa | 8.000đ/hoa | **Chỉ thu hoạch ban đêm** |
| Cây linh khí | Drop từ hang động Lv 60+ | 42h | 1 cây | 12.000đ | Cần Bình tưới thần |
| Hạt giống cổ đại | Boss drop duy nhất | 48h | Random item | — | Kết quả là 1 item Legendary ngẫu nhiên |
| Tinh hoa thiên nhiên | Craft: 3 Nhân sâm + 3 Sâm đỏ + 5 Linh khí | — | — | 20.000đ | Không trồng — dùng để craft trang bị Mythic |

---

### Bảng lợi nhuận nhanh (profit/giờ/ô)

| Cây | Lợi nhuận/giờ | Ghi chú |
|---|---|---|
| Hành lá | **30đ/h** | 60đ / 2h |
| Dâu tây (full cycle) | **40đ/h** | 800đ / 20h |
| Trà xanh (full cycle) | **83đ/h** | 4.000đ / 48h |
| Hoa sen (full cycle) | **58đ/h** | 2.300đ / 40h |
| Dược thảo (full cycle) | **43đ/h** | 1.500đ / 35h |
| Hoa mặt trời | **67đ/h** | 2.000đ / 30h |
| Dưa hấu | **29đ/h** | 400đ / 14h |
| Nấm (full cycle) | **25đ/h** | 300đ / 12h |
| Cà chua (full cycle) | **23đ/h** | 460đ / 20h |
| Cà rốt | 13đ/h | 50đ / 4h |
| Cây linh khí | **~286đ/h** | 12.000đ / 42h (seed drop miễn phí) |
| Hoa ánh trăng | **~444đ/h** | 16.000đ / 36h (seed drop miễn phí) |
| Nhân sâm | — | Craft only — bán thẳng lỗ vốn |
| Sâm đỏ | — | Craft only — bán thẳng hòa vốn |

---

## Chăn nuôi

### Cơ chế

- Mua con giống từ **Người bán hạt giống** hoặc **Chủ cửa hàng**.
- Cần mua **Thức ăn chăn nuôi** mỗi ngày thực — nếu thiếu, con vật không sản xuất (không chết).
- Công cụ **Silo** giúp tự động cho ăn.

### Bảng chăn nuôi

| Con vật | Giá mua | Thức ăn/ngày | Sản phẩm | Chu kỳ | Giá bán SP | Lợi nhuận/ngày |
|---|---|---|---|---|---|---|
| Gà | 800đ | 10đ | Trứng gà | 8h | 50đ | **~140đ** |
| Vịt | 1.200đ | 12đ | Trứng vịt | 10h | 80đ | **~180đ** |
| Bò | 8.000đ | 50đ | Sữa tươi | 24h | 500đ | **~450đ** |
| Cừu | 6.000đ | 40đ | Len thô | 48h | 1.000đ | **~460đ** |

> **Hòa vốn (Break-even):** Gà: ~6 ngày · Vịt: ~7 ngày · Bò: ~18 ngày · Cừu: ~13 ngày

### Sản phẩm chế biến (tăng giá trị)

| Nguyên liệu | Chế biến tại | Kết quả | Giá bán |
|---|---|---|---|
| 3 Trứng gà | Bếp | Trứng chiên | 250đ |
| 1 Sữa tươi | Bếp | Phô mai | 800đ |
| 1 Sữa + 2 Khoai tây | Bếp | Súp kem | 600đ |
| 3 Len thô | Bàn dệt | Vải len | 1.500đ |

---

## Câu cá

### Cơ chế

- Câu tại **hồ nước, sông, hang động ngầm** — mỗi địa điểm có bảng cá khác nhau.
- Thời gian câu phụ thuộc **Cần câu** và **Luck** của người chơi.
- Nhấn đúng thời điểm (mini-game) để tăng độ hiếm của cá.

### Bảng cá và giá trị

| Bậc | Ví dụ | Thời gian câu | Giá bán | Địa điểm |
|---|---|---|---|---|
| Common | Cá Diếc, Cá Rô, Cá Chép | 5–15 giây | 20–80đ | Ao làng, sông |
| Rare | Cá Hồi, Cá Vàng Lớn, Cá Mực | 15–30 giây | 100–400đ | Sông, hang động |
| Epic | Cá Kiếm, Cá Rồng Nhỏ, Cá Bướm | 30–60 giây | 500–1.500đ | Hang động, suối núi |
| Legendary | Cá Rồng Vàng, Cá Nguyệt, Cá Tiên | 60–120 giây | 3.000–15.000đ | Boss map, hồ bí ẩn |

### Hệ số cần câu

| Cần câu | Luck bonus | Giảm thời gian câu | Mở khóa |
|---|---|---|---|
| Cần tre | +0 | 0% | Mặc định |
| Cần sắt | +2 | -20% | Thợ rèn Lv 10 |
| Cần vàng | +5 | -40% | Craft Lv 40 |
| Cần huyền thoại | +15 | -60% | Quest đặc biệt |

---

## Trang trí nông trại

| Vật phẩm | Mua tại | Giá | Chức năng |
|---|---|---|---|
| Hàng rào | Cửa hàng | 50đ/đoạn | Trang trí, giữ động vật |
| Đèn lồng | Cửa hàng | 200đ | Chiếu sáng ban đêm |
| Hồ cá | Thợ rèn | 2.000đ | Câu cá ngay tại nhà |
| Tượng | Nhà giả kim | 5.000đ | +1 Luck cho toàn bộ nông trại |
| Giếng nước | Thợ rèn | 1.500đ | Tự động tưới 3×3 ô xung quanh mỗi sáng |
| Silo | Thợ rèn | 8.000đ | Tự động cho vật nuôi ăn |
| Nhà kính | Thợ rèn | 20.000đ | Cây hiếm lớn nhanh hơn 20% |
