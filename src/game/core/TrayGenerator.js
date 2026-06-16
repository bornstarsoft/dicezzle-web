const DEFAULT_WEIGHTS = [
  { value: 1, weight: 42 },
  { value: 2, weight: 34 },
  { value: 3, weight: 20 },
  { value: 4, weight: 9 },
  { value: 5, weight: 4 },
  { value: 6, weight: 1 }
];

function hashSeed(seed) {
  let hash = 1779033703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return hash >>> 0;
  };
}

function makeRandom(seed) {
  let state = hashSeed(seed)();
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export class TrayGenerator {
  constructor(options = {}) {
    this.seed = options.seed ?? `classic-${Date.now()}`;
    this.weights = options.weights ?? DEFAULT_WEIGHTS;
    this.traySize = options.traySize ?? 3;
    this.earlyTurnCount = options.earlyTurnCount ?? 8;
    this.earlyTurnMaxValue = options.earlyTurnMaxValue ?? 3;
    this.random = makeRandom(this.seed);
  }

  nextTray({ turn = 1 } = {}) {
    return Array.from({ length: this.traySize }, () => ({
      value: this.pickValue(turn),
      id: cryptoSafeId(this.random)
    }));
  }

  pickValue(turn) {
    const pool = this.weights.filter((entry) => turn <= this.earlyTurnCount ? entry.value <= this.earlyTurnMaxValue : true);
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = this.random() * total;
    for (const entry of pool) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.value;
      }
    }
    return pool[pool.length - 1].value;
  }
}

function cryptoSafeId(random) {
  return Math.floor(random() * 1_000_000_000).toString(36);
}
