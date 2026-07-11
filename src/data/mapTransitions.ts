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
  /** Sprint 12 — cấp tối thiểu để đi qua cổng này (map chiến đấu Lv10+ theo `docs/world/maps.md`). `undefined`
   * = không giới hạn (Farm/Village/Bãi Tập Luyện/Đồng Cỏ, mọi cổng ĐI NGƯỢC lại map đã mở khoá rồi). Scene tự
   * kiểm `combatManager.getStats().level >= minLevel` TRƯỚC khi gọi `fadeOutToScene()` — xem
   * `CombatMapCommon.checkGatedExitZones()`. */
  minLevel?: number
}

export const TRAINING_GROUND_SCENE_KEY = 'TrainingGroundScene'
export const GRASSLAND_SCENE_KEY = 'GrasslandScene'
export const FARM_SCENE_KEY = 'GameScene'
export const VILLAGE_SCENE_KEY = 'VillageScene'
export const BAMBOO_FOREST_SCENE_KEY = 'RungTreScene'
export const CAVE_SCENE_KEY = 'HangDongScene'
export const SNOW_MOUNTAIN_SCENE_KEY = 'NuiTuyetScene'
export const SACRED_FOREST_SCENE_KEY = 'RungThiengScene'
export const ANCIENT_FOREST_SCENE_KEY = 'RungCoScene'

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
  },
  {
    // Cổng 3 (bãi cỏ mở phía đông-bắc, gần dãy núi nền) → Làng Ẩn Nhân (Map 0, Sprint 10) — toạ độ verify bằng
    // Puppeteer teleport thật, đứng cách xa mọi FARM_COLLISION_ZONES/khu chăn nuôi/điểm câu cá đã có.
    rect: squareZone(850, 200),
    targetScene: VILLAGE_SCENE_KEY,
    entryPoint: { x: 450, y: 500 }
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
  },
  {
    // Sprint 12 — cổng tiếp sang Map 3 (Rừng Tre), đặt ở rìa đông map Đồng Cỏ (MAP_WIDTH=1000).
    rect: squareZone(950, 375),
    targetScene: BAMBOO_FOREST_SCENE_KEY,
    entryPoint: { x: 150, y: 350 },
    minLevel: 10
  }
]

export const VILLAGE_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(450, 550),
    targetScene: FARM_SCENE_KEY,
    // Lệch khỏi cổng 3 của FARM_EXIT_ZONES (825-875, 175-225) để không tự kích hoạt lại ngay lúc vừa rơi vào.
    entryPoint: { x: 830, y: 250 }
  }
]

/** Sprint 12 — chuỗi 5 map chiến đấu còn lại (Map 3-7), nối tiếp TUYẾN TÍNH: mỗi map có đúng 1 cổng lùi (map
 * trước) + 1 cổng tiến (map sau, có `minLevel` theo đúng "Mở khóa" của từng map trong `docs/world/maps.md`) —
 * trừ Rừng Cổ (Map 7, cuối chuỗi hiện tại) chỉ có cổng lùi vì Map 8 (Thánh Điện Cổ) cần MQ-09 hoàn thành, chưa
 * làm (Sprint 17+). Mỗi map rộng `COMBAT_MAP_WIDTH`×`COMBAT_MAP_HEIGHT` — xem giải thích lý do map rộng (thay
 * cho nhiều scene/phòng riêng) ở `CombatMapCommon.ts`. */
export const COMBAT_MAP_WIDTH = 1200
export const COMBAT_MAP_HEIGHT = 700

/** Mọi `entryPoint` bên dưới dùng `150`/`COMBAT_MAP_WIDTH - 150` (KHÔNG phải `80`/`COMBAT_MAP_WIDTH - 80`,
 * bug thật gặp lúc verify bằng Puppeteer) — cổng lùi/tiến của map ĐÍCH đặt tại x=60/x=`COMBAT_MAP_WIDTH-60`
 * (`squareZone`, cạnh `PORTAL_SIZE=50` nên rect trải 35-85/`WIDTH-85`-`WIDTH-35`); nếu entryPoint rơi vào đúng
 * rect đó thì vừa rơi vào map mới đã tự kích hoạt lại cổng NGAY LẬP TỨC, bật ngược lại map cũ. */

export const BAMBOO_FOREST_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(60, 350),
    targetScene: GRASSLAND_SCENE_KEY,
    entryPoint: { x: 900, y: 375 }
  },
  {
    rect: squareZone(COMBAT_MAP_WIDTH - 60, 350),
    targetScene: CAVE_SCENE_KEY,
    entryPoint: { x: 150, y: 350 },
    minLevel: 20
  }
]

export const CAVE_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(60, 350),
    targetScene: BAMBOO_FOREST_SCENE_KEY,
    entryPoint: { x: COMBAT_MAP_WIDTH - 150, y: 350 }
  },
  {
    rect: squareZone(COMBAT_MAP_WIDTH - 60, 350),
    targetScene: SNOW_MOUNTAIN_SCENE_KEY,
    entryPoint: { x: 150, y: 350 },
    minLevel: 30
  }
]

export const SNOW_MOUNTAIN_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(60, 350),
    targetScene: CAVE_SCENE_KEY,
    entryPoint: { x: COMBAT_MAP_WIDTH - 150, y: 350 }
  },
  {
    rect: squareZone(COMBAT_MAP_WIDTH - 60, 350),
    targetScene: SACRED_FOREST_SCENE_KEY,
    entryPoint: { x: 150, y: 350 },
    minLevel: 40
  }
]

export const SACRED_FOREST_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(60, 350),
    targetScene: SNOW_MOUNTAIN_SCENE_KEY,
    entryPoint: { x: COMBAT_MAP_WIDTH - 150, y: 350 }
  },
  {
    rect: squareZone(COMBAT_MAP_WIDTH - 60, 350),
    targetScene: ANCIENT_FOREST_SCENE_KEY,
    entryPoint: { x: 150, y: 350 },
    minLevel: 50
  }
]

export const ANCIENT_FOREST_EXIT_ZONES: ExitZoneDef[] = [
  {
    rect: squareZone(60, 350),
    targetScene: SACRED_FOREST_SCENE_KEY,
    entryPoint: { x: COMBAT_MAP_WIDTH - 150, y: 350 }
  }
  // Chưa có cổng tiến sang Map 8 (Thánh Điện Cổ) — cần MQ-09 "rèn Kiếm Hư Vô" hoàn thành trước (Sprint 17+),
  // chưa có hệ quest nên chưa thể kiểm điều kiện mở khoá thật.
]
