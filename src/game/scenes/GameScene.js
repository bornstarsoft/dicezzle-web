import Phaser from 'phaser';
import { BoardModel } from '../core/BoardModel.js';
import { DiceModel } from '../core/DiceModel.js';
import { MergeResolver } from '../core/MergeResolver.js';
import { RankModel } from '../core/RankModel.js';
import { ScoreModel, defaultScoringConfig } from '../core/ScoreModel.js';
import { ShareService } from '../core/ShareService.js';
import { StorageService } from '../core/StorageService.js';
import { TrayGenerator } from '../core/TrayGenerator.js';
import { BoardView } from '../ui/BoardView.js';
import { ResultPanel } from '../ui/ResultPanel.js';
import { ToastView } from '../ui/ToastView.js';
import { TrayView } from '../ui/TrayView.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.configData = data.config ?? {};
  }

  create() {
    this.storage = new StorageService();
    this.scoringConfig = {
      ...defaultScoringConfig,
      ...(this.configData.scoring ?? {}),
      merge: {
        ...defaultScoringConfig.merge,
        ...(this.configData.scoring?.merge ?? {})
      }
    };
    this.scoreModel = new ScoreModel(this.scoringConfig);
    this.resolver = new MergeResolver(this.scoringConfig);
    this.boardView = new BoardView(this);
    this.trayView = new TrayView(this);
    this.toast = new ToastView();
    this.resultPanel = new ResultPanel({
      onShare: (result) => this.shareResult(result),
      onCopy: (result) => this.copyResult(result),
      onRestart: () => this.restartGame()
    });

    this.bindControls();
    this.startGame();
    this.scale.on('resize', () => this.renderGame());
  }

  startGame() {
    this.board = new BoardModel(this.configData.boardSize ?? 5);
    this.trayGenerator = new TrayGenerator({
      seed: `classic-${Date.now()}`,
      weights: this.configData.tray?.weights,
      traySize: this.configData.tray?.size ?? 3,
      earlyTurnCount: this.configData.tray?.earlyTurnCount,
      earlyTurnMaxValue: this.configData.tray?.earlyTurnMaxValue
    });
    this.score = 0;
    this.bestScore = this.storage.getBestScore();
    this.turn = 1;
    this.highestDie = 1;
    this.starsCreated = 0;
    this.starClears = 0;
    this.bestChain = 1;
    this.selectedTrayIndex = 0;
    this.isGameOver = false;
    this.tray = this.trayGenerator.nextTray({ turn: this.turn });
    this.resultPanel.hide();
    this.showTutorialIfNeeded();
    this.track('game_start');
    this.renderGame();
  }

  bindControls() {
    document.querySelector('[data-game-restart]')?.addEventListener('click', () => {
      this.track('restart_click');
      this.restartGame();
    });

    const soundButton = document.querySelector('[data-game-sound]');
    soundButton?.addEventListener('click', () => {
      const next = !this.storage.isSoundEnabled();
      this.storage.setSoundEnabled(next);
      this.updateSoundButton();
    });
    this.updateSoundButton();

    document.querySelector('[data-tutorial-dismiss]')?.addEventListener('click', () => {
      this.storage.dismissTutorial();
      this.track('tutorial_dismiss');
      document.querySelector('[data-tutorial-hint]')?.setAttribute('hidden', '');
    });
  }

  showTutorialIfNeeded() {
    const hint = document.querySelector('[data-tutorial-hint]');
    if (!hint) {
      return;
    }
    if (this.storage.isTutorialDismissed()) {
      hint.setAttribute('hidden', '');
    } else {
      hint.removeAttribute('hidden');
    }
  }

  updateSoundButton() {
    const button = document.querySelector('[data-game-sound]');
    if (!button) {
      return;
    }
    const enabled = this.storage.isSoundEnabled();
    button.textContent = enabled ? 'Sound on' : 'Sound off';
    button.setAttribute('aria-pressed', String(enabled));
  }

  restartGame() {
    this.startGame();
  }

  handleTrayTap(index) {
    if (this.isGameOver) {
      return;
    }
    this.selectedTrayIndex = index;
    this.renderGame();
  }

  handleCellTap(row, col) {
    if (this.isGameOver || this.selectedTrayIndex === null || !this.tray[this.selectedTrayIndex]) {
      this.toast.show('Tap a die first.');
      return;
    }
    if (!this.board.isEmpty(row, col)) {
      this.toast.show('Choose an empty cell.');
      return;
    }

    const die = this.tray[this.selectedTrayIndex];
    this.board.placeDie(row, col, die.value);
    this.score += this.scoreModel.placeScore();
    this.highestDie = this.maxDie(this.highestDie, die.value);
    this.tray.splice(this.selectedTrayIndex, 1);
    this.selectedTrayIndex = this.tray.length > 0 ? Math.min(this.selectedTrayIndex, this.tray.length - 1) : null;
    this.track('dice_place', { value: die.value });

    const mergeResult = this.resolver.resolveAll(this.board, { row, col });
    this.applyMergeResult(mergeResult);

    if (this.shouldGameEnd()) {
      this.endGame();
      return;
    }

    if (this.tray.length === 0) {
      this.turn += 1;
      this.tray = this.trayGenerator.nextTray({ turn: this.turn });
      this.selectedTrayIndex = 0;
      if (this.shouldGameEnd()) {
        this.endGame();
        return;
      }
    }

    this.renderGame();
  }

  applyMergeResult(result) {
    if (!result.events.length) {
      return;
    }

    this.score += result.scoreDelta;
    this.highestDie = this.maxDie(this.highestDie, result.highestDie);
    this.starsCreated += result.starsCreated;
    this.starClears += result.starClears;
    this.bestChain = Math.max(this.bestChain, result.bestChain || 1);

    const lastEvent = result.events[result.events.length - 1];
    if (result.bestChain > 1) {
      this.toast.show(`Chain x${result.bestChain}`);
    } else if (lastEvent.type === 'starClear') {
      this.toast.show('Star clear!');
    } else {
      this.toast.show(`${DiceModel.label(lastEvent.value)} merged`);
    }

    result.events.forEach((event) => {
      if (event.type === 'starClear') {
        this.track('star_clear');
      } else {
        this.track('merge_complete', { value: event.value, chain: event.chain });
        if (event.createdValue === 'star') {
          this.track('star_created');
        }
      }
    });
  }

  shouldGameEnd() {
    return this.board.getEmptyCells().length === 0 && this.tray.length > 0;
  }

  endGame() {
    this.isGameOver = true;
    const result = {
      score: this.score,
      bestScore: this.storage.saveBestScore(this.score),
      highestDie: this.highestDie,
      starsCreated: this.starsCreated,
      starClears: this.starClears,
      bestChain: this.bestChain,
      turnsSurvived: this.turn,
      rank: RankModel.getRank({
        score: this.score,
        highestDie: this.highestDie,
        starsCreated: this.starsCreated,
        starClears: this.starClears,
        bestChain: this.bestChain
      })
    };

    this.storage.incrementTotalGames();
    this.storage.saveLastResult(result);
    this.track('game_over', { score: result.score, rank: result.rank });
    this.renderGame();
    this.resultPanel.show(result);
  }

  async shareResult(result) {
    this.track('share_click');
    const shareResult = await ShareService.shareResult(result);
    if (shareResult.method === 'copy') {
      this.toast.show('Result copied!');
    }
  }

  async copyResult(result) {
    this.track('copy_result');
    await ShareService.copyResult(result);
    this.toast.show('Result copied!');
  }

  renderGame() {
    this.updateStats();
    this.boardView.draw(this.board, {
      selectedDie: this.selectedTrayIndex === null ? null : this.tray[this.selectedTrayIndex],
      onCellTap: (row, col) => this.handleCellTap(row, col)
    });
    this.trayView.draw(this.tray, {
      selectedIndex: this.selectedTrayIndex,
      onTrayTap: (index) => this.handleTrayTap(index)
    });
  }

  updateStats() {
    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = value;
      }
    };
    setText('[data-score]', ScoreModel.formatScore(this.score));
    setText('[data-best-score]', ScoreModel.formatScore(Math.max(this.bestScore, this.score)));
    setText('[data-turns]', String(this.turn));
    setText('[data-highest-die]', DiceModel.label(this.highestDie));
  }

  maxDie(left, right) {
    return DiceModel.rankValue(right) > DiceModel.rankValue(left) ? right : left;
  }

  track(eventName, detail = {}) {
    window.DicezzleAnalytics?.track?.(eventName, {
      mode: 'classic',
      ...detail
    });
  }
}
