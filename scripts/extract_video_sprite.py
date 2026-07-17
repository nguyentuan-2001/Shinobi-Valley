"""Tách frame từ video AI-gen (nền ĐEN hoặc TRẮNG thuần, có thể có watermark ở góc) thành sprite sheet
trong suốt — đúc lại quy trình đã làm TAY cho Cáo Lửa (`fox_walk_frames`), Trưởng Làng
(`village_chief_idle_frames`) và Thợ Rèn thành 1 script dùng lại được cho mọi video sau này.

CHỈ CẦN 1 LỆNH + TÊN FILE — mặc định TỰ CHỌN frame luôn, không cần xem contact sheet/tự đánh số tay:

  python scripts/extract_video_sprite.py "path/to/video.mp4"

Tự làm hết: tách frame mẫu → tự nhận diện màu NỀN đen hay trắng (`detect_bg_mode()`, lấy mẫu 4 góc — bug
thật gặp phải: video Thợ Rèn nền TRẮNG khác 2 video trước nền đen, không tự nhận diện sẽ xoá NGƯỢC, giữ nền
xoá mất áo/giày tối màu nhân vật) → LOẠI frame lệch hẳn khỏi phần đông (bbox kích thước/vị trí khác trung vị
quá 30% — video AI-gen có thể đổi hướng/pose giữa chừng, ví dụ video Cáo Lửa 2 frame đầu quay đầu ngược
hướng các frame sau, máy tự phát hiện được nhờ bbox lệch hẳn) → lấy đều 6 frame còn lại trải theo thời gian
→ crop theo 1 khung CHUNG (union bounding box, không bị "nhảy" vị trí lúc ghép animation) → xoá nền thành
trong suốt (soft chroma-key theo khoảng cách tới màu nền, fade mềm ở biên) → chuẩn hoá CELL×CELL → lưu từng
frame + 1 dải ngang `<action>_strip.png` (đúng convention `scripts/build-vegeta-sprites.py` dùng cho sprite
player). Tên action/thư mục lưu mặc định tự lấy theo tên file video nếu không truyền `--action`/`--out`. Luôn lưu
kèm `contact_sheet.png` đánh số + viền xanh quanh frame đã chọn để tự kiểm tra lại kết quả tự động có ổn
không (không phải "hộp đen") — thấy chọn sai thì chạy lại với `--frames` để tự chỉ tay (xem dưới).

Không cần cài gì trước, script tự lo:
  - Thiếu `Pillow`/`numpy` (Python) → tự `pip install` ngay khi chạy (numpy không bắt buộc, thất bại vẫn
    chạy được, chỉ chậm hơn — dùng fallback loop pixel PIL thuần).
  - Thiếu `ffmpeg`/`ffprobe` (Windows) → tự cài qua `winget install --id Gyan.FFmpeg -e`, rồi tự dò đường
    dẫn thật trong thư mục WinGet Packages dưới `%LOCALAPPDATA%` để dùng ngay trong process hiện tại
    (không cần mở terminal mới, xem `_ensure_ffmpeg()`). macOS/Linux: tự báo lệnh cài (brew/apt) rồi dừng,
    không tự chạy vì cần quyền root/mật khẩu.

Tuỳ chọn thêm khi cần:

  # Đặt tên action/thư mục lưu rõ ràng hơn tên tự suy ra từ file video
  python scripts/extract_video_sprite.py "video.mp4" --action walk_side --out public/images/Monsters/fox

  # Chỉ xem contact sheet, KHÔNG build gì (tự chọn tay từ đầu)
  python scripts/extract_video_sprite.py "video.mp4" --preview-only

  # Tự chỉ tay đúng frame muốn dùng (theo số trên contact sheet) — TẮT hẳn chế độ tự chọn
  python scripts/extract_video_sprite.py "video.mp4" --frames 3,7,11,15,19 --action walk_side

  # Ép màu nền cụ thể nếu tự nhận diện sai (ví dụ nền gần xám, không rõ hẳn đen/trắng)
  python scripts/extract_video_sprite.py "video.mp4" --bg white

Mặc định giả định video nền ĐEN THUẦN (đúng kiểu video AI-gen đã dùng cho 2 lần trước) và có thể có
watermark/sparkle ở góc phải — cột bên phải chiếm `--watermark-ratio` (mặc định 0.22 = 22%) chiều rộng bị
loại khỏi vùng tính bounding-box, tránh dính watermark vào khung crop (bug thật gặp lúc làm tay: sparkle góc
phải làm bbox tính sai lệch hẳn sang phải ở 1-2 frame). Nếu video KHÔNG có watermark, đặt `--watermark-ratio 0`.
"""

