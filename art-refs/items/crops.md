# Crops — AI Image Prompts

**Style chung (dán vào đầu mọi prompt bên dưới) — đúng theo [`art-refs/theme.md`](../theme.md), bắt buộc đọc file đó trước khi gen:**
```
Shinobi Valley art style, cozy fantasy farming game icon, pixel-art inspired, bright natural colors, soft saturation, gentle daylight, slightly stylized, high readability, not realistic, not photorealistic, not overly vibrant, not dark, consistent palette, friendly cute style, clean simple shapes.
Single centered object — the small soil mound (or water patch) is part of the object itself, not a floor or ground plane.
Consistent slightly angled front view.
Transparent background, nothing behind the object, no floor, no ground plane, no backdrop, no cast shadow, no border, no text.
Designed to remain readable at 32x32.
Avoid: dark fantasy, HDR, cinematic lighting, oversaturated colors, neon colors, glossy 3D render, heavy outlines, horror atmosphere.
```

Mỗi cây có **5 file**: **Hạt giống** (seed) → **Nảy mầm** (sprout) → **Đang lớn** (growing) → **Chín / Thu hoạch** (harvest — cây đã chín, vẫn còn gắn trên mô đất/thân cây, hiển thị trên ô đất khi tới lúc hái) → **Vật phẩm** (item icon — dùng khi hiển thị trong túi đồ sau khi đã hái, tách rời khỏi cây/đất). Khớp đúng cách `FarmManager.getVisualStage()` + `PreloadScene.ts` đang load: `crop_<id>_seed/_sprout/_growing/_harvest` (harvest có hậu tố `_harvest` riêng — KHÁC file `<id>.png` dùng làm item icon, hiện Inventory UI chưa preload file item icon vì để dành Sprint 4). Giai đoạn hiển thị trên map tính theo % thời gian đã trồng so với `growth_hours` (khớp `FarmManager.getVisualStage()`): **0–33% seed, 33–66% sprout, 66–100% growing**, sau đó chuyển sang state rời `harvest` khi đủ `growth_hours` (không tính theo %).

**Quy tắc bám đất (quan trọng để đặt lên map không bị "nhảy"):** 4 giai đoạn Seed/Sprout/Growing/Harvest của **cùng 1 cây** phải vẽ **cùng một mô đất nhỏ ở đáy sprite, cùng kích thước, cùng vị trí** (trừ cây thủy sinh — Hoa Sen — dùng mặt nước + lá sen thay cho mô đất, cũng giữ nguyên vị trí qua cả 4 giai đoạn). Cây lớn dần lên PHÍA TRÊN mô đất đó qua từng giai đoạn, mô đất không đổi; **Harvest** là giai đoạn cây đã chín hẳn, quả/lá đầy đủ kích thước nhất, vẫn còn gắn trên mô đất/thân cây, sẵn sàng để hái. Riêng **Item Icon thì KHÔNG có đất/nước** — chỉ là cây/quả đã tách rời sau khi hái, nhìn rõ để làm icon nhỏ trong túi đồ.

**Quy tắc nền/bóng:** style chung đã yêu cầu `Transparent background` + `no cast shadow` + `no floor`. Nếu tool gen ra alpha thật thì dùng luôn; nếu tool trả về checkerboard giả thì vẫn gen được, báo lại — có sẵn pipeline tách nền bằng code (`docs/planning/dev-schedule.md` Phụ lục A). Hiệu ứng phát sáng/hạt lấp lánh NẰM TRÊN cây (glow, sparkle) vẫn giữ nguyên — đó là hiệu ứng vật thể, không phải bóng đổ, không ảnh hưởng tách nền.

---

## TIER CƠ BẢN

### Cà Rốt (Carrot)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small round orange-brown carrot seed sitting on top of a small rounded mound of dark soil, tiny green sprout tip just beginning to emerge from the soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small carrot seedling, two thin green leaves growing up from the same small mound of dark soil, no visible root bulb yet, delicate young plant, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young carrot plant growing from the same small mound of dark soil, short leafy green top with a few more leaves, small hint of orange root peeking above the soil mound, not yet full size, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown carrot plant growing from the same small mound of dark soil, full lush green leafy top, bright orange root now clearly visible bulging above the soil mound, ready to be pulled, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single bright orange carrot pulled from the ground, tapered root, lush green feathery leafy top, slightly dirty from soil, isolated single item, no soil, no ground, transparent background
```

---

### Khoai Tây (Potato)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small tan-brown potato seed piece with tiny eye sprout, half-buried in a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small potato seedling, single thin green stem with two small leaves growing up from the same small mound of dark soil, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young potato plant growing from the same small mound of dark soil, bushy green leafy top with several stems, soil mound slightly larger hiding growing tubers underneath, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown potato plant growing from the same small mound of dark soil, full bushy green leafy top, soil mound slightly cracked revealing a hint of tan potato skin underneath, ready to be dug up, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single round tan-brown potato, slightly lumpy irregular surface, small root nubs, earthy texture, isolated single item freshly dug, no soil mound, no ground, transparent background
```

