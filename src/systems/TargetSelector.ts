import Phaser from 'phaser'

/** Điều kiện tối thiểu để 1 object "ngắm được" — Monster/TrainingDummy đều thoả (đều có toạ độ + cách biết còn
 * sống hay không). Dùng generic thay vì ràng buộc cứng vào 1 class cụ thể để dùng chung được cho cả quái lẫn
 * Người Rơm (user yêu cầu: "quái hoặc ô đất hay bất cứ gì có thể trỏ được" — tổng quát hoá thay vì chỉ làm
 * riêng cho Monster). */
export interface Targetable {
  id: number
  x: number
  y: number
  isValid(): boolean
}

/** Chọn + xoay vòng mục tiêu trong 1 danh sách candidate đưa vào mỗi frame — KHÔNG tự đi tìm candidate (scene
 * biết rõ nhất "còn gì gần đó" nên tự lọc rồi truyền vào), class này chỉ lo phần "nhớ đang chọn cái nào" +
 * "chọn gần nhất khi chưa có gì" + "xoay sang cái tiếp theo khi bấm F2". Dùng chung cho `GrasslandScene`
 * (quái)/`TrainingGroundScene` (Người Rơm) thay vì viết lặp lại logic này ở mỗi scene. */
export class TargetSelector<T extends Targetable> {
  private selectedId: number | null = null

  /** Gọi mỗi frame — tự bỏ chọn nếu mục tiêu cũ hết hợp lệ (chết/ra khỏi tầm, tuỳ scene lọc `candidates` trước
   * khi truyền vào), tự chọn GẦN NHẤT nếu chưa có gì đang chọn. Trả về mục tiêu đang chọn (`null` nếu không có
   * candidate nào). */
  update(candidates: readonly T[], playerX: number, playerY: number): T | null {
    const valid = candidates.filter((c) => c.isValid())
    if (valid.length === 0) {
      this.selectedId = null
      return null
    }

    const current = valid.find((c) => c.id === this.selectedId)
    if (current) return current

    let nearest = valid[0]
    let nearestDist = Phaser.Math.Distance.Between(playerX, playerY, nearest.x, nearest.y)
    for (const candidate of valid) {
      const dist = Phaser.Math.Distance.Between(playerX, playerY, candidate.x, candidate.y)
      if (dist < nearestDist) {
        nearest = candidate
        nearestDist = dist
      }
    }
    this.selectedId = nearest.id
    return nearest
  }

  /** F2 — chuyển sang candidate KẾ TIẾP trong danh sách hiện có (theo đúng thứ tự `candidates` được truyền vào,
   * xoay vòng về đầu khi hết danh sách). Không làm gì nếu chỉ có 0-1 candidate (không có gì để xoay sang). */
  cycleNext(candidates: readonly T[]): void {
    const valid = candidates.filter((c) => c.isValid())
    if (valid.length <= 1) return
    const currentIndex = valid.findIndex((c) => c.id === this.selectedId)
    const nextIndex = (currentIndex + 1) % valid.length
    this.selectedId = valid[nextIndex].id
  }
}
