import { DiceModel } from './DiceModel.js';

export class RankModel {
  static getRank(result) {
    const score = result.score ?? 0;
    const highest = DiceModel.rankValue(result.highestDie ?? 1);
    const starsCreated = result.starsCreated ?? 0;
    const starClears = result.starClears ?? 0;
    const bestChain = result.bestChain ?? 1;

    if (score >= 15000 && starsCreated >= 5 && starClears >= 3) {
      return 'Dicezzle Pro';
    }
    if (starClears >= 1 || score >= 7500) {
      return 'Star Clearer';
    }
    if (starsCreated >= 1 || highest >= 7 || score >= 4000) {
      return 'Star Maker';
    }
    if (highest >= 6 || score >= 2000) {
      return 'Six Master';
    }
    if (bestChain >= 2 || highest >= 4 || score >= 800) {
      return 'Chain Builder';
    }
    if (highest >= 3 || score >= 300) {
      return 'Clever Roller';
    }
    return 'Beginner Roller';
  }
}
