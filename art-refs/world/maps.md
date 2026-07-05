# Maps — AI Image Prompts

Dùng để gen **tileset**, **background**, và **preview thumbnail** cho từng bản đồ.

Style chung: `2D pixel art, top-down view, RPG game map tileset, clean outlines, vibrant colors, white background`

**Định hướng art (bám theo asset đã gen — xem `cave/background.png`, `crops/carrot.png`):** pixel art chi tiết có shading/dithering như RPG 16-bit (Stardew Valley, Secret of Mana) — **KHÔNG** phải vector phẳng, **KHÔNG** bóng gương/gradient mượt kiểu asset pack mobile, **KHÔNG** outline đen dày đều kiểu hoạt hình đồ chơi. Outline dùng tông màu đậm hơn của chính vật liệu (gỗ dùng nâu sậm, đá dùng xám sậm...), không dùng đen thuần. Palette ấm, hơi trầm (muted), tránh màu chói/bão hòa như sticker. Nếu prompt AI ra kết quả giống "vector cute mobile game" thay vì pixel art có texture — thêm rõ các cụm từ: `detailed hand-painted pixel art`, `soft dithering shading`, `muted color palette`, `no flat vector illustration`, `no glossy cartoon outline`.

---

## Map 0 — Nông Trại (Player Farm)

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

## Map 1 — Đồng Cỏ (Grassland)

**Level:** 1–5

### Background / Thumbnail

```
2D pixel art, top-down view, peaceful green grassland RPG map, lush bright green grass tiles, scattered wildflowers in pink and yellow, small dirt paths, gentle rolling hills in background, clear blue sky with white puffy clouds, sunny warm atmosphere, beginner zone feel, vibrant and inviting, farming village RPG style
```

### Tileset Elements

```
2D pixel art tileset sheet, grassland theme tiles: bright green grass, dirt path, small rocks, wildflower patches (red, yellow, pink), tall grass clumps, wooden fence sections, small pond with lily pads, tree stumps, all on white background, 32x32 tiles
```

---

## Map 2 — Rừng Tre (Bamboo Forest)

**Level:** 5–10

### Background / Thumbnail

```
2D pixel art, top-down view, dense bamboo forest RPG map, tall bamboo stalks casting dappled green light on ground, soft green ambient lighting filtering through canopy, moss-covered stone path winding through, scattered bamboo leaves on ground, mysterious and serene, slightly darker than grassland, green and earthy color palette
```

### Tileset Elements

```
2D pixel art tileset sheet, bamboo forest theme tiles: bamboo stalk sections, fallen bamboo logs, green moss patches, stone lanterns, spider web patches, dense undergrowth, bamboo leaf piles, ancient stone markers, all on white background, 32x32 tiles
```

---

## Map 3 — Hang Động (Cave / Dungeon)

**Level:** 10–15

### Background / Thumbnail

```
2D pixel art, top-down view, dark underground cave RPG dungeon map, rough dark stone floor with dark brown and grey tones, glowing teal and purple crystals growing from walls, stalactites hanging from cave ceiling edges, small underground pools reflecting crystal light, torches on walls casting warm orange pools of light, eerie and atmospheric, dungeon crawler style
```

### Tileset Elements

```
2D pixel art tileset sheet, cave dungeon theme tiles: dark stone floor, cave wall sections, glowing crystal clusters (blue, purple, green), bone piles, underground pools, wooden support beams, iron torch wall sconces, cracked stone, treasure chest, all on white background, 32x32 tiles
```

---

## Map 4 — Núi Tuyết (Snow Mountain)

**Level:** 15–20

### Background / Thumbnail

```
2D pixel art, top-down view, snowy mountain RPG map, white snow-covered ground with ice patches, frozen pine trees with snow on branches, icy blue frozen lake sections, snowflake particles falling, pale blue-white color palette, cold and treacherous atmosphere, mountain peaks in background, winter wilderness RPG zone
```

### Tileset Elements

```
2D pixel art tileset sheet, snow mountain theme tiles: snow covered ground, ice patches, frozen pine tree sections, snowdrift piles, icicle formations, frozen cracked ice floor, snow-covered boulders, igloo structures, frosty cave entrances, all on white background, 32x32 tiles
```

---

## Map 5 — Rừng Cổ (Ancient Forest)

**Level:** 20–25

### Background / Thumbnail

```
2D pixel art, top-down view, mystical ancient forest RPG map, massive ancient tree trunks wider than paths, bioluminescent mushrooms and plants glowing softly, purple and green ethereal light, ancient stone ruins overgrown with vines, floating spirit lights drifting through air, deep green and purple color palette, mysterious and magical, endgame forest zone atmosphere
```

### Tileset Elements

```
2D pixel art tileset sheet, ancient forest theme tiles: massive ancient tree roots, glowing mushroom clusters, overgrown stone ruins, vine-covered walls, spirit wisps, ancient altar stones, glowing flower patches, dense ancient undergrowth, all on white background, 32x32 tiles
```

---

## Map Boss — Thánh Điện Cổ (Ancient Temple)

**Điều kiện:** Hoàn thành 5 map + chìa khóa

### Background / Thumbnail

```
2D pixel art, top-down view, ominous ancient temple boss arena RPG map, massive stone temple floor with cracked ancient tiles, glowing dragon rune carvings in floor, large stone pillars at sides with fire torches, dark red and gold color palette, dramatic atmosphere, epic final boss arena, rising dark smoke from cracks, sense of ancient power, cinematic boss room
```

### Boss Arena Tileset

```
2D pixel art tileset sheet, ancient temple boss arena tiles: dark stone floor with glowing golden rune cracks, massive stone column sections, fire brazier pedestals, broken stone rubble, ancient dragon relief carvings on walls, lava cracks in floor, dramatic lighting effects, all on white background, 32x32 tiles
```

### Preview Thumbnail (cho menu màn hình chọn map)

```
2D pixel art, 64x64 map selection icon, ancient temple shrouded in mystery, silhouette of dragon visible through dark temple gates, glowing red eyes peering from shadows, forbidding and epic, locked dungeon icon style, white background
```
