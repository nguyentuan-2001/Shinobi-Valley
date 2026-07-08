import Phaser from 'phaser'

/** Texture PLACEHOLDER cho Sprint 5 (Người Rơm/quái/hiệu ứng combat) — vẽ bằng code (canvas), không cần asset
 * thật, đúng tinh thần các texture tạm khác đã có trong dự án (`GameScene.createShadowTexture()` v.v.). Gọi 1
 * lần duy nhất (guard `textures.exists`) — nhiều scene (GameScene/TrainingGroundScene/GrasslandScene) đều cần
 * các texture này nên tách ra module dùng chung thay vì lặp lại trong từng scene. Thay bằng sprite thật khi có
 * (Người Rơm chưa có prompt art-refs nào — cần thêm sau; Thỏ hoang đã có prompt ở `art-refs/enemies/monsters.md`). */

export const TRAINING_DUMMY_TEXTURE = 'training_dummy'
export const WILD_RABBIT_TEXTURE = 'wild_rabbit'
export const HIT_SPARK_TEXTURE = 'hit_spark'
export const STRAW_PARTICLE_TEXTURE = 'straw_particle'
export const SLASH_FX_TEXTURE = 'slash_fx'
export const TARGET_RETICLE_TEXTURE = 'target_reticle'

export function createCombatPlaceholderTextures(scene: Phaser.Scene): void {
  createTrainingDummyTexture(scene)
  createWildRabbitTexture(scene)
  createHitSparkTexture(scene)
  createStrawParticleTexture(scene)
  createSlashFxTexture(scene)
  createTargetReticleTexture(scene)
}

/** Người Rơm: cọc gỗ cắm đất + bó rơm hình bầu dục làm thân/đầu, dây thừng buộc ngang — đủ nhận diện "hình nộm
 * tập luyện" dù chỉ là khối màu đơn giản. */
function createTrainingDummyTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TRAINING_DUMMY_TEXTURE)) return
  const width = 32
  const height = 44
  const canvasTexture = scene.textures.createCanvas(TRAINING_DUMMY_TEXTURE, width, height)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  const cx = width / 2

  // Cọc gỗ cắm xuống đất (chân đế).
  ctx.fillStyle = '#7A5230'
  ctx.fillRect(cx - 3, height - 12, 6, 12)

  // Thân rơm (bầu dục thẳng đứng).
  ctx.beginPath()
  ctx.ellipse(cx, height - 24, 10, 16, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#D9B15C' // rơm vàng nhạt
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#9C7A32'
  ctx.stroke()

  // Đầu rơm (tròn nhỏ hơn).
  ctx.beginPath()
  ctx.ellipse(cx, height - 38, 7, 7, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#E8C878'
  ctx.fill()
  ctx.stroke()

  // 2 dây thừng buộc ngang thân cho rõ "hình nộm", không phải cục màu vô nghĩa.
  ctx.strokeStyle = '#6B4423'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 9, height - 28)
  ctx.lineTo(cx + 9, height - 28)
  ctx.moveTo(cx - 9, height - 18)
  ctx.lineTo(cx + 9, height - 18)
  ctx.stroke()

  canvasTexture.refresh()
}

/** Thỏ hoang: thân bầu dục xám-trắng + 2 tai dài + mắt đỏ nhỏ (gợi ý "hoang dã/hung dữ" theo đúng mô tả prompt
 * ở art-refs, dù chỉ là hình khối đơn giản). */
function createWildRabbitTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(WILD_RABBIT_TEXTURE)) return
  const size = 32
  const canvasTexture = scene.textures.createCanvas(WILD_RABBIT_TEXTURE, size, size)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  const cx = size / 2

  // 2 tai dài.
  ctx.fillStyle = '#D8D8D0'
  ctx.beginPath()
  ctx.ellipse(cx - 5, 9, 3, 9, -0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 5, 9, 3, 9, 0.15, 0, Math.PI * 2)
  ctx.fill()

  // Thân bầu dục.
  ctx.beginPath()
  ctx.ellipse(cx, 21, 11, 9, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#C9C9C0'
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#8A8A80'
  ctx.stroke()

  // Mắt đỏ nhỏ (dữ tợn hơn thỏ thường, đúng mô tả "glowing red angry eyes" trong art-refs).
  ctx.fillStyle = '#D8362E'
  ctx.beginPath()
  ctx.arc(cx - 4, 19, 1.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + 4, 19, 1.6, 0, Math.PI * 2)
  ctx.fill()

  canvasTexture.refresh()
}

