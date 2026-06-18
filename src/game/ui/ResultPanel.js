import { DiceModel } from '../core/DiceModel.js';
import { ScoreModel } from '../core/ScoreModel.js';
import { ShareService } from '../core/ShareService.js';

export class ResultPanel {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.root = document.querySelector('[data-result-panel]');
    this.content = document.querySelector('[data-result-card]');
    this.shareButton = document.querySelector('[data-result-share]');
    this.copyButton = document.querySelector('[data-result-copy]');
    this.restartButton = document.querySelector('[data-result-restart]');
    this.result = null;
    this.bind();
  }

  bind() {
    this.shareButton?.addEventListener('click', () => this.result && this.callbacks.onShare?.(this.result));
    this.copyButton?.addEventListener('click', () => this.result && this.callbacks.onCopy?.(this.result));
    this.restartButton?.addEventListener('click', () => this.result && this.callbacks.onRestart?.());
  }

  show(result) {
    this.result = result;
    if (this.content) {
      this.content.innerHTML = this.renderResultCard(result);
    }
    this.root?.removeAttribute('hidden');
    this.restartButton?.focus();
  }

  hide() {
    this.root?.setAttribute('hidden', '');
  }

  renderResultCard(result) {
    const score = result.score ?? 0;
    const bestScore = result.bestScore ?? score;
    const highestDie = result.highestDie ?? 1;
    const starsCreated = result.starsCreated ?? 0;
    const starClears = result.starClears ?? 0;
    const bestChain = result.bestChain ?? 1;
    const turnsSurvived = result.turnsSurvived ?? 0;
    const rank = result.rank ?? 'Beginner Roller';
    const rows = [
      ['Best Score', ScoreModel.formatScore(bestScore), 'best'],
      ['Stars Created', starsCreated, 'stars'],
      ['Star Clears', starClears, 'star-clears'],
      ['Best Chain', `x${bestChain}`, 'chain'],
      ['Turns', turnsSurvived, 'turns'],
      ['Best Die', DiceModel.label(highestDie), 'die']
    ];

    // TODO: Keep this markup stable so it can become a client-side share image export target later.
    return `
      <div class="result-panel__header">
        <p class="result-panel__eyebrow">Dicezzle Classic</p>
        <h2>Game Over</h2>
        ${result.newBestScore ? '<span class="result-panel__badge">New Best!</span>' : ''}
      </div>
      <div class="result-panel__score" aria-label="Final score">
        <span>Score</span>
        <strong class="result-panel__score-value">${ScoreModel.formatScore(score)}</strong>
      </div>
      <dl class="result-panel__stats">
        ${rows.map(([label, value, key]) => `<div class="result-panel__stat result-panel__stat--${key}"><dt>${label}</dt><dd>${value}</dd></div>`).join('')}
      </dl>
      <div class="result-panel__rank">
        <span>Rank</span>
        <strong>${rank}</strong>
        <p>${this.getEncouragement(result)}</p>
      </div>
      <pre class="result-panel__share-text">${ShareService.generateResultText({
        ...result,
        score,
        bestScore,
        starsCreated,
        starClears,
        bestChain,
        rank
      })}</pre>
    `;
  }

  getEncouragement(result) {
    if (result.newBestScore) {
      return 'A fresh personal best. Nicely rolled.';
    }
    if ((result.starClears ?? 0) > 0) {
      return 'Those Star Clears opened real breathing room.';
    }
    if ((result.bestChain ?? 1) >= 3) {
      return 'That chain timing was sharp.';
    }
    return 'One more run can open the board a little longer.';
  }
}
