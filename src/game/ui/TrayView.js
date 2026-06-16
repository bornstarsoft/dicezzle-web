import { DiceView } from './DiceView.js';
import { DiceStyle } from './DiceStyle.js';
import { calculateGameLayout } from './GameLayout.js';

export class TrayView {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.slotDice = [];
  }

  clear() {
    this.objects.forEach((object) => object.destroy());
    this.objects = [];
    this.slotDice = [];
  }

  draw(tray, options = {}) {
    this.clear();
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const slotCount = options.slotCount ?? Math.max(3, tray.length);
    const gameLayout = options.layout ?? calculateGameLayout({ width, height, traySize: slotCount });
    const { slotSize, hitSize, gap, y, centers, totalWidth, top } = gameLayout.tray;
    const pieceSize = gameLayout.tray.pieceSize;
    this.layout = { slotCount, slotSize, hitSize, pieceSize, gap, y, centers };

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
        const dieObject = DiceView.draw(this.scene, x, y, pieceSize, die.value, {
          selected: isSelected
        });
        this.slotDice[index] = dieObject;
        this.objects.push(dieObject);
      }

      const zone = this.scene.add.zone(x, y, hitSize, hitSize).setDepth(120);
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

  setSlotDieVisible(index, visible) {
    this.slotDice[index]?.setVisible(visible);
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

    rack.fillStyle(0x31433a, 0.12);
    rack.fillRoundedRect(rackX + 1, rackY + 5, rackWidth, rackHeight, radius);
    rack.fillStyle(0xd6dfd2, 1);
    rack.fillRoundedRect(rackX, rackY, rackWidth, rackHeight, radius);
    rack.fillStyle(0xf4efe4, 1);
    rack.fillRoundedRect(rackX + 3, rackY + 3, rackWidth - 6, rackHeight - 6, radius - 3);
    rack.lineStyle(1, 0xffffff, 0.72);
    rack.strokeRoundedRect(rackX + 3, rackY + 3, rackWidth - 6, rackHeight - 6, radius - 3);
    rack.lineStyle(1, 0xb7c4b6, 0.86);
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
      holder.fillStyle(0xffd967, 0.16);
      holder.fillRoundedRect(left - 4, top - 4, size + 8, size + 8, radius + 4);
      holder.lineStyle(3, 0xffe677, 0.9);
      holder.strokeRoundedRect(left - 3, top - 3, size + 6, size + 6, radius + 3);
    }

    holder.fillStyle(0x31433a, 0.12);
    holder.fillRoundedRect(left + 1, top + 4, size, size, radius);
    holder.fillStyle(0xcfc2aa, 1);
    holder.fillRoundedRect(left, top, size, size, radius);
    holder.fillStyle(0xf3eadb, 1);
    holder.fillRoundedRect(left + size * 0.055, top + size * 0.055, size * 0.89, size * 0.84, radius * 0.8);
    holder.fillStyle(0x90775a, 0.12);
    holder.fillRoundedRect(left + size * 0.13, top + size * 0.14, size * 0.74, size * 0.66, radius * 0.54);
    holder.fillStyle(empty ? 0xe8dfd1 : 0xf7f0e3, 1);
    holder.fillRoundedRect(left + size * 0.18, top + size * 0.17, size * 0.64, size * 0.56, radius * 0.42);
    holder.fillStyle(0xffffff, 0.26);
    holder.fillRoundedRect(left + size * 0.21, top + size * 0.19, size * 0.42, size * 0.1, radius * 0.22);
    holder.lineStyle(selected ? 3 : 2, accent, accentAlpha);
    holder.strokeRoundedRect(left + 1, top + 1, size - 2, size - 2, radius);
    holder.lineStyle(1, 0xfff4df, 0.68);
    holder.strokeRoundedRect(left + size * 0.18, top + size * 0.17, size * 0.64, size * 0.56, radius * 0.4);

    return holder;
  }
}
