import { DiceView } from './DiceView.js';

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
    const boardSize = Math.min(width - 28, height * 0.62, 420);
    const gap = Math.max(5, Math.min(8, boardSize * 0.018));
    const cellSize = (boardSize - gap * (board.size - 1)) / board.size;
    const originX = (width - boardSize) / 2;
    const originY = Math.max(16, Math.min(34, height * 0.06));
    this.layout = { boardSize, cellSize, gap, originX, originY, size: board.size };

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

        const background = this.scene.add.graphics();
        background.fillStyle(isPreview ? (previewValid ? 0xd8f2e2 : 0xffe2dc) : isValid ? 0xe5f4eb : 0xeef6f2, 1);
        background.lineStyle(isPreview ? 4 : 2, isPreview ? (previewValid ? 0x315f50 : 0xdf6758) : isValid ? 0x7fb393 : 0xcddbd3, 1);
        background.fillRoundedRect(x, y, cellSize, cellSize, Math.max(8, cellSize * 0.14));
        background.strokeRoundedRect(x, y, cellSize, cellSize, Math.max(8, cellSize * 0.14));
        this.objects.push(background);

        if (cell) {
          this.objects.push(DiceView.draw(this.scene, centerX, centerY, cellSize * 0.94, cell.value));
        }

        const hitArea = this.scene.add.zone(centerX, centerY, cellSize, cellSize);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => options.onCellTap?.(row, col));
        this.objects.push(hitArea);
      }
    }
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
}
