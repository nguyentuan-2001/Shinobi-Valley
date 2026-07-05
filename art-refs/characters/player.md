# Player Character — AI Image Prompts

Nhân vật chính có thể thay đổi ngoại hình theo vũ khí trang bị.
Base character dùng chung cho mọi hệ.

**Giới tính:** Game có 2 giới tính chọn được — **Nam** và **Nữ** — xác định ngay lúc tạo tài khoản/tạo nhân vật (xem `docs/data/data-schema.md` field `gender`). Lựa chọn này chỉ đổi model/animation, không ảnh hưởng chỉ số hay cốt truyện. Vì vậy **mọi mục dưới đây đều cần gen 2 bản Nam + Nữ** dùng chung 1 bộ trang bị/class — chỉ khác phần tóc/khuôn mặt theo mô tả cố định ở "Đặc điểm theo giới tính".

Style chung: `2D pixel art, 32x32 character sprite, clean outlines, clean cel-shading with soft highlights and shadows, transparent background, ninja RPG style`

### Đặc điểm theo giới tính (dùng cố định, ghép vào mọi prompt bên dưới)

- **Nam:** `short spiky black hair with a subtle glossy sheen, headband with a metal plate, sharp expressive eyes, young male face with a warm cheerful smile, bright happy eyes, friendly and approachable expression`
- **Nữ:** `long silver-white hair tied back under headband with a few loose strands framing the face, headband with a metal plate, sharp expressive eyes, young female face with a warm cheerful smile, bright happy eyes, friendly and approachable expression`

**Chi tiết trang phục chuẩn (áp dụng cho base character và các hệ vũ khí trừ khi có mô tả riêng):** `simple red accent trim on the collar` — chỉ 1 điểm nhấn màu, tránh trang phục 1 màu phẳng như bản cũ **nhưng không nhồi quá nhiều chi tiết** (nếp vải, băng quấn, rim light...) vào sprite 32x32 — thực tế gen thử cho thấy càng thêm nhiều mô tả cùng lúc thì AI càng vẽ rối/xấu hơn, không đẹp hơn.

---

## Nguyên tắc gen 1 bộ animation (đọc trước khi gen bất kỳ hành động nào)

Rút ra từ lỗi thực tế đã gặp (nhân vật quay lưng giữa chừng, sải chân lệch biên độ giữa các frame, kích thước ảnh không đồng nhất):

1. **Mỗi hành động (idle/walk/attack) × mỗi hướng = 8 frame**, đánh số `01`→`08`, mô tả tư thế cụ thể cho từng frame (mỗi frame đã có sẵn 1 prompt riêng đầy đủ bên dưới, không cần tự viết) — **không** dùng prompt mơ hồ kiểu "mid-step walk pose" chung chung cho cả bộ, vì AI sẽ vẽ mỗi frame 1 kiểu không khớp nhau.
2. **Gen cả 8 frame trong cùng 1 lượt/cùng seed** (nếu tool hỗ trợ) để giữ nhất quán tỉ lệ nhân vật, màu sắc, góc nhìn.
3. **Không được đổi hướng nhìn giữa các frame** — nếu đang gen bộ "front", cả 8 frame phải quay mặt ra trước xuyên suốt, không có frame nào lệch sang quay lưng/quay nghiêng. Nên thêm rõ vào cuối prompt: `character must face forward in every frame, do not rotate to side or back view`.
4. **Biên độ chuyển động phải đối xứng đều giữa các frame** — ví dụ sải chân ở frame 1 và frame 5 (2 frame đối xứng trong chu kỳ đi) phải rộng bằng nhau, không được 1 frame bước rộng, 1 frame gần như đứng yên.
5. Sau khi gen xong, cắt về cùng kích thước/tỉ lệ với các frame khác đã có (không giữ nguyên canvas gốc của tool AI, thường to hơn nhiều so với sprite 32x32 gốc) — xem quy trình cắt ở `dev-schedule.md` Phụ lục A.

**2 cách gen, chọn theo tool đang dùng:**
- **Gen từng frame riêng** (8 lần gen/hành động) — dùng prompt ở mục "Nhân Vật Gốc" bên dưới, mỗi dòng ra đúng 1 ảnh.
- **Gen ghép sẵn 8 frame vào 1 ảnh** (dạng sprite sheet ngang, tool phải hỗ trợ vẽ nhiều panel liên tục 1 lượt) — dùng prompt ở mục "Gen dạng sprite sheet" ngay bên dưới đây. Cách này cho kết quả đồng nhất hơn (cùng 1 lần vẽ nên tỉ lệ/màu/góc nhìn khớp nhau tự nhiên), sau đó chỉ cần cắt 8 ô đều nhau ra thay vì tách 8 ảnh lẻ.

