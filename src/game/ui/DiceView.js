import { DiceModel } from '../core/DiceModel.js';

export class DiceView {
  static draw(scene, x, y, size, value, options = {}) {
    const group = scene.add.container(x, y);
    const isStar = value === 'star';
    const fill = isStar ? 0xfff2ad : options.fill ?? 0xffffff;
    const stroke = options.selected ? 0x315f50 : isStar ? 0xd09416 : 0xcddbd3;
    const lineWidth = options.selected ? 4 : 2;

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x2f2a1f, 0.12);
    shadow.fillRoundedRect(-size / 2 + 2, -size / 2 + 4, size, size, Math.max(8, size * 0.16));

    const body = scene.add.graphics();
    body.fillStyle(fill, 1);
    body.lineStyle(lineWidth, stroke, 1);
    body.fillRoundedRect(-size / 2, -size / 2, size, size, Math.max(8, size * 0.16));
    body.strokeRoundedRect(-size / 2, -size / 2, size, size, Math.max(8, size * 0.16));

    const label = scene.add.text(0, isStar ? -1 : 0, DiceModel.label(value), {
      color: isStar ? '#725207' : '#24312c',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: `${Math.round(size * (isStar ? 0.5 : 0.58))}px`,
      fontStyle: '700'
    }).setOrigin(0.5);

    group.add([shadow, body, label]);
    return group;
  }
}
