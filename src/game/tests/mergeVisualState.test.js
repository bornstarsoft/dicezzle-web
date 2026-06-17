import { describe, expect, test } from 'vitest';
import { BoardModel } from '../core/BoardModel.js';
import { applyMergeVisualEvent, createHiddenCellSet, hideMergeSourceCell, isCellHidden } from '../ui/MergeVisualState.js';

describe('MergeVisualState', () => {
  test('keeps old dice until the merge event is visually committed', () => {
    const board = new BoardModel(5);
    board.setCell(0, 0, 1);
    board.setCell(0, 1, 1);
    board.setCell(0, 2, 1);

    const beforeCommit = board.clone();
    applyMergeVisualEvent(board, {
      type: 'merge',
      createdValue: 2,
      group: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
      target: { row: 0, col: 1 }
    });

    expect(beforeCommit.toJSON()[0].slice(0, 3)).toEqual([1, 1, 1]);
    expect(board.toJSON()[0].slice(0, 3)).toEqual([null, 2, null]);
  });

  test('visually commits star clear only after the star clear animation phase', () => {
    const board = new BoardModel(5);
    board.setCell(1, 1, 'star');
    board.setCell(1, 2, 'star');
    board.setCell(2, 1, 'star');
    board.setCell(2, 2, 6);

    applyMergeVisualEvent(board, {
      type: 'starClear',
      group: [{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 }],
      target: { row: 1, col: 1 }
    });

    expect(board.getCellValue(1, 1)).toBeNull();
    expect(board.getCellValue(1, 2)).toBeNull();
    expect(board.getCellValue(2, 1)).toBeNull();
    expect(board.getCellValue(2, 2)).toBeNull();
  });

  test('can hide a moving source cell before the merge event is committed', () => {
    const hiddenCells = createHiddenCellSet();

    expect(isCellHidden(hiddenCells, 0, 0)).toBe(false);

    hideMergeSourceCell(hiddenCells, { row: 0, col: 0 });

    expect(isCellHidden(hiddenCells, 0, 0)).toBe(true);
    expect(isCellHidden(hiddenCells, 0, 1)).toBe(false);
  });
});
