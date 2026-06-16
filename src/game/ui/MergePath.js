function toPoint(cell) {
  return { x: cell.x, y: cell.y };
}

function samePoint(left, right) {
  return left.x === right.x && left.y === right.y;
}

function compactPath(points) {
  return points.filter((point, index) => index === 0 || !samePoint(point, points[index - 1]));
}

export function getOrthogonalMergePath(source, target) {
  const start = toPoint(source);
  const end = toPoint(target);

  if (source.row === target.row || source.col === target.col) {
    return compactPath([start, end]);
  }

  const horizontalFirst = Math.abs(target.col - source.col) >= Math.abs(target.row - source.row);
  const turn = horizontalFirst
    ? { x: end.x, y: start.y }
    : { x: start.x, y: end.y };

  return compactPath([start, turn, end]);
}
