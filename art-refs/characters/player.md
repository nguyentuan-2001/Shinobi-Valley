# Player Character — AI Image Prompts

Nhân vật chính có thể thay đổi ngoại hình theo vũ khí trang bị.
Base character dùng chung cho mọi hệ.

**Giới tính:** Game có 2 giới tính chọn được — **Nam** và **Nữ** — xác định ngay lúc tạo tài khoản/tạo nhân vật (xem `docs/data/data-schema.md` field `gender`). Lựa chọn này chỉ đổi model/animation, không ảnh hưởng chỉ số hay cốt truyện. Vì vậy **mọi mục dưới đây đều cần gen 2 bản Nam + Nữ** dùng chung 1 bộ trang bị/class — chỉ khác phần tóc/khuôn mặt theo mô tả cố định ở "Đặc điểm theo giới tính".

Style chung: `2D pixel art, 32x32 character sprite, clean outlines, transparent background, ninja RPG style`

### Đặc điểm theo giới tính (dùng cố định, ghép vào mọi prompt bên dưới)

- **Nam:** `short black hair, headband with metal plate, young male face`
- **Nữ:** `long silver-white hair tied back under headband, metal plate headband, young female face`

---

## Nhân Vật Gốc (Base Character — Starter)

### Idle (Đứng yên)
**Nam:**
```
2D pixel art, 32x32 character sprite, young ninja student, short black hair, headband with metal plate, dark blue gi training uniform, simple white belt, determined young male face, front-facing idle stance, hands at sides, slight confident posture, beginner ninja RPG protagonist, transparent background
```
**Nữ:**
```
2D pixel art, 32x32 character sprite, young ninja student, long silver-white hair tied back under headband, metal plate headband, dark blue gi training uniform, simple white belt, determined young female face, front-facing idle stance, hands at sides, slight confident posture, beginner ninja RPG protagonist, transparent background
```

### Idle — Sau / Trái / Phải
*(còn thiếu — hiện chỉ có idle hướng trước; cần gen thêm nếu muốn nhân vật đứng yên đúng hướng đang quay mặt, xem ghi chú ở `docs/data/asset-manifest.md` mục 1)*

### Walk Cycle (3 frame/hướng: Sau, Trước, Nghiêng)
**Nam — mẫu prompt (lặp lại cho từng hướng, đổi từ khóa hướng):**
```
2D pixel art, 32x32 character sprite, young ninja walking, short black hair, headband with metal plate, dark blue training gi, mid-step walk pose, one foot forward, slight arm swing, [front-facing / back-facing / left-facing side profile] movement frame, transparent background
```
**Nữ — mẫu prompt:**
```
2D pixel art, 32x32 character sprite, young ninja walking, long silver-white hair tied back under headband, dark blue training gi, mid-step walk pose, one foot forward, slight arm swing, [front-facing / back-facing / left-facing side profile] movement frame, transparent background
```
*(Hướng phải dùng lại frame nghiêng-trái rồi lật ngang trong code — không cần gen riêng)*

### Attack Pose
**Nam:**
```
2D pixel art, 32x32 character sprite, young ninja in basic attack stance, short black hair, headband with metal plate, dark blue gi, raised arm mid-swing, energetic action pose, combat ready, transparent background
```
**Nữ:**
```
2D pixel art, 32x32 character sprite, young ninja in basic attack stance, long silver-white hair tied back under headband, dark blue gi, raised arm mid-swing, energetic action pose, combat ready, transparent background
```
*(Hiện chỉ có attack hướng trước — nếu muốn đánh đúng hướng sau/nghiêng thì cần gen thêm, xem ghi chú asset-manifest.md)*

---

## Theo Hệ Vũ Khí (Class Variants)

Mỗi hệ dưới đây gen **2 bản Nam + Nữ** (ghép đặc điểm giới tính ở trên vào đầu prompt, giữ nguyên phần trang bị/class).

### Kiếm Sĩ (Sword Class)

