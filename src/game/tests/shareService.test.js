import { describe, expect, test } from 'vitest';
import { ShareService } from '../core/ShareService.js';

describe('ShareService', () => {
  test('generates the required share text format', () => {
    const text = ShareService.generateResultText({
      score: 12840,
      bestScore: 18420,
      starsCreated: 3,
      starClears: 1,
      bestChain: 3,
      rank: 'Star Maker'
    });

    expect(text).toBe([
      'Dicezzle Classic',
      'Score: 12,840',
      'Best: 18,420',
      'Stars: 3',
      'Star Clears: 1',
      'Best Chain: x3',
      'Rank: Star Maker',
      '',
      'Can you beat my score?',
      'https://dicezzle.com/'
    ].join('\n'));
  });

  test('shares the root Dicezzle URL', () => {
    expect(ShareService.shareUrl).toBe('https://dicezzle.com/');
  });
});
