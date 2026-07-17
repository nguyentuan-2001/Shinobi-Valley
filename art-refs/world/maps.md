# Maps — AI Image Prompts

Dùng để gen **tileset**, **background**, và **preview thumbnail** cho từng bản đồ.

Style chung: `2D pixel art, top-down view, RPG game map tileset, clean outlines, vibrant colors, white background`

**Định hướng art (bám theo asset đã gen — xem `cave/background.png`, `crops/carrot.png`):** pixel art chi tiết có shading/dithering như RPG 16-bit (Stardew Valley, Secret of Mana) — **KHÔNG** phải vector phẳng, **KHÔNG** bóng gương/gradient mượt kiểu asset pack mobile, **KHÔNG** outline đen dày đều kiểu hoạt hình đồ chơi. Outline dùng tông màu đậm hơn của chính vật liệu (gỗ dùng nâu sậm, đá dùng xám sậm...), không dùng đen thuần. Palette ấm, hơi trầm (muted), tránh màu chói/bão hòa như sticker. Nếu prompt AI ra kết quả giống "vector cute mobile game" thay vì pixel art có texture — thêm rõ các cụm từ: `detailed hand-painted pixel art`, `soft dithering shading`, `muted color palette`, `no flat vector illustration`, `no glossy cartoon outline`.

**Khớp đúng số map + tên theo [`docs/world/maps.md`](../../docs/world/maps.md)** — 9 map tổng (Map 0-8): 2 map phi chiến đấu (Hub + Nông Trại), 6 map chiến đấu, 1 đấu trường Boss cuối.

**Kiến trúc render khác nhau theo loại map (quyết định trong `docs/planning/dev-schedule.md` Sprint 12, tham khảo Ninja School Online/Ngọc Rồng Online):**

- **Map 0 (Hub) + Map 1 (Farm) + Map 8 (Boss Arena)** — đủ nhỏ để thấy cả map cùng lúc → giữ nguyên **1 ảnh nền tĩnh vẽ nguyên khối** (mục "Background / Thumbnail" — dùng luôn làm ảnh nền thật trong game, không tách lớp).
- **Map 2-7 (6 map chiến đấu)** — map lớn hơn, chia thành nhiều khu vực/phòng nối tiếp trong code, mỗi khu vực gồm 2 lớp: **Backdrop** (nền xa — trời/núi/rừng xa, đứng yên hoặc parallax chậm, KHÔNG vẽ mặt đất đi được, dùng chung/lặp lại giữa các khu vực cùng map) + **Tileset Elements** (mặt đất/vật cản thật, cuộn theo camera, ghép trong Tiled). Mỗi map còn có 1 **Thumbnail** icon nhỏ riêng cho menu chọn map (khác Backdrop — không dùng chung).

**Định hướng màu sắc riêng cho Map 2-7 (user gửi ảnh chụp tham khảo Ninja School Online/Ngọc Rồng Online)** — chỉ mượn TÔNG MÀU + độ chi tiết/dễ thương của prop từ ảnh tham khảo, **KHÔNG đổi góc camera** (vẫn top-down như toàn bộ game, không chuyển sang side-view/portrait như ảnh gốc — đã xác nhận với user, xem `docs/planning/progress.md`). Khác với Map 0/1/8 (giữ tông ấm-trầm kiểu Stardew Valley ở mục "Định hướng art" phía trên), 6 map chiến đấu này cần **tươi sáng, bão hòa (saturated) hơn hẳn** — đúng phong cách hoạt hình dễ thương, vui mắt của ảnh tham khảo: cây cối sai trĩu quả/hoa màu đỏ-cam rực rỡ, hàng rào gỗ ấm màu nâu vàng rõ vân gỗ, quái vật/prop hình dáng tròn trịa dễ thương, bầu trời xanh trong/ánh nắng rõ ràng thay vì mù sương xám. Riêng Map 4 (Hang Động) và Map 6 (Rừng Thiêng) vẫn giữ nền tối theo đúng lore nhưng đổi các điểm sáng (pha lê, hào quang tha hóa) thành màu neon rực rỡ thay vì mờ nhạt — "tối nhưng rực rỡ ở điểm nhấn", không xám xịt đều màu như thiết kế cũ. Đã viết lại toàn bộ prompt Backdrop/Tileset/Thumbnail của 6 map dưới đây theo đúng hướng này.

---

## Map 0 — Làng Ẩn Nhân (Hub)