**Lv 1–30 — Nam:**
```
2D pixel art, 32x32 character sprite, sword class ninja, short black hair, headband with metal plate, dark navy blue and grey armor, single katana on back, bandaged arms, focused male warrior expression, katana at side ready, transparent background
```
**Lv 1–30 — Nữ:**
```
2D pixel art, 32x32 character sprite, sword class ninja, long silver-white hair tied back under headband, dark navy blue and grey armor, single katana on back, bandaged arms, focused female warrior expression, katana at side ready, transparent background
```

**Lv 60–90 (Late game) — Nam:**
```
2D pixel art, 32x32 character sprite, elite sword master, short black hair, headband with metal plate, dark navy and silver armor with shoulder pauldrons, glowing blue katana visible at hip, cape trailing behind, veteran male warrior presence, transparent background
```
**Lv 60–90 (Late game) — Nữ:**
```
2D pixel art, 32x32 character sprite, elite sword master, long silver-white hair tied back under headband, dark navy and silver armor with shoulder pauldrons, glowing blue katana visible at hip, cape trailing behind, veteran female warrior presence, transparent background
```

---

### Song Kiếm Sĩ (Dual Sword Class)

**Base — Nam:**
```
2D pixel art, 32x32 character sprite, dual sword ninja, short black hair, headband with metal plate, black and crimson outfit, two short swords crossed on back, agile light armor, fast male fighter look, lean athletic build, transparent background
```
**Base — Nữ:**
```
2D pixel art, 32x32 character sprite, dual sword ninja, long silver-white hair tied back under headband, black and crimson outfit, two short swords crossed on back, agile light armor, fast female fighter look, lean athletic build, transparent background
```

**Late game — Nam:**
```
2D pixel art, 32x32 character sprite, dual blade master, short black hair, headband with metal plate, black-red segmented armor, twin glowing swords at hips, shadow energy wisps trailing, speed-focused male elite look, transparent background
```
**Late game — Nữ:**
```
2D pixel art, 32x32 character sprite, dual blade master, long silver-white hair tied back under headband, black-red segmented armor, twin glowing swords at hips, shadow energy wisps trailing, speed-focused female elite look, transparent background
```

---

### Thương Sĩ (Spear Class)

**Base — Nam:**
```
2D pixel art, 32x32 character sprite, spear warrior, short black hair, headband with metal plate, green and brown medium armor, bamboo-steel spear held vertically, tall stance, sturdy male build, forest warrior aesthetic, transparent background
```
**Base — Nữ:**
```
2D pixel art, 32x32 character sprite, spear warrior, long silver-white hair tied back under headband, green and brown medium armor, bamboo-steel spear held vertically, tall stance, sturdy female build, forest warrior aesthetic, transparent background
```

**Late game — Nam:**
```
2D pixel art, 32x32 character sprite, elite spear master, short black hair, headband with metal plate, dark green dragon-scale armor, ornate spear with dragon tip glowing blue, commanding male presence, transparent background
```
**Late game — Nữ:**
```
2D pixel art, 32x32 character sprite, elite spear master, long silver-white hair tied back under headband, dark green dragon-scale armor, ornate spear with dragon tip glowing blue, commanding female presence, transparent background
```

---

### Cung Thủ (Archer Class)

**Base — Nam:**
```
2D pixel art, 32x32 character sprite, archer ninja, short black hair, headband with metal plate, forest green and brown light leather armor, quiver of arrows on back, recurve bow in hand, agile male ranger look, alert eyes, transparent background
```
**Base — Nữ:**
```
2D pixel art, 32x32 character sprite, archer ninja, long silver-white hair tied back under headband, forest green and brown light leather armor, quiver of arrows on back, recurve bow in hand, agile female ranger look, alert eyes, transparent background
```

**Late game — Nam:**
```
2D pixel art, 32x32 character sprite, elite archer, short black hair, headband with metal plate, deep forest green and gold armor, enchanted glowing bow, full quiver, hawk feather in hair, master male marksman presence, transparent background
```
**Late game — Nữ:**
```
2D pixel art, 32x32 character sprite, elite archer, long silver-white hair tied back under headband, deep forest green and gold armor, enchanted glowing bow, full quiver, hawk feather in hair, master female marksman presence, transparent background
```

