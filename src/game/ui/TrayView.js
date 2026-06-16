import { DiceView } from './DiceView.js';
import { DiceStyle } from './DiceStyle.js';
import { calculateGameLayout } from './GameLayout.js';

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
    const gameLayout = options.layout ?? calculateGameLayout({ width, height, traySize: slotCount });
    const { slotSize, gap, y, centers, totalWidth, top } = gameLayout.tray;
    const pieceSize = gameLayout.tray.pieceSize;
    this.layout = { slotCount, slotSize, pieceSize, gap, y, centers };

    this.drawRack(totalWidth, slotSize, top, gap);

    for (let index = 0; index < slotCount; index += 1) {
      const die = tray[index];
      const { x } = centers[index];
      const isSelected = index === options.selectedIndex;
      this.objects.push(this.drawSlotHolder(x, y, slotSize, {
        die,
        selected: isSelected,
        empty: !die
      }));

      if (die && options.dragSlotIndex !== index) {
        this.objects.push(DiceView.draw(this.scene, x, y, pieceSize, die.value, {
          selected: isSelected
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

  drawRack(totalWidth, slotSize, top, gap) {
    const padX = Math.max(9, slotSize * 0.14);
    const padY = Math.max(8, slotSize * 0.12);
    const rackX = (this.scene.scale.width - totalWidth) / 2 - padX;
    const rackY = top - padY;
    const rackWidth = totalWidth + padX * 2;
    const rackHeight = slotSize + padY * 2;
    const radius = Math.max(14, slotSize * 0.2);
    const rack = this.scene.add.graphics();

    rack.fillStyle(0x5d3f26, 0.2);
    rack.fillRoundedRect(rackX + 2, rackY + 6, rackWidth, rackHeight, radius);
    rack.fillStyle(0xb8925d, 1);
    rack.fillRoundedRect(rackX, rackY, rackWidth, rackHeight, radius);
    rack.fillStyle(0xe0c59e, 1);
    rack.fillRoundedRect(rackX + 3, rackY + 3, rackWidth - 6, rackHeight - 6, radius - 3);
    rack.fillStyle(0xc59f68, 0.26);
    rack.fillRoundedRect(rackX + 7, rackY + 7, rackWidth - 14, rackHeight - 14, radius - 7);
    rack.lineStyle(2, 0xffefc9, 0.88);
    rack.strokeRoundedRect(rackX + 3, rackY + 3, rackWidth - 6, rackHeight - 6, radius - 3);
    rack.lineStyle(1, 0x8f6635, 0.78);
    rack.strokeRoundedRect(rackX, rackY, rackWidth, rackHeight, radius);

    this.objects.push(rack);
  }

  drawSlotHolder(x, y, size, { die, selected, empty }) {
    const holder = this.scene.add.graphics();
    const radius = Math.max(12, size * 0.2);
    const left = x - size / 2;
    const top = y - size / 2;
    const style = die ? DiceStyle.forValue(die.value) : null;
    const accent = selected ? 0xffd967 : style ? DiceStyle.hexToNumber(style.glow) : 0xa7875e;
    const accentAlpha = selected ? 0.95 : die ? 0.36 : 0.16;

    if (selected) {
      holder.fillStyle(0xffd967, 0.2);
      holder.fillRoundedRect(left - 4, top - 4, size + 8, size + 8, radius + 4);
      holder.lineStyle(3, 0xffe677, 0.9);
      holder.strokeRoundedRect(left - 3, top - 3, size + 6, size + 6, radius + 3);
    }

    holder.fillStyle(0x5d3f26, 0.2);
    holder.fillRoundedRect(left + 2, top + 4, size, size, radius);
    holder.fillStyle(0xad8859, 1);
    holder.fillRoundedRect(left, top, size, size, radius);
    holder.fillStyle(0xdfc6a0, 1);
    holder.fillRoundedRect(left + size * 0.055, top + size * 0.055, size * 0.89, size * 0.84, radius * 0.8);
    holder.fillStyle(0x795b37, 0.2);
    holder.fillRoundedRect(left + size * 0.13, top + size * 0.14, size * 0.74, size * 0.66, radius * 0.54);
    holder.fillStyle(empty ? 0xddcbb2 : 0xefddc1, 1);
    holder.fillRoundedRect(left + size * 0.18, top + size * 0.17, size * 0.64, size * 0.56, radius * 0.42);
    holder.fillStyle(0xffffff, 0.22);
    holder.fillRoundedRect(left + size * 0.21, top + size * 0.19, size * 0.42, size * 0.1, radius * 0.22);
    holder.lineStyle(selected ? 3 : 2, accent, accentAlpha);
    holder.strokeRoundedRect(left + 1, top + 1, size - 2, size - 2, radius);
    holder.lineStyle(1, 0xfff4df, 0.68);
    holder.strokeRoundedRect(left + size * 0.18, top + size * 0.17, size * 0.64, size * 0.56, radius * 0.4);

    const tabWidth = Math.max(4, size * 0.065);
    const tabHeight = Math.max(17, size * 0.3);
    holder.fillStyle(0xf2c261, selected ? 1 : 0.74);
    holder.fillRoundedRect(left - tabWidth * 0.45, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);
    holder.fillRoundedRect(left + size - tabWidth * 0.55, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);
    holder.lineStyle(1, 0x9f6b1e, 0.5);
    holder.strokeRoundedRect(left - tabWidth * 0.45, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);
    holder.strokeRoundedRect(left + size - tabWidth * 0.55, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);

    return holder;
  }
}
