const STORAGE_KEYS = {
  bestScore: 'dicezzle.bestScore',
  soundEnabled: 'dicezzle.soundEnabled',
  tutorialDismissed: 'dicezzle.tutorialDismissed',
  totalGames: 'dicezzle.totalGames',
  lastResult: 'dicezzle.lastResult'
};

export class StorageService {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }

  getNumber(key, fallback = 0) {
    const value = this.storage?.getItem(key);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  getBoolean(key, fallback = false) {
    const value = this.storage?.getItem(key);
    if (value === null || value === undefined) {
      return fallback;
    }
    return value === 'true';
  }

  setBoolean(key, value) {
    this.storage?.setItem(key, value ? 'true' : 'false');
  }

  getBestScore() {
    return this.getNumber(STORAGE_KEYS.bestScore, 0);
  }

  saveBestScore(score) {
    const best = Math.max(this.getBestScore(), score);
    this.storage?.setItem(STORAGE_KEYS.bestScore, String(best));
    return best;
  }

  isSoundEnabled() {
    return this.getBoolean(STORAGE_KEYS.soundEnabled, false);
  }

  setSoundEnabled(enabled) {
    this.setBoolean(STORAGE_KEYS.soundEnabled, enabled);
  }

  isTutorialDismissed() {
    return this.getBoolean(STORAGE_KEYS.tutorialDismissed, false);
  }

  dismissTutorial() {
    this.setBoolean(STORAGE_KEYS.tutorialDismissed, true);
  }

  incrementTotalGames() {
    const next = this.getNumber(STORAGE_KEYS.totalGames, 0) + 1;
    this.storage?.setItem(STORAGE_KEYS.totalGames, String(next));
    return next;
  }

  saveLastResult(result) {
    this.storage?.setItem(STORAGE_KEYS.lastResult, JSON.stringify(result));
  }
}

export { STORAGE_KEYS };
