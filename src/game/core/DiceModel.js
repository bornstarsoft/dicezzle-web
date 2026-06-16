export const DICE_VALUES = [1, 2, 3, 4, 5, 6, 'star'];

const DICE_LABELS = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
  star: '⭐'
};

export class DiceModel {
  static isValidValue(value) {
    return DICE_VALUES.includes(value);
  }

  static nextValue(value) {
    if (value === 'star') {
      return null;
    }
    if (!Number.isInteger(value) || value < 1 || value > 6) {
      throw new Error(`Invalid die value: ${value}`);
    }
    return value === 6 ? 'star' : value + 1;
  }

  static label(value) {
    return DICE_LABELS[value] ?? String(value);
  }

  static rankValue(value) {
    return value === 'star' ? 7 : Number(value);
  }
}
