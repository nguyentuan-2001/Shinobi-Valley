import type { SaveState } from '../data/types'

const SAVE_KEY = 'shinobi_valley_save'

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
      gold: 0,
      weapon_id: 'iron_sword'
    }
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
