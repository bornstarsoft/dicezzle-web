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
        const isValid = !cell && options.selectedDie;
        const isPreview = options.previewCell?.row === row && options.previewCell?.col === col;
        const previewValid = Boolean(options.previewCell?.valid);

        this.objects.push(this.drawCellSlot(x, y, cellSize, { isValid, isPreview, previewValid }));

        if (cell) {
          this.objects.push(DiceView.draw(this.scene, centerX, centerY, dieSize, cell.value));
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
    const radius = Math.max(18, cellSize * 0.24);
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x5c422a, 0.2);
    frame.fillRoundedRect(originX - padding + 2, originY - padding + 6, boardSize + padding * 2, boardSize + padding * 2, radius);
    frame.fillStyle(0xb99d74, 1);
    frame.fillRoundedRect(originX - padding, originY - padding, boardSize + padding * 2, boardSize + padding * 2, radius);
    frame.fillStyle(0xe6d7bd, 1);
    frame.fillRoundedRect(originX - padding + 3, originY - padding + 3, boardSize + padding * 2 - 6, boardSize + padding * 2 - 6, radius - 3);
    frame.fillStyle(0xd0b98f, 0.5);
    frame.fillRoundedRect(originX - padding + 7, originY - padding + 7, boardSize + padding * 2 - 14, boardSize + padding * 2 - 14, radius - 7);
    frame.lineStyle(Math.max(2, cellSize * 0.032), 0xfff2da, 0.92);
    frame.strokeRoundedRect(originX - padding + 3, originY - padding + 3, boardSize + padding * 2 - 6, boardSize + padding * 2 - 6, radius - 3);
    frame.lineStyle(Math.max(1, cellSize * 0.02), 0xa88d68, 0.8);
    frame.strokeRoundedRect(originX - padding, originY - padding, boardSize + padding * 2, boardSize + padding * 2, radius);
    this.objects.push(frame);
  }

  drawCellSlot(x, y, size, state) {
    const radius = Math.max(10, size * 0.18);
    const cell = this.scene.add.graphics();
    const validGlow = state.isPreview && state.previewValid;
    const invalidGlow = state.isPreview && !state.previewValid;
    const idleFill = state.isValid ? 0xf0e6d6 : 0xdeccb1;
    const stroke = validGlow ? 0x72d8ff : invalidGlow ? 0xdf6758 : state.isValid ? 0xc7a978 : 0x987a56;
    const strokeAlpha = validGlow || invalidGlow ? 1 : state.isValid ? 0.9 : 0.82;

    if (validGlow || invalidGlow) {
      cell.fillStyle(validGlow ? 0x9be0ff : 0xffaaa2, 0.26);
      cell.fillRoundedRect(x - 6, y - 6, size + 12, size + 12, radius + 6);
      cell.lineStyle(3, validGlow ? 0x8ee7ff : 0xff8e85, 0.85);
      cell.strokeRoundedRect(x - 4, y - 4, size + 8, size + 8, radius + 4);
    }

    cell.fillStyle(0x5d4228, 0.2);
    cell.fillRoundedRect(x + size * 0.035, y + size * 0.055, size, size, radius);
    cell.fillStyle(0xb49368, 1);
    cell.fillRoundedRect(x, y, size, size, radius);
    cell.fillStyle(0xefdfc6, 1);
    cell.fillRoundedRect(x + size * 0.045, y + size * 0.045, size * 0.91, size * 0.86, radius * 0.82);
    cell.fillStyle(0x7b6142, 0.22);
    cell.fillRoundedRect(x + size * 0.1, y + size * 0.11, size * 0.8, size * 0.7, radius * 0.6);
    cell.fillStyle(idleFill, 1);
    cell.fillRoundedRect(x + size * 0.15, y + size * 0.14, size * 0.7, size * 0.61, radius * 0.48);
    cell.fillStyle(0xffffff, 0.24);
    cell.fillRoundedRect(x + size * 0.18, y + size * 0.16, size * 0.48, size * 0.1, radius * 0.26);
    cell.lineStyle(state.isPreview ? 3 : 2, stroke, strokeAlpha);
    cell.strokeRoundedRect(x + 1, y + 1, size - 2, size - 2, radius);
    cell.lineStyle(1, 0xfff6e8, 0.7);
    cell.strokeRoundedRect(x + size * 0.15, y + size * 0.14, size * 0.7, size * 0.61, radius * 0.44);
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
