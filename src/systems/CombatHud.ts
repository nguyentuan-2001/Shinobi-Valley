import Phaser from 'phaser'
import { combatManager } from './CombatManager'

/** Đồng bộ chỉ số chiến đấu (`combatManager`) vào `registry` cho `UIScene` đọc — đúng pattern
 * `selectedSeedName`/`gameTimeText` đã dùng ở `GameScene` (Sprint 2/3), tách thành hàm dùng chung vì Sprint 5
 * có tới 3 scene (Farm/Bãi Tập Luyện/Đồng Cỏ) đều cần hiện cùng 1 bộ HUD HP/MP/EXP. Gọi 1 lần trong `create()`
 * của mỗi scene — tự đăng ký/gỡ listener theo đúng vòng đời scene đó (SHUTDOWN), không cần scene tự nhớ làm. */
export function syncCombatHudToRegistry(scene: Phaser.Scene): void {
  const registry = scene.registry
  const write = () => {
    const stats = combatManager.getStats()
    registry.set('playerHp', stats.hp)
    registry.set('playerMaxHp', stats.max_hp)
    registry.set('playerMp', stats.mp)
    registry.set('playerMaxMp', stats.max_mp)
    registry.set('playerLevel', stats.level)
    registry.set('playerExp', stats.exp)
    registry.set('playerExpToNext', stats.exp_to_next)
    registry.set('playerGold', stats.gold)
  }
  write()
  combatManager.on('stats-changed', write)
  // `combatManager` là singleton sống XUYÊN SUỐT mọi scene (không bị huỷ theo scene như `registry.events` ở
  // UIScene) — nếu không gỡ listener khi scene này dừng, mỗi lần chuyển màn qua lại sẽ cộng dồn thêm 1 listener
  // mới gọi `write()` trên CÙNG 1 registry key nhiều lần thừa (không sai kết quả vì idempotent, nhưng rò rỉ bộ
  // nhớ tăng dần không giới hạn qua nhiều lần chuyển màn — cùng bài học đã rút ra với `registry.events`, xem
  // progress.md).
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    combatManager.off('stats-changed', write)
  })
}
