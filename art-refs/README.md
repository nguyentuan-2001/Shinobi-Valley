# Game Assets — AI Image Prompts

Prompt mô tả cho toàn bộ asset trong game để gen ảnh bằng AI.

---

## Cấu trúc thư mục

```
assets/
├── characters/           Nhân vật
│   ├── player.md         Nhân vật chính (5 class, sprite sheet, expressions)
│   └── npcs.md           10 NPC
│
├── combat/               Chiến đấu
│   ├── skills.md         50 chiêu thức (5 phái × 10) — icon + effect
│   ├── weapons.md        5 loại vũ khí
│   └── equipment.md      Trang bị 5 rank + đá cường hóa
│
├── enemies/              Kẻ địch
│   └── monsters.md       20 quái + 5 mini boss + Rồng Cổ Đại (3 phase)
│
├── world/                Thế giới
│   ├── maps.md           6 bản đồ (background, tileset, thumbnail)
│   ├── buildings.md      Nhà cửa, cửa hàng, chuồng trại, công trình làng
│   └── decorations.md    Trang trí ngoài trời + nội thất trong nhà
│
├── items/                Vật phẩm
│   ├── crops.md          20 cây trồng × 2 (seed + harvest)
│   ├── livestock.md      4 con vật chăn nuôi + sản phẩm
│   ├── fish.md           Cá theo 4 bậc hiếm
│   ├── tools.md          Nông cụ + cần câu + phân bón
│   ├── consumables.md    Thuốc, thức ăn, buff food, hỗ trợ
│   ├── materials.md      Nguyên liệu thô, drop quái, boss drop
│   └── currency.md       3 loại tiền tệ + HUD icon
│
└── ui/
    └── ui.md             Status bar, menu icon, HUD, combat status, slot frame
```

---

## Thông số kỹ thuật

| Loại | Kích thước |
|---|---|
| Item / Icon / Tile | 32×32 px |
| Character / NPC / Monster | 32×32 px (sprite) |
| Mini Boss | 64×64 px |
| Final Boss | 128×128 px |
| Building | 64×64 px (hoặc ghép tile) |
| Skill effect | 64×64 → 256×64 tùy chiêu |

**Style cố định cho mọi asset:**
- 2D pixel art
- Top-down view
- Clean outlines
- Vibrant colors
- Transparent background

---

## Style prefix dùng chung

Copy và dán vào đầu mỗi prompt:

```
2D pixel art, 32x32, top-down view, clean outlines, vibrant colors, transparent background, RPG game asset —
```

**Thêm vào cuối để tăng chất lượng:**

```
add shading and highlight, clear outline, bright colors, cute fantasy style, no text, no watermark
```

---

## Lưu ý khi gen ảnh

1. Dùng **cùng model + cùng seed** cho toàn bộ asset để đồng nhất style
2. Character và monster cần **sprite sheet 4 hướng**: down, left, right, up
3. Sau khi gen: kiểm tra outline, màu sắc, độ tương phản
4. Upscale ×2 nếu cần nhưng giữ nguyên pixel art — không dùng smooth filter
