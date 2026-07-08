import Phaser from 'phaser'
import type { ExitZoneDef } from '../data/mapTransitions'

export const PORTAL_TEXTURE = 'magic_portal'
/** Nổi rõ hơn hẳn nền/prop tĩnh xung quanh — đặt cao hơn player 1 chút để không bao giờ bị Y-sort che mất
 * (khác cách các prop tĩnh khác dùng `bottomY` để player có thể đi "trước"/"sau" nó — cổng dịch chuyển luôn
 * phải thấy rõ, không có khái niệm đứng "sau" nó). */
const PORTAL_DEPTH = 500

/** Vòng xoáy phép thuật dùng chung cho MỌI điểm chuyển màn trong game (Farm↔Bãi Tập Luyện, Farm↔Đồng Cỏ, và
 * mọi map sau này) — vẽ 1 lần bằng canvas, share texture giữa các scene (Phaser texture manager là global).
 * Trước đây `GameScene` tự vẽ riêng 1 bản chỉ cho cổng Đồng Cỏ (`createGrasslandPortalTexture()`) — tách ra
 * đây để mọi Exit Zone (kể cả 2 chiều dẫn ngược lại Farm) đều dùng chung 1 hình ảnh, nhất quán toàn bộ game
 * thay vì mỗi nơi 1 kiểu (nơi thì có cổng, nơi thì chỉ là vùng vô hình "đi ra rìa map"). */
function createPortalTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(PORTAL_TEXTURE)) return
  const size = 64
  const canvasTexture = scene.textures.createCanvas(PORTAL_TEXTURE, size, size)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  const c = size / 2

  const glow = ctx.createRadialGradient(c, c, 0, c, c, c - 4)
  glow.addColorStop(0, 'rgba(200,160,255,0.95)')
  glow.addColorStop(0.55, 'rgba(120,80,220,0.75)')
  glow.addColorStop(1, 'rgba(60,30,120,0.15)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(c, c, c - 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(230,210,255,0.9)'
  ctx.beginPath()
  ctx.arc(c, c, c - 4, 0, Math.PI * 2)
  ctx.stroke()

  // 3 cánh xoắn ốc mờ toả từ tâm ra viền, gợi ý "đang xoáy" kể cả trước khi tween xoay chạy.
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 2
  for (let arm = 0; arm < 3; arm++) {
    const baseAngle = (arm / 3) * Math.PI * 2
    ctx.beginPath()
    for (let t = 0; t <= 1; t += 0.05) {
      const angle = baseAngle + t * Math.PI * 1.4
      const radius = t * (c - 8)
      const x = c + Math.cos(angle) * radius
      const y = c + Math.sin(angle) * radius
      if (t === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  canvasTexture.refresh()
  scene.textures.get(PORTAL_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
}

/** Đặt 1 hình cổng dịch chuyển tại toạ độ world (x,y), tự xoay + phập phồng liên tục — dùng cho từng Exit Zone
 * riêng lẻ khi toạ độ không khớp thẳng tâm 1 rect có sẵn. */
export function placePortalVisual(scene: Phaser.Scene, x: number, y: number, size = 50): void {
  createPortalTexture(scene)
  const portal = scene.add
    .image(x, y, PORTAL_TEXTURE)
    .setDisplaySize(size, size)
    .setDepth(PORTAL_DEPTH)
  scene.tweens.add({ targets: portal, angle: 360, duration: 3000, repeat: -1, ease: 'Linear' })
  scene.tweens.add({
    targets: portal,
    scale: portal.scale * 1.08,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })
}

/** Đặt cổng đúng CHÍNH GIỮA 1 `ExitZoneDef.rect` — tiện dùng khi scene chỉ cần vẽ cổng cho đúng vùng kích hoạt
 * chuyển màn của chính nó (mọi Exit Zone giờ đều là hình vuông 50×50, tâm rect = tâm cổng). */
export function placePortalAtZone(scene: Phaser.Scene, zone: ExitZoneDef): void {
  placePortalVisual(
    scene,
    zone.rect.x + zone.rect.width / 2,
    zone.rect.y + zone.rect.height / 2,
    Math.min(zone.rect.width, zone.rect.height)
  )
}
