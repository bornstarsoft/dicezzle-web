import { DiceModel } from './DiceModel.js';

export class BoardModel {
  constructor(size = 5, cells = null) {
    this.size = size;
    this.cells = cells ?? Array.from({ length: size }, () => Array.from({ length: size }, () => null));
  }

  clone() {
    return new BoardModel(
      this.size,
      this.cells.map((row) => row.map((cell) => (cell ? { value: cell.value } : null)))
    );
  }

  validateCoordinate(row, col) {
    if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= this.size || col >= this.size) {
      throw new Error(`Coordinate (${row}, ${col}) is outside the board`);
    }
  }

  getCell(row, col) {
    this.validateCoordinate(row, col);
    const cell = this.cells[row][col];
    return cell ? { value: cell.value } : null;
  }

  getCellValue(row, col) {
    this.validateCoordinate(row, col);
    return this.cells[row][col]?.value ?? null;
  }

  setCell(row, col, value) {
    this.validateCoordinate(row, col);
    if (value !== null && !DiceModel.isValidValue(value)) {
      throw new Error(`Invalid die value: ${value}`);
    }
    this.cells[row][col] = value === null ? null : { value };
  }

  clearCell(row, col) {
    this.setCell(row, col, null);
  }

  placeDie(row, col, value) {
    this.validateCoordinate(row, col);
    if (!DiceModel.isValidValue(value)) {
      throw new Error(`Invalid die value: ${value}`);
    }
    if (this.cells[row][col]) {
      throw new Error('Cell is occupied');
    }
    this.cells[row][col] = { value };
  }

  isEmpty(row, col) {
    this.validateCoordinate(row, col);
    return this.cells[row][col] === null;
  }

  getEmptyCells() {
    const emptyCells = [];
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (!this.cells[row][col]) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells;
  }

  forEachCell(callback) {
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        callback(this.getCell(row, col), row, col);
      }
    }
  }

  toJSON() {
    return this.cells.map((row) => row.map((cell) => (cell ? cell.value : null)));
  }

  static fromJSON(cells) {
    return new BoardModel(cells.length, cells.map((row) => row.map((value) => (value === null ? null : { value }))));
  }
}
