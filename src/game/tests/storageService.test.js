import { describe, expect, test } from 'vitest';
import { StorageService, STORAGE_KEYS } from '../core/StorageService.js';

function createMemoryStorage(seed = {}) {
  const store = { ...seed };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    store
  };
}

describe('StorageService result records', () => {
  test('saves best score and supporting local result records', () => {
    const memory = createMemoryStorage({
      [STORAGE_KEYS.bestScore]: '900',
      [STORAGE_KEYS.bestStars]: '1',
      [STORAGE_KEYS.bestStarClears]: '0',
      [STORAGE_KEYS.bestChain]: '2'
    });
    const storage = new StorageService(memory);

    const records = storage.saveResultRecords({
      score: 12840,
      starsCreated: 3,
      starClears: 1,
      bestChain: 4
    });

    expect(records).toEqual({
      bestScore: 12840,
      bestStars: 3,
      bestStarClears: 1,
      bestChain: 4,
      newBestScore: true
    });
    expect(memory.store[STORAGE_KEYS.bestScore]).toBe('12840');
    expect(memory.store[STORAGE_KEYS.bestStars]).toBe('3');
    expect(memory.store[STORAGE_KEYS.bestStarClears]).toBe('1');
    expect(memory.store[STORAGE_KEYS.bestChain]).toBe('4');
  });

  test('does not lower saved personal records', () => {
    const memory = createMemoryStorage({
      [STORAGE_KEYS.bestScore]: '20000',
      [STORAGE_KEYS.bestStars]: '5',
      [STORAGE_KEYS.bestStarClears]: '2',
      [STORAGE_KEYS.bestChain]: '6'
    });
    const storage = new StorageService(memory);

    const records = storage.saveResultRecords({
      score: 12840,
      starsCreated: 3,
      starClears: 1,
      bestChain: 4
    });

    expect(records).toEqual({
      bestScore: 20000,
      bestStars: 5,
      bestStarClears: 2,
      bestChain: 6,
      newBestScore: false
    });
  });
});
