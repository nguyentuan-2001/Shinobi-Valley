/** Công thức sát thương dùng chung cho mọi trường hợp đánh nhau (player->quái, player->Người Rơm bỏ qua kết
 * quả số vì Người Rơm chỉ đếm hit — xem `TrainingDummy.ts`) — đúng `docs/gameplay/mechanics.md` mục "Công thức
 * sát thương" + case 1 ở `docs/gameplay/combat.md` mục "Case xử lý khi chiến đấu". */

const CRIT_MULTIPLIER = 1.5
const MIN_DAMAGE = 1

export interface DamageResult {
  damage: number
  isCrit: boolean
}

/** `damage_multiplier` mặc định 1.0 cho đòn đánh thường (Sprint 5 chỉ có đòn thường, chưa có hệ skill/hotbar
 * thật — xem ghi chú trong progress.md). `critChance` là số 0-1 (vd 0.05 = 5%). */
export function computeDamage(
  atk: number,
  damageMultiplier: number,
  def: number,
  critChance: number
): DamageResult {
  const base = atk * damageMultiplier * (100 / (100 + def))
  const isCrit = Math.random() < critChance
  const raw = isCrit ? base * CRIT_MULTIPLIER : base
  return { damage: Math.max(MIN_DAMAGE, Math.round(raw)), isCrit }
}