---

### Bắp Cải (Cabbage)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, tiny dark green cabbage seed sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small cabbage seedling, four to five loose pale green round leaves spreading open from the same small mound of dark soil, not curling yet, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young cabbage plant growing from the same small mound of dark soil, leaves starting to curl inward forming a loose open head, medium green color, not yet tight, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown cabbage plant growing from the same small mound of dark soil, round tightly wrapped green cabbage head resting directly on the soil mound, outer leaves fully layered, ready to be cut, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single round green cabbage head, layered leaves wrapping tightly, pale yellow-green center visible at top, isolated single item, no soil, no ground, transparent background
```

---

### Hành Lá (Green Onion / Scallion)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, tiny onion bulb seed sitting on top of a small rounded mound of dark soil, thin green shoot tip just beginning to emerge, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, single thin green onion shoot growing up from the same small mound of dark soil, tiny white bulb base just forming at the soil line, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young green onion plant growing from the same small mound of dark soil, two to three thin green stalks of medium height, small white bulb base visible at the soil line, not yet bundled, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown green onion plant growing from the same small mound of dark soil, several tall bright green tubular stalks, white and purple-tinged bulb bases clearly visible at the soil line, ready to be pulled, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, bundle of three green onion stalks, bright green tubular tops, white and purple-tinged base bulbs, tied together with a small band, isolated single item, no soil, no ground, transparent background
```

---

### Bí Đỏ (Pumpkin)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, flat oval cream-colored pumpkin seed sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small pumpkin seedling, two broad round green leaves and a thin curling vine tendril growing up from the same small mound of dark soil, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young pumpkin vine spreading from the same small mound of dark soil, broad green leaves, small unripe green pumpkin fruit forming right beside the soil mound, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown pumpkin vine spreading from the same small mound of dark soil, broad green leaves, one large round orange pumpkin with deep ribbed segments resting fully ripe beside the soil mound, ready to be cut from the vine, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single round orange pumpkin, deep ribbed vertical segments, dark green curly vine stem at top, isolated single item, no soil, no ground, warm autumn harvest vegetable, transparent background
```

---

## TIER TRUNG CẤP

### Dâu Tây (Strawberry)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, tiny strawberry seed sitting on top of a small rounded mound of dark soil, small white seeds visible on its surface, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small strawberry seedling, three small round serrated green leaves growing up from the same small mound of dark soil, no fruit yet, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young strawberry plant growing from the same small mound of dark soil, cluster of green leaves with a small unripe pale green-white berry forming right at the soil line, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown strawberry plant growing from the same small mound of dark soil, cluster of green leaves with one ripe red heart-shaped strawberry hanging at the soil line, tiny yellow seeds dotting its surface, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single ripe red heart-shaped strawberry, tiny yellow seeds dotting the surface, bright green serrated leaf cap, isolated single item, no soil, no ground, shiny and appetizing, transparent background
```

---

### Cà Chua (Tomato)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small pale yellow tomato seed sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small tomato seedling, thin stem with two round pale green seed leaves growing up from the same small mound of dark soil, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young tomato plant growing from the same small mound of dark soil, green leafy stem with a small unripe green tomato hanging just above the soil, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown tomato plant growing from the same small mound of dark soil, green leafy stem with one round glossy ripe red tomato hanging just above the soil, small green star-shaped calyx at top, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single round glossy ripe red tomato, small green star-shaped calyx at top, slightly shiny highlight reflection, isolated single item, no soil, no ground, transparent background
```

---

### Dưa Hấu (Watermelon)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, black oval watermelon seed sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small watermelon seedling, two broad heart-shaped green leaves growing up from the same small mound of dark soil next to the black seed husk, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young watermelon vine spreading from the same small mound of dark soil, sprawling green leaves and curling tendrils, small round striped fruit still growing beside the soil mound, not full size, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown watermelon vine spreading from the same small mound of dark soil, sprawling green leaves and curling tendrils, one large plump round watermelon with dark green and lighter green stripes resting fully ripe beside the soil mound, ready to be cut from the vine, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single round watermelon, dark green with lighter green vertical stripes, small curly brown vine stem, large and plump, isolated single item, no soil, no ground, summer fruit, transparent background
```

---