import argparse
import glob
import os
import platform
import re
import shutil
import statistics
import subprocess
import sys
import unicodedata

# Console Windows mặc định dùng codepage cp1252 (không encode được tiếng Việt có dấu) — ép stdout/stderr
# sang UTF-8 ngay từ đầu, không thì mọi print() có dấu ném UnicodeEncodeError giữa chừng (bug thật gặp lúc
# test script này lần đầu).
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


def _pip_install(pip_name):
    print(f"Thiếu thư viện Python '{pip_name}' — tự cài qua pip...")
    subprocess.run([sys.executable, "-m", "pip", "install", pip_name], check=True)


# Pillow bắt buộc phải có — tự cài nếu thiếu rồi import lại, không bắt người dùng tự `pip install` tay.
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    _pip_install("Pillow")
    from PIL import Image, ImageDraw, ImageFont

# numpy không bắt buộc (có fallback loop pixel thuần PIL ở `soft_chroma_key()`) nhưng nhanh hơn nhiều —
# vẫn thử tự cài, nếu lỗi (không có mạng, không có compiler cho bản wheel lạ...) thì chấp nhận chạy chậm.
try:
    import numpy as np
except ImportError:
    try:
        _pip_install("numpy")
        import numpy as np
    except Exception as exc:
        print(f"Cài numpy thất bại ({exc}) — vẫn chạy được nhưng xử lý màu chậm hơn (fallback pixel PIL thuần).")
        np = None

BBOX_THRESHOLD = 25
FADE_LO, FADE_HI = 6, 30
DEFAULT_CELL = 150
DEFAULT_WATERMARK_RATIO = 0.22
CONTACT_COLS = 5
CONTACT_THUMB_W, CONTACT_THUMB_H = 213, 120


def ffmpeg_bin():
    return os.environ.get("FFMPEG_PATH", "ffmpeg")


def ffprobe_bin():
    return os.environ.get("FFPROBE_PATH", "ffprobe")


def _find_winget_ffmpeg_dir():
    """Dò thư mục `bin/` thật của ffmpeg cài qua winget — winget cập nhật PATH cho session TERMINAL MỚI,
    nhưng process Python đang chạy (hoặc mở từ trước lúc cài) không tự thấy ngay, phải tự dò đường dẫn
    (bug thật gặp lúc cài lần đầu: `winget install` chạy xong nhưng gọi `ffmpeg` vẫn báo not found)."""
    base = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages")
    matches = glob.glob(os.path.join(base, "Gyan.FFmpeg_*", "ffmpeg-*-full_build", "bin"))
    return matches[0] if matches else None


