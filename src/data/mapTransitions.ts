/** Định nghĩa Exit Zone/Entry Point cho toàn bộ hệ thống chuyển màn (`systems/SceneTransition.ts`) — đúng
 * pattern `docs/gameplay/mechanics.md` mục "Hệ thống Chuyển Màn": mỗi map có 1+ Exit Zone, biết trước map đích
 * + Entry Point tương ứng. Định nghĩa 2 CHIỀU: Farm có 2 Exit Zone dẫn sang Bãi Tập Luyện/Đồng Cỏ, và mỗi map
 * đó lại có Exit Zone riêng dẫn ngược lại Farm — không dùng chung 1 mảng 2 chiều vì Entry Point vào Farm (điểm
 * rơi xuống của nhân vật) phải khác điểm rời đi (Exit Zone) để không tự kích hoạt lại ngay khi vừa tới.
 *
 * TOÀN BỘ Exit Zone giờ là hình vuông `PORTAL_SIZE`×`PORTAL_SIZE` đứng giữa map (không còn kiểu "đi ra rìa map"
 * cũ) — user yêu cầu đồng bộ 1 kiểu cổng dịch chuyển (vòng xoáy, xem `systems/PortalVisual.ts`) cho MỌI điểm
 * chuyển màn, không riêng gì cổng Đồng Cỏ ban đầu. Tâm mỗi rect = tâm hình cổng, `placePortalAtZone()` tự suy
 * ra vị trí vẽ từ đúng rect này, không cần khai báo toạ độ cổng riêng nữa. */
export interface ExitZoneDef {
  rect: { x: number; y: number; width: number; height: number }
  targetScene: string
  entryPoint: { x: number; y: number }
}

export const TRAINING_GROUND_SCENE_KEY = 'TrainingGroundScene'
export const GRASSLAND_SCENE_KEY = 'GrasslandScene'
export const FARM_SCENE_KEY = 'GameScene'

const PORTAL_SIZE = 50

/** Tạo `ExitZoneDef.rect` hình vuông `PORTAL_SIZE` từ toạ độ TÂM (dễ đọc/dễ sửa hơn tự trừ nửa cạnh ở từng chỗ
 * khai báo bên dưới). */
function squareZone(centerX: number, centerY: number) {
  return {
    x: centerX - PORTAL_SIZE / 2,
    y: centerY - PORTAL_SIZE / 2,
    width: PORTAL_SIZE,
    height: PORTAL_SIZE
  }
}

/** Toạ độ tâm đã verify bằng Puppeteer (test điểm không nằm trong bất kỳ `FARM_COLLISION_ZONES` nào, xem
 * progress.md mục Sprint 5 phần "Hệ thống chuyển màn") trước khi chốt. Cổng 1 (tây, cạnh biển chỉ dẫn gần thác)
 * → Bãi Tập Luyện; cổng 2 (giữa đồng, cạnh nhà) → Đồng Cỏ. */
export const FARM_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(240, 430),
    targetScene: TRAINING_GROUND_SCENE_KEY,
    entryPoint: { x: 350, y: 480 }
  },
  {
    rect: squareZone(620, 530),
    targetScene: GRASSLAND_SCENE_KEY,
    entryPoint: { x: 120, y: 400 }
  }
]

export const TRAINING_GROUND_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(350, 520),
    targetScene: FARM_SCENE_KEY,
    // Lệch khỏi cổng 1 của FARM_EXIT_ZONES (215-265, 405-455) để không tự kích hoạt lại ngay lúc vừa rơi vào.
    entryPoint: { x: 250, y: 495 }
  }
]

export const GRASSLAND_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(45, 400),
    targetScene: FARM_SCENE_KEY,
    // Lệch khỏi cổng 2 của FARM_EXIT_ZONES (595-645, 505-555) để không tự kích hoạt lại ngay lúc vừa rơi vào.
    entryPoint: { x: 620, y: 590 }
  }
]