**Level:** 1 (mở khóa ngay từ đầu, hub trung tâm — không chiến đấu)

### Background / Thumbnail

```
2D pixel art, top-down view, detailed hand-painted pixel art RPG hidden ninja village hub map in the style of a 16-bit RPG (Stardew Valley, Secret of Mana), no flat vector illustration, no glossy cartoon toy style, cozy village layout with smooth stone-paved roads radiating outward from a central village square, small wooden shops and houses with weathered wood grain and shaded roof tiles scattered around the square, a massive ancient tree with a faint warm glow standing just north of the square, a calm lake with a small wooden fishing dock in the southwest corner, hanging paper lanterns along the roads, a large dark foreboding barrier of swirling shadow energy sealing the eastern village gate, warm daylight over most of the village but a cold dim tone near the sealed gate, muted warm color palette, painterly pixel texture, dark warm-toned outlines instead of pure black, peaceful yet quietly ominous hub feel
```

### Tileset Elements

```
2D pixel art tileset sheet, detailed hand-painted pixel art matching the same art direction as this game's other tilesets, no flat vector illustration, no glossy cartoon outline: smooth stone-paved road tiles (straight, corner, T-junction) with soft dithering shading, packed dirt village ground, lush green grass with subtle color variation, small garden flower patches, weathered wooden fence sections, hanging paper lantern post glowing warm orange, wooden signpost, small decorative shrubs, calm lake water tile with soft reflection, wooden dock plank tiles, dark swirling shadow-barrier wall tile (for the sealed East Gate), muted warm color palette, dark brown outlines instead of pure black, all on white background, 32x32 tiles
```

---

## Map 1 — Nông Trại (Player Farm)

**Level:** 1 (map khởi đầu, không có kẻ thù)

### Background / Thumbnail

```
2D pixel art, top-down view, detailed hand-painted pixel art RPG farm map in the style of a 16-bit RPG (Stardew Valley, Secret of Mana), no flat vector illustration, no glossy cartoon toy style, rustic wooden farmhouse with weathered wood grain texture and shaded roof tiles, neat rows of tilled brown soil plots with visible dirt clump texture and soft shading, aged wooden water well, small animal pen with weathered wooden fence, worn dirt paths connecting farmhouse to fields, lush green grass with subtle color variation and soft dithering shading, scattered wildflowers, warm morning sunlight with gentle soft shadows, muted warm color palette, painterly pixel texture, dark warm-toned outlines instead of pure black, peaceful starting zone feel
```

### Tileset Elements

```
2D pixel art tileset sheet, detailed hand-painted pixel art matching the same art direction as this game's cave and grassland tilesets, no flat vector illustration, no glossy cartoon outline: bright green grass with soft dithering shading, dry tilled soil plot with visible dirt clump texture, watered/moist tilled soil plot with darker shaded soil, dirt path straight and corner with worn texture, weathered wooden fence sections (straight, corner, gate) with visible wood grain shading, small pond water tile with lily pad and soft reflection, aged wooden signpost, hay bale with straw texture, wood pile, grass tuft decoration, muted warm color palette, dark brown outlines instead of pure black, all on white background, 32x32 tiles
```

---

## Map 2 — Đồng Cỏ (Grassland)

**Level:** 1–8

### Backdrop (nền xa — parallax)

```
2D pixel art, top-down view, wide horizontal parallax backdrop layer, distant gentle green rolling hills silhouette, vivid bright blue sky with cheerful puffy white clouds, bold saturated warm sunshine, cheerful cartoon-friendly mobile RPG mood (Ninja School Online/Ngọc Rồng Online reference), no foreground ground detail, no walkable terrain visible, designed to tile seamlessly on left/right edges, beginner zone atmosphere, vibrant and inviting, bright saturated colors not muted
```

### Tileset Elements

```
2D pixel art tileset sheet, cheerful vibrant grassland theme tiles matching Ninja School Online/Ngọc Rồng Online mobile RPG color mood: saturated bright green grass, warm dirt path, small rounded rocks, bold wildflower patches (bright red, yellow, pink), tall grass clumps, fruit-laden trees with clusters of bright red berries/apples and warm honey-brown trunk with clear wood grain, weathered wooden fence sections (warm golden-brown, visible grain), small pond with lily pads, cheerful and cute proportions, bright saturated color palette not muted, all on white background, 32x32 tiles
```

