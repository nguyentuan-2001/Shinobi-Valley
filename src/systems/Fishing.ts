import { GameData } from '../data/DataLoader'
import type { Fish } from '../data/types'

/** Chọn 1 loại cá ĐỦ ĐIỀU KIỆN (đúng địa điểm, đúng ngày/đêm, Luck người chơi đủ `luck_required`) rồi random
 * ĐỀU trong danh sách đó — `luck_required` là NGƯỠNG MỞ KHÓA (có mặt trong danh sách hay không), không phải
 * trọng số xác suất. Luck càng cao thì càng nhiều loại hiếm lọt vào danh sách đủ điều kiện, tự nhiên kéo tỉ lệ
 * trung bình ra cá hiếm lên cao hơn mà không cần thêm hệ trọng số riêng — đúng "Done when" của dev-schedule.md:
 * "tỷ lệ ra cá cao hơn khi Luck cao hơn". */
export function pickEligibleFish(location: string, luck: number, isNight: boolean): Fish | null {
  const eligible = GameData.fish.filter(
    (f) => f.location.includes(location) && f.luck_required <= luck && (!f.night_only || isNight)
  )
  if (eligible.length === 0) return null
  return eligible[Math.floor(Math.random() * eligible.length)]
}

/** Random đều trong khoảng `catch_time_min`-`catch_time_max` (giây, theo `fish.json`) rồi đổi ra ms — thời gian
 * chờ cắn câu trước khi vào phần mini-game giật đúng lúc. Chưa có Cần câu nào khác ngoài Cần Tre mặc định (chưa
 * có Thợ rèn/Craft để mở khoá Cần sắt/vàng/huyền thoại — xem `docs/gameplay/farming.md` mục "Hệ số cần câu"),
 * nên chưa có hệ số giảm thời gian nào áp dụng ở đây. */
export function rollCatchTimeMs(fish: Fish): number {
  const seconds = fish.catch_time_min + Math.random() * (fish.catch_time_max - fish.catch_time_min)
  return Math.round(seconds * 1000)
}
