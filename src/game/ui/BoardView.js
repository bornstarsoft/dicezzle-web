import { DiceView } from './DiceView.js';
import { calculateGameLayout } from './GameLayout.js';

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
    const { originX, originY, size: boardPixelSize, cellSize, gap } = gameLayout.board;
    this.layout = { boardSize: boardPixelSize, cellSize, gap, originX, originY, size: board.size };

    this.drawBoardFrame(originX, originY, boardPixelSize, cellSize);

    for (let row = 0; row < board.size; row += 1) {
      for (let col = 0; col < board.size; col += 1) {
        const x = originX + col * (cellSize + gap);
        const y = originY + row * (cellSize + gap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const cell = board.getCell(row, col);
        const isValid = !cell && options.selectedDie;
        const isPreview = options.previewCell?.row === row && options.previewCell?.col === col;
        const previewValid = Boolean(options.previewCell?.valid);

        this.objects.push(this.drawCellSlot(x, y, cellSize, { isValid, isPreview, previewValid }));

        if (cell) {
          this.objects.push(DiceView.draw(this.scene, centerX, centerY, cellSize * 0.98, cell.value));
        }

        const hitArea = this.scene.add.zone(centerX, centerY, cellSize, cellSize);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => options.onCellTap?.(row, col));
        this.objects.push(hitArea);
      }
    }
  }

  drawBoardFrame(originX, originY, boardSize, cellSize) {
    const padding = Math.max(6, cellSize * 0.1);
    const radius = Math.max(16, cellSize * 0.22);
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x5c4a36, 0.16);
    frame.fillRoundedRect(originX - padding + 1, originY - padding + 5, boardSize + padding * 2, boardSize + padding * 2, radius);
    frame.fillStyle(0xd8c6a9, 1);
    frame.fillRoundedRect(originX - padding, originY - padding, boardSize + padding * 2, boardSize + padding * 2, radius);
    frame.lineStyle(Math.max(2, cellSize * 0.035), 0xf8edd9, 0.8);
    frame.strokeRoundedRect(originX - padding + 2, originY - padding + 2, boardSize + padding * 2 - 4, boardSize + padding * 2 - 4, radius - 2);
    frame.lineStyle(Math.max(1, cellSize * 0.02), 0xa88d68, 0.8);
    frame.strokeRoundedRect(originX - padding, originY - padding, boardSize + padding * 2, boardSize + padding * 2, radius);
    this.objects.push(frame);
  }

  drawCellSlot(x, y, size, state) {
    const radius = Math.max(9, size * 0.16);
    const cell = this.scene.add.graphics();
    const validGlow = state.isPreview && state.previewValid;
    const invalidGlow = state.isPreview && !state.previewValid;
    const idleFill = state.isValid ? 0xe5decf : 0xded2bd;
    const stroke = validGlow ? 0x70d8ff : invalidGlow ? 0xdf6758 : state.isValid ? 0xb8a386 : 0xa99270;
    const strokeAlpha = validGlow || invalidGlow ? 0.98 : state.isValid ? 0.82 : 0.72;

    if (validGlow || invalidGlow) {
      cell.fillStyle(validGlow ? 0x9edbff : 0xffaaa2, 0.22);
      cell.fillRoundedRect(x - 4, y - 4, size + 8, size + 8, radius + 4);
    }

    cell.fillStyle(0x6a5134, 0.18);
    cell.fillRoundedRect(x + 2, y + 4, size, size, radius);
    cell.fillStyle(0xbba98d, 1);
    cell.fillRoundedRect(x, y, size, size, radius);
    cell.fillStyle(idleFill, 1);
    cell.fillRoundedRect(x + size * 0.055, y + size * 0.055, size * 0.89, size * 0.83, radius * 0.72);
    cell.lineStyle(state.isPreview ? 4 : 2, stroke, strokeAlpha);
    cell.strokeRoundedRect(x + 1, y + 1, size - 2, size - 2, radius);
    cell.lineStyle(1, 0xfff6e8, 0.55);
    cell.strokeRoundedRect(x + size * 0.09, y + size * 0.08, size * 0.82, size * 0.73, radius * 0.58);
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

    const { originX, originY, cellSize, gap, size } = this.layout;
    if (row < 0 || col < 0 || row >= size || col >= size) {
      return null;
    }

    return {
      x: originX + col * (cellSize + gap) + cellSize / 2,
      y: originY + row * (cellSize + gap) + cellSize / 2,
      size: cellSize
    };
  }
}
