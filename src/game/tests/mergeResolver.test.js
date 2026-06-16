import { describe, expect, test } from 'vitest';
import { BoardModel } from '../core/BoardModel.js';
import { MergeResolver } from '../core/MergeResolver.js';
import { defaultScoringConfig } from '../core/ScoreModel.js';

function makeResolver() {
  return new MergeResolver(defaultScoringConfig);
}

describe('MergeResolver', () => {
  test('merges three connected ones into a two at the placed cell', () => {
    const board = new BoardModel(5);
    board.placeDie(2, 2, 1);
    board.placeDie(2, 1, 1);
    board.placeDie(1, 2, 1);

    const result = makeResolver().resolveAll(board, { row: 2, col: 2 });

    expect(board.getCell(2, 2)).toEqual({ value: 2 });
    expect(board.getCell(2, 1)).toBeNull();
    expect(board.getCell(1, 2)).toBeNull();
    expect(result.events[0]).toMatchObject({ type: 'merge', value: 1, createdValue: 2, chain: 1 });
    expect(result.scoreDelta).toBe(30);
  });

  test('merges four connected matching dice into one upgraded die', () => {
    const board = new BoardModel(5);
    board.placeDie(2, 2, 2);
    board.placeDie(2, 1, 2);
    board.placeDie(1, 2, 2);
    board.placeDie(3, 2, 2);

    makeResolver().resolveAll(board, { row: 2, col: 2 });

    expect(board.getCell(2, 2)).toEqual({ value: 3 });
    expect(board.getEmptyCells()).toHaveLength(24);
  });

  test('resolves chain merges from an upgraded die', () => {
    const board = new BoardModel(5);
    board.placeDie(2, 2, 1);
    board.placeDie(2, 1, 1);
    board.placeDie(1, 2, 1);
    board.placeDie(2, 3, 2);
    board.placeDie(3, 2, 2);

    const result = makeResolver().resolveAll(board, { row: 2, col: 2 });

    expect(board.getCell(2, 2)).toEqual({ value: 3 });
    expect(result.events.map((event) => event.chain)).toEqual([1, 2]);
    expect(result.bestChain).toBe(2);
    expect(result.scoreDelta).toBe(30 + 90);
  });

  test('merges sixes into a star die', () => {
    const board = new BoardModel(5);
    board.placeDie(2, 2, 6);
    board.placeDie(2, 1, 6);
    board.placeDie(1, 2, 6);

    const result = makeResolver().resolveAll(board, { row: 2, col: 2 });

    expect(board.getCell(2, 2)).toEqual({ value: 'star' });
    expect(result.starsCreated).toBe(1);
    expect(result.highestDie).toBe('star');
  });

  test('star groups trigger a 3x3 star clear without creating another die', () => {
    const board = new BoardModel(5);
    board.placeDie(2, 2, 'star');
    board.placeDie(2, 1, 'star');
    board.placeDie(1, 2, 'star');
    board.placeDie(1, 1, 5);
    board.placeDie(3, 3, 4);
    board.placeDie(4, 4, 6);

    const result = makeResolver().resolveAll(board, { row: 2, col: 2 });

    expect(board.getCell(2, 2)).toBeNull();
    expect(board.getCell(1, 1)).toBeNull();
    expect(board.getCell(3, 3)).toBeNull();
    expect(board.getCell(4, 4)).toEqual({ value: 6 });
    expect(result.events[0]).toMatchObject({ type: 'starClear', chain: 1 });
    expect(result.starClears).toBe(1);
    expect(result.scoreDelta).toBe(2000);
  });
});
