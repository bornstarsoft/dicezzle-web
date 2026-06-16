export const defaultScoringConfig = {
  place: 1,
  merge: {
    1: 30,
    2: 60,
    3: 120,
    4: 240,
    5: 480,
    6: 960
  },
  starClear: 2000,
  chainMultipliers: [1, 1.5, 2, 3]
};

export class ScoreModel {
  constructor(config = defaultScoringConfig) {
    this.config = config;
  }

  placeScore() {
    return this.config.place;
  }

  chainMultiplier(chain) {
    const index = Math.max(0, Math.min(this.config.chainMultipliers.length - 1, chain - 1));
    return this.config.chainMultipliers[index];
  }

  mergeScore(value, chain) {
    const base = this.config.merge[value] ?? 0;
    return Math.round(base * this.chainMultiplier(chain));
  }

  starClearScore() {
    return this.config.starClear;
  }

  static formatScore(score) {
    return new Intl.NumberFormat('en-US').format(score);
  }
}
