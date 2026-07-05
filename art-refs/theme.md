# Shinobi Valley — Theme Guide & Color Palette Bible

Version 1.0

Quy tắc gốc về art direction + bảng màu cho **toàn bộ** asset trong game — đọc file này trước khi viết prompt gen ảnh mới, và dùng chung với style prefix ở [README.md](README.md).

---

## Art Direction

Shinobi Valley là:

- Cozy Farming RPG
- Fantasy Slice of Life
- Top-down, 2D
- Pixel Art inspired
- Bright but relaxing
- Nintendo style atmosphere

Lấy cảm hứng từ: Stardew Valley, Rune Factory, Avatar Teamobi, Ninja School.

**Mood**: Peaceful, Warm, Inviting, Relaxing, Adventure, Fantasy.

**Never**: dark · realistic · neon · highly saturated.

---

## Global Theme Prompt

Dùng cho **mọi** lần gen ảnh:

```text
Shinobi Valley art style
cozy fantasy farming game
bright natural colors
soft saturation
pleasant greens
warm brown dirt roads
clean blue rivers
lush vegetation
small wildflowers
gentle daylight
top-down perspective
Stardew Valley inspired
Rune Factory inspired
Nintendo style atmosphere
slightly stylized
high readability
not realistic
not overly vibrant
not dark
calm relaxing mood
consistent palette
soft shadows
friendly environment
pixel inspired
cozy farming RPG
```

---

## Visual Rules

| Thuộc tính     | Giá trị      |
| -------------- | ------------ |
| Brightness     | 75%          |
| Saturation     | 65%          |
| Contrast       | 55%          |
| Warmth         | 52%          |
| Shadow Strength| 40%          |
| Bloom          | Very subtle  |
| Ambient Light  | Soft daylight|

**Tránh**: HDR · cinematic lighting · dramatic shadows · dark fantasy · horror atmosphere · oversaturated greens · neon colors · washed-out colors · heavy outlines.

---

## Color Palette

### Sky

| Tên           | Hex       |
| ------------- | --------- |
| Sky Top       | `#5CAEF8` |
| Sky Mid       | `#79C4FF` |
| Sky Horizon   | `#B7E2FF` |
| Cloud Light   | `#FFFFFF` |
| Cloud Shadow  | `#DCEAF7` |

```text
bright cozy sky
soft gradient
clean atmosphere
gentle contrast
pleasant daylight
peaceful mood
```

### Mountains

| Tên            | Hex       |
| -------------- | --------- |
| Mountain Dark  | `#4E7CB2` |
| Mountain Mid   | `#6C96C8` |
| Mountain Light | `#9BC2E8` |

```text
soft blue mountains
desaturated
atmospheric perspective
fantasy valley
peaceful scenery
```

### Grass

| Tên             | Hex       |
| --------------- | --------- |
| Grass Base      | `#8AC94A` |
| Grass Light     | `#A8DB67` |
| Grass Highlight | `#BEEA7A` |
| Grass Shadow    | `#6DA33C` |

```text
lush green grass
vibrant but natural
pleasant green
cozy farming game
soft saturation
not neon
```

### Flowers

| Tên    | Hex       |
| ------ | --------- |
| White  | `#F8F8F8` |
| Pink   | `#F7A7C2` |
| Yellow | `#FFD963` |
| Purple | `#B98EF2` |
| Blue   | `#80BFFF` |

```text
small wildflowers
subtle decorative flowers
cute fantasy environment
natural distribution
```

### Dirt Roads

| Tên         | Hex       |
| ----------- | --------- |
| Dirt Base   | `#B88A54` |
| Dirt Light  | `#D0A36A` |
| Dirt Shadow | `#94663D` |

```text
warm brown dirt path
soft earthy tones
slightly saturated
cozy village road
natural color
not orange
```

### Rivers

| Tên             | Hex       |
| --------------- | --------- |
| River Base      | `#4AA9F0` |
| River Light     | `#6EC5FF` |
| River Highlight | `#A6E5FF` |
| River Shadow    | `#2C7BC7` |

```text
clean river
bright blue water
gentle reflections
fantasy farming style
peaceful atmosphere
```

### Lakes

| Tên         | Hex       |
| ----------- | --------- |
| Lake Base   | `#58B7E7` |
| Lake Shadow | `#3F96D2` |
| Lake Edge   | `#739D57` |

```text
calm pond
fresh blue water
soft reflections
peaceful environment
```

### Trees

| Tên            | Hex       |
| -------------- | --------- |
| Pine Dark      | `#2E6A46` |
| Pine Mid       | `#3D875B` |
| Pine Highlight | `#57AA74` |

```text
healthy evergreen trees
cozy fantasy forest
soft shading
bright natural colors
```

### Cherry Blossom

| Tên         | Hex       |
| ----------- | --------- |
| Pink        | `#F2A5C4` |
| Light Pink  | `#FFD4E5` |
| Shadow Pink | `#D77CA0` |

```text
blooming cherry blossom tree
cute fantasy style
soft pink foliage
spring atmosphere
```

### Rocks

| Tên         | Hex       |
| ----------- | --------- |
| Rock Base   | `#7E8A91` |
| Rock Light  | `#AAB4BA` |
| Rock Shadow | `#5C666C` |

```text
stylized fantasy rocks
smooth shading
cozy environment
not realistic
```

### Wood

| Tên           | Hex       |
| ------------- | --------- |
| Wood Base     | `#9C6A3A` |
| Wood Highlight| `#B9834E` |
| Wood Shadow   | `#714A28` |

```text
warm wooden structures
friendly fantasy style
natural wood colors
```

---

## Environmental Details

Luôn thêm vào cảnh: small flowers · grass variation · tiny bushes · wild plants · pebbles · small rocks · occasional mushrooms · fallen leaves · soft vegetation clusters.

Không để trống lớn — cảnh phải luôn có cảm giác "sống" (alive).

---

## World Design Rules

**Thứ tự layer nền** (xa → gần):

```
Sky → Clouds → Mountains → Distant Forest → Main Tree Line
→ Grassland → Roads → Flowers → River → Foreground Vegetation
```

| Thuộc tính        | Giá trị     |
| ----------------- | ----------- |
| Tree density      | 70%         |
| Open grass area   | 30%         |
| Flower density    | Low–Medium  |
| Road width        | Medium      |
| Water saturation  | Medium      |
| Grass saturation  | Medium High |

---

## Lighting

| Thuộc tính      | Giá trị      |
| --------------- | ------------ |
| Time            | Late Morning |
| Weather         | Clear Sky    |
| Season          | Spring       |
| Light Temperature | Warm Neutral |

**Tránh**: sunset · night · rain · fog · dark ambience · heavy bloom · strong contrast.

---

## AI Negative Prompt

Dùng làm negative prompt cho mọi lần gen (nếu tool hỗ trợ) hoặc thêm vào cuối prompt dạng "avoid: ...":

```text
dark fantasy
realistic
photorealistic
HDR
cinematic
oversaturated
neon colors
empty terrain
blurry
low detail
gloomy
horror
desert
winter
snow
cyberpunk
heavy shadows
dramatic lighting
orange grass
dead vegetation
urban environment
```

---

## Theme Identity

| Nguồn cảm hứng   | Tỉ lệ |
| ---------------- | ----- |
| Stardew Valley   | 40%   |
| Rune Factory     | 30%   |
| Avatar Teamobi   | 20%   |
| Animal Crossing  | 10%   |

**Target feeling**: Cute · Relaxing · Readable · Bright · Comfortable · Adventurous · Timeless.

Phù hợp cho phiên chơi dài (long play sessions) và gameplay MMO farming.