## Gen dạng sprite sheet (8 frame/1 ảnh, nền trắng)

Prompt yêu cầu rõ: xếp 8 frame thành 1 hàng ngang, cùng tỉ lệ nhân vật, **nền trắng đặc toàn ảnh** (không phải ô vuông xám-trắng trong suốt) để dễ tách nền bằng công cụ xóa nền (rembg) sau này — theo đúng pipeline nền trắng → xóa nền ở `dev-schedule.md` Phụ lục A.

### Idle (Đứng yên) — hướng trước

**Nam:**
```
2D pixel art, 32x32 character sprite sheet, young ninja student, short spiky black hair with a subtle glossy sheen, headband with a metal plate, dark navy blue gi training uniform with a simple red accent trim on the collar, simple white belt, clean cel-shading with soft highlights and shadows, sharp expressive eyes, determined young male face with a warm cheerful smile, bright happy eyes, friendly and approachable expression, front-facing idle breathing cycle, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: standing in a relaxed neutral pose, arms hanging loosely at sides — frame 2: beginning to inhale, chest rising slightly, shoulders lifting a little — frame 3: at the peak of inhaling, chest raised noticeably, holding breath — frame 4: beginning to exhale, shoulders starting to lower — frame 5: back to a relaxed neutral pose, weight shifted slightly onto one leg — frame 6: continuing to exhale, chest lowering further — frame 7: at the lowest point of exhaling, body fully relaxed — frame 8: beginning to inhale again, smoothly transitioning back toward the neutral pose, character must face forward in every single frame, do not rotate to side or back view in any frame, beginner ninja RPG protagonist
```
**Nữ:**
```
2D pixel art, 32x32 character sprite sheet, young ninja student, long silver-white hair tied back under headband with a few loose strands framing the face, headband with a metal plate, dark navy blue gi training uniform with a simple red accent trim on the collar, simple white belt, clean cel-shading with soft highlights and shadows, sharp expressive eyes, determined young female face with a warm cheerful smile, bright happy eyes, friendly and approachable expression, front-facing idle breathing cycle, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: standing in a relaxed neutral pose, arms hanging loosely at sides — frame 2: beginning to inhale, chest rising slightly, shoulders lifting a little — frame 3: at the peak of inhaling, chest raised noticeably, holding breath — frame 4: beginning to exhale, shoulders starting to lower — frame 5: back to a relaxed neutral pose, weight shifted slightly onto one leg — frame 6: continuing to exhale, chest lowering further — frame 7: at the lowest point of exhaling, body fully relaxed — frame 8: beginning to inhale again, smoothly transitioning back toward the neutral pose, character must face forward in every single frame, do not rotate to side or back view in any frame, beginner ninja RPG protagonist
```

### Walk Cycle — Hướng Trước

