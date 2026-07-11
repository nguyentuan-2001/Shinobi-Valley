import type { SkillEffect } from '../data/types'

/** 6 loại hiệu ứng trạng thái theo `docs/gameplay/combat.md`/`docs/gameplay/mechanics.md` mục "Quy tắc Hiệu ứng
 * Trạng thái" — bỏ `'atk_up'`/`null` khỏi `SkillEffect` gốc vì đó là buff tự thân (xem `BuffStat` ở
 * `data/types.ts`), không phải hiệu ứng áp lên MỤC TIÊU bị đánh trúng mà tracker này quản lý. */
export type StatusEffectType = Exclude<SkillEffect, 'atk_up' | null>

const DOT_TYPES: readonly StatusEffectType[] = ['poison', 'bleed', 'burn']
const DOT_TICK_INTERVAL_MS = 1000

interface ActiveEffect {
  expiresAt: number
  /** % cho `slow`/`def_down`; sát thương MỖI GIÂY cho DOT (`poison`/`bleed`/`burn`); không dùng cho `stun`. */
  magnitude: number
  lastTickAt: number
}

/** Theo dõi hiệu ứng trạng thái của 1 mục tiêu (Sprint 11) — dùng cho `Monster` (V1 chưa có quái/skill nào áp
 * hiệu ứng NGƯỢC lên người chơi, chỉ 1 chiều player→quái). Case 9 combat.md: áp lại hiệu ứng CÙNG LOẠI trong lúc
 * đang tồn tại chỉ LÀM MỚI thời gian/độ mạnh (ghi đè `Map.set()`), không cộng dồn — mỗi loại tối đa 1 instance
 * tại 1 thời điểm. */
export class StatusEffectTracker {
  private readonly effects = new Map<StatusEffectType, ActiveEffect>()

  apply(type: StatusEffectType, durationMs: number, magnitude: number, now: number): void {
    this.effects.set(type, { expiresAt: now + durationMs, magnitude, lastTickAt: now })
  }

  private has(type: StatusEffectType, now: number): boolean {
    const effect = this.effects.get(type)
    return effect !== undefined && effect.expiresAt > now
  }

  isStunned(now: number): boolean {
    return this.has('stun', now)
  }

  /** Hệ số còn lại sau khi trừ Slow (vd 0.7 nếu đang Slow 30%) — nhân thẳng vào tốc độ di chuyển gốc. */
  getSlowSpeedMultiplier(now: number): number {
    const effect = this.effects.get('slow')
    if (!effect || effect.expiresAt <= now) return 1
    return Math.max(0, 1 - effect.magnitude / 100)
  }

  /** Hệ số DEF còn lại sau khi trừ Def Down (vd 0.7 nếu đang giảm 30% DEF) — nhân thẳng vào DEF gốc trước khi
   * tính damage, xem `Monster.getDef()`. */
  getDefDownMultiplier(now: number): number {
    const effect = this.effects.get('def_down')
    if (!effect || effect.expiresAt <= now) return 1
    return Math.max(0, 1 - effect.magnitude / 100)
  }

  hasDefDown(now: number): boolean {
    return this.has('def_down', now)
  }

  /** Case 5 (Ninja Passive Sát thương "Độc Ảnh Thích Sát"): mục tiêu đang dính BẤT KỲ debuff nào (kể cả Stun,
   * không riêng 5 loại DOT/Slow/DefDown — combat.md liệt kê "poison/bleed/slow/stun/burn" là các debuff hợp lệ,
   * def_down cũng tính vì cùng nhóm hiệu ứng trạng thái). */
  hasAnyActiveEffect(now: number): boolean {
    for (const effect of this.effects.values()) {
      if (effect.expiresAt > now) return true
    }
    return false
  }

  /** Gọi mỗi frame từ entity sở hữu (`Monster.updateAi()`) — tick sát thương DOT (Poison/Bleed/Burn) đúng mỗi
   * `DOT_TICK_INTERVAL_MS`, tự dọn hiệu ứng đã hết hạn. Trả tổng sát thương DOT cần trừ HP frame này (0 nếu
   * chưa tới hạn tick nào) — case 6 combat.md ("DOT đang tick mà mục tiêu chết: dừng ngay") tự đúng vì
   * `Monster.takeDamage()` đã chặn khi `deadState`, tracker này không cần biết mục tiêu còn sống hay không. */
  update(now: number): number {
    let totalTick = 0
    for (const [type, effect] of this.effects) {
      if (effect.expiresAt <= now) {
        this.effects.delete(type)
        continue
      }
      if (DOT_TYPES.includes(type) && now - effect.lastTickAt >= DOT_TICK_INTERVAL_MS) {
        totalTick += effect.magnitude
        effect.lastTickAt = now
      }
    }
    return totalTick
  }
}
