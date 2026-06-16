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

    for (let row = 0; row < board.size; row += 1) {
      for (let col = 0; col < board.size; col += 1) {
        const x = originX + col * (cellSize + gap);
        const y = originY + row * (cellSize + gap);
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const cell = board.getCell(row, col);
        const isValid = !cell && options.selectedDie;

        const background = this.scene.add.graphics();
        background.fillStyle(isValid ? 0xe5f4eb : 0xeef6f2, 1);
        background.lineStyle(2, isValid ? 0x7fb393 : 0xcddbd3, 1);
        background.fillRoundedRect(x, y, cellSize, cellSize, Math.max(8, cellSize * 0.14));
        background.strokeRoundedRect(x, y, cellSize, cellSize, Math.max(8, cellSize * 0.14));
        this.objects.push(background);

        if (cell) {
          this.objects.push(DiceView.draw(this.scene, centerX, centerY, cellSize * 0.82, cell.value));
        }

        const hitArea = this.scene.add.zone(centerX, centerY, cellSize, cellSize);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => options.onCellTap?.(row, col));
        this.objects.push(hitArea);
      }
    }
  }
}
