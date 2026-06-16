import { DiceModel } from '../core/DiceModel.js';
import { DiceStyle } from './DiceStyle.js';

export class DiceView {
  static draw(scene, x, y, size, value, options = {}) {
    const group = scene.add.container(x, y);
    const isStar = value === 'star';
    const style = DiceStyle.forValue(value);
    const fill = options.fill ?? DiceStyle.hexToNumber(style.fill);
    const stroke = options.selected ? 0xf4bf45 : DiceStyle.hexToNumber(style.stroke);
    const lineWidth = options.selected ? Math.max(3, size * 0.055) : Math.max(2, size * 0.032);
    const radius = Math.max(10, size * 0.2);

    const shadow = scene.add.graphics();
    shadow.fillStyle(DiceStyle.hexToNumber(style.shadow), options.drag ? 0.3 : 0.22);
    shadow.fillRoundedRect(-size / 2 + size * 0.08, -size / 2 + size * 0.12, size, size, radius);

    const selectedGlow = scene.add.graphics();
    if (options.selected || options.drag) {
      selectedGlow.fillStyle(DiceStyle.hexToNumber(style.glow), options.drag ? 0.24 : 0.18);
      selectedGlow.fillRoundedRect(-size / 2 - size * 0.08, -size / 2 - size * 0.08, size * 1.16, size * 1.16, radius * 1.25);
    }

    const side = scene.add.graphics();
    side.fillStyle(DiceStyle.hexToNumber(style.side), 1);
    side.fillRoundedRect(-size / 2, -size / 2 + size * 0.08, size, size, radius);

    const body = scene.add.graphics();
    body.fillStyle(fill, 1);
    body.lineStyle(lineWidth, stroke, 1);
    body.fillRoundedRect(-size / 2, -size / 2, size, size * 0.94, radius);
    body.strokeRoundedRect(-size / 2, -size / 2, size, size * 0.94, radius);

    const rim = scene.add.graphics();
    rim.lineStyle(Math.max(1, size * 0.018), DiceStyle.hexToNumber(style.rim), 0.42);
    rim.strokeRoundedRect(-size / 2 + size * 0.07, -size / 2 + size * 0.06, size * 0.86, size * 0.74, radius * 0.68);

    const shine = scene.add.graphics();
    shine.fillStyle(DiceStyle.hexToNumber(style.highlight), 0.34);
    shine.fillRoundedRect(-size * 0.34, -size * 0.38, size * 0.58, size * 0.19, radius * 0.5);
    shine.fillStyle(0xffffff, 0.18);
    shine.fillCircle(-size * 0.18, -size * 0.22, size * 0.11);

    const face = isStar ? DiceView.drawStar(scene, size, style) : DiceView.drawPips(scene, size, value, style);

    group.add([shadow, selectedGlow, side, body, rim, shine, face]);
    if (options.alpha !== undefined) {
      group.setAlpha(options.alpha);
    }
    if (options.depth !== undefined) {
      group.setDepth(options.depth);
    }
    return group;
  }

  static drawStar(scene, size, style) {
    const star = scene.add.container(0, -size * 0.02);
    const shadow = scene.add.text(size * 0.025, size * 0.035, DiceModel.label('star'), {
      color: style.pipShadow,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: `${Math.round(size * 0.56)}px`,
      fontStyle: '900'
    }).setOrigin(0.5).setAlpha(0.72);
    const face = scene.add.text(0, 0, DiceModel.label('star'), {
      color: style.pip,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: `${Math.round(size * 0.56)}px`,
      fontStyle: '900'
    }).setOrigin(0.5);
    star.add([shadow, face]);
    return star;
  }

  static drawPips(scene, size, value, style) {
    const graphics = scene.add.graphics();
    const radius = Math.max(5, size * 0.088);
    const offset = size * 0.235;
    const positions = {
      1: [[0, 0]],
      2: [[-offset, -offset], [offset, offset]],
      3: [[-offset, -offset], [0, 0], [offset, offset]],
      4: [[-offset, -offset], [offset, -offset], [-offset, offset], [offset, offset]],
      5: [[-offset, -offset], [offset, -offset], [0, 0], [-offset, offset], [offset, offset]],
      6: [[-offset, -offset], [offset, -offset], [-offset, 0], [offset, 0], [-offset, offset], [offset, offset]]
    };

    (positions[value] ?? positions[1]).forEach(([pipX, pipY]) => {
      graphics.fillStyle(DiceStyle.hexToNumber(style.pipShadow), 0.58);
      graphics.fillCircle(pipX + size * 0.025, pipY + size * 0.03, radius * 1.08);
      graphics.fillStyle(DiceStyle.hexToNumber(style.pip), 1);
      graphics.fillCircle(pipX, pipY, radius);
      graphics.lineStyle(Math.max(1, size * 0.012), 0xffffff, 0.36);
      graphics.strokeCircle(pipX - size * 0.006, pipY - size * 0.006, radius * 0.82);
    });

    return graphics;
  }
}
