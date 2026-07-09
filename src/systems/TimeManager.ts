import Phaser from 'phaser'

/** 1 giờ trong game = 60 giây thực -> 1 giây thực = 1 phút trong game (tỉ lệ tròn, dễ verify khi test:
 * chờ N giây thực thì kim đồng hồ phải nhảy đúng N phút). 1 ngày (24h) = 24 phút thực. */
const HOUR_DURATION_MS = 60_000
const START_HOUR = 6 // bắt đầu lúc 6:00 sáng, giống hầu hết game farming khác
/** Mốc chuyển ngày/đêm — có vùng chuyển tiếp dần (hoàng hôn 19h->21h, bình minh 4h->6h) thay vì bật/tắt đột
 * ngột, đúng yêu cầu "Overlay tint màu tối dần" trong dev-schedule.md Sprint 3. */
const NIGHT_START_HOUR = 19
const NIGHT_FULL_HOUR = 21
const DAWN_START_HOUR = 4
const DAY_FULL_HOUR = 6
const MAX_NIGHT_ALPHA = 0.55

/** Đồng hồ trong game — hoàn toàn tách biệt với thời gian lớn cây (`FarmManager` dùng giờ THỰC trôi qua theo
 * đúng thiết kế `docs/gameplay/farming.md`, không liên quan gì tới đồng hồ tăng tốc này). TimeManager chỉ phục
 * vụ chu kỳ ngày/đêm hiển thị + làm tiền đề cho các hệ thống ăn theo giờ/đêm sau này (cây chỉ hái ban đêm, quái
 * đổi hành vi ban đêm...) qua event bus `hourTick`/`dayChange`/`nightStart`/`dayStart`. */
export class TimeManager extends Phaser.Events.EventEmitter {
  private hour: number
  private day: number
  private isNight: boolean

  constructor(startHour: number = START_HOUR, startDay = 1) {
    super()
    this.hour = startHour
    this.day = startDay
    this.isNight = this.computeIsNight(startHour)
  }

  /** Gọi mỗi frame từ GameScene.update() với `delta` (ms) của Phaser. */
  update(deltaMs: number): void {
    const prevHourInt = Math.floor(this.hour)
    this.hour += deltaMs / HOUR_DURATION_MS

    if (this.hour >= 24) {
      this.hour -= 24
      this.day += 1
      this.emit('dayChange', this.day)
    }

    const hourInt = Math.floor(this.hour)
    if (hourInt !== prevHourInt) {
      this.emit('hourTick', hourInt, this.day)
    }

    const nowNight = this.computeIsNight(this.hour)
    if (nowNight !== this.isNight) {
      this.isNight = nowNight
      this.emit(nowNight ? 'nightStart' : 'dayStart', this.day)
    }
  }

  /** DEBUG: nhảy nhanh N giờ giả lập — không có ý nghĩa gameplay thật, chỉ để test chu kỳ ngày/đêm không phải
   * chờ hàng chục giây/phút thật. */
  debugAdvanceHours(hours: number): void {
    this.update(hours * HOUR_DURATION_MS)
  }

  private computeIsNight(hour: number): boolean {
    return hour >= NIGHT_FULL_HOUR || hour < DAY_FULL_HOUR
  }

  /** % đêm hiện tại, 0 (sáng hoàn toàn) -> 1 (đêm sâu hoàn toàn) — nội suy tuyến tính trong khung giờ hoàng
   * hôn/bình minh để mọi thứ ăn theo (overlay tối, crossfade nền đêm...) chuyển cảnh mượt cùng lúc thay vì mỗi
   * chỗ tự tính riêng rồi lệch nhịp nhau. */
  getNightFraction(): number {
    const h = this.hour
    if (h >= NIGHT_START_HOUR && h < NIGHT_FULL_HOUR) {
      return (h - NIGHT_START_HOUR) / (NIGHT_FULL_HOUR - NIGHT_START_HOUR)
    }
    if (h >= NIGHT_FULL_HOUR || h < DAWN_START_HOUR) {
      return 1
    }
    if (h >= DAWN_START_HOUR && h < DAY_FULL_HOUR) {
      return 1 - (h - DAWN_START_HOUR) / (DAY_FULL_HOUR - DAWN_START_HOUR)
    }
    return 0
  }

  /** Alpha lớp phủ tối dùng cho overlay ban đêm (phủ lên player/prop — chưa có bản vẽ ban đêm riêng cho chúng
   * như nền map) — chỉ là `getNightFraction()` quy đổi sang biên độ tối đa `MAX_NIGHT_ALPHA`. */
  getNightOverlayAlpha(): number {
    return this.getNightFraction() * MAX_NIGHT_ALPHA
  }

  getHour(): number {
    return Math.floor(this.hour)
  }

  getMinute(): number {
    return Math.floor((this.hour % 1) * 60)
  }

  getDay(): number {
    return this.day
  }

  getIsNight(): boolean {
    return this.isNight
  }

  getTimeString(): string {
    return `${String(this.getHour()).padStart(2, '0')}:${String(this.getMinute()).padStart(2, '0')}`
  }

  /** Sprint 6 — lưu nguyên `hour` DẠNG SỐ THỰC (không `Math.floor` như `getHour()`) để phút hiện tại không bị
   * làm tròn mất mỗi lần lưu/tải lại. */
  serialize(): { day: number; hour: number } {
    return { day: this.day, hour: this.hour }
  }

  /** Sprint 6 — chỉ gọi ĐÚNG 1 LẦN lúc boot game load save, giống lý do ở `FarmManager.loadState()`. */
  loadState(day: number, hour: number): void {
    this.day = day
    this.hour = hour
    this.isNight = this.computeIsNight(hour)
  }
}
