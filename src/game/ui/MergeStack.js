export const STACK_LAYER_SCALE = 1;

export function getStackLayerPoint(point, layerIndex, totalLayers, cellSize) {
  const stackOffset = Math.max(12, Math.min(cellSize * 0.24, 18));
  return {
    x: point.x,
    y: point.y - layerIndex * stackOffset,
    stackOffset
  };
}
