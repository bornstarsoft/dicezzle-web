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
    const padX = Math.max(8, slotSize * 0.12);
    const padY = Math.max(6, slotSize * 0.09);
    const rackX = (this.scene.scale.width - totalWidth) / 2 - padX;
    const rackY = top - padY;
    const rackWidth = totalWidth + padX * 2;
    const rackHeight = slotSize + padY * 2;
    const radius = Math.max(14, slotSize * 0.2);
    const rack = this.scene.add.graphics();

    rack.fillStyle(0x5d4a33, 0.16);
    rack.fillRoundedRect(rackX + 1, rackY + 5, rackWidth, rackHeight, radius);
    rack.fillStyle(0xd4bea0, 1);
    rack.fillRoundedRect(rackX, rackY, rackWidth, rackHeight, radius);
    rack.lineStyle(2, 0xffefd1, 0.78);
    rack.strokeRoundedRect(rackX + 2, rackY + 2, rackWidth - 4, rackHeight - 4, radius - 2);
    rack.lineStyle(1, 0xa7875e, 0.72);
    rack.strokeRoundedRect(rackX, rackY, rackWidth, rackHeight, radius);

    this.objects.push(rack);
  }

  drawSlotHolder(x, y, size, { die, selected, empty }) {
    const holder = this.scene.add.graphics();
    const radius = Math.max(11, size * 0.18);
    const left = x - size / 2;
    const top = y - size / 2;
    const style = die ? DiceStyle.forValue(die.value) : null;
    const accent = selected ? 0xffd967 : style ? DiceStyle.hexToNumber(style.glow) : 0xa7875e;
    const accentAlpha = selected ? 0.95 : die ? 0.36 : 0.16;

    if (selected) {
      holder.fillStyle(0xffd967, 0.2);
      holder.fillRoundedRect(left - 5, top - 5, size + 10, size + 10, radius + 5);
    }

    holder.fillStyle(0x6c5134, 0.18);
    holder.fillRoundedRect(left + 2, top + 4, size, size, radius);
    holder.fillStyle(0xcdb38f, 1);
    holder.fillRoundedRect(left, top, size, size, radius);
    holder.fillStyle(empty ? 0xd9c8ad : 0xe7d8c1, 1);
    holder.fillRoundedRect(left + size * 0.11, top + size * 0.1, size * 0.78, size * 0.76, radius * 0.62);
    holder.lineStyle(selected ? 4 : 2, accent, accentAlpha);
    holder.strokeRoundedRect(left + 1, top + 1, size - 2, size - 2, radius);
    holder.lineStyle(1, 0xfff4df, 0.5);
    holder.strokeRoundedRect(left + size * 0.14, top + size * 0.13, size * 0.72, size * 0.66, radius * 0.48);

    const tabWidth = Math.max(4, size * 0.075);
    const tabHeight = Math.max(18, size * 0.32);
    holder.fillStyle(0xf2c261, selected ? 1 : 0.74);
    holder.fillRoundedRect(left - tabWidth * 0.45, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);
    holder.fillRoundedRect(left + size - tabWidth * 0.55, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);
    holder.lineStyle(1, 0x9f6b1e, 0.5);
    holder.strokeRoundedRect(left - tabWidth * 0.45, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);
    holder.strokeRoundedRect(left + size - tabWidth * 0.55, y - tabHeight / 2, tabWidth, tabHeight, tabWidth);

    return holder;
  }
}
