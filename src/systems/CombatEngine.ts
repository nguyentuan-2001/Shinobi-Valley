import Phaser from 'phaser'
import type { Skill } from '../data/types'
import type { Player } from '../entities/Player'
import type { Monster } from '../entities/Monster'
import type { SkillHotbar } from './SkillHotbar'
import { combatManager } from './CombatManager'
import { computeDamage } from './CombatSystem'

/** Đứng yên ≥ mốc này (ms) trước khi bắn mới tính "đã ngắm kỹ" — passive Cung Thủ "Nhãn Lực Tập Trung". */
const STATIONARY_AIM_MS = 1000

/** Sprint 11 (rút ra thành module dùng chung ở Sprint 12 khi có thêm 5 map chiến đấu mới — trước đó sống thẳng
 * trong `GrasslandScene.ts`, lặp lại y hệt sẽ tốn ~140 dòng × 6 scene) — động cơ chiến đấu data-driven dùng
 * chung cho CẢ 5 hệ vũ khí VÀ mọi map chiến đấu (Đồng Cỏ/Rừng Tre/Hang Động/Núi Tuyết/Rừng Thiêng/Rừng Cổ).
 * Không giữ state riêng gì ngoài tham chiếu tới scene/player/monsters/hotbar hiện tại — mỗi scene tự tạo 1
 * instance trong `create()` SAU KHI đã có `this.monsters` thật (constructor giữ tham chiếu mảng, không phải bản
 * sao — nếu scene gán lại `this.monsters` bằng mảng MỚI sau khi tạo `CombatEngine` thì instance sẽ cầm mảng cũ,
 * mọi scene hiện tại chỉ gán `this.monsters` đúng 1 lần trong `create()`). */
export class CombatEngine {
  private readonly scene: Phaser.Scene
  private readonly player: Player
  private readonly monsters: readonly Monster[]
  private readonly hotbar: SkillHotbar
  /** User yêu cầu: đi ngang qua map mà KHÔNG đánh quái nào thì quái cũng không đánh lại — chỉ khi người chơi
   * chủ động đánh trúng ít nhất 1 quái (`resolveOneHit()` chạy), MỌI quái trong map mới bắt đầu phát hiện/đuổi
   * theo/gây sát thương như bình thường. Reset về `false` mỗi lần vào lại map (instance mới mỗi `create()`,
   * đúng tinh thần "đi qua map" — không phải cờ toàn cục nhớ suốt cả phiên chơi). */
  private combatStarted = false

  constructor(
    scene: Phaser.Scene,
    player: Player,
    monsters: readonly Monster[],
    hotbar: SkillHotbar
  ) {
    this.scene = scene
    this.player = player
    this.monsters = monsters
    this.hotbar = hotbar
  }

  /** Scene gọi mỗi frame TRƯỚC khi cập nhật AI quái — truyền vào `Monster.updateAi()` để quyết định có cho phép
   * phát hiện/đuổi theo/gây sát thương hay không (xem docstring `combatStarted`). */
  hasCombatStarted(): boolean {
    return this.combatStarted
  }

  /** `skill: null` là đòn đánh thường (Space, multiplier 1.0 + hitbox melee mặc định); có `skill` là chiêu từ
   * hotbar (Enter). Chiêu `type: 'buff'` (Hào quang kiếm/Xạ điêu thủ/Bóng tối) KHÔNG gây damage — chỉ tự buff
   * bản thân rồi return sớm, không lặp hitbox/monster gì cả. Mọi chiêu còn lại (kể cả `debuff`/`ultimate`,
   * combat.md coi các loại này tương đương Active) lặp đúng `hits` lần (case 2 combat.md: mỗi hit tính
   * damage/crit/proc ĐỘC LẬP), mỗi lần quét TOÀN BỘ quái đang overlap hitbox (case 3: mỗi mục tiêu AOE nhận
   * riêng, không chia sẻ/giảm theo số lượng trúng). */
  handlePlayerAttack(skill: Skill | null): void {
    const now = this.scene.time.now

    if (skill?.type === 'buff') {
      combatManager.applyBuff(skill.buff_stat, skill.buff_value, skill.effect_duration * 1000, now)
      return
    }

    const hitbox = skill
      ? this.player.getSkillHitboxBounds(skill)
      : this.player.getAttackHitboxBounds()
    const damageMultiplier = skill?.damage_multiplier ?? 1
    const hits = skill ? Math.max(1, skill.hits) : 1
    const skillClass = combatManager.getWeaponSkillClass()

    for (let hit = 0; hit < hits; hit++) {
      for (const monster of this.monsters) {
        if (!monster.isAlive() || !Phaser.Geom.Rectangle.Overlaps(hitbox, monster.getBounds()))
          continue
        this.resolveOneHit(monster, damageMultiplier, skill, skillClass, now)
      }
    }

    // Cung Thủ Passive #9 "Bách Xạ Quán Nhật": mỗi 10 đòn ĐÁNH THƯỜNG tự bắn thêm 1 mũi tên miễn phí (100% ATK,
    // không tốn MP — đã tốn MP/không tốn gì từ lượt đánh gốc rồi, đây chỉ cộng thêm 1 lượt tính damage nữa).
    if (!skill && skillClass === 'archer') {
      const passive = combatManager.getActivePassive('free_shot_every_n_hits')
      if (passive && combatManager.getBasicAttackCount() % passive.passive_value === 0) {
        for (const monster of this.monsters) {
          if (!monster.isAlive() || !Phaser.Geom.Rectangle.Overlaps(hitbox, monster.getBounds()))
            continue
          this.resolveOneHit(monster, 1, null, skillClass, now)
        }
      }
    }
  }

