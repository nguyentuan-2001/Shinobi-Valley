/** Vị trí 5 Người Rơm (Training Dummy) trong Bãi Tập Luyện — đúng pattern `wellPlacement.ts`/`farmTiles.ts`:
 * toạ độ cố định gắn với 1 map cụ thể thì để ở `src/data/`, KHÔNG thêm vào `monsters.json` (Người Rơm không
 * phải kẻ địch thật, xem `docs/gameplay/mechanics.md` mục "Người Rơm (Training Dummy)"). Map placeholder hiện
 * tại (`TrainingGroundScene`) kích thước 700×550 — rải đều tránh vùng player spawn (350,480) và Exit Zone về
 * Farm (290-410, 505-545, xem `data/mapTransitions.ts`). */
export interface TrainingDummyPlacement {
  id: number
  x: number
  y: number
}

export const TRAINING_DUMMY_PLACEMENTS: TrainingDummyPlacement[] = [
  { id: 0, x: 150, y: 160 },
  { id: 1, x: 350, y: 110 },
  { id: 2, x: 550, y: 160 },
  { id: 3, x: 220, y: 320 },
  { id: 4, x: 480, y: 320 }
]
