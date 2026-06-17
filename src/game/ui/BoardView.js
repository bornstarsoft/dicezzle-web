import { DiceView } from './DiceView.js';
import { calculateGameLayout } from './GameLayout.js';
import { isCellHidden } from './MergeVisualState.js';

export class BoardView {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
  }

  clear() {
    this.objects.forEach((object) => object.destroy());
    this.objects = [];
  }

  draw(board, options = {}) {
    this.clear();
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const gameLayout = options.layout ?? calculateGameLayout({ width, height, boardSize: board.size });
    const { originX, originY, size: boardPixelSize, cellSize, dieSize, gap } = gameLayout.board;
    this.layout = { boardSize: boardPixelSize, cellSize, dieSize, gap, originX, originY, size: board.size };

    this.drawBoardFrame(originX, originY, boardPixelSize, cellSize);

    for (let row = 0; row < board.size; row += 1) {
      for (let col = 0; col < board.size; col += 1) {
        const x = originX + col * (cellSize + gap);
        const y = originY + row * (cellSize + gap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const cell = board.getCell(row, col);
        const hidden = isCellHidden(options.hiddenCells, row, col);
        const visibleCell = hidden ? null : cell;
        const isValid = !visibleCell && options.selectedDie;
        const isPreview = options.previewCell?.row === row && options.previewCell?.col === col;
        const previewValid = Boolean(options.previewCell?.valid);

        this.objects.push(this.drawCellSlot(x, y, cellSize, { isValid, isPreview, previewValid }));

        if (visibleCell) {
          this.objects.push(DiceView.draw(this.scene, centerX, centerY, dieSize, visibleCell.value));
        }

        const hitArea = this.scene.add.zone(centerX, centerY, cellSize, cellSize);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => options.onCellTap?.(row, col));
        this.objects.push(hitArea);
      }
    }
  }

  drawBoardFrame(originX, originY, boardSize, cellSize) {
    const padding = Math.max(5, cellSize * 0.08);
    const radius = Math.max(16, cellSize * 0.22);
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x31433a, 0.12);
    frame.fillRoundedRect(originX - padding + 1, originY - padding + 5, boardSize + padding * 2, boardSize + padding * 2, radius);
    frame.fillStyle(0xd7dfd2, 1);
    frame.fillRoundedRect(originX - padding, originY - padding, boardSize + padding * 2, boardSize + padding * 2, radius);
    frame.fillStyle(0xf4f0e6, 1);
    frame.fillRoundedRect(originX - padding + 3, originY - padding + 3, boardSize + padding * 2 - 6, boardSize + padding * 2 - 6, radius - 3);
    frame.lineStyle(Math.max(1, cellSize * 0.02), 0xffffff, 0.78);
    frame.strokeRoundedRect(originX - padding + 3, originY - padding + 3, boardSize + padding * 2 - 6, boardSize + padding * 2 - 6, radius - 3);
    frame.lineStyle(1, 0xb9c5b8, 0.85);
    frame.strokeRoundedRect(originX - padding, originY - padding, boardSize + padding * 2, boardSize + padding * 2, radius);
    this.objects.push(frame);
  }

  drawCellSlot(x, y, size, state) {
    const radius = Math.max(10, size * 0.18);
    const cell = this.scene.add.graphics();
    const validGlow = state.isPreview && state.previewValid;
    const invalidGlow = state.isPreview && !state.previewValid;
    const idleFill = state.isValid ? 0xf4f5ee : 0xe8e0d1;
    const stroke = validGlow ? 0x72d8ff : invalidGlow ? 0xdf6758 : state.isValid ? 0xbcc9bc : 0xc7bba6;
    const strokeAlpha = validGlow || invalidGlow ? 1 : state.isValid ? 0.9 : 0.82;

    if (validGlow || invalidGlow) {
      cell.fillStyle(validGlow ? 0x9be0ff : 0xffaaa2, 0.26);
      cell.fillRoundedRect(x - 6, y - 6, size + 12, size + 12, radius + 6);
      cell.lineStyle(3, validGlow ? 0x8ee7ff : 0xff8e85, 0.85);
      cell.strokeRoundedRect(x - 4, y - 4, size + 8, size + 8, radius + 4);
    }

    cell.fillStyle(0x31433a, 0.1);
    cell.fillRoundedRect(x + size * 0.025, y + size * 0.045, size, size, radius);
    cell.fillStyle(0xd5c8b2, 1);
    cell.fillRoundedRect(x, y, size, size, radius);
    cell.fillStyle(0xf5efe3, 1);
    cell.fillRoundedRect(x + size * 0.05, y + size * 0.05, size * 0.9, size * 0.84, radius * 0.78);
    cell.fillStyle(0x90775a, 0.12);
    cell.fillRoundedRect(x + size * 0.1, y + size * 0.12, size * 0.8, size * 0.66, radius * 0.55);
    cell.fillStyle(idleFill, 1);
    cell.fillRoundedRect(x + size * 0.15, y + size * 0.13, size * 0.7, size * 0.6, radius * 0.46);
    cell.fillStyle(0xffffff, 0.24);
    cell.fillRoundedRect(x + size * 0.18, y + size * 0.16, size * 0.46, size * 0.08, radius * 0.22);
    cell.lineStyle(state.isPreview ? 3 : 2, stroke, strokeAlpha);
    cell.strokeRoundedRect(x + 1, y + 1, size - 2, size - 2, radius);
    cell.lineStyle(1, 0xffffff, 0.62);
    cell.strokeRoundedRect(x + size * 0.15, y + size * 0.13, size * 0.7, size * 0.6, radius * 0.42);
    return cell;
  }

  getCellAtPoint(x, y) {
    if (!this.layout) {
      return null;
    }

    const { originX, originY, boardSize, cellSize, gap, size } = this.layout;
    if (x < originX || y < originY || x > originX + boardSize || y > originY + boardSize) {
      return null;
    }

    const col = Math.floor((x - originX) / (cellSize + gap));
    const row = Math.floor((y - originY) / (cellSize + gap));
    if (row < 0 || col < 0 || row >= size || col >= size) {
      return null;
    }

    const cellX = originX + col * (cellSize + gap);
    const cellY = originY + row * (cellSize + gap);
    if (x > cellX + cellSize || y > cellY + cellSize) {
      return null;
    }

    return { row, col };
  }

  getCellCenter(row, col) {
    if (!this.layout) {
      return null;
    }

    const { originX, originY, cellSize, dieSize, gap, size } = this.layout;
    if (row < 0 || col < 0 || row >= size || col >= size) {
      return null;
    }

    return {
      x: originX + col * (cellSize + gap) + cellSize / 2,
      y: originY + row * (cellSize + gap) + cellSize / 2,
      size: cellSize,
      dieSize: dieSize ?? cellSize
    };
  }
}
