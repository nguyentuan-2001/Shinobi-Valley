import Phaser from 'phaser'
import { GameData } from '../data/DataLoader'
import { Monster } from '../entities/Monster'

/** Helper dùng chung cho 5 map chiến đấu mới (Map 3-7, Sprint 12) — tránh lặp lại y hệt logic dựng nền/quái ở
 * cả 5 scene. **Quyết định kiến trúc**: thay vì dựng "nhiều Room/scene nối tiếp bằng transition" (phức tạp hơn
 * hẳn — cần quản lý nhiều scene con + chuyển cảnh mượt giữa chúng), mỗi map là **1 scene DUY NHẤT nhưng world
 * RỘNG** (`COMBAT_MAP_WIDTH`×`COMBAT_MAP_HEIGHT`, xem `data/mapTransitions.ts`) chia 2 nửa màu nền khác nhau —
 * camera cuộn tự nhiên khi đi từ nửa này sang nửa kia đã tạo đúng cảm giác "đi qua khu vực khác" mà không cần
 * transition riêng. Đây là phương án ĐƯỢC PHÉP theo chính quyết định kiến trúc gốc trong `dev-schedule.md`
 * Sprint 12: "...hoặc ghép liền trong 1 Tiled map lớn nếu muốn camera mở rộng tự nhiên". Chưa có tileset thật
 * (`art-refs/`/`asset-manifest.md` mục 17 chưa dùng tới) nên nền vẫn vẽ bằng code như mọi map chiến đấu trước đó
 * (Bãi Tập Luyện/Đồng Cỏ Sprint 5). */

export interface FlatZoneGroundConfig {
  key: string
  width: number
  height: number
  /** Màu nửa TRÁI (khu vực 1) và nửa PHẢI (khu vực 2) — khác nhau rõ để người chơi nhận ra đã "sang khu mới". */
  zone1Color: number
  zone2Color: number
  /** Màu chấm trang trí rải rác (rgba string) — tạo cảm giác bề mặt tự nhiên, cùng kỹ thuật `GrasslandScene.
   * createGroundTexture()` đã dùng. */
  speckleColor: string
}

export function createFlatZoneGroundTexture(
  scene: Phaser.Scene,
  config: FlatZoneGroundConfig
): void {
  if (scene.textures.exists(config.key)) return
  const canvasTexture = scene.textures.createCanvas(config.key, config.width, config.height)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  const halfWidth = config.width / 2

  ctx.fillStyle = `#${config.zone1Color.toString(16).padStart(6, '0')}`
  ctx.fillRect(0, 0, halfWidth, config.height)
  ctx.fillStyle = `#${config.zone2Color.toString(16).padStart(6, '0')}`
  ctx.fillRect(halfWidth, 0, halfWidth, config.height)

  ctx.fillStyle = config.speckleColor
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * config.width
    const y = Math.random() * config.height
    ctx.beginPath()
    ctx.ellipse(x, y, 14, 8, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  canvasTexture.refresh()
}

export interface MonsterSpawnDef {
  monsterId: string
  x: number
  y: number
}

/** Tạo Monster thật từ `monsters.json` theo danh sách vị trí — bỏ qua id không tra được (không nên xảy ra, chỉ
 * phòng hờ lỗi đánh máy id lúc khai báo `MONSTER_SPAWNS` ở từng scene). */
export function spawnMonstersFromDefs(
  scene: Phaser.Scene,
  spawns: readonly MonsterSpawnDef[]
): Monster[] {
  const monsters: Monster[] = []
  spawns.forEach((spawn, index) => {
    const data = GameData.monsters.find((m) => m.id === spawn.monsterId)
    if (!data) return
    monsters.push(new Monster(scene, spawn.x, spawn.y, data, index))
  })
  return monsters
}

/** Hiện 1 dòng chữ ngắn tự biến mất — dùng khi người chơi đứng vào cổng bị khoá cấp (`checkGatedExitZones()`
 * trả `blockedByLevel`) để báo rõ lý do thay vì im lặng không có phản hồi gì. */
export function showLevelGateMessage(
  scene: Phaser.Scene,
  x: number,
  y: number,
  minLevel: number
): void {
  const text = scene.add
    .text(x, y - 30, `Cần đạt cấp ${minLevel} để đi tiếp`, {
      fontSize: '12px',
      color: '#ffb4b4',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 }
    })
    .setOrigin(0.5)
    .setDepth(999_999)
  scene.time.delayedCall(1500, () => text.destroy())
}
