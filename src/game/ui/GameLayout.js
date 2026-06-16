function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function compactRound(value) {
  return Math.floor(value * 10) / 10;
}

export function calculateGameLayout({ width = 390, height = 430, boardSize = 5, traySize = 3 } = {}) {
  const compact = width < 560;
  const topMargin = compact ? 8 : 14;
  const bottomMargin = compact ? 6 : 10;
  const sideMargin = clamp(width * (compact ? 0.035 : 0.045), compact ? 10 : 18, compact ? 16 : 28);
  const trayGap = compact ? 24 : 20;
  const traySlotGap = clamp(width * 0.026, compact ? 8 : 10, compact ? 12 : 16);
  const maxTraySlot = compact ? 76 : 90;
  const minTraySlot = compact ? 62 : 76;
  const traySlotSize = Math.floor(clamp(
    (width - sideMargin * 2 - traySlotGap * (traySize - 1)) / traySize,
    minTraySlot,
    maxTraySlot
  ));
  const availableBoardHeight = Math.max(220, height - topMargin - trayGap - traySlotSize - bottomMargin);
  const availableBoardWidth = width - sideMargin * 2;
  const maxBoardSize = compact ? 342 : 420;
  const rawBoardSize = Math.floor(Math.min(availableBoardWidth, availableBoardHeight, maxBoardSize));
  const cellGap = compactRound(clamp(rawBoardSize * 0.014, 4, compact ? 5.5 : 7));
  const cellSize = compactRound((rawBoardSize - cellGap * (boardSize - 1)) / boardSize);
  const renderedBoardSize = compactRound(cellSize * boardSize + cellGap * (boardSize - 1));
  const dieSize = Math.floor(Math.min(cellSize * 0.94, traySlotSize * 0.82));
  const boardOriginX = compactRound((width - renderedBoardSize) / 2);
  const boardOriginY = topMargin;
  const trayTop = compactRound(boardOriginY + renderedBoardSize + trayGap);
  const trayY = compactRound(trayTop + traySlotSize / 2);
  const trayTotalWidth = compactRound(traySlotSize * traySize + traySlotGap * (traySize - 1));
  const trayStartX = compactRound((width - trayTotalWidth) / 2 + traySlotSize / 2);
  const trayCenters = Array.from({ length: traySize }, (_, index) => ({
    x: compactRound(trayStartX + index * (traySlotSize + traySlotGap)),
    y: trayY
  }));

  return {
    width,
    height,
    compact,
    topMargin,
    bottomMargin,
    sideMargin,
    trayGap,
    board: {
      originX: boardOriginX,
      originY: boardOriginY,
      size: renderedBoardSize,
      boardSize: renderedBoardSize,
      cellSize,
      dieSize,
      gap: cellGap,
      cells: boardSize,
      bottom: compactRound(boardOriginY + renderedBoardSize)
    },
    tray: {
      slotCount: traySize,
      slotSize: traySlotSize,
      pieceSize: dieSize,
      gap: traySlotGap,
      top: trayTop,
      y: trayY,
      bottom: compactRound(trayTop + traySlotSize),
      totalWidth: trayTotalWidth,
      centers: trayCenters
    },
    drag: {
      dieSize
    }
  };
}