def _ensure_ffmpeg():
    """Kiểm tra ffmpeg/ffprobe có dùng được không — thiếu thì tự cài qua winget (Windows) rồi tự dò lại
    đường dẫn thật để set FFMPEG_PATH/FFPROBE_PATH cho ngay process hiện tại (không cần mở terminal mới)."""
    if shutil.which(ffmpeg_bin()) and shutil.which(ffprobe_bin()):
        return

    if platform.system() != "Windows":
        print(
            "Không tìm thấy ffmpeg/ffprobe trong PATH — cài bằng package manager của hệ điều hành rồi chạy "
            "lại (macOS: `brew install ffmpeg` | Linux: `sudo apt install ffmpeg` hoặc tương đương)."
        )
        sys.exit(1)

    if not shutil.which("winget"):
        print(
            "Không tìm thấy ffmpeg/ffprobe và không có winget để tự cài — cài tay từ "
            "https://www.gyan.dev/ffmpeg/builds/ rồi set biến môi trường FFMPEG_PATH/FFPROBE_PATH."
        )
        sys.exit(1)

    print("Không tìm thấy ffmpeg/ffprobe — tự cài qua winget (Gyan.FFmpeg)...")
    # KHÔNG `check=True` — winget trả mã lỗi khác 0 cả khi package ĐÃ CÀI SẴN ("No available upgrade
    # found"), không phải lỗi thật (bug thật gặp lúc test: package cài rồi vẫn ném CalledProcessError).
    # Tiêu chí thành công thật là "có dò được đường dẫn ffmpeg sau đó không", kiểm ở bước tiếp theo.
    subprocess.run(
        [
            "winget", "install", "--id", "Gyan.FFmpeg", "-e",
            "--accept-package-agreements", "--accept-source-agreements",
        ]
    )

    bin_dir = _find_winget_ffmpeg_dir()
    if not bin_dir:
        print(
            "Đã cài ffmpeg qua winget nhưng không tự dò được đường dẫn — mở terminal MỚI rồi chạy lại "
            "(PATH cần nạp lại sau khi cài xong)."
        )
        sys.exit(1)

    os.environ["FFMPEG_PATH"] = os.path.join(bin_dir, "ffmpeg.exe")
    os.environ["FFPROBE_PATH"] = os.path.join(bin_dir, "ffprobe.exe")
    print(f"Đã cài xong ffmpeg — dùng: {bin_dir}")


def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Lệnh thất bại: {' '.join(cmd)}\n{result.stderr}")
    return result.stdout


def extract_frames(video_path, out_dir, fps):
    """Tách frame từ video theo `fps` (frame/giây) vào `out_dir`, trả về danh sách đường dẫn đã sắp xếp."""
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        if f.startswith("frame_") and f.endswith(".png"):
            os.remove(os.path.join(out_dir, f))
    run([ffmpeg_bin(), "-y", "-i", video_path, "-vf", f"fps={fps}", os.path.join(out_dir, "frame_%03d.png")])
    files = sorted(f for f in os.listdir(out_dir) if f.startswith("frame_") and f.endswith(".png"))
    return [os.path.join(out_dir, f) for f in files]


def build_contact_sheet(frame_paths, out_path, cols=CONTACT_COLS, highlight=None):
    """Ghép toàn bộ frame thành 1 lưới ảnh, mỗi ô đánh số thứ tự (1-based, khớp thứ tự file) để dùng làm
    tham số `--frames` ở bước build — không cần mở từng file riêng để biết số. `highlight` (nếu có) là tập
    số frame đã được TỰ CHỌN (chế độ auto) — viền xanh quanh ô đó để tự kiểm tra lại máy chọn có ổn không."""
    highlight = set(highlight or [])
    rows = (len(frame_paths) + cols - 1) // cols
    sheet = Image.new("RGB", (CONTACT_THUMB_W * cols, CONTACT_THUMB_H * rows), (40, 40, 40))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 22)
    except OSError:
        font = ImageFont.load_default()
    for i, path in enumerate(frame_paths):
        thumb = Image.open(path).convert("RGB").resize((CONTACT_THUMB_W, CONTACT_THUMB_H))
        x = (i % cols) * CONTACT_THUMB_W
        y = (i // cols) * CONTACT_THUMB_H
        sheet.paste(thumb, (x, y))
        if (i + 1) in highlight:
            draw.rectangle([x, y, x + CONTACT_THUMB_W - 1, y + CONTACT_THUMB_H - 1], outline=(50, 220, 50), width=4)
        label = str(i + 1)
        draw.rectangle([x + 2, y + 2, x + 26, y + 26], fill=(0, 0, 0))
        draw.text((x + 6, y + 4), label, fill=(255, 255, 0), font=font)
    sheet.save(out_path)
    return out_path


def detect_bg_mode(im_rgb):
    """Đoán màu nền video là ĐEN hay TRẮNG bằng cách lấy mẫu 4 góc (né đúng góc hay có watermark) — quyết
    định chiều chroma-key/bbox đúng. Bug thật gặp phải: video AI-gen thứ 3 (Thợ Rèn) nền TRẮNG, không phải
    đen như 2 video trước — code cũ chỉ hiểu nền đen nên xoá NGƯỢC (giữ nền trắng, xoá mất áo/giày tối màu
    của nhân vật). Mặc định trả `black` nếu không rõ hẳn (giữ đúng hành vi cũ khi không chắc)."""
    w, h = im_rgb.size
    corners = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]
    avg = sum(sum(im_rgb.getpixel(c)) for c in corners) / (len(corners) * 3)
    return "white" if avg > 200 else "black"


