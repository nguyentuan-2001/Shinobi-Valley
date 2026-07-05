import type { SaveState } from '../data/types'

const SAVE_KEY = 'shinobi_valley_save'

export function createDefaultSaveState(): SaveState {
  return {
    player_id: 'p001',
    gender: 'male',
    farm_tiles: [],
    animals: [],
    buildings_built: [],
    farm_decorations: []
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