---

### Ninja (Shuriken Class)

**Base — Nam:**
```
2D pixel art, 32x32 character sprite, classic ninja, short black hair, headband with metal plate, all dark grey-black ninja outfit, mask covering lower face, shurikens on belt, male stealth operative look, crouched ready stance, transparent background
```
**Base — Nữ:**
```
2D pixel art, 32x32 character sprite, classic ninja, long silver-white hair tied back under headband, all dark grey-black ninja outfit, mask covering lower face, shurikens on belt, female stealth operative look, crouched ready stance, transparent background
```

**Late game — Nam:**
```
2D pixel art, 32x32 character sprite, shadow master ninja, short black hair, headband with metal plate, void-black outfit with purple shadow energy flowing off it, face hidden in shadows with only glowing purple eyes visible, shurikens orbiting around body, ultimate male stealth form, transparent background
```
**Late game — Nữ:**
```
2D pixel art, 32x32 character sprite, shadow master ninja, long silver-white hair tied back under headband, void-black outfit with purple shadow energy flowing off it, face hidden in shadows with only glowing purple eyes visible, shurikens orbiting around body, ultimate female stealth form, transparent background
```

---

## Sprite Sheet Layout

### Hướng dẫn gen sprite sheet đầy đủ (gen riêng cho Nam và Nữ)
```
2D pixel art, sprite sheet, ninja RPG character, [short black hair male / long silver-white hair female], 4x4 grid layout on transparent background:
Row 1: idle front, idle back, idle left, idle right
Row 2: walk frame 1 front, walk frame 2 front, walk frame 1 side, walk frame 2 side  
Row 3: attack frame 1, attack frame 2, attack frame 3, hurt/knockback
Row 4: death frame 1, death frame 2, victory pose, sit/idle special
All 32x32 per cell, clean pixel art style, dark blue ninja base character
```

---

## Biểu Cảm (Expressions — cho dialogue/cutscene)

Gen 2 bản Nam/Nữ cho mỗi biểu cảm, dùng đặc điểm tóc ở đầu file.

### Bình thường (Normal)
**Nam:**
```
2D pixel art, 32x32 character portrait face, young ninja student, short black hair, calm neutral expression, clean face, dialogue box portrait style, transparent background
```
**Nữ:**
```
2D pixel art, 32x32 character portrait face, young ninja student, long silver-white hair, calm neutral expression, clean face, dialogue box portrait style, transparent background
```

### Quyết tâm (Determined)
**Nam:**
```
2D pixel art, 32x32 character portrait, young ninja, short black hair, determined serious expression, eyebrows furrowed, gritted teeth showing resolve, ready for battle, transparent background
```
**Nữ:**
```
2D pixel art, 32x32 character portrait, young ninja, long silver-white hair, determined serious expression, eyebrows furrowed, gritted teeth showing resolve, ready for battle, transparent background
```

### Ngạc nhiên (Surprised)
**Nam:**
```
2D pixel art, 32x32 character portrait, young ninja, short black hair, wide surprised eyes, open mouth, shocked expression, transparent background
```
**Nữ:**
```
2D pixel art, 32x32 character portrait, young ninja, long silver-white hair, wide surprised eyes, open mouth, shocked expression, transparent background
```

### Vui mừng (Happy)
**Nam:**
```
2D pixel art, 32x32 character portrait, young ninja, short black hair, bright smile, squinted happy eyes, cheerful joyful expression, transparent background
```
**Nữ:**
```
2D pixel art, 32x32 character portrait, young ninja, long silver-white hair, bright smile, squinted happy eyes, cheerful joyful expression, transparent background
```

### Bị thương (Hurt)
**Nam:**
```
2D pixel art, 32x32 character portrait, young ninja, short black hair, pained expression, eyes squeezed, slight damage marks, hurt battle expression, transparent background
```
**Nữ:**
```
2D pixel art, 32x32 character portrait, young ninja, long silver-white hair, pained expression, eyes squeezed, slight damage marks, hurt battle expression, transparent background
```
