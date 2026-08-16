import {
  FENCE_PLACEMENTS as DAY_FENCE_PLACEMENTS,
  FARM_BUILDING_PLACEMENTS as DAY_FARM_BUILDING_PLACEMENTS,
  type FencePlacement,
  type FarmBuildingPlacement
} from './day'

/** Bản sinh đôi của `mapPlacements/day.ts` cho BẢN ĐÊM — xem giải thích đầy đủ ở đó (lý do tách riêng ngày/đêm,
 * cách import cả 2 file cùng lúc, vd. `import { FARM_BUILDING_PLACEMENTS as FARM_BUILDING_PLACEMENTS_NIGHT }
 * from '../data/mapPlacements/night'`). Chưa canh riêng cho bản đêm — TẠM THỜI sao chép y hệt giá trị bản
 * ngày, user tự kéo chỉnh lại bằng `BuildingEditorScene` (phím P từ GameScene, phím N để chuyển sang chế độ
 * đêm) khi cần khớp riêng với `BaseMap_night.png`. */

export const FENCE_PLACEMENTS: FencePlacement[] = DAY_FENCE_PLACEMENTS.map((f) => ({ ...f }))
export const FARM_BUILDING_PLACEMENTS: FarmBuildingPlacement[] = DAY_FARM_BUILDING_PLACEMENTS.map(
  (b) => ({ ...b })
)
