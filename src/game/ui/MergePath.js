function toPoint(cell) {
  return { x: cell.x, y: cell.y };
}

function samePoint(left, right) {
  return left.x === right.x && left.y === right.y;
}

function compactPath(points) {
  return points.filter((point, index) => index === 0 || !samePoint(point, points[index - 1]));
}

function cellKey(cell) {
  return `${cell.row},${cell.col}`;
}

function isBlocked(cell, blockedCells = []) {
  return blockedCells.some((blocked) => blocked.row === cell.row && blocked.col === cell.col);
}

function distance(left, right) {
  return Math.abs(left.row - right.row) + Math.abs(left.col - right.col);
}

function chooseTurn(source, target, blockedCells = []) {
  const horizontalFirst = {
    point: { x: target.x, y: source.y },
    cell: { row: source.row, col: target.col }
  };
  const verticalFirst = {
    point: { x: source.x, y: target.y },
    cell: { row: target.row, col: source.col }
  };
  const preferred = Math.abs(target.col - source.col) >= Math.abs(target.row - source.row)
    ? horizontalFirst
    : verticalFirst;
  const alternate = preferred === horizontalFirst ? verticalFirst : horizontalFirst;

  if (isBlocked(preferred.cell, blockedCells) && !isBlocked(alternate.cell, blockedCells)) {
    return alternate.point;
  }
  return preferred.point;
}

export function getOrthogonalMergePath(source, target, options = {}) {
  const start = toPoint(source);
  const end = toPoint(target);

  if (source.row === target.row || source.col === target.col) {
    return compactPath([start, end]);
  }

  const turn = chooseTurn(source, target, options.blockedCells ?? []);

  return compactPath([start, turn, end]);
}

export function buildMergeGatherPlan({ group = [], target, blockedCells = [] } = {}) {
  if (!target || !group.length) {
    return { steps: [] };
  }

  const targetKey = cellKey(target);
  const mergeKeys = new Set(group.map(cellKey));
  const visualBlockers = blockedCells.filter((cell) => !mergeKeys.has(cellKey(cell)));
  const sources = group
    .filter((cell) => cellKey(cell) !== targetKey)
    .sort((left, right) => distance(right, target) - distance(left, target));

  const steps = sources.map((source, index) => {
    const sourceDistance = distance(source, target);
    const candidates = group
      .filter((candidate) => cellKey(candidate) !== cellKey(source))
      .filter((candidate) => distance(candidate, target) < sourceDistance);
    const to = candidates.sort((left, right) => {
      const sourceDelta = distance(source, left) - distance(source, right);
      if (sourceDelta !== 0) {
        return sourceDelta;
      }
      return distance(left, target) - distance(right, target);
    })[0] ?? target;
    return {
      from: source,
      to,
      stage: index,
      final: cellKey(to) === targetKey,
      path: getOrthogonalMergePath(source, to, { blockedCells: visualBlockers })
    };
  });

  return { steps };
}
