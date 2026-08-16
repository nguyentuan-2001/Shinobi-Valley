export interface ControlEntry {
  key: string
  action: string
}

/** Danh sách phím tắt hiện ở bảng trợ giúp (phím Z, xem `systems/ControlsHelp.ts`) khi đang ở Farm
 * (`GameScene`). C không đăng ký ở `GameScene` mà ở `UIScene` (dùng chung mọi scene, xem
 * `CharacterPanel.bindCharacterPanelInput`) nhưng vẫn liệt kê ở đây cho đủ. */
export const FARM_CONTROLS: ControlEntry[] = [
  { key: '↑ ↓ ← →', action: 'Di chuyển' },
  { key: 'Space', action: 'Đòn thường' },
  {
    key: 'Enter',
    action: 'Cuốc đất / mở menu hạt giống / trồng / tương tác (tưới, hái, cho ăn...)'
  },
  { key: '← → (menu hạt giống mở)', action: 'Chọn hạt giống' },
  { key: 'I', action: 'Mở bảng Hành trang' },
  { key: 'F', action: 'Mở/đóng bảng Công Cụ Nông Trại' },
  { key: 'C', action: 'Mở bảng Nhân vật' },
  { key: 'Esc', action: 'Đóng menu/bảng đang mở, huỷ câu cá' },
  { key: 'Z', action: 'Hiện/ẩn bảng phím tắt này' },
  { key: 'Q', action: '[Debug] Mở Editor vùng va chạm' },
  { key: 'P', action: '[Debug] Mở Editor kéo-thả vị trí công trình' },
  { key: 'G', action: '[Debug] +1 giờ cây trồng' },
  { key: 'T', action: '[Debug] +1 giờ đồng hồ game' },
  { key: 'N', action: '[Debug] Nuôi thử 1 con vật ngẫu nhiên' }
]

/** Dùng chung cho mọi scene chiến đấu (Bãi Tập Luyện/Đồng Cỏ/Rừng Tre/Hang Động/Núi Tuyết/Rừng Thiêng/Rừng Cổ)
 * — phím SỐ 1-6 luôn được đăng ký đủ ở `bindSkillHotbarInput()` dù hotbar thực tế có ít hơn 6 chiêu. */
export const COMBAT_CONTROLS: ControlEntry[] = [
  { key: '↑ ↓ ← →', action: 'Di chuyển' },
  { key: 'Space', action: 'Đòn thường' },
  { key: '1-6', action: 'Chọn ô chiêu trong hotbar' },
  { key: 'Enter', action: 'Đánh chiêu đang chọn' },
  { key: 'F2', action: 'Đổi mục tiêu' },
  { key: 'C', action: 'Mở bảng Nhân vật' },
  { key: 'Esc', action: 'Đóng bảng đang mở' },
  { key: 'Z', action: 'Hiện/ẩn bảng phím tắt này' }
]

export const VILLAGE_CONTROLS: ControlEntry[] = [
  { key: '↑ ↓ ← →', action: 'Di chuyển' },
  { key: 'Enter', action: 'Nói chuyện với NPC gần nhất / xác nhận giao dịch ở cửa hàng' },
  { key: 'F', action: 'Mở cửa hàng (nếu NPC có bán đồ)' },
  { key: 'G', action: 'Tặng quà yêu thích cho NPC' },
  { key: '← → (cửa hàng mở)', action: 'Chọn vật phẩm' },
  { key: 'C', action: 'Mở bảng Nhân vật' },
  { key: 'Esc', action: 'Đóng hội thoại/cửa hàng đang mở' },
  { key: 'Z', action: 'Hiện/ẩn bảng phím tắt này' }
]
