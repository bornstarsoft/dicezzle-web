import Phaser from 'phaser';
import { DiceView } from './DiceView.js';

export class TrayView {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
  }

  clear() {
    this.objects.forEach((object) => object.destroy());
    this.objects = [];
  }

  draw(tray, options = {}) {
    this.clear();
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const slotSize = Math.min(76, Math.max(58, (width - 82) / 3));
    const gap = Math.max(12, Math.min(22, width * 0.045));
    const totalWidth = tray.length * slotSize + Math.max(0, tray.length - 1) * gap;
    const startX = (width - totalWidth) / 2 + slotSize / 2;
    const y = Math.min(height - slotSize / 2 - 18, height * 0.82);

    const label = this.scene.add.text(width / 2, y - slotSize / 2 - 20, 'Tray', {
      color: '#5f675f',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '16px',
      fontStyle: '700'
    }).setOrigin(0.5);
    this.objects.push(label);

    tray.forEach((die, index) => {
      const x = startX + index * (slotSize + gap);
      const dieView = DiceView.draw(this.scene, x, y, slotSize, die.value, {
        selected: index === options.selectedIndex
      });
      dieView.setSize(slotSize, slotSize);
      dieView.setInteractive(new Phaser.Geom.Rectangle(-slotSize / 2, -slotSize / 2, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      dieView.on('pointerdown', () => options.onTrayTap?.(index));
      this.objects.push(dieView);
    });
  }
}
