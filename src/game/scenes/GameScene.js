import Phaser from 'phaser';
import { BoardModel } from '../core/BoardModel.js';
import { DiceModel } from '../core/DiceModel.js';
import { MergeResolver } from '../core/MergeResolver.js';
import { RankModel } from '../core/RankModel.js';
import { ScoreModel, defaultScoringConfig } from '../core/ScoreModel.js';
import { ShareService } from '../core/ShareService.js';
import { StorageService } from '../core/StorageService.js';
import { TrayGenerator } from '../core/TrayGenerator.js';
import { TraySlots } from '../core/TraySlots.js';
import { BoardView } from '../ui/BoardView.js';
import { DiceView } from '../ui/DiceView.js';
import { DiceStyle } from '../ui/DiceStyle.js';
import { calculateGameLayout } from '../ui/GameLayout.js';
import { buildMergeGatherPlan } from '../ui/MergePath.js';
import { applyMergeVisualEvent, createHiddenCellSet, hideMergeSourceCell } from '../ui/MergeVisualState.js';
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
    this.bindPointerControls();
    this.startGame();
    this.scale.on('resize', () => {
      this.cancelDrag();
      this.renderGame();
    });
  }

  startGame() {
    this.clearMergeAnimationObjects?.();
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
    this.dragState = null;
    this.previewCell = null;
    this.mergeAnimationObjects = [];
    this.isGameOver = false;
    this.inputLocked = false;
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

  bindPointerControls() {
    this.input.on('pointermove', (pointer) => this.handlePointerMove(pointer));
    this.input.on('pointerup', (pointer) => this.handlePointerUp(pointer));
    this.input.on('gameout', () => this.handlePointerCancel());
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
    if (this.inputLocked || this.isGameOver || !this.tray[index]) {
      return;
    }
    this.selectedTrayIndex = index;
    this.renderGame();
  }

  handleCellTap(row, col) {
    if (this.inputLocked || this.isGameOver) {
      return;
    }
    if (this.selectedTrayIndex === null || !this.tray[this.selectedTrayIndex]) {
      this.toast.show('Tap a die first.');
      return;
    }
    if (!this.board.isEmpty(row, col)) {
      this.toast.show('Choose an empty cell.');
      return;
    }

    this.placeTrayDie(this.selectedTrayIndex, row, col);
  }

  placeTrayDie(slotIndex, row, col) {
    if (this.inputLocked || this.isGameOver || !this.tray[slotIndex]) {
      return false;
    }
    if (!this.board.isEmpty(row, col)) {
      return false;
    }

    const die = this.tray[slotIndex];
    this.board.placeDie(row, col, die.value);
    const visualBoard = this.board.clone();
    this.score += this.scoreModel.placeScore();
    this.highestDie = this.maxDie(this.highestDie, die.value);
    this.tray = TraySlots.consume(this.tray, slotIndex);
    this.selectedTrayIndex = TraySlots.nextActiveIndex(this.tray, slotIndex);
    this.track('dice_place', { value: die.value });

    const mergeResult = this.resolver.resolveAll(this.board, { row, col });
    this.applyMergeResult(mergeResult);

    let shouldEndAfterTurn = false;
    if (this.shouldGameEnd()) {
      shouldEndAfterTurn = true;
    }

    if (!shouldEndAfterTurn && TraySlots.shouldRefill(this.tray)) {
      this.turn += 1;
      this.tray = this.trayGenerator.nextTray({ turn: this.turn });
      this.selectedTrayIndex = TraySlots.nextActiveIndex(this.tray, 0);
      if (this.shouldGameEnd()) {
        shouldEndAfterTurn = true;
      }
    }

    if (mergeResult.events.length) {
      this.inputLocked = true;
      this.cancelDrag({ render: false });
      this.renderGame({ boardOverride: visualBoard });
      this.playMergeAnimations(mergeResult.events, visualBoard, () => {
        this.inputLocked = false;
        if (shouldEndAfterTurn) {
          this.endGame();
        } else {
          this.renderGame();
        }
      });
      return true;
    }

    if (shouldEndAfterTurn) {
      this.endGame();
      return true;
    }

    this.renderGame();
    return true;
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
      this.toast.show('Merge!');
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
    return this.board.getEmptyCells().length === 0 && this.tray.some(Boolean);
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

  renderGame(options = {}) {
    this.updateStats();
    const boardToRender = options.boardOverride ?? this.board;
    const selectedDie = this.inputLocked || this.selectedTrayIndex === null ? null : this.tray[this.selectedTrayIndex];
    this.gameLayout = calculateGameLayout({
      width: this.scale.width,
      height: this.scale.height,
      boardSize: boardToRender.size,
      traySize: Math.max(3, this.tray.length)
    });
    this.boardView.draw(boardToRender, {
      layout: this.gameLayout,
      selectedDie,
      previewCell: this.previewCell,
      hiddenCells: options.hiddenCells,
      onCellTap: (row, col) => this.handleCellTap(row, col)
    });
    this.trayView.draw(this.tray, {
      layout: this.gameLayout,
      selectedIndex: this.selectedTrayIndex,
      dragSlotIndex: this.dragState?.slotIndex,
      onTrayTap: (index) => this.handleTrayTap(index),
      onTrayPointerDown: (index, pointer) => this.startDrag(index, pointer)
    });
  }

  playMergeAnimations(events, visualBoard = null, onComplete = null) {
    if (!events?.length || !this.boardView.layout) {
      onComplete?.();
      return;
    }

    this.clearMergeAnimationObjects();
    this.playMergeAnimationAtIndex(events, 0, visualBoard, onComplete);
  }

  playMergeAnimationAtIndex(events, index, visualBoard, onComplete) {
    if (index >= events.length) {
      onComplete?.();
      return;
    }

    const event = events[index];
    const hiddenCells = createHiddenCellSet();
    const renderVisualBoard = () => {
      if (visualBoard) {
        this.renderGame({ boardOverride: visualBoard, hiddenCells });
      }
    };
    if (visualBoard) {
      renderVisualBoard();
    }

    const finishEvent = () => {
      if (visualBoard) {
        applyMergeVisualEvent(visualBoard, event);
        this.renderGame({ boardOverride: visualBoard });
      }
      this.time.delayedCall(120, () => this.playMergeAnimationAtIndex(events, index + 1, visualBoard, onComplete));
    };

    const hideSourceCell = (step) => {
      if (!visualBoard) {
        return;
      }
      hideMergeSourceCell(hiddenCells, step.from);
      renderVisualBoard();
    };

    if (event.type === 'starClear') {
      this.playStarClearAnimation(event, { board: visualBoard, onSourceStart: hideSourceCell, onComplete: finishEvent });
    } else {
      this.playMergeAnimation(event, { board: visualBoard, onSourceStart: hideSourceCell, onComplete: finishEvent });
    }
  }

  playMergeAnimation(event, options = {}) {
    const targetCenter = this.boardView.getCellCenter(event.target.row, event.target.col);
    if (!targetCenter) {
      options.onComplete?.();
      return;
    }

    const plan = this.buildGatherPlan(event, targetCenter, options.board);
    this.playGatherPlan({
      plan,
      value: event.value,
      dieSize: targetCenter.dieSize ?? targetCenter.size * 0.96,
      cellSize: targetCenter.size,
      onStepStart: options.onSourceStart,
      onComplete: () => {
        this.playTargetPop(targetCenter, event.value, event.createdValue === 'star', options.onComplete);
      }
    });
  }

  buildGatherPlan(event, targetCenter, board = this.board) {
    const group = (event.group ?? [])
      .map((cell) => {
        const center = this.boardView.getCellCenter(cell.row, cell.col);
        return center ? { row: cell.row, col: cell.col, x: center.x, y: center.y } : null;
      })
      .filter(Boolean);

    return buildMergeGatherPlan({
      group,
      target: {
        row: event.target.row,
        col: event.target.col,
        x: targetCenter.x,
        y: targetCenter.y
      },
      blockedCells: this.getVisualBlockers(event, board)
    });
  }

  getVisualBlockers(event, board = this.board) {
    const mergeCells = new Set((event.group ?? []).map((cell) => `${cell.row},${cell.col}`));
    const blockers = [];
    for (let row = 0; row < board.size; row += 1) {
      for (let col = 0; col < board.size; col += 1) {
        if (board.getCell(row, col) && !mergeCells.has(`${row},${col}`)) {
          blockers.push({ row, col });
        }
      }
    }
    return blockers;
  }

  playGatherPlan({ plan, value, dieSize, cellSize, onStepStart, onComplete }) {
    if (!plan.steps.length) {
      onComplete?.();
      return;
    }

    const stepDelay = 118;
    plan.steps.forEach((step, index) => {
      this.time.delayedCall(index * stepDelay, () => {
        const start = step.path[0];
        const end = step.path[step.path.length - 1];
        onStepStart?.(step);
        this.drawMergeTrail(step.path, value, cellSize, step.final ? 0.36 : 0.24);
        const overlay = DiceView.draw(this, start.x, start.y, dieSize, value, {
          alpha: 0.92,
          depth: 72,
          drag: true
        });
        this.mergeAnimationObjects.push(overlay);
        this.animateAlongPath(overlay, step.path, cellSize, 1, {
          finalScale: step.final ? 0.42 : 0.66,
          onComplete: () => {
            if (!step.final) {
              this.playGatherPulse(end, value, cellSize);
            }
          }
        });
      });
    });

    this.time.delayedCall(plan.steps.length * stepDelay + 360, () => onComplete?.());
  }

  playGatherPulse(point, value, cellSize) {
    const style = DiceStyle.forValue(value);
    const pulse = this.add.circle(point.x, point.y, cellSize * 0.2, DiceStyle.hexToNumber(style.glow), 0.28).setDepth(71);
    this.mergeAnimationObjects.push(pulse);
    this.tweens.add({
      targets: pulse,
      scaleX: 1.9,
      scaleY: 1.9,
      alpha: 0,
      duration: 160,
      ease: 'Sine.easeOut',
      onComplete: () => pulse.destroy()
    });
  }

  drawMergeTrail(path, value, cellSize, alpha = 0.24) {
    if (path.length < 2) {
      return;
    }

    const style = DiceStyle.forValue(value);
    const trail = this.add.graphics().setDepth(69);
    trail.lineStyle(Math.max(4, cellSize * 0.06), DiceStyle.hexToNumber(style.glow), alpha);
    trail.beginPath();
    trail.moveTo(path[0].x, path[0].y);
    path.slice(1).forEach((point) => trail.lineTo(point.x, point.y));
    trail.strokePath();
    this.mergeAnimationObjects.push(trail);
    this.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 340,
      ease: 'Sine.easeOut',
      onComplete: () => trail.destroy()
    });
  }

  animateAlongPath(overlay, path, cellSize, segmentIndex = 1, options = {}) {
    if (segmentIndex >= path.length) {
      this.tweens.add({
        targets: overlay,
        scaleX: options.finalScale ?? 0.38,
        scaleY: options.finalScale ?? 0.38,
        alpha: 0.06,
        duration: 58,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          overlay.destroy();
          options.onComplete?.();
        }
      });
      return;
    }

    const point = path[segmentIndex];
    this.tweens.add({
      targets: overlay,
      x: point.x,
      y: point.y,
      scaleX: segmentIndex === path.length - 1 ? 0.62 : 0.9,
      scaleY: segmentIndex === path.length - 1 ? 0.62 : 0.9,
      duration: Math.max(86, Math.min(132, cellSize * 1.45)),
      ease: segmentIndex === path.length - 1 ? 'Cubic.easeIn' : 'Sine.easeInOut',
      onComplete: () => this.animateAlongPath(overlay, path, cellSize, segmentIndex + 1, options)
    });
  }

  playTargetPop(center, value, isSpecial = false, onComplete = null) {
    if (!center) {
      onComplete?.();
      return;
    }

    const style = DiceStyle.forValue(value);
    const glow = this.add.circle(center.x, center.y, center.size * (isSpecial ? 0.66 : 0.52), DiceStyle.hexToNumber(style.glow), isSpecial ? 0.34 : 0.22).setDepth(68);
    const die = DiceView.draw(this, center.x, center.y, center.dieSize ?? center.size * 0.96, value, {
      alpha: 0.98,
      depth: 72
    });
    die.setScale(0.72);
    this.mergeAnimationObjects.push(glow, die);

    this.tweens.add({
      targets: glow,
      scaleX: isSpecial ? 1.5 : 1.25,
      scaleY: isSpecial ? 1.5 : 1.25,
      alpha: 0,
      duration: isSpecial ? 320 : 220,
      ease: 'Sine.easeOut',
      onComplete: () => glow.destroy()
    });
    this.tweens.add({
      targets: die,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 105,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        die.destroy();
        onComplete?.();
      }
    });
  }

  playStarClearAnimation(event, options = {}) {
    const targetCenter = this.boardView.getCellCenter(event.target.row, event.target.col);
    if (!targetCenter) {
      options.onComplete?.();
      return;
    }

    const plan = this.buildGatherPlan(event, targetCenter, options.board);
    this.playGatherPlan({
      plan,
      value: 'star',
      dieSize: targetCenter.dieSize ?? targetCenter.size * 0.96,
      cellSize: targetCenter.size,
      onStepStart: options.onSourceStart,
      onComplete: () => {
        const burst = this.add.circle(targetCenter.x, targetCenter.y, targetCenter.size * 0.45, 0xf4bf45, 0.32).setDepth(69);
        burst.setStrokeStyle(Math.max(3, targetCenter.size * 0.06), 0xd09416, 0.58);
        this.mergeAnimationObjects.push(burst);
        this.tweens.add({
          targets: burst,
          scaleX: 2.4,
          scaleY: 2.4,
          alpha: 0,
          duration: 360,
          ease: 'Sine.easeOut',
          onComplete: () => {
            burst.destroy();
            options.onComplete?.();
          }
        });
      }
    });
  }

  clearMergeAnimationObjects() {
    this.mergeAnimationObjects?.forEach((object) => {
      this.tweens.killTweensOf(object);
      if (object && typeof object.destroy === 'function' && !object.destroyed) {
        object.destroy();
      }
    });
    this.mergeAnimationObjects = [];
  }

  startDrag(slotIndex, pointer) {
    if (this.inputLocked || this.isGameOver || !this.tray[slotIndex]) {
      return;
    }

    this.cancelDrag({ render: false });
    const trayOrigin = this.trayView.getSlotCenter(slotIndex) ?? { x: pointer.x, y: pointer.y };
    const die = this.tray[slotIndex];
    const ghostSize = this.gameLayout?.drag?.dieSize ?? this.boardView.layout?.dieSize ?? this.trayView.layout?.pieceSize ?? 70;
    const ghost = this.add.container(trayOrigin.x, trayOrigin.y).setDepth(80);
    ghost.add(DiceView.draw(this, 0, 0, ghostSize, die.value, { alpha: 0.96, drag: true }));

    this.selectedTrayIndex = slotIndex;
    this.dragState = {
      slotIndex,
      die,
      trayOrigin,
      ghost,
      ghostSize,
      returning: false,
      valid: false,
      boardCell: null
    };
    this.trayView.setSlotDieVisible(slotIndex, false);
    this.handlePointerMove(pointer);
  }

  handlePointerMove(pointer) {
    if (this.inputLocked || !this.dragState || this.dragState.returning) {
      return;
    }

    const lifted = this.getLiftedPointer(pointer);
    const boardCell = this.boardView.getCellAtPoint(lifted.x, lifted.y);
    const valid = Boolean(boardCell && this.board.isEmpty(boardCell.row, boardCell.col));
    this.dragState.valid = valid;
    this.dragState.boardCell = boardCell;
    this.previewCell = boardCell ? { ...boardCell, valid } : null;
    this.moveDragGhost(pointer, true);
    this.boardView.draw(this.board, {
      selectedDie: this.dragState.die,
      previewCell: this.previewCell,
      onCellTap: (row, col) => this.handleCellTap(row, col)
    });
  }

  handlePointerUp(pointer) {
    if (this.inputLocked || !this.dragState || this.dragState.returning) {
      return;
    }

    const state = this.dragState;
    const lifted = this.getLiftedPointer(pointer);
    const boardCell = this.boardView.getCellAtPoint(lifted.x, lifted.y);
    this.previewCell = null;

    if (!boardCell || !this.board.isEmpty(boardCell.row, boardCell.col)) {
      this.toast.show(boardCell ? 'Choose an empty cell.' : 'Drop onto the board.');
      this.previewCell = boardCell ? { ...boardCell, valid: false } : null;
      this.boardView.draw(this.board, {
        selectedDie: state.die,
        previewCell: this.previewCell,
        onCellTap: (row, col) => this.handleCellTap(row, col)
      });
      this.animateGhostBackToTray(state);
      return;
    }

    state.ghost.destroy();
    this.dragState = null;
    this.placeTrayDie(state.slotIndex, boardCell.row, boardCell.col);
  }

  handlePointerCancel() {
    if (this.dragState && !this.dragState.returning) {
      this.animateGhostBackToTray(this.dragState);
    }
  }

  getLiftedPointer(pointer) {
    const lift = Math.min(46, Math.max(24, (this.dragState?.ghostSize ?? 64) * 0.42));
    return { x: pointer.x, y: pointer.y - lift };
  }

  moveDragGhost(pointer, immediate = false) {
    if (!this.dragState?.ghost) {
      return;
    }

    const lifted = this.getLiftedPointer(pointer);
    this.tweens.killTweensOf(this.dragState.ghost);
    if (immediate) {
      this.dragState.ghost.setPosition(lifted.x, lifted.y);
      return;
    }
    this.tweens.add({
      targets: this.dragState.ghost,
      x: lifted.x,
      y: lifted.y,
      duration: 55,
      ease: 'Sine.easeOut'
    });
  }

  animateGhostBackToTray(state) {
    if (!state?.ghost || state.returning) {
      return;
    }

    state.returning = true;
    this.tweens.killTweensOf(state.ghost);
    const trayPieceSize = this.trayView.layout?.pieceSize ?? state.ghostSize;
    const returnScale = Math.max(0.62, Math.min(1, trayPieceSize / state.ghostSize));
    this.tweens.add({
      targets: state.ghost,
      x: state.trayOrigin.x,
      y: state.trayOrigin.y,
      scaleX: returnScale,
      scaleY: returnScale,
      alpha: 0.52,
      duration: 210,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        state.ghost.destroy();
        if (this.dragState === state) {
          this.dragState = null;
        }
        this.previewCell = null;
        this.renderGame();
      }
    });
  }

  cancelDrag(options = {}) {
    if (!this.dragState) {
      return;
    }
    this.tweens.killTweensOf(this.dragState.ghost);
    this.dragState.ghost.destroy();
    this.dragState = null;
    this.previewCell = null;
    if (options.render !== false) {
      this.renderGame();
    }
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
    const highestElement = document.querySelector('[data-highest-die]');
    if (highestElement) {
      const style = DiceStyle.forValue(this.highestDie);
      highestElement.textContent = DiceModel.label(this.highestDie);
      highestElement.style.setProperty('--die-chip-fill', style.fill);
      highestElement.style.setProperty('--die-chip-border', style.stroke);
      highestElement.style.setProperty('--die-chip-ink', style.pip);
      highestElement.classList.add('die-chip');
    }
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
