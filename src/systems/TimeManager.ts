import Phaser from 'phaser'

/** 1 giờ trong game = 60 giây thực -> 1 giây thực = 1 phút trong game (tỉ lệ tròn, dễ verify khi test:
 * chờ N giây thực thì kim đồng hồ phải nhảy đúng N phút). 1 ngày (24h) = 24 phút thực. */
const HOUR_DURATION_MS = 60_000
const START_HOUR = 6 // bắt đầu lúc 6:00 sáng, giống hầu hết game farming khác
/** Mốc chuyển ngày/đêm — CHUYỂN HẲN, không còn vùng chuyển tiếp dần/nội suy như bản đầu (Sprint 3 làm "Overlay
 * tint màu tối dần" theo dev-schedule.md, nhưng user yêu cầu đổi lại: đúng 18h chuyển hẳn sang `BaseMap_night.png`,
 * đúng 6h chuyển hẳn về `BaseMap.png`, KHÔNG pha trộn/tint gì thêm — giữ nguyên sắc độ gốc của ảnh nền). */
const NIGHT_HOUR = 18
const DAY_HOUR = 6

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
    return hour >= NIGHT_HOUR || hour < DAY_HOUR
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
