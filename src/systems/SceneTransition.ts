import Phaser from 'phaser'
import type { ExitZoneDef } from '../data/mapTransitions'

/** Hệ thống chuyển màn DÙNG CHUNG cho mọi cặp map (Farm ↔ Bãi Tập Luyện lần đầu, dùng lại nguyên cho Village/
 * Map 2-7 sau này — xem `docs/gameplay/mechanics.md` mục "Hệ thống Chuyển Màn"). Không phải 1 class/scene riêng
 * vì mỗi scene vẫn cần tự quản lý cờ `isTransitioning` của chính nó (để khoá input trong `update()` theo đúng
 * pattern `seedMenuOpen`/`inventoryOpen` đã có ở GameScene) — đây chỉ là các hàm helper thuần, scene gọi vào. */

const FADE_MS = 400

/** Gọi mỗi frame trong `update()` của scene có Exit Zone (sau khi đã né được các trường hợp input bị khoá khác
 * như menu đang mở) — kiểm tra người chơi có đang đứng trong 1 trong các zone không, có thì bắt đầu chuyển màn
 * ngay (case 17 combat.md: "đi vào Exit Zone giữa lúc đang tấn công/combo" → chuyển màn ngay, huỷ animation
 * đang chạy — `scene.scene.start()` ở `goToScene()` tự làm việc này vì nó phá huỷ toàn bộ scene cũ, không cần
 * xử lý gì thêm). Trả về `true` nếu vừa kích hoạt chuyển màn (để scene gọi biết mà set cờ `isTransitioning`). */
export function checkExitZones(
  playerX: number,
  playerY: number,
  zones: readonly ExitZoneDef[]
): ExitZoneDef | null {
  for (const zone of zones) {
    const { x, y, width, height } = zone.rect
    if (playerX >= x && playerX <= x + width && playerY >= y && playerY <= y + height) {
      return zone
    }
  }
  return null
}

export interface GatedExitCheck {
  /** Zone hợp lệ để chuyển màn NGAY (đứng đúng trong zone + đủ cấp nếu zone có `minLevel`) — `null` nếu không
   * đứng trong zone nào hoặc đứng trong zone có `minLevel` nhưng chưa đủ cấp. */
  zone: ExitZoneDef | null
  /** Cấp cần thiết nếu đang đứng ĐÚNG trong 1 zone bị khoá cấp (để scene hiện thông báo "cần Lv X") — `null`
   * nếu không đứng trong zone nào hoặc zone đó không khoá cấp. */
  blockedByLevel: number | null
}

/** Sprint 12 — bản mở rộng của `checkExitZones()` có kiểm thêm `ExitZoneDef.minLevel` (map chiến đấu Lv10+ theo
 * `docs/world/maps.md`). Tách hàm riêng thay vì sửa `checkExitZones()` gốc vì Farm/Village/Bãi Tập Luyện/Đồng Cỏ
 * (chiều vào) không cần biết khái niệm cấp độ tối thiểu — giữ hàm gốc đơn giản, chỗ nào cần khoá cấp mới gọi
 * bản này. */
export function checkGatedExitZones(
  playerX: number,
  playerY: number,
  zones: readonly ExitZoneDef[],
  currentLevel: number
): GatedExitCheck {
  const zone = checkExitZones(playerX, playerY, zones)
  if (!zone) return { zone: null, blockedByLevel: null }
  if (zone.minLevel && currentLevel < zone.minLevel) {
    return { zone: null, blockedByLevel: zone.minLevel }
  }
  return { zone, blockedByLevel: null }
}

/** Fade-out màn hình đen rồi chuyển scene, mang theo toạ độ Entry Point của map đích qua `data` (scene đích tự
 * đọc ở `create(data)`). Dừng `UIScene` trước khi chuyển vì `scene.start()` chỉ dừng CHÍNH scene đang gọi, không
 * đụng tới các scene được `launch()` song song khác — scene đích sẽ tự `scene.launch('UIScene')` lại. */
export function fadeOutToScene(
  scene: Phaser.Scene,
  targetSceneKey: string,
  entryPoint: { x: number; y: number }
): void {
  scene.cameras.main.fadeOut(FADE_MS, 0, 0, 0)
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.stop('UIScene')
    scene.scene.start(targetSceneKey, { spawnX: entryPoint.x, spawnY: entryPoint.y })
  })
}

/** Gọi ở đầu `create()` của MỌI scene có thể là đích đến của chuyển màn — fade-in từ đen. `onUnlock` chạy khi
 * fade xong, dùng để hạ cờ `isTransitioning` của scene đó (mở lại input di chuyển/tấn công). */
export function fadeInScene(scene: Phaser.Scene, onUnlock: () => void): void {
  scene.cameras.main.fadeIn(FADE_MS, 0, 0, 0)
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, onUnlock)
}
