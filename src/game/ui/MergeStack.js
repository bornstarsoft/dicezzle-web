export const STACK_LAYER_SCALE = 1;

export function getStackLayerPoint(point, layerIndex, totalLayers, cellSize) {
  const stackOffset = Math.max(12, Math.min(cellSize * 0.24, 18));
  return {
    x: point.x,
    y: point.y - layerIndex * stackOffset,
    stackOffset
  };
}

export function getMergeStackFeedback(event = {}) {
  const groupSize = event.groupSize ?? event.group?.length ?? 0;
  if (groupSize < 4) {
    return null;
  }

  return {
    groupSize,
    score: event.score ?? 0,
    level: groupSize >= 5 ? 'huge' : 'big',
    title: groupSize >= 5 ? `${groupSize} Dice Merge!` : '4 Dice Merge!'
  };
}

export function takeNextStackArrival(queue = []) {
  return queue.shift() ?? null;
}
