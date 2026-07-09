import type { SaveState } from '../data/types'

const SAVE_KEY = 'shinobi_valley_save'

/** Toạ độ spawn mặc định của Farm (khớp `data?.spawnX ?? 890, data?.spawnY ?? 430` trong `GameScene.create()`)
 * — dùng làm `player_position` mặc định khi chưa từng lưu save nào. */
const DEFAULT_SPAWN = { x: 890, y: 430 }

export function createDefaultSaveState(): SaveState {
  return {
    player_id: 'p001',
    gender: 'male',
    farm_tiles: [],
    animals: [],
    buildings_built: [],
    farm_decorations: [],
    player_stats: {
      level: 1,
      exp: 0,
      exp_to_next: 100,
      hp: 500,
      max_hp: 500,
      mp: 200,
      max_mp: 200,
      atk: 10,
      def: 5,
      move_speed: 100,
      crit: 2,
      attack_speed: 1.0,
      luck: 1,
      gold: 0,
      weapon_id: 'iron_sword',
      free_points: 0,
      equipped_armor: {
        head: null,
        chest: null,
        hands: null,
        feet: null,
        ring: null,
        necklace: null
      }
    },
    inventory: [],
    game_time: { day: 1, hour: 6 },
    player_position: { scene: 'GameScene', x: DEFAULT_SPAWN.x, y: DEFAULT_SPAWN.y }
  }
}

export function hasSaveGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function saveGame(state: SaveState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state))
}

export function loadGame(): SaveState | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  return JSON.parse(raw) as SaveState
}

export function clearSaveGame(): void {
  localStorage.removeItem(SAVE_KEY)
}
