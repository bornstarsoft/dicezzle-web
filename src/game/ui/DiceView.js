import { DiceStyle } from './DiceStyle.js';

export class DiceView {
  static draw(scene, x, y, size, value, options = {}) {
    const group = scene.add.container(x, y);
    const isStar = value === 'star';
    const style = DiceStyle.forValue(value);
    const fill = options.fill ?? DiceStyle.hexToNumber(style.fill);
    const stroke = options.selected ? 0xf4bf45 : DiceStyle.hexToNumber(style.stroke);
    const lineWidth = options.selected ? Math.max(4, size * 0.068) : Math.max(2, size * 0.038);
    const radius = Math.max(12, size * 0.23);

    const shadow = scene.add.graphics();
    shadow.fillStyle(DiceStyle.hexToNumber(style.shadow), options.drag ? 0.32 : 0.25);
    shadow.fillEllipse(size * 0.04, size * 0.42, size * 0.9, size * 0.24);

    const selectedGlow = scene.add.graphics();
    if (options.selected || options.drag) {
      selectedGlow.lineStyle(Math.max(4, size * 0.065), options.selected ? 0xffdf66 : DiceStyle.hexToNumber(style.glow), options.drag ? 0.76 : 0.9);
      selectedGlow.strokeRoundedRect(-size / 2 - size * 0.09, -size / 2 - size * 0.1, size * 1.18, size * 1.15, radius * 1.28);
      selectedGlow.fillStyle(DiceStyle.hexToNumber(style.glow), options.drag ? 0.2 : 0.15);
      selectedGlow.fillRoundedRect(-size / 2 - size * 0.12, -size / 2 - size * 0.12, size * 1.24, size * 1.2, radius * 1.35);
    }

    const cube = scene.add.graphics();
    cube.fillStyle(DiceStyle.hexToNumber(style.shadow), 0.18);
    cube.fillRoundedRect(-size / 2 + size * 0.02, -size / 2 + size * 0.1, size, size * 0.88, radius);
    cube.fillStyle(DiceStyle.hexToNumber(style.side), 1);
    cube.fillRoundedRect(-size / 2, -size / 2 + size * 0.14, size, size * 0.86, radius);
    cube.fillStyle(DiceStyle.hexToNumber(style.shadow), 0.18);
    cube.fillRoundedRect(-size / 2, size * 0.2, size, size * 0.31, radius * 0.78);
    cube.fillStyle(0xffffff, 0.12);
    cube.fillRoundedRect(-size / 2 + size * 0.05, -size / 2 + size * 0.15, size * 0.9, size * 0.16, radius * 0.62);

    const body = scene.add.graphics();
    body.fillStyle(fill, 1);
    body.lineStyle(lineWidth, stroke, 1);
    body.fillRoundedRect(-size / 2, -size / 2 - size * 0.04, size, size * 0.88, radius);
    body.strokeRoundedRect(-size / 2, -size / 2 - size * 0.04, size, size * 0.88, radius);

    const rim = scene.add.graphics();
    rim.lineStyle(Math.max(1, size * 0.02), DiceStyle.hexToNumber(style.rim), 0.64);
    rim.strokeRoundedRect(-size / 2 + size * 0.065, -size / 2 + size * 0.02, size * 0.87, size * 0.7, radius * 0.68);
    rim.lineStyle(Math.max(1, size * 0.016), DiceStyle.hexToNumber(style.shadow), 0.2);
    rim.strokeRoundedRect(-size / 2 + size * 0.015, -size / 2 - size * 0.02, size * 0.97, size * 0.82, radius * 0.9);

    const shine = scene.add.graphics();
    shine.fillStyle(DiceStyle.hexToNumber(style.highlight), 0.5);
    shine.fillRoundedRect(-size * 0.33, -size * 0.42, size * 0.6, size * 0.18, radius * 0.48);
    shine.fillStyle(0xffffff, 0.23);
    shine.fillCircle(-size * 0.23, -size * 0.24, size * 0.095);
    shine.fillStyle(0xffffff, 0.08);
    shine.fillCircle(size * 0.26, -size * 0.22, size * 0.05);

    const face = isStar ? DiceView.drawStar(scene, size, style) : DiceView.drawPips(scene, size, value, style);

    group.add([shadow, selectedGlow, cube, body, rim, shine, face]);
    if (options.alpha !== undefined) {
      group.setAlpha(options.alpha);
    }
    if (options.depth !== undefined) {
      group.setDepth(options.depth);
    }
    return group;
  }

  static drawStar(scene, size, style) {
    const star = scene.add.container(0, -size * 0.05);
    const shadow = scene.add.graphics();
    DiceView.drawStarShape(shadow, size * 0.31, size * 0.025, size * 0.045, DiceStyle.hexToNumber(style.pipShadow), 0.72, 0x6d4307, 0.5);
    const face = scene.add.graphics();
    DiceView.drawStarShape(face, size * 0.31, 0, 0, DiceStyle.hexToNumber(style.pip), 1, DiceStyle.hexToNumber(style.pipShadow), 0.8);
    const shine = scene.add.graphics();
    DiceView.drawStarShape(shine, size * 0.16, -size * 0.05, -size * 0.06, 0xffffff, 0.3, 0xffffff, 0);
    star.add([shadow, face, shine]);
    return star;
  }

  static drawStarShape(graphics, outerRadius, x, y, fill, alpha, stroke, strokeAlpha) {
    const points = [];
    const innerRadius = outerRadius * 0.48;
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 === 0 ? outerRadius : innerRadius;
      const angle = -Math.PI / 2 + index * Math.PI / 5;
      points.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius
      });
    }
    graphics.fillStyle(fill, alpha);
    graphics.lineStyle(Math.max(1, outerRadius * 0.11), stroke, strokeAlpha);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
    graphics.closePath();
    graphics.fillPath();
    if (strokeAlpha > 0) {
      graphics.strokePath();
    }
  }

  static drawPips(scene, size, value, style) {
    const graphics = scene.add.graphics();
    const radius = Math.max(5.6, size * 0.1);
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
      graphics.fillStyle(DiceStyle.hexToNumber(style.shadow), 0.42);
      graphics.fillCircle(pipX + size * 0.025, pipY + size * 0.032, radius * 1.22);
      graphics.fillStyle(DiceStyle.hexToNumber(style.pipShadow), 0.74);
      graphics.fillCircle(pipX + size * 0.012, pipY + size * 0.018, radius * 1.07);
      graphics.fillStyle(DiceStyle.hexToNumber(style.pip), 1);
      graphics.fillCircle(pipX - size * 0.005, pipY - size * 0.006, radius * 0.9);
      graphics.lineStyle(Math.max(1, size * 0.014), 0xffffff, 0.42);
      graphics.strokeCircle(pipX - size * 0.012, pipY - size * 0.012, radius * 0.72);
    });

    return graphics;
  }
}