### Thumbnail (icon chọn map)

```
2D pixel art, 64x64 map selection icon, sunny grassland with a fruit-laden tree and colorful wildflowers, bright saturated inviting colors, cheerful beginner zone icon style, white background
```

---

## Map 3 — Rừng Tre (Bamboo Forest)

**Level:** 8–18

### Backdrop (nền xa — parallax)

```
2D pixel art, top-down view, wide horizontal parallax backdrop layer, dense distant bamboo grove silhouette, vivid saturated green-gold dappled canopy light filtering down from above, cheerful cartoon-friendly mobile RPG mood (Ninja School Online/Ngọc Rồng Online reference) rather than dull/hazy, mysterious yet colorful atmosphere, no foreground ground detail, no walkable terrain visible, designed to tile seamlessly on left/right edges, bright saturated colors not muted
```

### Tileset Elements

```
2D pixel art tileset sheet, cheerful vibrant bamboo forest theme tiles: saturated green bamboo stalk sections, fallen bamboo logs with warm tan highlights, bright moss patches, cute round stone lantern glowing warm orange, small spider web patches, dense leafy undergrowth, bamboo leaf piles, ancient stone markers, bold saturated green-gold color palette not muted, all on white background, 32x32 tiles
```

### Thumbnail (icon chọn map)

```
2D pixel art, 64x64 map selection icon, tall bamboo stalks with vivid saturated dappled green-gold light, cheerful mysterious forest icon style, white background
```

---

## Map 4 — Hang Động (Cave / Dungeon)

**Level:** 18–30

### Backdrop (nền xa — parallax)

```
2D pixel art, top-down view, wide horizontal parallax backdrop layer, deep dark cave wall silhouette receding into darkness, vividly glowing neon teal and purple crystal clusters embedded in the distant rock (bright saturated glow, not faint/dim), warm bright torch glow points far off, dark-but-vibrant atmosphere (Ninja School Online/Ngọc Rồng Online reference: dark base with bold saturated highlights, not dull grey), no foreground floor detail, no walkable terrain visible, designed to tile seamlessly on left/right edges
```

### Tileset Elements

```
2D pixel art tileset sheet, cave dungeon theme tiles with vivid saturated highlights against a dark base: dark stone floor, cave wall sections, brightly glowing neon crystal clusters (saturated blue, purple, green), bone piles, underground pools with clear reflective blue-teal water, wooden support beams, bright torch wall sconces with warm glowing flame, cracked stone, shiny treasure chest with gold highlight, all on white background, 32x32 tiles
```

### Thumbnail (icon chọn map)

```
2D pixel art, 64x64 map selection icon, dark cave entrance with vividly glowing saturated crystals inside, dungeon icon style, white background
```

---

## Map 5 — Núi Tuyết (Snow Mountain)

**Level:** 28–42

### Backdrop (nền xa — parallax)

```
2D pixel art, top-down view, wide horizontal parallax backdrop layer, distant snow-capped mountain peaks silhouette, bright crisp blue sky (not dull overcast grey), sparkling falling snowflake particles catching the light, cheerful cartoon-friendly mobile RPG mood (Ninja School Online/Ngọc Rồng Online reference) with cold-but-vibrant atmosphere, no foreground ground detail, no walkable terrain visible, designed to tile seamlessly on left/right edges, bright saturated colors not muted
```

### Tileset Elements

```
2D pixel art tileset sheet, cheerful vibrant snow mountain theme tiles: bright white snow-covered ground with sparkle highlights, saturated blue ice patches, frosted pine tree sections, snowdrift piles, sparkling icicle formations, frozen cracked ice floor with vivid blue glow, snow-covered boulders, cute igloo structure, frosty cave entrance, bold saturated cold-toned color palette not dull/muted, all on white background, 32x32 tiles
```

### Thumbnail (icon chọn map)

```
2D pixel art, 64x64 map selection icon, bright snowy mountain peak with sparkling falling snow, cheerful saturated winter zone icon style, white background
```

---

## Map 6 — Rừng Thiêng (Sacred/Corrupted Forest)

**Level:** 40–55. **Lore:** đây là nơi sự tha hóa của Ma Khí bắt đầu lan rộng từ Linh Thụ Cổ Đại — một số ô đất gây thiệt hại theo thời gian (ô nhiễm) trừ khi có Cuộn Giấy Tẩy Uế. Cần rõ ràng khác biệt với Map 7 (Rừng Cổ, đổ nát/cổ đại) — Map 6 là rừng đang chết dần vì độc khí, không phải tàn tích cổ.