def compute_bbox(im_rgb, watermark_ratio, bg_mode="black", threshold=BBOX_THRESHOLD):
    """Bounding box vùng KHÁC màu nền trong `im_rgb` (nền đen thì tìm vùng sáng, nền trắng thì tìm vùng tối
    — xem `bg_mode`/`detect_bg_mode()`), loại trừ cột bên phải (watermark) theo `watermark_ratio`. Trả
    `None` nếu không tìm thấy gì (frame toàn nền — video lỗi hoặc fps tách quá thưa)."""
    w = im_rgb.width
    check_w = int(w * (1 - watermark_ratio)) if watermark_ratio > 0 else w
    region = im_rgb.crop((0, 0, check_w, im_rgb.height))
    gray = region.convert("L")
    if bg_mode == "white":
        return gray.point(lambda p: 255 if p < 255 - threshold else 0).getbbox()
    return gray.point(lambda p: 255 if p > threshold else 0).getbbox()


def union_box(boxes, frame_size, pad=15):
    boxes = [b for b in boxes if b is not None]
    if not boxes:
        raise ValueError("Không có frame nào có nội dung — kiểm tra lại --watermark-ratio hoặc video nguồn.")
    w, h = frame_size
    return (
        max(0, min(b[0] for b in boxes) - pad),
        max(0, min(b[1] for b in boxes) - pad),
        min(w, max(b[2] for b in boxes) + pad),
        min(h, max(b[3] for b in boxes) + pad),
    )


def soft_chroma_key(rgba_image, bg_mode="black", fade_lo=FADE_LO, fade_hi=FADE_HI):
    """Nền (đen HOẶC trắng, theo `bg_mode` — xem `detect_bg_mode()`) -> trong suốt, có fade mềm giữa
    `fade_lo`/`fade_hi` (theo "khoảng cách tới màu nền" mỗi pixel: nền đen dùng max(R,G,B), nền trắng dùng
    255-min(R,G,B)) để biên đỡ răng cưa/viền cứng — dùng numpy nếu có (nhanh hơn nhiều), fallback loop pixel
    thuần PIL nếu không."""
    if np is not None:
        arr = np.array(rgba_image, dtype=np.float32)
        if bg_mode == "white":
            distance = 255 - arr[:, :, :3].min(axis=2)
        else:
            distance = arr[:, :, :3].max(axis=2)
        alpha = np.clip((distance - fade_lo) / (fade_hi - fade_lo), 0, 1) * 255
        arr[:, :, 3] = alpha
        return Image.fromarray(arr.astype("uint8"), "RGBA")

    px = rgba_image.load()
    w, h = rgba_image.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            d = (255 - min(r, g, b)) if bg_mode == "white" else max(r, g, b)
            if d <= fade_lo:
                alpha = 0
            elif d >= fade_hi:
                alpha = 255
            else:
                alpha = int(255 * (d - fade_lo) / (fade_hi - fade_lo))
            px[x, y] = (r, g, b, alpha)
    return rgba_image


