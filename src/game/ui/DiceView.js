import { DiceModel } from '../core/DiceModel.js';
import { DiceStyle } from './DiceStyle.js';

export class DiceView {
  static draw(scene, x, y, size, value, options = {}) {
    const group = scene.add.container(x, y);
    const isStar = value === 'star';
    const style = DiceStyle.forValue(value);
    const fill = options.fill ?? DiceStyle.hexToNumber(style.fill);
    const stroke = options.selected ? 0x315f50 : DiceStyle.hexToNumber(style.stroke);
    const lineWidth = options.selected ? 4 : 2;

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x2f2a1f, 0.12);
    shadow.fillRoundedRect(-size / 2 + 2, -size / 2 + 4, size, size, Math.max(8, size * 0.16));

    const body = scene.add.graphics();
    body.fillStyle(fill, 1);
    body.lineStyle(lineWidth, stroke, 1);
    body.fillRoundedRect(-size / 2, -size / 2, size, size, Math.max(8, size * 0.16));
    body.strokeRoundedRect(-size / 2, -size / 2, size, size, Math.max(8, size * 0.16));

    const face = isStar ? DiceView.drawStar(scene, size, style) : DiceView.drawPips(scene, size, value, style);

    group.add([shadow, body, face]);
    if (options.alpha !== undefined) {
      group.setAlpha(options.alpha);
    }
    if (options.depth !== undefined) {
      group.setDepth(options.depth);
    }
    return group;
  }

  static drawStar(scene, size, style) {
    return scene.add.text(0, -1, DiceModel.label('star'), {
      color: style.pip,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: `${Math.round(size * 0.58)}px`,
      fontStyle: '800'
    }).setOrigin(0.5);
  }

  static drawPips(scene, size, value, style) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(DiceStyle.hexToNumber(style.pip), 1);
    const radius = Math.max(4.5, size * 0.085);
    const offset = size * 0.24;
    const positions = {
      1: [[0, 0]],
      2: [[-offset, -offset], [offset, offset]],
      3: [[-offset, -offset], [0, 0], [offset, offset]],
      4: [[-offset, -offset], [offset, -offset], [-offset, offset], [offset, offset]],
      5: [[-offset, -offset], [offset, -offset], [0, 0], [-offset, offset], [offset, offset]],
      6: [[-offset, -offset], [offset, -offset], [-offset, 0], [offset, 0], [-offset, offset], [offset, offset]]
    };

    (positions[value] ?? positions[1]).forEach(([pipX, pipY]) => {
      graphics.fillCircle(pipX, pipY, radius);
    });

    return graphics;
  }
}