### Backdrop (nền xa — parallax)

```
2D pixel art, top-down view, wide horizontal parallax backdrop layer, dark reddish-purple sky filtering through a distant corrupted forest silhouette, faint outline of a massive ancient tree looming far in the distance, drifting ghostly violet wisps rendered in vivid saturated neon purple-red (Ninja School Online/Ngọc Rồng Online reference: dark base with bold vibrant glow accents, not dull/hazy), sense of active corruption spreading, no foreground ground detail, no walkable terrain visible, designed to tile seamlessly on left/right edges, tense atmosphere but visually vibrant not drab
```

### Tileset Elements

```
2D pixel art tileset sheet matching this game's established art direction: withering dark grass with patches of dead dry ground, vividly glowing neon purple-red corrupted soil tile (hazard tile, damage over time, bright saturated glow not faint), twisted blackened tree trunk sections, sparse dying leaf canopy, small toxic mist pool with vivid glow, cracked dry riverbed, bright ghostly wisp light particle overlay, ancient stone marker half-swallowed by corruption, fallen withered branch piles, dark decayed base palette with bold saturated purple-red glow accents (not muted overall), dark brown outlines instead of pure black, all on white background, 32x32 tiles
```

### Thumbnail (icon chọn map)

```
2D pixel art, 64x64 map selection icon, twisted corrupted tree silhouette wreathed in vivid saturated purple-red glow, ominous but visually striking zone icon style, white background
```

---

## Map 7 — Rừng Cổ (Ancient Forest)

**Level:** 52–68

### Backdrop (nền xa — parallax)

```
2D pixel art, top-down view, wide horizontal parallax backdrop layer, distant massive ancient tree silhouettes towering into a vivid saturated purple-green ethereal glow (Ninja School Online/Ngọc Rồng Online reference: bold vibrant magical glow, not soft/hazy), floating bright spirit lights drifting far off, mysterious yet visually striking magical atmosphere, no foreground ground detail, no walkable terrain visible, designed to tile seamlessly on left/right edges, endgame forest mood but colorful not drab
```

### Tileset Elements

```
2D pixel art tileset sheet, ancient forest theme tiles with vivid saturated highlights: massive ancient tree roots, brightly glowing mushroom clusters (saturated blue-green), overgrown stone ruins with lush green moss, vine-covered walls, bright spirit wisps, ancient altar stones, vividly glowing flower patches, dense ancient undergrowth, bold saturated color palette not muted, all on white background, 32x32 tiles
```

### Thumbnail (icon chọn map)

```
2D pixel art, 64x64 map selection icon, glowing ancient tree silhouette wrapped in vivid saturated mystical purple-green light, endgame forest icon style, white background
```

---

## Map 8 — Thánh Điện Cổ (Boss Arena)

**Điều kiện:** Lv 70 + hoàn thành MQ-09 (rèn Kiếm Hư Vô). **Boss cuối:** Linh Thụ Ma Hóa — chính Linh Thụ Cổ Đại của làng bị Ma Khí chiếm hoàn toàn (xem `art-refs/enemies/monsters.md` mục "BOSS CUỐI") — không phải rồng.

### Background / Thumbnail

```
2D pixel art, top-down view, ominous ancient temple boss arena RPG map, massive stone temple floor with cracked ancient tiles, giant black tree roots breaking up through the cracks in the floor, glowing ancient rune carvings winding around the roots, large stone pillars at sides with fire torches, dark red and violet color palette, dramatic atmosphere, epic final boss arena, rising dark smoke from cracks, sense of ancient corrupted power, cinematic boss room
```

### Boss Arena Tileset

```
2D pixel art tileset sheet, ancient temple boss arena tiles: dark stone floor with glowing golden-violet rune cracks, massive stone column sections, fire brazier pedestals, broken stone rubble, ancient corrupted-tree relief carvings on walls, thick black root cracks bursting through the floor, dramatic lighting effects, all on white background, 32x32 tiles
```

### Preview Thumbnail (cho menu màn hình chọn map)

```
2D pixel art, 64x64 map selection icon, ancient temple shrouded in mystery, silhouette of a massive twisted tree visible through dark temple gates, faint violet-red glow pulsing from deep within, forbidding and epic, locked dungeon icon style, white background
```