/** Tia sáng bung ra khi trúng đòn — dùng chung cho cả Người Rơm lẫn quái, chỉ là phản hồi hình ảnh tức thời. */
function createHitSparkTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(HIT_SPARK_TEXTURE)) return
  const size = 16
  const canvasTexture = scene.textures.createCanvas(HIT_SPARK_TEXTURE, size, size)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  const c = size / 2
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.5, 'rgba(255,230,140,0.7)')
  gradient.addColorStop(1, 'rgba(255,230,140,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  canvasTexture.refresh()
  scene.textures.get(HIT_SPARK_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
}

/** Mảnh rơm văng ra khi Người Rơm "chết" (đủ 5 hit) — hình vuông nhỏ màu rơm, dùng nhiều instance + tween toả
 * ra các hướng để mô phỏng "vỡ tung" mà không cần particle emitter thật. */
function createStrawParticleTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(STRAW_PARTICLE_TEXTURE)) return
  const size = 5
  const canvasTexture = scene.textures.createCanvas(STRAW_PARTICLE_TEXTURE, size, size)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  ctx.fillStyle = '#D9B15C'
  ctx.fillRect(0, 0, size, size)
  canvasTexture.refresh()
}

/** Con trỏ ngắm mục tiêu (Sprint 5 sau, user yêu cầu thêm) — 4 dấu ngoặc góc đỏ kiểu "lock-on" quân sự + vòng
 * tròn tâm nhỏ, khác hẳn hình thoi vàng của con trỏ tương tác ở Farm (`INTERACTION_POINTER_TEXTURE`) để phân
 * biệt rõ "đang NGẮM mục tiêu để đánh" với "đang có thứ TƯƠNG TÁC được" — 2 khái niệm khác nhau dù cùng là
 * "con trỏ chỉ vào 1 object". */
function createTargetReticleTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TARGET_RETICLE_TEXTURE)) return
  const size = 40
  const canvasTexture = scene.textures.createCanvas(TARGET_RETICLE_TEXTURE, size, size)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  const c = size / 2
  const r = size / 2 - 4
  const bracket = 8

  ctx.strokeStyle = '#FF4433'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  // 4 góc ngoặc (trên-trái, trên-phải, dưới-trái, dưới-phải) quanh 1 hình vuông ảo cạnh 2r.
  const corners: Array<[number, number, number, number]> = [
    [c - r, c - r, 1, 1],
    [c + r, c - r, -1, 1],
    [c - r, c + r, 1, -1],
    [c + r, c + r, -1, -1]
  ]
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath()
    ctx.moveTo(x + dx * bracket, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * bracket)
    ctx.stroke()
  }

  // Chấm tròn tâm nhỏ cho rõ điểm ngắm chính giữa.
  ctx.fillStyle = '#FF4433'
  ctx.beginPath()
  ctx.arc(c, c, 2.5, 0, Math.PI * 2)
  ctx.fill()

  canvasTexture.refresh()
  scene.textures.get(TARGET_RETICLE_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
}

/** Vệt chém khi tấn công — cung tròn mỏng màu trắng, hiện chớp nhoáng trước mặt player lúc vung vũ khí. */
function createSlashFxTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(SLASH_FX_TEXTURE)) return
  const width = 40
  const height = 40
  const canvasTexture = scene.textures.createCanvas(SLASH_FX_TEXTURE, width, height)
  if (!canvasTexture) return
  const ctx = canvasTexture.getContext()
  const cx = width / 2
  const cy = height / 2
  ctx.lineWidth = 4
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.arc(cx, cy, width / 2 - 4, -0.9, 0.9)
  ctx.stroke()
  canvasTexture.refresh()
  scene.textures.get(SLASH_FX_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
}