### Ngô (Corn)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, golden yellow corn kernel seed sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, single thin green corn shoot with one narrow blade leaf growing straight up from the same small mound of dark soil, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young corn stalk growing from the same small mound of dark soil, tall with several long narrow green leaves, small immature cob just forming at the base of a leaf, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown corn stalk growing from the same small mound of dark soil, tall with several long narrow green leaves, one full-sized corn cob with golden kernels peeking through the green husk at the base of a leaf, silk threads visible at top, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single yellow corn cob, rows of golden kernels, green husk leaves peeled back to reveal corn, silk threads visible at top, isolated single item, no soil, no ground, transparent background
```

---

### Nấm (Mushroom)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, tiny brown mushroom spore resting on top of a small rounded mound of dark forest soil, small white mycelium threads visible in the soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, tiny white mushroom pin just breaking through the surface of the same small mound of dark soil, barely formed cap, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young mushroom growing from the same small mound of dark soil, small tan cap not yet fully opened, short thin pale stem rising from the soil, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown mushroom growing from the same small mound of dark soil, round tan dome cap fully opened with white spots, thick pale stem rising from the soil, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single round brown and white mushroom, tan dome cap with white spots, thick pale stem, isolated single item, no soil, no ground, forest floor mushroom, transparent background
```

---

## TIER CAO CẤP

### Trà Xanh (Green Tea)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small green tea seed, delicate oval shape, sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small tea seedling, thin woody stem with two tiny oval glossy leaves growing up from the same small mound of dark soil, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young tea shrub growing from the same small mound of dark soil, small woody stem with several oval green leaves, not yet bundled for harvest, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown tea shrub growing from the same small mound of dark soil, small woody stem full of oval glossy vivid green leaves, slight morning dew, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, bundle of fresh green tea leaves, small oval glossy leaves, vivid bright green, tied in a small bundle, slight morning dew, isolated single item, no soil, no ground, transparent background
```

---

### Nhân Sâm (Ginseng)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small beige-red ginseng berry seed sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small ginseng seedling, single green leaf stalk growing up from the same small mound of dark soil, thin pale root barely visible at the soil surface, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young ginseng plant growing from the same small mound of dark soil, leafy green top with a few compound leaves, small forked pale root beginning to show just under the soil surface, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown ginseng plant growing from the same small mound of dark soil, leafy green top with full compound leaves, pale golden forked root now clearly visible breaking through the soil surface, subtle golden glow, ready to be dug up, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, pale golden ginseng root, humanoid forked root shape with arms and legs, intricate wrinkled texture, small green leaf sprout at top, subtle golden glow, isolated single item, no soil, no ground, magical medicinal herb, transparent background
```

---

### Hoa Sen (Lotus)

*(Cây thủy sinh — dùng mặt nước + lá sen làm điểm bám thay cho mô đất, giữ nguyên vị trí mặt nước qua cả 4 giai đoạn Seed/Sprout/Growing/Harvest. Item Icon thì tách rời khỏi nước.)*

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, dark brown oval lotus seed, hard shell, resting on the surface of a small patch of calm water, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small lotus sprout, single round green lily pad and thin stem growing up from the same small patch of water, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young lotus plant growing from the same small patch of water, a couple of floating lily pads and one closed pink flower bud on a stem above the water, not yet bloomed, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown lotus plant growing from the same small patch of water, a couple of floating lily pads and one fully bloomed pink lotus flower with layered petals and golden yellow center stamens rising above the water, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, single pink lotus flower in bloom, multiple layered petals from pale pink to deep rose, golden yellow center stamens, one small lily pad beneath it, isolated single item, no open water, elegant and serene, transparent background
```

---

### Sâm Đỏ (Red Ginseng)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, deep red ginseng berry seed, slightly glowing, sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small red-tinted ginseng seedling, single glowing red-green leaf growing up from the same small mound of dark soil, faint warm glow, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young red ginseng plant growing from the same small mound of dark soil, leafy top with a faint red inner glow, small forked crimson-tinted root beginning to show under the soil surface, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown red ginseng plant growing from the same small mound of dark soil, leafy top with a strong red inner glow, dark crimson-red twisted forked root now clearly visible breaking through the soil surface, intense warm glow, ready to be dug up, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, red ginseng root, dark crimson-red color, twisted forked root shape, intense warm glow emanating from it, isolated single item, no soil, no ground, magical aura, transparent background
```

---

### Dược Thảo (Medicinal Herb)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small herb seed pod sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small herb seedling, a couple tiny green leaves growing up from the same small mound of dark soil, faint healing glow just starting, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young medicinal herb plant growing from the same small mound of dark soil, mix of small green and purple leaves, not yet bundled, faint glowing green particles beginning to appear, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown medicinal herb plant growing from the same small mound of dark soil, full mix of green and purple leaves, subtle glowing green particles floating around, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, bundle of mixed medicinal herbs, small green and purple leaves tied together, subtle glowing green particles floating around, isolated single item, no soil, no ground, healing magic herb bundle, transparent background
```

---

## TIER HIẾM

### Hoa Ánh Trăng (Moonlight Flower)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, pearlescent silver seed, soft white glow, sitting on top of a small rounded mound of dark soil, moon phase symbol visual cue, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small silver-white flower seedling, two slender glowing leaves growing up from the same small mound of dark soil, faint moonlight glow, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young moonlight flower plant growing from the same small mound of dark soil, slender silver-blue leaves and a small closed bud, soft glow, not yet bloomed, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown moonlight flower plant growing from the same small mound of dark soil, slender silver-blue leaves surrounding one fully bloomed white flower with silver-blue petals glowing softly like moonlight, small crescent moon shape in center, soft silver particle effects, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, white flower with silver-blue petals glowing softly like moonlight, elegant slender petals radiating outward, small crescent moon shape in center, soft silver particle effects, isolated single item, no soil, no ground, mystical night-blooming flower, transparent background
```

