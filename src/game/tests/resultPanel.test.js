import { describe, expect, test } from 'vitest';
import { ResultPanel } from '../ui/ResultPanel.js';

describe('ResultPanel rendering', () => {
  test('renders a compact game-over result card with core personal stats', () => {
    const html = ResultPanel.prototype.renderResultCard({
      score: 12840,
      bestScore: 18420,
      highestDie: 'star',
      starsCreated: 3,
      starClears: 1,
      bestChain: 3,
      turnsSurvived: 42,
      rank: 'Star Maker',
      newBestScore: true
    });

    expect(html).toContain('Game Over');
    expect(html).toContain('New Best!');
    expect(html).toContain('result-panel__score-value');
    expect(html).toContain('12,840');
    expect(html).toContain('Best Score');
    expect(html).toContain('18,420');
    expect(html).toContain('Stars Created');
    expect(html).toContain('Star Clears');
    expect(html).toContain('Best Chain');
    expect(html).toContain('Turns');
    expect(html).toContain('Rank');
    expect(html).toContain('Star Maker');
    expect(html).toContain('result-panel__share-note');
    expect(html).not.toContain('result-panel__share-text');
    expect(html).not.toContain('<pre');
  });

  test('handles missing optional result values without rendering undefined', () => {
    const html = ResultPanel.prototype.renderResultCard({
      score: 0,
      bestScore: 0,
      rank: 'Beginner Roller'
    });

    expect(html).not.toContain('undefined');
    expect(html).toContain('Beginner Roller');
  });
});
