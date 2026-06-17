function cellKey(row, col) {
  return `${row},${col}`;
}

export function createHiddenCellSet(cells = []) {
  return new Set(cells.map((cell) => cellKey(cell.row, cell.col)));
}

export function hideMergeSourceCell(hiddenCells, cell) {
  if (!hiddenCells || !cell) {
    return hiddenCells;
  }
  hiddenCells.add(cellKey(cell.row, cell.col));
  return hiddenCells;
}

export function isCellHidden(hiddenCells, row, col) {
  return Boolean(hiddenCells?.has(cellKey(row, col)));
}

export function applyMergeVisualEvent(board, event) {
  if (!board || !event) {
    return board;
  }

  if (event.type === 'merge') {
    event.group.forEach((cell) => board.clearCell(cell.row, cell.col));
    board.setCell(event.target.row, event.target.col, event.createdValue);
    return board;
  }

  if (event.type === 'starClear') {
    event.group.forEach((cell) => board.clearCell(cell.row, cell.col));
    for (let row = event.target.row - 1; row <= event.target.row + 1; row += 1) {
      for (let col = event.target.col - 1; col <= event.target.col + 1; col += 1) {
        if (row >= 0 && col >= 0 && row < board.size && col < board.size) {
          board.clearCell(row, col);
        }
      }
    }
  }

  return board;
}