**Nam:**
```
2D pixel art, 32x32 character sprite sheet, young ninja walking, short spiky black hair with a subtle glossy sheen, headband with a metal plate, dark navy blue training gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp expressive eyes, energetic marching-style walk with pronounced arm swing opposite the legs like a soldier marching in place, arms clearly swinging away from the body silhouette, not tucked close to the torso, front-facing walk cycle, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: left knee bent and lifted with the left foot raised slightly off the ground moving forward, right leg planted straight supporting the body, right fist swung clearly forward and visibly outside the body outline at hip level, left fist swung clearly backward and visibly outside the body outline behind the hip, contact pose, body viewed straight-on with shoulders and hips squared to the camera — frame 2: left foot lowering back toward the ground, weight settling, body at its lowest point, right fist moving back down past the hip toward the side of the body, left fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 3: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, still viewed straight-on with shoulders and hips squared to the camera — frame 4: right knee beginning to bend and lift, left leg planted and straight, body rising, left fist swinging forward past the side of the body, right fist swinging backward past the side of the body, both visibly offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 5: right knee bent and lifted with the right foot raised slightly off the ground moving forward, left leg planted straight supporting the body, left fist swung clearly forward and visibly outside the body outline at hip level, right fist swung clearly backward and visibly outside the body outline behind the hip, contact pose mirrored from frame 1, still viewed straight-on with shoulders and hips squared to the camera — frame 6: right foot lowering back toward the ground, weight settling, body at its lowest point, left fist moving back down past the hip toward the side of the body, right fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, mirrored from frame 2, still viewed straight-on with shoulders and hips squared to the camera — frame 7: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, mirrored from frame 3, still viewed straight-on with shoulders and hips squared to the camera — frame 8: left knee beginning to bend and lift, right leg planted and straight, body rising, right fist swinging forward past the side of the body, left fist swinging backward past the side of the body, both visibly offset from the torso outline, mirrored from frame 4, still viewed straight-on with shoulders and hips squared to the camera, both arms must visibly swing away from the body outline in every frame like a marching soldier, arm swing amplitude reaching about to hip level, not a punch or wide reach, character's shoulders and hips must stay squared to the camera in every single frame, the character must NOT be drawn from a side angle or 3/4 turned view in any frame, only the legs and arms move while the torso and head keep facing the camera directly, all 8 stride heights must match exactly between mirrored frames
```
**Nữ:**
```
2D pixel art, 32x32 character sprite sheet, young ninja walking, long silver-white hair tied back under headband with a few loose strands framing the face, headband with a metal plate, dark navy blue training gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp expressive eyes, energetic marching-style walk with pronounced arm swing opposite the legs like a soldier marching in place, arms clearly swinging away from the body silhouette, not tucked close to the torso, front-facing walk cycle, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: left knee bent and lifted with the left foot raised slightly off the ground moving forward, right leg planted straight supporting the body, right fist swung clearly forward and visibly outside the body outline at hip level, left fist swung clearly backward and visibly outside the body outline behind the hip, contact pose, body viewed straight-on with shoulders and hips squared to the camera — frame 2: left foot lowering back toward the ground, weight settling, body at its lowest point, right fist moving back down past the hip toward the side of the body, left fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 3: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, still viewed straight-on with shoulders and hips squared to the camera — frame 4: right knee beginning to bend and lift, left leg planted and straight, body rising, left fist swinging forward past the side of the body, right fist swinging backward past the side of the body, both visibly offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 5: right knee bent and lifted with the right foot raised slightly off the ground moving forward, left leg planted straight supporting the body, left fist swung clearly forward and visibly outside the body outline at hip level, right fist swung clearly backward and visibly outside the body outline behind the hip, contact pose mirrored from frame 1, still viewed straight-on with shoulders and hips squared to the camera — frame 6: right foot lowering back toward the ground, weight settling, body at its lowest point, left fist moving back down past the hip toward the side of the body, right fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, mirrored from frame 2, still viewed straight-on with shoulders and hips squared to the camera — frame 7: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, mirrored from frame 3, still viewed straight-on with shoulders and hips squared to the camera — frame 8: left knee beginning to bend and lift, right leg planted and straight, body rising, right fist swinging forward past the side of the body, left fist swinging backward past the side of the body, both visibly offset from the torso outline, mirrored from frame 4, still viewed straight-on with shoulders and hips squared to the camera, both arms must visibly swing away from the body outline in every frame like a marching soldier, arm swing amplitude reaching about to hip level, not a punch or wide reach, character's shoulders and hips must stay squared to the camera in every single frame, the character must NOT be drawn from a side angle or 3/4 turned view in any frame, only the legs and arms move while the torso and head keep facing the camera directly, all 8 stride heights must match exactly between mirrored frames
```

### Walk Cycle — Hướng Sau

