/** Danh sách vùng va chạm ẩn cho map Farm (BaseMap.png) — nguồn dữ liệu dùng chung giữa GameScene (chạy game
 * thật, kiểm tra điểm-trong-đa-giác thủ công vì Arcade Physics không hỗ trợ polygon) và EditorScene (công cụ
 * chỉnh tay). Mỗi zone là 1 đa giác tuỳ ý (>=3 điểm), không còn giới hạn hình chữ nhật. Sửa xong trong
 * EditorScene thì xuất mảng này và dán đè lại vào đây. */
export interface Point {
  x: number
  y: number
}

export interface CollisionZone {
  label: string
  points: Point[]
}

export const FARM_COLLISION_ZONES: CollisionZone[] = [
  {
    label: 'Suối nối thác -> sông',
    points: [
      { x: -1, y: 4 },
      { x: 1673, y: 1 },
      { x: 1676, y: 271 },
      { x: 1455, y: 277 },
      { x: 1401, y: 317 },
      { x: 1358, y: 255 },
      { x: 1361, y: 224 },
      { x: 308, y: 218 },
      { x: 291, y: 247 },
      { x: 289, y: 294 },
      { x: 279, y: 318 },
      { x: 265, y: 346 },
      { x: 206, y: 356 },
      { x: 180, y: 369 },
      { x: 159, y: 405 },
      { x: 179, y: 468 },
      { x: 166, y: 502 },
      { x: 186, y: 561 },
      { x: 202, y: 579 },
      { x: 226, y: 547 },
      { x: 253, y: 586 },
      { x: 279, y: 563 },
      { x: 345, y: 624 },
      { x: 413, y: 656 },
      { x: 446, y: 668 },
      { x: 445, y: 753 },
      { x: 390, y: 753 },
      { x: 388, y: 945 },
      { x: -3, y: 934 },
      { x: -1, y: 637 }
    ]
  },
  {
    label: 'Sông - đoạn phải',
    points: [
      { x: 1051, y: 669 },
      { x: 1105, y: 649 },
      { x: 1148, y: 614 },
      { x: 1219, y: 535 },
      { x: 1333, y: 535 },
      { x: 1376, y: 537 },
      { x: 1398, y: 312 },
      { x: 1476, y: 256 },
      { x: 1675, y: 263 },
      { x: 1675, y: 659 },
      { x: 1673, y: 941 },
      { x: 1111, y: 947 },
      { x: 1112, y: 760 },
      { x: 1052, y: 760 }
    ]
  },
  {
    label: 'Khu mới 1',
    points: [
      { x: 488, y: 667 },
      { x: 625, y: 676 },
      { x: 672, y: 684 },
      { x: 778, y: 685 },
      { x: 933, y: 682 },
      { x: 1007, y: 666 },
      { x: 1009, y: 760 },
      { x: 925, y: 770 },
      { x: 884, y: 826 },
      { x: 869, y: 825 },
      { x: 826, y: 772 },
      { x: 788, y: 774 },
      { x: 645, y: 770 },
      { x: 549, y: 751 },
      { x: 488, y: 753 }
    ]
  },
  {
    label: 'Khu mới 2',
    points: [
      { x: 635, y: 393 },
      { x: 763, y: 393 },
      { x: 763, y: 501 },
      { x: 635, y: 501 }
    ]
  },
  {
    label: 'Khu mới 3',
    points: [
      { x: 995, y: 395 },
      { x: 1334, y: 395 },
      { x: 1334, y: 539 },
      { x: 995, y: 539 },
      { x: 995, y: 512 },
      { x: 1312, y: 513 },
      { x: 1312, y: 406 },
      { x: 1021, y: 407 },
      { x: 1022, y: 468 },
      { x: 995, y: 468 }
    ]
  }
]
