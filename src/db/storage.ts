import { openDB, type IDBPDatabase } from 'idb';
import type { GameState } from '../types/game';

const DB_NAME = 'kps-db';
const DB_VERSION = 1;
const STORE_SAVES = 'saves';
const STORE_META = 'meta';

let _db: IDBPDatabase | null = null;

async function db(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE_SAVES)) {
        d.createObjectStore(STORE_SAVES, { keyPath: 'id' });
      }
      if (!d.objectStoreNames.contains(STORE_META)) {
        d.createObjectStore(STORE_META);
      }
    },
  });
  return _db;
}

export interface SaveSlot {
  id: string;
  name: string;
  updatedAt: string;
  state: GameState;
}

export async function listSaves(): Promise<SaveSlot[]> {
  const d = await db();
  const all = await d.getAll(STORE_SAVES);
  return all.sort((a: SaveSlot, b: SaveSlot) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveSlot(slot: SaveSlot): Promise<void> {
  const d = await db();
  await d.put(STORE_SAVES, slot);
}

export async function loadSlot(id: string): Promise<SaveSlot | undefined> {
  const d = await db();
  return d.get(STORE_SAVES, id);
}

export async function deleteSlot(id: string): Promise<void> {
  const d = await db();
  await d.delete(STORE_SAVES, id);
}

// --- light state cache in localStorage for fastest reload ---
const LS_KEY = 'kps-current';
const LS_SETTINGS = 'kps-settings';

export function saveCurrent(state: GameState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    localStorage.setItem(LS_SETTINGS, JSON.stringify(state.settings));
  } catch (e) {
    console.warn('localStorage save failed', e);
  }
}

export function loadCurrent(): GameState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearCurrent(): void {
  localStorage.removeItem(LS_KEY);
}

export function loadSettings(): Partial<GameState['settings']> | null {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
