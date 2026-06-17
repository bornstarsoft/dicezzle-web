import { DiceStyle } from './DiceStyle.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class DiceView {
  static draw(scene, x, y, size, value, options = {}) {
    const group = scene.add.container(x, y);
    const isStar = value === 'star';
    const style = DiceStyle.forValue(value);
    const fill = options.fill ?? DiceStyle.hexToNumber(style.fill);
    const stroke = options.selected ? 0xf4bf45 : DiceStyle.hexToNumber(style.stroke);
    const lineWidth = options.selected ? Math.max(2, size * 0.042) : Math.max(2, size * 0.034);
    const radius = Math.max(11, size * 0.22);
    const faceSize = size * 0.86;
    const faceLeft = -faceSize / 2;
    const faceTop = -size * 0.5;
    const faceRadius = Math.max(10, size * 0.2);

    const shadow = scene.add.graphics();
    shadow.fillStyle(DiceStyle.hexToNumber(style.shadow), options.drag ? 0.34 : 0.23);
    shadow.fillEllipse(size * 0.04, size * 0.43, size * 0.82, size * 0.2);

    const selectedGlow = scene.add.graphics();
    if (options.drag) {
      selectedGlow.lineStyle(Math.max(3, size * 0.052), DiceStyle.hexToNumber(style.glow), 0.76);
      selectedGlow.strokeRoundedRect(-size * 0.55, -size * 0.57, size * 1.1, size * 1.1, radius * 1.16);
      selectedGlow.fillStyle(DiceStyle.hexToNumber(style.glow), 0.16);
      selectedGlow.fillRoundedRect(-size * 0.57, -size * 0.59, size * 1.14, size * 1.14, radius * 1.22);
    } else if (options.selected) {
      selectedGlow.lineStyle(Math.max(2, size * 0.03), 0xffe177, 0.9);
      selectedGlow.strokeRoundedRect(-size * 0.515, -size * 0.535, size * 1.03, size * 1.03, radius * 1.05);
    }

    const cube = scene.add.graphics();
    cube.fillStyle(DiceStyle.hexToNumber(style.shadow), 0.2);
    cube.fillRoundedRect(-size * 0.47, -size * 0.3, size * 0.94, size * 0.78, radius);
    cube.fillStyle(DiceStyle.hexToNumber(style.side), 1);
    cube.fillRoundedRect(-size * 0.49, -size * 0.29, size * 0.98, size * 0.78, radius);
    cube.fillStyle(DiceStyle.hexToNumber(style.shadow), 0.22);
    cube.fillRoundedRect(-size * 0.45, size * 0.2, size * 0.9, size * 0.24, radius * 0.7);
    cube.lineStyle(Math.max(1, size * 0.018), DiceStyle.hexToNumber(style.shadow), 0.28);
    cube.strokeRoundedRect(-size * 0.49, -size * 0.29, size * 0.98, size * 0.78, radius);

    const body = scene.add.graphics();
    body.fillStyle(fill, 1);
    body.lineStyle(lineWidth, stroke, 1);
    body.fillRoundedRect(faceLeft, faceTop, faceSize, faceSize, faceRadius);
    body.strokeRoundedRect(faceLeft, faceTop, faceSize, faceSize, faceRadius);

    const rim = scene.add.graphics();
    rim.lineStyle(Math.max(1, size * 0.018), DiceStyle.hexToNumber(style.rim), 0.7);
    rim.strokeRoundedRect(-size * 0.36, -size * 0.43, size * 0.72, size * 0.72, radius * 0.58);
    rim.lineStyle(Math.max(1, size * 0.014), DiceStyle.hexToNumber(style.shadow), 0.16);
    rim.strokeRoundedRect(faceLeft + size * 0.025, faceTop + size * 0.025, faceSize - size * 0.05, faceSize - size * 0.05, faceRadius * 0.86);

    const shine = scene.add.graphics();
    shine.fillStyle(DiceStyle.hexToNumber(style.highlight), 0.42);
    shine.fillRoundedRect(-size * 0.29, -size * 0.43, size * 0.52, size * 0.12, radius * 0.38);
    shine.fillStyle(0xffffff, 0.18);
    shine.fillRoundedRect(-size * 0.33, -size * 0.44, size * 0.4, size * 0.07, radius * 0.26);
    shine.fillStyle(0xffffff, 0.16);
    shine.fillCircle(size * 0.24, -size * 0.24, size * 0.042);

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

  static getFaceGeometry(size) {
    const centerY = -size * 0.07;
    const halfSafe = size * 0.295;
    return {
      centerX: 0,
      centerY,
      safe: {
        left: -halfSafe,
        right: halfSafe,
        top: centerY - halfSafe,
        bottom: centerY + halfSafe
      }
    };
  }

  static getPipLayout(size, value) {
    const { centerX, centerY, safe } = DiceView.getFaceGeometry(size);
    const radius = clamp(size * 0.074, 4, 6.1);
    const offset = size * 0.17;
    const grid = {
      left: centerX - offset,
      center: centerX,
      right: centerX + offset,
      top: centerY - offset,
      middle: centerY,
      bottom: centerY + offset
    };
    const positions = {
      1: [[grid.center, grid.middle]],
      2: [[grid.left, grid.top], [grid.right, grid.bottom]],
      3: [[grid.left, grid.top], [grid.center, grid.middle], [grid.right, grid.bottom]],
      4: [[grid.left, grid.top], [grid.right, grid.top], [grid.left, grid.bottom], [grid.right, grid.bottom]],
      5: [[grid.left, grid.top], [grid.right, grid.top], [grid.center, grid.middle], [grid.left, grid.bottom], [grid.right, grid.bottom]],
      6: [[grid.left, grid.top], [grid.right, grid.top], [grid.left, grid.middle], [grid.right, grid.middle], [grid.left, grid.bottom], [grid.right, grid.bottom]]
    };

    return {
      centerX,
      centerY,
      safe,
      radius,
      positions: (positions[value] ?? positions[1]).map(([pipX, pipY]) => ({ x: pipX, y: pipY }))
    };
  }

  static getStarLayout(size) {
    const { centerX, centerY, safe } = DiceView.getFaceGeometry(size);
    return {
      centerX,
      centerY,
      safe,
      outerRadius: size * 0.225
    };
  }

  static drawStar(scene, size, style) {
    const layout = DiceView.getStarLayout(size);
    const star = scene.add.container(0, 0);
    const shadow = scene.add.graphics();
    DiceView.drawStarShape(shadow, layout.outerRadius, layout.centerX + size * 0.018, layout.centerY + size * 0.032, DiceStyle.hexToNumber(style.pipShadow), 0.64, 0x6d4307, 0.45);
    const face = scene.add.graphics();
    DiceView.drawStarShape(face, layout.outerRadius, layout.centerX, layout.centerY, DiceStyle.hexToNumber(style.pip), 1, DiceStyle.hexToNumber(style.pipShadow), 0.82);
    const shine = scene.add.graphics();
    DiceView.drawStarShape(shine, layout.outerRadius * 0.48, layout.centerX - size * 0.04, layout.centerY - size * 0.055, 0xffffff, 0.3, 0xffffff, 0);
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
    const layout = DiceView.getPipLayout(size, value);
    const { radius } = layout;

    layout.positions.forEach(({ x: pipX, y: pipY }) => {
      graphics.fillStyle(DiceStyle.hexToNumber(style.shadow), 0.28);
      graphics.fillCircle(pipX + radius * 0.2, pipY + radius * 0.26, radius * 1.2);
      graphics.fillStyle(DiceStyle.hexToNumber(style.pipShadow), 0.82);
      graphics.fillCircle(pipX, pipY, radius * 1.05);
      graphics.fillStyle(DiceStyle.hexToNumber(style.pip), 1);
      graphics.fillCircle(pipX - radius * 0.06, pipY - radius * 0.08, radius * 0.78);
      graphics.fillStyle(0xffffff, 0.42);
      graphics.fillCircle(pipX - radius * 0.22, pipY - radius * 0.24, radius * 0.2);
      graphics.lineStyle(Math.max(1, size * 0.011), 0xffffff, 0.28);
      graphics.strokeCircle(pipX - radius * 0.04, pipY - radius * 0.06, radius * 0.76);
    });

    return graphics;
  }
}
