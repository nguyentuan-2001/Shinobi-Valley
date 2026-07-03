# Shinobi Valley — Quy tắc dự án

## Quy tắc Commit

Dùng chuẩn **Conventional Commits**, viết tiếng Việt phần mô tả.

```
<type>(<scope>): <mô tả ngắn gọn, thì hiện tại, không viết hoa đầu, không chấm cuối câu>

[phần thân — giải thích LÝ DO (why) nếu không hiển nhiên, không lặp lại "what" đã có trong diff]
```

### Type

| Type | Dùng khi |
|---|---|
| `feat` | Thêm tính năng gameplay mới (theo Sprint trong `docs/planning/dev-schedule.md`) |
| `fix` | Sửa lỗi hành vi/logic đã có |
| `data` | Thêm/sửa file JSON dữ liệu (`crops.json`, `items.json`, `monsters.json`...) |
| `asset` | Thêm, cắt, đổi tên, hoặc tổ chức lại tài nguyên hình ảnh/âm thanh trong `public/assets/` |
| `docs` | Cập nhật tài liệu thiết kế (`docs/`, `art-refs/`), không đổi code/asset |
| `refactor` | Tái cấu trúc code, không đổi hành vi quan sát được |
| `style` | Format/lint code, không đổi logic |
| `chore` | Việc lặt vặt: cấu hình, dependency, cấu trúc thư mục, `.gitignore`... |
| `test` | Thêm/sửa test |

### Scope (tùy chọn)

Ưu tiên dùng **tên hệ thống**: `player`, `farming`, `combat`, `inventory`, `npc`, `quest`, `crafting`, `save`, `ui`, `economy`.
Nếu commit gắn với 1 Sprint cụ thể trong `dev-schedule.md`, có thể dùng `sprint-N` làm scope thay thế.

### Ví dụ thực tế theo dự án này

```
feat(player): thêm di chuyển 4 hướng + camera follow

fix(farming): sửa công thức yield không nhân đúng % moisture

data(crops): thêm 14 cây Tier Cơ Bản/Trung Cấp/Cao Cấp vào crops.json

asset(crops): cắt 80 sprite 4 giai đoạn (seed/sprout/growing/harvest) cho 20 cây
từ public/images/Crops/{basic,intermediate,high}{,-1}.png

docs(dev-schedule): thêm lịch trình 24 sprint cho V1.0

chore: mở rộng allow-list permission cho lệnh python/pip/find
```

### Nguyên tắc chung

- 1 commit = 1 thay đổi logic hoàn chỉnh. Không gộp `feat` + `fix` không liên quan vào cùng 1 commit.
- Dòng đầu tiên ≤ 72 ký tự, không chấm cuối câu.
- Body giải thích **why**, không lặp lại **what** (diff đã nói rồi).
- Commit asset (ảnh/âm thanh) tách riêng khỏi commit code dùng asset đó, trừ khi asset quá nhỏ/gắn chặt với 1 tính năng.
- Không tự ý `git push` hay tạo commit trừ khi được yêu cầu rõ ràng — gõ lệnh `/save` (xem `.claude/commands/save.md`) tính là yêu cầu rõ ràng cho lần đó.
- **Trước khi commit code, luôn chạy `yarn format` (Prettier) để format trước.** Chỉ áp dụng cho code thật (`src/`, `index.html`, config) — `.prettierignore` đã loại `docs/`, `art-refs/`, `public/`, `*.md` ra khỏi phạm vi format. Nếu Prettier đổi file nào, add luôn phần đổi đó vào cùng commit code tương ứng (không tạo commit `style` riêng cho việc format tự động này, trừ khi format cả 1 lượt lớn không gắn với thay đổi nào khác).