**Nam:**
```
2D pixel art, 32x32 character sprite sheet, young ninja walking, short spiky black hair with a subtle glossy sheen, headband with a metal plate, dark navy blue training gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp expressive eyes, energetic marching-style walk with pronounced arm swing opposite the legs like a soldier marching in place, arms clearly swinging away from the body silhouette, not tucked close to the torso, back-facing walk cycle viewed from behind, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: left knee bent and lifted with the left foot raised slightly off the ground moving forward, right leg planted straight supporting the body, right fist swung clearly forward and visibly outside the body outline at hip level, left fist swung clearly backward and visibly outside the body outline behind the hip, contact pose, body viewed straight-on with shoulders and hips squared to the camera — frame 2: left foot lowering back toward the ground, weight settling, body at its lowest point, right fist moving back down past the hip toward the side of the body, left fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 3: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, still viewed straight-on with shoulders and hips squared to the camera — frame 4: right knee beginning to bend and lift, left leg planted and straight, body rising, left fist swinging forward past the side of the body, right fist swinging backward past the side of the body, both visibly offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 5: right knee bent and lifted with the right foot raised slightly off the ground moving forward, left leg planted straight supporting the body, left fist swung clearly forward and visibly outside the body outline at hip level, right fist swung clearly backward and visibly outside the body outline behind the hip, contact pose mirrored from frame 1, still viewed straight-on with shoulders and hips squared to the camera — frame 6: right foot lowering back toward the ground, weight settling, body at its lowest point, left fist moving back down past the hip toward the side of the body, right fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, mirrored from frame 2, still viewed straight-on with shoulders and hips squared to the camera — frame 7: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, mirrored from frame 3, still viewed straight-on with shoulders and hips squared to the camera — frame 8: left knee beginning to bend and lift, right leg planted and straight, body rising, right fist swinging forward past the side of the body, left fist swinging backward past the side of the body, both visibly offset from the torso outline, mirrored from frame 4, still viewed straight-on with shoulders and hips squared to the camera, both arms must visibly swing away from the body outline in every frame like a marching soldier, arm swing amplitude reaching about to hip level, not a punch or wide reach, character's shoulders and hips must stay squared away from the camera with the back fully visible in every single frame, the character must NOT be drawn from a side angle or 3/4 turned view in any frame, do not show the face in any frame, only the legs and arms move while the torso and head keep facing away from the camera directly, all 8 stride heights must match exactly between mirrored frames
```
**Nữ:**
```
2D pixel art, 32x32 character sprite sheet, young ninja walking, long silver-white hair tied back under headband with a few loose strands framing the face, headband with a metal plate, dark navy blue training gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp expressive eyes, energetic marching-style walk with pronounced arm swing opposite the legs like a soldier marching in place, arms clearly swinging away from the body silhouette, not tucked close to the torso, back-facing walk cycle viewed from behind, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: left knee bent and lifted with the left foot raised slightly off the ground moving forward, right leg planted straight supporting the body, right fist swung clearly forward and visibly outside the body outline at hip level, left fist swung clearly backward and visibly outside the body outline behind the hip, contact pose, body viewed straight-on with shoulders and hips squared to the camera — frame 2: left foot lowering back toward the ground, weight settling, body at its lowest point, right fist moving back down past the hip toward the side of the body, left fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 3: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, still viewed straight-on with shoulders and hips squared to the camera — frame 4: right knee beginning to bend and lift, left leg planted and straight, body rising, left fist swinging forward past the side of the body, right fist swinging backward past the side of the body, both visibly offset from the torso outline, still viewed straight-on with shoulders and hips squared to the camera — frame 5: right knee bent and lifted with the right foot raised slightly off the ground moving forward, left leg planted straight supporting the body, left fist swung clearly forward and visibly outside the body outline at hip level, right fist swung clearly backward and visibly outside the body outline behind the hip, contact pose mirrored from frame 1, still viewed straight-on with shoulders and hips squared to the camera — frame 6: right foot lowering back toward the ground, weight settling, body at its lowest point, left fist moving back down past the hip toward the side of the body, right fist moving forward down past the hip toward the side of the body, both still offset from the torso outline, mirrored from frame 2, still viewed straight-on with shoulders and hips squared to the camera — frame 7: both feet together directly beneath the body, body at its highest point, both fists at the sides of the body at the midpoint of their swing, mirrored from frame 3, still viewed straight-on with shoulders and hips squared to the camera — frame 8: left knee beginning to bend and lift, right leg planted and straight, body rising, right fist swinging forward past the side of the body, left fist swinging backward past the side of the body, both visibly offset from the torso outline, mirrored from frame 4, still viewed straight-on with shoulders and hips squared to the camera, both arms must visibly swing away from the body outline in every frame like a marching soldier, arm swing amplitude reaching about to hip level, not a punch or wide reach, character's shoulders and hips must stay squared away from the camera with the back fully visible in every single frame, the character must NOT be drawn from a side angle or 3/4 turned view in any frame, do not show the face in any frame, only the legs and arms move while the torso and head keep facing away from the camera directly, all 8 stride heights must match exactly between mirrored frames
```

### Walk Cycle — Hướng Nghiêng phải

