"""Ghép sprite Vegeta từ 3 mảnh rời (đầu/thân/chân, do user cung cấp) trong
public/assets/sprites/player/vegeta/raw/ thành 5 file *_strip.png (idle_front/walk_front/walk_back/
walk_side/attack) đúng convention PreloadScene.ts đang dùng cho men/women.

Không có metadata toạ độ/pivot gốc cho biết phần nào khớp phần nào — mọi offset (`oh`/`ol`/`*_dx` trong
ACTIONS bên dưới) đều CĂN CHỈNH BẰNG MẮT, đã verify qua Puppeteer (đứng/đi/tấn công trong game thật không hở
hình). Sửa lại giá trị trong ACTIONS + chạy lại nếu cần chỉnh hoặc thêm frame mới từ raw/.

Cách chạy: python scripts/build-vegeta-sprites.py (từ thư mục gốc dự án, cần `pip install pillow`).
"""

from PIL import Image
import os

RAW = "public/assets/sprites/player/vegeta/raw"
OUT = "public/assets/sprites/player/vegeta"


def load(name):
    return Image.open(os.path.join(RAW, name + ".png")).convert("RGBA")


def compose(head_n, chest_n, legs_n, oh, ol, head_dx=0, chest_dx=0, legs_dx=0):
    """Chồng đầu lên thân lên chân, canh giữa theo trục X (+ dx tuỳ chỉnh riêng từng phần nếu pose lệch
    tâm), lấn (overlap) oh px giữa đầu-thân và ol px giữa thân-chân."""
    head, chest, legs = load(head_n), load(chest_n), load(legs_n)
    canvas_w = max(head.width, chest.width, legs.width) + 40
    canvas_h = head.height + chest.height + legs.height - oh - ol
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    cx = canvas_w // 2
    y = 0
    canvas.alpha_composite(head, (cx - head.width // 2 + head_dx, y))
    y += head.height - oh
    canvas.alpha_composite(chest, (cx - chest.width // 2 + chest_dx, y))
    y += chest.height - ol
    canvas.alpha_composite(legs, (cx - legs.width // 2 + legs_dx, y))
    return canvas


# (head, chest, legs, overlap_head_chest, overlap_chest_legs, head_dx, chest_dx, legs_dx)
ACTIONS = {
    "idle_front": [
        ("6027", "6035", "6044", 18, 14, 0, 0, 0),
        ("6027", "6036", "6044", 18, 14, 0, 0, 0),
    ],
    "walk_front": [
        ("6027", "6035", "6044", 18, 14, 0, 0, 0),
        ("6027", "6035", "6045", 18, 5, 0, 0, 0),
    ],
    "walk_back": [
        ("6028", "6041", "6051", 16, 12, 0, 0, 0),
        ("6028", "6041", "6045", 16, 6, 0, 0, 0),
    ],
    "walk_side": [
        ("6027", "6031", "6044", 20, 6, 0, -4, 0),
        ("6027", "6033", "6045", 22, 6, 0, -4, 0),
    ],
    "attack": [
        ("6028", "6043", "6044", 14, 14, 0, 0, 0),
        ("6028", "6039", "6045", 16, 10, 0, 0, 0),
        ("6028", "6036", "6044", 18, 14, 0, 0, 0),
    ],
}

os.makedirs(OUT, exist_ok=True)

# Player.ts chỉ tính 1 body-offset/shadow-offset DUY NHẤT cho cả nhân vật (FRAME_SIZES[gender], không phải
# theo từng action như men/women vốn đã gần đều nhau) — phải dùng CHUNG 1 kích thước cell cho mọi action, nếu
# không nhân vật sẽ "nhảy" vị trí/bóng đổ mỗi lần đổi animation vì kích thước ảnh thật đổi khác nhau nhiều.
all_composites = {action: [compose(*f) for f in frames] for action, frames in ACTIONS.items()}
frame_w = max(c.width for cs in all_composites.values() for c in cs)
frame_h = max(c.height for cs in all_composites.values() for c in cs)
print("uniform cell size:", frame_w, frame_h)

for action, composites in all_composites.items():
    strip = Image.new("RGBA", (frame_w * len(composites), frame_h), (0, 0, 0, 0))
    for i, c in enumerate(composites):
        # Căn giữa theo X, đáy (chân) chạm cạnh dưới cell — giữ baseline chân đồng nhất giữa các frame/action.
        x = i * frame_w + (frame_w - c.width) // 2
        y = frame_h - c.height
        strip.alpha_composite(c, (x, y))
    strip.save(os.path.join(OUT, f"{action}_strip.png"))
    print(action, "frames:", len(composites))
