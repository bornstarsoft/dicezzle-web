import { describe, expect, test } from 'vitest';
import { BoardModel } from '../core/BoardModel.js';

describe('BoardModel', () => {
  test('places one die on an empty cell and tracks empty cells', () => {
    const board = new BoardModel(5);

    board.placeDie(2, 3, 4);

    expect(board.getCell(2, 3)).toEqual({ value: 4 });
    expect(board.getEmptyCells()).toHaveLength(24);
  });

  test('rejects placement on an occupied cell', () => {
    const board = new BoardModel(5);
    board.placeDie(0, 0, 1);

    expect(() => board.placeDie(0, 0, 2)).toThrow('Cell is occupied');
    expect(board.getCell(0, 0)).toEqual({ value: 1 });
  });

  test('rejects coordinates outside the board', () => {
    const board = new BoardModel(5);

    expect(() => board.placeDie(5, 0, 1)).toThrow('outside the board');
    expect(() => board.getCell(-1, 0)).toThrow('outside the board');
  });
});
