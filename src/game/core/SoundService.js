const DEFAULT_VOLUME = 0.12;

function createDefaultAudioContext() {
  const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
}

export class SoundService {
  constructor({ enabled = false, audioContextFactory = createDefaultAudioContext } = {}) {
    this.enabled = Boolean(enabled);
    this.audioContextFactory = audioContextFactory;
    this.context = null;
    this.unlocked = false;
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.unlocked = false;
    }
  }

  async unlock({ confirm = false } = {}) {
    if (!this.enabled) {
      return false;
    }

    const context = this.ensureContext();
    if (!context) {
      return false;
    }

    try {
      if (context.state === 'suspended' && typeof context.resume === 'function') {
        await context.resume();
      }
      this.unlocked = context.state !== 'suspended';
      if (confirm && this.unlocked) {
        this.playPattern([
          { frequency: 520, start: 0, duration: 0.045, volume: 0.08 },
          { frequency: 760, start: 0.052, duration: 0.055, volume: 0.075 }
        ]);
      }
      return this.unlocked;
    } catch {
      this.unlocked = false;
      return false;
    }
  }

  playPlace() {
    return this.playPattern([
      { frequency: 420, start: 0, duration: 0.038, volume: 0.07 },
      { frequency: 590, start: 0.035, duration: 0.045, volume: 0.055 }
    ], { type: 'triangle' });
  }

  playInvalidDrop() {
    return this.playPattern([
      { frequency: 150, start: 0, duration: 0.07, volume: 0.055 }
    ], { type: 'sine' });
  }

  playMerge(groupSize = 3) {
    const rich = groupSize >= 5;
    const medium = groupSize >= 4;
    return this.playPattern([
      { frequency: medium ? 360 : 330, start: 0, duration: 0.05, volume: 0.07 },
      { frequency: rich ? 620 : 520, start: 0.046, duration: 0.06, volume: 0.072 },
      ...(rich ? [{ frequency: 820, start: 0.095, duration: 0.065, volume: 0.06 }] : [])
    ], { type: 'triangle' });
  }

  playStackLayer(layerIndex = 1, totalLayers = 3) {
    const clampedLayer = Math.max(1, Math.min(layerIndex, 6));
    const clampedTotal = Math.max(3, Math.min(totalLayers, 8));
    const baseFrequency = 235 + clampedLayer * 32 + clampedTotal * 4;
    return this.playPattern([
      { frequency: baseFrequency, start: 0, duration: 0.026, volume: 0.045 },
      { frequency: baseFrequency * 1.52, start: 0.018, duration: 0.032, volume: 0.032 }
    ], { type: 'triangle' });
  }

  playMergeComplete({ valueBefore = 1, valueAfter = null, groupSize = 3, starClear = false } = {}) {
    if (starClear) {
      return this.playStarClear();
    }
    if (valueAfter === 'star') {
      return this.playStarCreated();
    }

    const valueRank = Number.isFinite(Number(valueBefore)) ? Number(valueBefore) : 3;
    const rich = groupSize >= 5;
    const medium = groupSize >= 4;
    const base = 390 + Math.max(1, Math.min(valueRank, 6)) * 34;
    return this.playPattern([
      { frequency: base, start: 0, duration: 0.045, volume: 0.064 },
      { frequency: base * (medium ? 1.42 : 1.34), start: 0.042, duration: 0.068, volume: 0.066 },
      ...(rich ? [{ frequency: base * 1.76, start: 0.095, duration: 0.072, volume: 0.048 }] : [])
    ], { type: 'triangle' });
  }

  playStarCreated() {
    return this.playPattern([
      { frequency: 640, start: 0, duration: 0.05, volume: 0.08 },
      { frequency: 880, start: 0.052, duration: 0.075, volume: 0.075 },
      { frequency: 1175, start: 0.11, duration: 0.09, volume: 0.055 }
    ], { type: 'sine' });
  }

  playStarClear() {
    return this.playPattern([
      { frequency: 523, start: 0, duration: 0.06, volume: 0.075 },
      { frequency: 784, start: 0.045, duration: 0.08, volume: 0.07 },
      { frequency: 1046, start: 0.105, duration: 0.1, volume: 0.055 }
    ], { type: 'sine' });
  }

  playGameOver() {
    return this.playPattern([
      { frequency: 330, start: 0, duration: 0.08, volume: 0.055 },
      { frequency: 247, start: 0.075, duration: 0.11, volume: 0.05 }
    ], { type: 'sine' });
  }

  ensureContext() {
    if (this.context) {
      return this.context;
    }
    try {
      this.context = this.audioContextFactory?.() ?? null;
    } catch {
      this.context = null;
    }
    return this.context;
  }

  canPlay() {
    return Boolean(this.enabled && this.context && this.unlocked && this.context.state !== 'suspended');
  }

  playPattern(notes, options = {}) {
    if (!this.canPlay()) {
      return false;
    }

    notes.forEach((note) => this.playTone(note, options));
    return notes.length > 0;
  }

  playTone({ frequency, start = 0, duration = 0.08, volume = DEFAULT_VOLUME }, { type = 'sine' } = {}) {
    const context = this.context;
    if (!context) {
      return;
    }

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const startTime = now + start;
      const endTime = startTime + duration;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.cancelScheduledValues(startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + Math.min(0.018, duration * 0.35));
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.02);
    } catch {
      // Sound is optional; failed playback should never disturb the game.
    }
  }
}