def _slugify(text):
    """Tên file bất kỳ (có dấu tiếng Việt, khoảng trắng...) -> chuỗi an toàn cho tên action/thư mục —
    dùng làm mặc định cho `--action`/`--out` khi không truyền, đỡ phải tự nghĩ tên."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-zA-Z0-9]+", "_", text).strip("_").lower()
    return text or "video"


def process_frames(images_rgb, out_dir, action, cell, watermark_ratio, fade_lo, fade_hi, bg_mode=None):
    """Phần xử lý ảnh dùng chung cho cả chế độ tự chọn (auto) và tự chỉ tay (`--frames`) — crop theo union
    bbox CHUNG, xoá nền, chuẩn hoá CELL×CELL, lưu frame rời + 1 dải `<action>_strip.png` vào `out_dir`.
    `bg_mode` (`"black"`/`"white"`) — tự nhận diện từ frame đầu (`detect_bg_mode()`) nếu để `None`, xem bug
    thật gặp phải ở video Thợ Rèn (nền trắng, không phải đen như 2 video trước) trong docstring hàm đó."""
    if bg_mode is None:
        bg_mode = detect_bg_mode(images_rgb[0])
        print(f"Tự nhận diện màu nền: {bg_mode}")

    boxes = [compute_bbox(im, watermark_ratio, bg_mode) for im in images_rgb]
    box = union_box(boxes, images_rgb[0].size)
    print(f"union crop box: {box}")

    os.makedirs(out_dir, exist_ok=True)
    frames_out = []
    for i, im in enumerate(images_rgb):
        cropped = im.crop(box).convert("RGBA")
        keyed = soft_chroma_key(cropped, bg_mode, fade_lo, fade_hi)
        w, h = keyed.size
        ratio = min(cell / w, cell / h)
        resized = keyed.resize((max(1, int(w * ratio)), max(1, int(h * ratio))), Image.LANCZOS)
        canvas = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
        # Căn giữa theo X, đáy chạm cạnh dưới cell — cùng quy ước với build-vegeta-sprites.py để ghép
        # nhiều action lại với nhau (nếu sau này cần) không bị lệch chân.
        canvas.paste(resized, ((cell - resized.width) // 2, cell - resized.height), resized)
        fname = f"{action}_{i + 1}.png"
        canvas.save(os.path.join(out_dir, fname))
        frames_out.append(canvas)
        print("saved", fname)

    strip = Image.new("RGBA", (cell * len(frames_out), cell), (0, 0, 0, 0))
    for i, c in enumerate(frames_out):
        strip.alpha_composite(c, (i * cell, 0))
    strip_path = os.path.join(out_dir, f"{action}_strip.png")
    strip.save(strip_path)
    print("saved strip:", strip_path, strip.size)


def build_frames(video_path, frame_indices, out_dir, action, fps, cell, watermark_ratio, fade_lo, fade_hi, bg_mode=None):
    """Chế độ TỰ CHỈ TAY — trích đúng các frame trong `frame_indices` (1-based, khớp số trên contact sheet
    tách CÙNG `fps` này) từ video rồi xử lý qua `process_frames()`."""
    tmp_dir = os.path.join(out_dir, "_tmp_frames")
    all_frames = extract_frames(video_path, tmp_dir, fps)

    chosen_paths = []
    for idx in frame_indices:
        if idx < 1 or idx > len(all_frames):
            raise ValueError(f"Frame #{idx} không tồn tại — video này chỉ tách được {len(all_frames)} frame ở fps={fps}.")
        chosen_paths.append(all_frames[idx - 1])

    # `.convert("RGB")` buộc PIL đọc hết dữ liệu ảnh vào RAM ngay (thay vì lazy-load) — an toàn để xoá
    # `tmp_dir` ngay sau đây mà không mất dữ liệu đang cần dùng tiếp.
    images_rgb = [Image.open(p).convert("RGB") for p in chosen_paths]
    shutil.rmtree(tmp_dir, ignore_errors=True)
    process_frames(images_rgb, out_dir, action, cell, watermark_ratio, fade_lo, fade_hi, bg_mode)


def auto_select_indices(boxes, count):
    """Chọn ra tối đa `count` frame (1-based, theo đúng thứ tự thời gian) từ `boxes` (bbox hoặc `None` mỗi
    frame) — loại các frame lệch hẳn khỏi phần đông bằng cách so kích thước+vị trí bbox với TRUNG VỊ của cả
    video (video AI-gen có thể đổi hướng/pose giữa chừng — bug thật gặp ở video Cáo Lửa: 2 frame đầu quay
    đầu ngược hướng các frame sau, bbox lệch hẳn sang phải, tự phát hiện được nhờ cách này), rồi lấy đều
    `count` frame trải khắp phần còn lại (giữ thứ tự thời gian, không random)."""
    valid = [(i, b) for i, b in enumerate(boxes) if b is not None]
    if not valid:
        raise ValueError("Không tách được frame nào có nội dung — kiểm tra lại --watermark-ratio hoặc video nguồn.")

    def metrics(b):
        return (b[2] - b[0], b[3] - b[1], (b[0] + b[2]) / 2, (b[1] + b[3]) / 2)

    ws, hs, cxs, cys = zip(*(metrics(b) for _, b in valid))
    med_w, med_h = statistics.median(ws), statistics.median(hs)
    med_cx, med_cy = statistics.median(cxs), statistics.median(cys)

    TOLERANCE = 0.3  # lệch quá 30% so với trung vị (kích thước HOẶC vị trí tâm) thì coi là outlier

    def is_consistent(b):
        w, h, cx, cy = metrics(b)
        return (
            abs(w - med_w) <= med_w * TOLERANCE
            and abs(h - med_h) <= med_h * TOLERANCE
            and abs(cx - med_cx) <= max(med_w, 1) * TOLERANCE
            and abs(cy - med_cy) <= max(med_h, 1) * TOLERANCE
        )

    good = [i for i, b in valid if is_consistent(b)]
    if len(good) < count:
        print(f"Cảnh báo: chỉ {len(good)}/{len(valid)} frame nhất quán (muốn {count}) — dùng luôn cả frame nghi ngờ.")
        good = [i for i, _ in valid]

    if len(good) <= count:
        chosen = good
    else:
        step = (len(good) - 1) / (count - 1) if count > 1 else 0
        positions, seen, chosen = [round(i * step) for i in range(count)], set(), []
        for pos in positions:
            idx = good[pos]
            if idx not in seen:
                seen.add(idx)
                chosen.append(idx)

    return [i + 1 for i in chosen]


def run_auto(video_path, out_dir, action, count, fps, cell, watermark_ratio, fade_lo, fade_hi, skip_start=0.5, bg_mode=None):
    """Chế độ TỰ CHỌN (mặc định) — tách frame mẫu, tự lọc + chọn `count` frame bằng `auto_select_indices()`,
    lưu contact sheet có đánh dấu frame đã chọn (để tự kiểm tra lại), rồi xử lý qua `process_frames()`.

    `skip_start` (giây, mặc định 0.5) — bỏ qua hẳn mấy frame đầu tiên khỏi vòng xét chọn: video AI-gen
    thường CHƯA ỔN ĐỊNH ngay từ khung đầu (bug thật gặp ở video Cáo Lửa — frame đầu quay đầu NGƯỢC hướng
    mọi frame sau, nhưng bbox lại tình cờ đủ giống trung vị nên `auto_select_indices()` không bắt được —
    hạn chế thật của cách lọc chỉ dựa vào kích thước/vị trí bbox, không biết được "hướng" nhân vật). Loại
    thẳng theo thời gian đơn giản hơn nhiều so với cố phát hiện lật hướng, và đúng với mọi video đã gặp.

    `bg_mode` (`"black"`/`"white"`) — tự nhận diện từ frame đầu tiên nếu để `None` (xem `detect_bg_mode()`)
    và dùng CHUNG cho cả bước lọc/chọn frame ở đây LẪN bước xoá nền ở `process_frames()` — bug thật gặp
    phải: nếu chỉ sửa phần xoá nền mà quên sửa bbox ở đây, video nền trắng vẫn bị tính bbox sai (coi cả
    khung hình là "nội dung" vì nền trắng cũng sáng), làm bước tự lọc outlier mất hết tác dụng phân biệt."""
    tmp_dir = os.path.join(out_dir, "_tmp_frames")
    all_frame_paths = extract_frames(video_path, tmp_dir, fps)
    images_rgb = [Image.open(p).convert("RGB") for p in all_frame_paths]

    if bg_mode is None:
        bg_mode = detect_bg_mode(images_rgb[0])
        print(f"Tự nhận diện màu nền: {bg_mode}")

    boxes = [compute_bbox(im, watermark_ratio, bg_mode) for im in images_rgb]

    skip_count = round(skip_start * fps)
    eligible_boxes = [None if i < skip_count else b for i, b in enumerate(boxes)]

    indices = auto_select_indices(eligible_boxes, count)
    print(f"Tự chọn {len(indices)}/{len(all_frame_paths)} frame: {indices}")

    os.makedirs(out_dir, exist_ok=True)
    sheet_path = build_contact_sheet(all_frame_paths, os.path.join(out_dir, "contact_sheet.png"), highlight=indices)
    print(f"Contact sheet (viền xanh = frame đã chọn): {sheet_path}")

    chosen_images = [images_rgb[i - 1] for i in indices]
    shutil.rmtree(tmp_dir, ignore_errors=True)
    process_frames(chosen_images, out_dir, action, cell, watermark_ratio, fade_lo, fade_hi, bg_mode)


def _derive_action(video_path):
    return _slugify(os.path.splitext(os.path.basename(video_path))[0])


def _derive_out_dir(video_path, action):
    return os.path.join(os.path.dirname(os.path.abspath(video_path)), f"{action}_frames")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("video", help="Đường dẫn file video nguồn (.mp4) — CHỈ CẦN CÁI NÀY là chạy được")
    parser.add_argument("--action", default=None, help="Tên action, tiền tố file (mặc định: tự lấy theo tên file video)")
    parser.add_argument("--out", default=None, help="Thư mục lưu kết quả (mặc định: <tên_video>_frames/ cùng chỗ với video)")
    parser.add_argument("--count", type=int, default=6, help="Số frame muốn lấy cho animation ở chế độ tự chọn (mặc định 6)")
    parser.add_argument("--fps", type=float, default=6, help="Số frame tách mẫu mỗi giây trước khi lọc/chọn (mặc định 6)")
    parser.add_argument("--skip-start", type=float, default=0.5, help="Bỏ qua N giây đầu video khỏi vòng tự chọn — đoạn đầu video AI-gen thường chưa ổn định (mặc định 0.5, chỉ áp dụng chế độ tự chọn)")
    parser.add_argument("--frames", default=None, help="Tự chỉ tay đúng số frame muốn dùng (theo contact sheet, cách nhau bằng dấu phẩy) — có giá trị này thì TẮT hẳn chế độ tự chọn")
    parser.add_argument("--preview-only", action="store_true", help="Chỉ tách frame + ghép contact sheet đánh số, không build gì — dùng khi muốn tự chọn tay từ đầu")
    parser.add_argument("--cell", type=int, default=DEFAULT_CELL, help=f"Kích thước khung vuông mỗi frame (mặc định {DEFAULT_CELL})")
    parser.add_argument("--watermark-ratio", type=float, default=DEFAULT_WATERMARK_RATIO, help=f"Tỉ lệ cột bên phải loại khỏi tính bbox (mặc định {DEFAULT_WATERMARK_RATIO}, đặt 0 nếu video không có watermark)")
    parser.add_argument("--fade-lo", type=int, default=FADE_LO, help=f"Ngưỡng dưới fade trong suốt (mặc định {FADE_LO})")
    parser.add_argument("--fade-hi", type=int, default=FADE_HI, help=f"Ngưỡng trên fade trong suốt (mặc định {FADE_HI})")
    parser.add_argument("--bg", choices=["auto", "black", "white"], default="auto", help="Màu nền video (mặc định auto — tự nhận diện từ frame đầu, xem detect_bg_mode())")

    args = parser.parse_args()

    _ensure_ffmpeg()

    action = args.action or _derive_action(args.video)
    out_dir = args.out or _derive_out_dir(args.video, action)
    bg_mode = None if args.bg == "auto" else args.bg

    if args.preview_only:
        frames = extract_frames(args.video, out_dir, args.fps)
        sheet_path = build_contact_sheet(frames, os.path.join(out_dir, "contact_sheet.png"))
        print(f"\n{len(frames)} frame đã tách vào {out_dir}")
        print(f"Xem contact sheet tại: {sheet_path}")
        print("Ghi lại số frame muốn dùng, rồi chạy lại với --frames (ví dụ --frames 3,7,11,15,19).")
        return

    if args.frames:
        indices = [int(x.strip()) for x in args.frames.split(",")]
        build_frames(
            args.video, indices, out_dir, action, args.fps,
            args.cell, args.watermark_ratio, args.fade_lo, args.fade_hi, bg_mode
        )
    else:
        run_auto(
            args.video, out_dir, action, args.count, args.fps,
            args.cell, args.watermark_ratio, args.fade_lo, args.fade_hi, args.skip_start, bg_mode
        )

    print(f"\nXong — kết quả ở: {out_dir}")


if __name__ == "__main__":
    main()