---

### Hoa Mặt Trời (Sunflower)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, large striped black and white sunflower seed sitting on top of a small rounded mound of dark soil, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small sunflower seedling, two round green seed leaves on a short thin stem growing up from the same small mound of dark soil, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young sunflower plant growing from the same small mound of dark soil, tall green stem with broad leaves, small closed yellow-green bud at top, not yet open, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown sunflower plant growing from the same small mound of dark soil, tall green stem with broad leaves, one large fully bloomed sunflower head with bright golden yellow petals and dark brown seed-pattern center at the top, warm sun energy glow, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, large sunflower head, bright golden yellow petals radiating outward, dark brown center with seed pattern, short stem, warm sun energy glow around it, isolated single item, no soil, no ground, transparent background
```

---

### Cây Linh Khí (Spirit Energy Plant)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, translucent blue-purple glowing seed sitting on top of a small rounded mound of dark soil, ethereal wisps floating around it, magical seed, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, small translucent blue-purple sprout growing up from the same small mound of dark soil, faint ethereal wisps, barely formed glowing leaf tips, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young spirit energy plant growing from the same small mound of dark soil, a few translucent crystalline leaves forming, soft blue-purple inner glow growing stronger, small wisps drifting around it, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown spirit energy plant growing from the same small mound of dark soil, full translucent blue and purple crystalline leaves, strong inner glow, spiritual energy wisps floating around it, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, otherworldly plant with translucent blue and purple crystalline leaves, spiritual energy wisps floating around it, soft inner glow, qi/chi energy emanating, isolated single item, no soil, no ground, magical rare plant, transparent background
```

---

### Hạt Giống Cổ Đại (Ancient Seed)

*(Seed = chính vật phẩm này, đã là dạng "item" ngay từ đầu — cả Harvest và Item Icon đều dùng lại gần như nguyên trạng hình hạt giống; Harvest vẫn còn mô đất/thân cây quanh nó, Item Icon thì bỏ mô đất.)*

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, ancient mysterious seed, dark obsidian black color, golden glowing cracks running through it (kintsugi-style), faint golden rune markings on surface, resting on top of a small rounded mound of dark soil once planted, radiates ancient power, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, ancient seed cracking open in the same small mound of dark soil, thin dark purple shoot with faint golden veins just emerging from the glowing black shell, small golden particles rising, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young ancient sprout growing from the same small mound of dark soil, dark purple stalk with a couple of golden-veined leaves, glowing golden particles rising steadily, mysterious aura, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown ancient sprout growing from the same small mound of dark soil, dark purple stalk with full golden-veined leaves, one fully re-formed ancient seed glowing brightly with golden kintsugi-style cracks resting at the base among the roots, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, ancient mysterious seed, dark obsidian black color, golden glowing cracks running through it (kintsugi-style), faint golden rune markings on surface, isolated single item, no soil, no ground, radiates ancient power, legendary rarity item, transparent background
```

---

### Tinh Hoa Thiên Nhiên (Nature's Essence)

**Seed:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, radiant green crystalline seed sitting on top of a small rounded mound of dark soil, pure nature energy concentrated, tiny rainbows refract from it, transparent background
```
**Sprout:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, tiny crystalline shoot growing up from the same small mound of dark soil, small emerald crystal fragments forming at the tip, faint sparkle, transparent background
```
**Growing:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, young crystalline plant growing from the same small mound of dark soil, a few emerald crystal formations and small leaf buds forming, particles beginning to orbit gently, transparent background
```
**Harvest:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, fully grown crystalline plant growing from the same small mound of dark soil, full emerald crystal formation with several small flowers blooming at tips, particles orbiting steadily, ready to be picked, transparent background
```
**Item Icon:**
```
Shinobi Valley pixel-art-inspired icon, bright natural colors, soft saturation, cute cozy fantasy farming style, consistent slightly angled front view, crystalline plant that looks like solidified pure nature energy, emerald green crystal formation, tiny flowers blooming at tips, surrounded by rotating leaf and flower particles, isolated single item, no soil, no ground, ultimate nature item, transparent background
```
