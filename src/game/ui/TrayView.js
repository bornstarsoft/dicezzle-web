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
    const padY = Math.max(7, slotSize * 0.11);
    const rackX = (this.scene.scale.width - totalWidth) / 2 - padX;
    const rackY = top - padY;
    const rackWidth = totalWidth + padX * 2;
    const rackHeight = slotSize + padY * 2;
    const radius = Math.max(14, slotSize * 0.2);
    const rack = this.scene.add.graphics();

    rack.fillStyle(0x5d3f26, 0.25);
    rack.fillRoundedRect(rackX + 2, rackY + 7, rackWidth, rackHeight, radius);
    rack.fillStyle(0xb99461, 1);
    rack.fillRoundedRect(rackX, rackY, rackWidth, rackHeight, radius);
    rack.fillStyle(0xdcc19a, 1);
    rack.fillRoundedRect(rackX + 3, rackY + 3, rackWidth - 6, rackHeight - 6, radius - 3);
    rack.lineStyle(3, 0xffefc9, 0.9);
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
      holder.fillStyle(0xffd967, 0.25);
      holder.fillRoundedRect(left - 7, top - 7, size + 14, size + 14, radius + 7);
      holder.lineStyle(4, 0xffe677, 0.9);
      holder.strokeRoundedRect(left - 5, top - 5, size + 10, size + 10, radius + 5);
    }

    holder.fillStyle(0x5d3f26, 0.24);
    holder.fillRoundedRect(left + 2, top + 5, size, size, radius);
    holder.fillStyle(0xa88456, 1);
    holder.fillRoundedRect(left, top, size, size, radius);
    holder.fillStyle(0xd3b78e, 1);
    holder.fillRoundedRect(left + size * 0.05, top + size * 0.05, size * 0.9, size * 0.86, radius * 0.8);
    holder.fillStyle(0x795b37, 0.22);
    holder.fillRoundedRect(left + size * 0.12, top + size * 0.13, size * 0.76, size * 0.68, radius * 0.56);
    holder.fillStyle(empty ? 0xd9c7ad : 0xead8bd, 1);
    holder.fillRoundedRect(left + size * 0.17, top + size * 0.16, size * 0.66, size * 0.58, radius * 0.44);
    holder.fillStyle(0xffffff, 0.2);
    holder.fillRoundedRect(left + size * 0.19, top + size * 0.18, size * 0.46, size * 0.12, radius * 0.25);
    holder.lineStyle(selected ? 4 : 2, accent, accentAlpha);
    holder.strokeRoundedRect(left + 1, top + 1, size - 2, size - 2, radius);
    holder.lineStyle(1, 0xfff4df, 0.68);
    holder.strokeRoundedRect(left + size * 0.17, top + size * 0.16, size * 0.66, size * 0.58, radius * 0.4);

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
