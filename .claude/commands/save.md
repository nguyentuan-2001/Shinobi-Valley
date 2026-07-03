---
description: Commit toàn bộ thay đổi hiện tại theo đúng quy tắc CLAUDE.md rồi push lên remote
---

Thực hiện theo đúng thứ tự sau. Gõ `/save` được tính là đồng ý rõ ràng cho việc commit + push trong lượt này — không cần hỏi lại xác nhận, trừ khi gặp lỗi hoặc rủi ro thật sự (file nhạy cảm, conflict khi push, hook chặn commit).

1. **Khảo sát trước khi động vào gì cả:** chạy song song `git status`, `git diff` (cả staged và unstaged), `git log --oneline -10`.
2. Nếu working tree sạch (không gì thay đổi, không gì chưa push) → báo cho người dùng và dừng, không tạo commit rỗng.
3. **Rà soát file nhạy cảm** trong danh sách thay đổi (`.env`, `*.key`, `*.pem`, credentials, token...). Nếu có: loại hẳn khỏi mọi thao tác add/commit ở các bước sau (dùng pathspec exclude khi add, ví dụ `git add -A -- . ':!.env'`; nếu lỡ đã nằm trong staging area thì `git restore --staged <file>`), và cảnh báo người dùng biết file nào đã bị loại và vì sao.
4. **Nhóm các file thay đổi còn lại thành các nhóm logic độc lập**, dựa theo đường dẫn + bản chất thay đổi — không phải tách theo từng file, cũng không gộp tất cả thành 1:
   - Mỗi thư mục con lớn trong `public/assets/sprites/<category>/` hoặc `public/assets/tilesets/<map>/` xuất hiện nhiều file mới → gộp thành **1 commit `asset(...)` cho cả category/map đó**, không tách theo từng sprite riêng lẻ.
   - Thay đổi trong `docs/` (kể cả `art-refs/`) → 1 commit `docs(...)` (có thể gộp chung nếu cùng 1 mạch việc, ví dụ vừa sửa `crops.md` vừa sửa `asset-manifest.md` cho cùng 1 thay đổi thì gộp 1 commit).
   - Thay đổi code gameplay (`src/`) → tách theo tính năng/Sprint, dùng `feat`/`fix`/`refactor` tương ứng.
   - Thay đổi cấu hình (`.claude/`, `package.json`, `.gitignore`, `CLAUDE.md`...) → 1 commit `chore(...)`.
   - Nếu 2 nhóm ở trên thực chất cùng phục vụ 1 việc duy nhất (ví dụ thêm tính năng mới kèm asset mới cho đúng tính năng đó) thì gộp lại, đừng tách máy móc.
   - Mục tiêu: ra một số lượng commit **vừa đủ để đọc log hiểu được đã làm gì** (thường vài commit, không phải một, cũng không phải hàng chục/hàng trăm).
5. Với mỗi nhóm, theo đúng thứ tự: `git add <đường dẫn thuộc nhóm đó>` → soạn commit message đúng quy tắc trong `CLAUDE.md` (Conventional Commits, mô tả tiếng Việt, `<type>(<scope>): <mô tả>`) → tạo commit bằng heredoc, luôn kết thúc message bằng dòng:
   `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`
6. **Nếu hook chặn 1 commit nào đó:** sửa lỗi được hook báo, `git add` lại đúng file vừa sửa, tạo commit **mới** (không `--amend`, không `--no-verify`) rồi tiếp tục các nhóm còn lại.
7. Sau khi tạo xong tất cả commit, kiểm tra branch hiện tại có upstream chưa (`git rev-parse --abbrev-ref --symbolic-full-name @{u}`). Chưa có → `git push -u origin <branch-hiện-tại>`; đã có → `git push`.
8. Nếu push thất bại do lịch sử phân kỳ (remote có commit mới hơn) → báo lại cho người dùng, hỏi cách xử lý (`pull --rebase` hay merge) — **không tự ý force push**.
9. Tóm tắt ngắn gọn cho người dùng: danh sách commit đã tạo (hash + message rút gọn), và đã push lên branch/remote nào.

Không bao giờ dùng `--no-verify`, `--force`, hay bỏ qua hook trừ khi người dùng yêu cầu rõ ràng ngay trong lượt chat này.
