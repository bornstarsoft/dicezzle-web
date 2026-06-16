import { DiceModel } from './DiceModel.js';
import { ScoreModel, defaultScoringConfig } from './ScoreModel.js';

const ORTHOGONAL_DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 }
];

export class MergeResolver {
  constructor(scoringConfig = defaultScoringConfig) {
    this.score = new ScoreModel(scoringConfig);
    this.chainLimit = 20;
  }

  resolveAll(board, placedCell) {
    const result = {
      events: [],
      scoreDelta: 0,
      highestDie: this.findHighestDie(board),
      starsCreated: 0,
      starClears: 0,
      bestChain: 0
    };

    let activeCell = placedCell;
    for (let chain = 1; chain <= this.chainLimit; chain += 1) {
      const group = this.findMergeGroup(board, activeCell);
      if (!group) {
        break;
      }

      const target = this.chooseMergeTarget(group, activeCell);
      const value = board.getCellValue(group[0].row, group[0].col);
      result.bestChain = Math.max(result.bestChain, chain);

      if (value === 'star') {
        this.clearStarGroupAndArea(board, group, target);
        const score = this.score.starClearScore();
        result.scoreDelta += score;
        result.starClears += 1;
        result.events.push({
          type: 'starClear',
          value,
          groupSize: group.length,
          target,
          chain,
          score
        });
        activeCell = target;
        continue;
      }

      const createdValue = DiceModel.nextValue(value);
      for (const cell of group) {
        board.clearCell(cell.row, cell.col);
      }
      board.setCell(target.row, target.col, createdValue);

      const score = this.score.mergeScore(value, chain);
      result.scoreDelta += score;
      if (createdValue === 'star') {
        result.starsCreated += 1;
      }
      result.highestDie = this.maxDie(result.highestDie, createdValue);
      result.events.push({
        type: 'merge',
        value,
        createdValue,
        groupSize: group.length,
        target,
        chain,
        score
      });
      activeCell = target;
    }

    return result;
  }

  findMergeGroup(board, activeCell) {
    if (activeCell) {
      const activeValue = board.getCellValue(activeCell.row, activeCell.col);
      if (activeValue !== null) {
        const activeGroup = this.collectGroup(board, activeCell.row, activeCell.col, activeValue);
        if (activeGroup.length >= 3) {
          return activeGroup;
        }
      }
    }

    const visited = new Set();
    for (let row = 0; row < board.size; row += 1) {
      for (let col = 0; col < board.size; col += 1) {
        const key = `${row},${col}`;
        const value = board.getCellValue(row, col);
        if (visited.has(key) || value === null) {
          continue;
        }
        const group = this.collectGroup(board, row, col, value);
        group.forEach((cell) => visited.add(`${cell.row},${cell.col}`));
        if (group.length >= 3) {
          return group;
        }
      }
    }

    return null;
  }

  collectGroup(board, row, col, value) {
    const group = [];
    const visited = new Set();
    const stack = [{ row, col }];

    while (stack.length > 0) {
      const current = stack.pop();
      const key = `${current.row},${current.col}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      try {
        if (board.getCellValue(current.row, current.col) !== value) {
          continue;
        }
      } catch {
        continue;
      }

      group.push(current);
      for (const direction of ORTHOGONAL_DIRECTIONS) {
        stack.push({ row: current.row + direction.row, col: current.col + direction.col });
      }
    }

    return group.sort((a, b) => a.row - b.row || a.col - b.col);
  }

  chooseMergeTarget(group, placedCell) {
    if (placedCell && group.some((cell) => cell.row === placedCell.row && cell.col === placedCell.col)) {
      return { row: placedCell.row, col: placedCell.col };
    }

    const center = group.reduce(
      (sum, cell) => ({ row: sum.row + cell.row, col: sum.col + cell.col }),
      { row: 0, col: 0 }
    );
    center.row /= group.length;
    center.col /= group.length;

    return [...group].sort((a, b) => {
      const distanceA = Math.abs(a.row - center.row) + Math.abs(a.col - center.col);
      const distanceB = Math.abs(b.row - center.row) + Math.abs(b.col - center.col);
      return distanceA - distanceB || a.row - b.row || a.col - b.col;
    })[0];
  }

  clearStarGroupAndArea(board, group, target) {
    for (const cell of group) {
      board.clearCell(cell.row, cell.col);
    }

    for (let row = target.row - 1; row <= target.row + 1; row += 1) {
      for (let col = target.col - 1; col <= target.col + 1; col += 1) {
        if (row >= 0 && col >= 0 && row < board.size && col < board.size) {
          board.clearCell(row, col);
        }
      }
    }
  }

  findHighestDie(board) {
    let highest = 1;
    board.forEachCell((cell) => {
      if (cell) {
        highest = this.maxDie(highest, cell.value);
      }
    });
    return highest;
  }

  maxDie(left, right) {
    return DiceModel.rankValue(right) > DiceModel.rankValue(left) ? right : left;
  }
}
