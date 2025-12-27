import type { GameState } from './types';

const STORAGE_KEY = 'love_emulator_save_v1';

export class PersistenceManager {
    saveGame(state: GameState): boolean {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY, serialized);
            console.log("Game saved successfully.");
            return true;
        } catch (e) {
            console.error("Failed to save game:", e);
            return false;
        }
    }

    loadGame(): GameState | null {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY);
            if (!serialized) return null;
            return JSON.parse(serialized) as GameState;
        } catch (e) {
            console.error("Failed to load game:", e);
            return null;
        }
    }

    clearSave(): void {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
}

export const persistenceManager = new PersistenceManager();