  /** 1 hit độc lập lên 1 mục tiêu — tự tính crit (gốc + bonus điều kiện Cung Thủ "đứng yên" + `guaranteed_crit`
   * của Ultimate), tự cộng dmg% điều kiện (Def Down/debuff mục tiêu, combo đòn thường thứ 3), tự áp `effect` của
   * chiêu (nếu có) lên mục tiêu, tự roll 3 passive Proc (Kiếm Sĩ crit-stun, Song Kiếm lifesteal, Thương Sĩ slow
   * — 2 passive sau CHỈ áp cho đòn đánh thường theo đúng mô tả "đòn đánh thường: X% cơ hội..." trong combat.md),
   * và Ninja "Thân Ảnh Bất Định" (crit thì giảm cooldown mọi ô hotbar đang hồi). */
  private resolveOneHit(
    monster: Monster,
    damageMultiplier: number,
    skill: Skill | null,
    skillClass: string,
    now: number
  ): void {
    this.combatStarted = true
    const isBasicAttack = skill === null
    const atk = combatManager.getTotalAtk()

    let critChance = combatManager.getTotalCrit() / 100
    if (skillClass === 'archer' && this.player.getStationaryDurationMs() >= STATIONARY_AIM_MS) {
      const p = combatManager.getActivePassive('stationary_crit_percent')
      if (p) critChance += p.passive_value / 100
    }

    let totalMultiplier = damageMultiplier * combatManager.getWeaponMultiplier()
    if (skillClass === 'spearman' && monster.hasDefDown(now)) {
      const p = combatManager.getActivePassive('def_down_target_damage_percent')
      if (p) totalMultiplier *= 1 + p.passive_value / 100
    }
    if (skillClass === 'ninja' && monster.hasAnyStatusEffect(now)) {
      const p = combatManager.getActivePassive('debuffed_target_damage_percent')
      if (p) totalMultiplier *= 1 + p.passive_value / 100
    }
    if (isBasicAttack && skillClass === 'swordsman') {
      const p = combatManager.getActivePassive('combo_3rd_hit_damage_percent')
      if (p && combatManager.getBasicAttackCount() % 3 === 0) {
        totalMultiplier *= 1 + p.passive_value / 100
      }
    }

    const result = computeDamage(
      atk,
      totalMultiplier,
      monster.getDef(now),
      skill?.guaranteed_crit ? 1 : critChance
    )
    monster.takeDamage(result.damage)

    // `'atk_up'` chỉ dành cho buff tự thân (`type: 'buff'`, đã return sớm ở đầu `handlePlayerAttack()` nên
    // không bao giờ tới được đây) — loại trừ tường minh để khớp `StatusEffectType` (không nhận `'atk_up'`).
    if (skill?.effect && skill.effect !== 'atk_up') {
      monster.applyStatusEffect(
        skill.effect,
        skill.effect_duration,
        this.getEffectMagnitude(skill),
        now
      )
    }

    if (result.isCrit) {
      const stunPassive = combatManager.getActivePassive('crit_stun_chance')
      if (skillClass === 'swordsman' && stunPassive && Math.random() < stunPassive.proc_chance) {
        monster.applyStatusEffect('stun', stunPassive.passive_value, 0, now)
      }
      const cdrPassive = combatManager.getActivePassive('crit_cooldown_reduction_percent')
      if (skillClass === 'ninja' && cdrPassive) {
        this.hotbar.reduceAllCooldowns(cdrPassive.passive_value, now)
      }
    }

    if (isBasicAttack && skillClass === 'dual_swordsman') {
      const lifesteal = combatManager.getActivePassive('basic_attack_lifesteal_chance')
      if (lifesteal && Math.random() < lifesteal.proc_chance) {
        combatManager.heal(Math.round(result.damage * (lifesteal.passive_value / 100)))
      }
    }
    if (isBasicAttack && skillClass === 'spearman') {
      const slowProc = combatManager.getActivePassive('basic_attack_slow_chance')
      if (slowProc && Math.random() < slowProc.proc_chance) {
        monster.applyStatusEffect('slow', 3, slowProc.passive_value, now)
      }
    }
  }

  /** Độ lớn hiệu ứng áp lên mục tiêu từ 1 chiêu Active có `effect` — `skills.json` không có field riêng cho độ
   * lớn (chỉ có `effect`/`effect_duration`) vì combat.md ghi số ngay trong mô tả từng chiêu, không theo công
   * thức chung: DOT (Huyết kiếm Bleed, Tên lửa Burn) = 30% ATK/giây (đúng số Huyết kiếm ghi rõ, Tên lửa không
   * ghi riêng nên dùng chung); Phá giáp (def_down) = đúng 30% ghi trong combat.md. Chỉ 2 chiêu Active có `effect`
   * ở V1 nên hardcode tại đây thay vì thêm field data cho 2 trường hợp. */
  private getEffectMagnitude(skill: Skill): number {
    if (skill.effect === 'def_down') return 30
    if (skill.effect === 'poison' || skill.effect === 'bleed' || skill.effect === 'burn') {
      return combatManager.getTotalAtk() * 0.3
    }
    return 0
  }
}
