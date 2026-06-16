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
    const slotCount = options.slotCount ?? Math.max(3, tray.length);
    const slotSize = Math.min(88, Math.max(66, (width - 76) / slotCount));
    const gap = Math.max(10, Math.min(18, width * 0.038));
    const totalWidth = slotCount * slotSize + Math.max(0, slotCount - 1) * gap;
    const startX = (width - totalWidth) / 2 + slotSize / 2;
    const y = Math.min(height - slotSize / 2 - 18, height * 0.82);
    const pieceSize = slotSize * 0.86;
    const centers = [];
    this.layout = { slotCount, slotSize, pieceSize, gap, y, centers };

    const label = this.scene.add.text(width / 2, y - slotSize / 2 - 20, 'Tray', {
      color: '#5f675f',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '16px',
      fontStyle: '700'
    }).setOrigin(0.5);
    this.objects.push(label);

    for (let index = 0; index < slotCount; index += 1) {
      const die = tray[index];
      const x = startX + index * (slotSize + gap);
      centers[index] = { x, y };

      const slot = this.scene.add.graphics();
      slot.fillStyle(die ? 0xffffff : 0xe8f0eb, die ? 1 : 0.78);
      slot.lineStyle(index === options.selectedIndex ? 4 : 2, index === options.selectedIndex ? 0x315f50 : 0xcddbd3, die ? 1 : 0.76);
      slot.fillRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, Math.max(8, slotSize * 0.16));
      slot.strokeRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, Math.max(8, slotSize * 0.16));
      this.objects.push(slot);

      if (die && options.dragSlotIndex !== index) {
        this.objects.push(DiceView.draw(this.scene, x, y, pieceSize, die.value, {
          selected: index === options.selectedIndex
        }));
      }

      const zone = this.scene.add.zone(x, y, slotSize, slotSize);
      if (die) {
        zone.setInteractive({ useHandCursor: true });
        zone.on('pointerdown', (pointer) => {
          options.onTrayTap?.(index);
          options.onTrayPointerDown?.(index, pointer);
        });
      }
      this.objects.push(zone);
    }
  }

  getSlotCenter(index) {
    return this.layout?.centers?.[index] ?? null;
  }
}
