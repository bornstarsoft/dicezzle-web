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
    const rows = [
      ['Score', ScoreModel.formatScore(result.score)],
      ['Best score', ScoreModel.formatScore(result.bestScore)],
      ['Highest die', DiceModel.label(result.highestDie)],
      ['Stars created', result.starsCreated],
      ['Star clears', result.starClears],
      ['Best chain', `x${result.bestChain}`],
      ['Turns survived', result.turnsSurvived],
      ['Rank', result.rank]
    ];

    // TODO: Keep this markup stable so it can become a client-side share image export target later.
    return `
      <p class="result-panel__eyebrow">Dicezzle Classic</p>
      <h2>${result.rank}</h2>
      <dl class="result-panel__stats">
        ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}
      </dl>
      <pre class="result-panel__share-text">${ShareService.generateResultText(result)}</pre>
    `;
  }
}