*(Hướng trái dùng lại bộ này rồi lật ngang `flipX` trong code — không cần gen riêng)*

**Nam:**
```
2D pixel art, 32x32 character sprite sheet, young ninja walking, short spiky black hair with a subtle glossy sheen, headband with a metal plate, dark navy blue training gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp expressive eyes, right-facing side profile walk cycle, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: front leg extended forward touching the ground, back leg extended backward, back arm swung forward, front arm swung back, contact pose — frame 2: body dropping slightly, front leg bent absorbing weight, recoil pose — frame 3: both legs crossing directly beneath the body, torso at its highest point, passing pose — frame 4: back leg swinging forward and upward, front leg planted and straight, torso rising — frame 5: legs swapped from frame 1, the leg that was back is now extended forward touching the ground and the leg that was front is now extended backward, arms swapped accordingly, contact pose mirrored from frame 1 with exact same stride length — frame 6: body dropping slightly, mirrored from frame 2, recoil pose — frame 7: both legs crossing beneath the body, torso at highest point, mirrored from frame 3, passing pose — frame 8: legs swinging forward and upward, mirrored from frame 4, character must keep the exact same right-facing side profile angle in every single frame, do not rotate to face forward or backward in any frame, all 8 stride lengths must match exactly between mirrored frames
```
**Nữ:**
```
2D pixel art, 32x32 character sprite sheet, young ninja walking, long silver-white hair tied back under headband with a few loose strands framing the face, headband with a metal plate, dark navy blue training gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp expressive eyes, right-facing side profile walk cycle, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: front leg extended forward touching the ground, back leg extended backward, back arm swung forward, front arm swung back, contact pose — frame 2: body dropping slightly, front leg bent absorbing weight, recoil pose — frame 3: both legs crossing directly beneath the body, torso at its highest point, passing pose — frame 4: back leg swinging forward and upward, front leg planted and straight, torso rising — frame 5: legs swapped from frame 1, the leg that was back is now extended forward touching the ground and the leg that was front is now extended backward, arms swapped accordingly, contact pose mirrored from frame 1 with exact same stride length — frame 6: body dropping slightly, mirrored from frame 2, recoil pose — frame 7: both legs crossing beneath the body, torso at highest point, mirrored from frame 3, passing pose — frame 8: legs swinging forward and upward, mirrored from frame 4, character must keep the exact same right-facing side profile angle in every single frame, do not rotate to face forward or backward in any frame, all 8 stride lengths must match exactly between mirrored frames
```

### Attack Pose — hướng trước

**Nam:**
```
2D pixel art, 32x32 character sprite sheet, young ninja in basic attack stance, short spiky black hair with a subtle glossy sheen, headband with a metal plate, dark navy blue gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp determined eyes, front-facing attack swing, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: ready combat stance, weapon or fist held up in guard position, not yet moving — frame 2: beginning the wind-up, arm pulling backward — frame 3: at the peak of the wind-up, arm fully drawn back, weight shifted backward — frame 4: beginning the forward swing, arm starting to move forward — frame 5: at the point of impact, arm fully extended forward at the strike point — frame 6: following through, arm continuing to move past the strike point — frame 7: beginning to recover, body stabilizing back to center — frame 8: returning to the ready combat stance similar to frame 1, character facing forward throughout the swing in every single frame, energetic action pose, combat ready
```
**Nữ:**
```
2D pixel art, 32x32 character sprite sheet, young ninja in basic attack stance, long silver-white hair tied back under headband with a few loose strands framing the face, headband with a metal plate, dark navy blue gi with a simple red accent trim on the collar, clean cel-shading with soft highlights and shadows, sharp determined eyes, front-facing attack swing, 8 frames arranged in a single horizontal row from left to right, evenly spaced, identical character scale and vertical position in every frame, solid plain white background filling the entire image with no transparency and no checkered pattern, frame 1: ready combat stance, weapon or fist held up in guard position, not yet moving — frame 2: beginning the wind-up, arm pulling backward — frame 3: at the peak of the wind-up, arm fully drawn back, weight shifted backward — frame 4: beginning the forward swing, arm starting to move forward — frame 5: at the point of impact, arm fully extended forward at the strike point — frame 6: following through, arm continuing to move past the strike point — frame 7: beginning to recover, body stabilizing back to center — frame 8: returning to the ready combat stance similar to frame 1, character facing forward throughout the swing in every single frame, energetic action pose, combat ready
```

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
