import { describe, expect, test } from 'vitest';
import { TraySlots } from '../core/TraySlots.js';

describe('TraySlots', () => {
  test('keeps fixed slots and empties only the consumed slot', () => {
    const tray = [{ value: 1 }, { value: 2 }, { value: 3 }];

    expect(TraySlots.consume(tray, 1)).toEqual([{ value: 1 }, null, { value: 3 }]);
  });

  test('finds the next active slot and reports when refill is needed', () => {
    expect(TraySlots.nextActiveIndex([null, { value: 2 }, { value: 3 }], 0)).toBe(1);
    expect(TraySlots.nextActiveIndex([{ value: 1 }, null, { value: 3 }], 1)).toBe(2);
    expect(TraySlots.nextActiveIndex([null, null, null], 0)).toBeNull();
    expect(TraySlots.shouldRefill([null, null, null])).toBe(true);
    expect(TraySlots.shouldRefill([null, { value: 2 }, null])).toBe(false);
  });
});
