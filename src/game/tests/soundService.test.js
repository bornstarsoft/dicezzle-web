import { describe, expect, test } from 'vitest';
import { SoundService } from '../core/SoundService.js';

class FakeAudioParam {
  constructor(value = 0) {
    this.value = value;
    this.events = [];
  }

  cancelScheduledValues(time) {
    this.events.push(['cancel', time]);
  }

  setValueAtTime(value, time) {
    this.value = value;
    this.events.push(['set', value, time]);
  }

  linearRampToValueAtTime(value, time) {
    this.value = value;
    this.events.push(['linear', value, time]);
  }

  exponentialRampToValueAtTime(value, time) {
    this.value = value;
    this.events.push(['exponential', value, time]);
  }
}

class FakeAudioNode {
  constructor() {
    this.connectedTo = null;
  }

  connect(destination) {
    this.connectedTo = destination;
    return destination;
  }

  disconnect() {
    this.connectedTo = null;
  }
}

class FakeOscillator extends FakeAudioNode {
  constructor(context) {
    super();
    this.context = context;
    this.frequency = new FakeAudioParam(440);
    this.type = 'sine';
    this.started = false;
    this.stopped = false;
  }

  start(time) {
    this.started = true;
    this.startTime = time;
  }

  stop(time) {
    this.stopped = true;
    this.stopTime = time;
  }
}

class FakeGain extends FakeAudioNode {
  constructor() {
    super();
    this.gain = new FakeAudioParam(1);
  }
}

class FakeAudioContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 1;
    this.destination = new FakeAudioNode();
    this.oscillators = [];
    this.gains = [];
    this.resumeCalls = 0;
  }

  async resume() {
    this.resumeCalls += 1;
    this.state = 'running';
  }

  createOscillator() {
    const oscillator = new FakeOscillator(this);
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
}

function audibleDuration(oscillator) {
  return Number((oscillator.stopTime - oscillator.startTime - 0.02).toFixed(3));
}

function peakVolume(gain) {
  return Math.max(
    ...gain.gain.events
      .filter((event) => event[0] === 'linear')
      .map((event) => event[1]),
    0
  );
}

describe('SoundService', () => {
  test('stays silent and avoids creating audio context while disabled', () => {
    let createdContexts = 0;
    const sound = new SoundService({
      audioContextFactory: () => {
        createdContexts += 1;
        return new FakeAudioContext();
      }
    });

    expect(sound.isEnabled()).toBe(false);
    expect(sound.playPlace()).toBe(false);
    expect(sound.playMerge(4)).toBe(false);
    expect(createdContexts).toBe(0);
  });

  test('unlocks audio from a user gesture and plays confirmation while enabled', async () => {
    const context = new FakeAudioContext();
    const sound = new SoundService({
      audioContextFactory: () => context
    });

    sound.setEnabled(true);
    const unlocked = await sound.unlock({ confirm: true });

    expect(unlocked).toBe(true);
    expect(sound.isEnabled()).toBe(true);
    expect(context.resumeCalls).toBe(1);
    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators.every((oscillator) => oscillator.started && oscillator.stopped)).toBe(true);
  });

  test('play methods are short no-ops after sound is turned off', async () => {
    const context = new FakeAudioContext();
    const sound = new SoundService({
      audioContextFactory: () => context,
      enabled: true
    });
    await sound.unlock();

    expect(sound.playPlace()).toBe(true);
    sound.setEnabled(false);
    expect(sound.playStarClear()).toBe(false);
    expect(sound.playGameOver()).toBe(false);
    expect(context.oscillators.length).toBeGreaterThan(0);
  });

  test('stack layer and merge complete sounds are silent while disabled', () => {
    let createdContexts = 0;
    const sound = new SoundService({
      audioContextFactory: () => {
        createdContexts += 1;
        return new FakeAudioContext();
      }
    });

    expect(sound.playStackLayer(1, 3)).toBe(false);
    expect(sound.playMergeComplete({ valueBefore: 2, valueAfter: 3, groupSize: 3 })).toBe(false);
    expect(createdContexts).toBe(0);
  });

  test('stack layer and merge complete sounds schedule distinct tone patterns', async () => {
    const context = new FakeAudioContext();
    const sound = new SoundService({
      audioContextFactory: () => context,
      enabled: true
    });
    await sound.unlock();

    expect(sound.playStackLayer(1, 4)).toBe(true);
    const afterStack = context.oscillators.length;
    expect(afterStack).toBeGreaterThan(0);

    expect(sound.playMergeComplete({ valueBefore: 5, valueAfter: 6, groupSize: 5 })).toBe(true);
    expect(context.oscillators.length).toBeGreaterThan(afterStack);
  });

  test('stack layer ticks are long and present enough for mobile speakers', async () => {
    const context = new FakeAudioContext();
    const sound = new SoundService({
      audioContextFactory: () => context,
      enabled: true
    });
    await sound.unlock();

    const before = context.oscillators.length;
    expect(sound.playStackLayer(2, 4)).toBe(true);

    const oscillators = context.oscillators.slice(before);
    const gains = context.gains.slice(before);
    expect(oscillators).toHaveLength(2);
    expect(Math.max(...oscillators.map(audibleDuration))).toBeGreaterThanOrEqual(0.055);
    expect(Math.max(...gains.map(peakVolume))).toBeGreaterThanOrEqual(0.065);
  });

  test('merge complete sound is a clearly stronger upgrade cue than stack ticks', async () => {
    const context = new FakeAudioContext();
    const sound = new SoundService({
      audioContextFactory: () => context,
      enabled: true
    });
    await sound.unlock();

    const before = context.oscillators.length;
    expect(sound.playMergeComplete({ valueBefore: 5, valueAfter: 6, groupSize: 5 })).toBe(true);

    const oscillators = context.oscillators.slice(before);
    const gains = context.gains.slice(before);
    expect(oscillators.length).toBeGreaterThanOrEqual(3);
    expect(Math.max(...oscillators.map(audibleDuration))).toBeGreaterThanOrEqual(0.09);
    expect(Math.max(...gains.map(peakVolume))).toBeGreaterThanOrEqual(0.075);
  });
});
