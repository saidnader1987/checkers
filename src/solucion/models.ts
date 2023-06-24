import { Player, PieceType } from "../types";

/**
 * Represents a checkers piece.
 */
export class Piece {
  /**
   * Constructs a new Piece object.
   * @param {Player} owner - The owner of the piece.
   * @param {PieceType} type - The type of the piece.
   */
  constructor(private owner: Player, private type: PieceType) {}

  /**
   * Returns the owner of the piece.
   * @returns {Player} - The owner of the piece.
   */
  public getOwner(): Player {
    return this.owner;
  }

  /**
   * Returns the type of the piece.
   * @returns {PieceType} - The type of the piece.
   */
  public getType(): PieceType {
    return this.type;
  }
}

/**
 * Represents a tile on a checkers board.
 */
export class Tile {
  /**
   * Constructs a new Tile object.
   * @param {number} row - The row number of the tile.
   * @param {number} column - The column number of the tile.
   * @param {Piece | undefined} piece - The piece on the tile; `undefined` if there is no piece on the tile.
   */
  constructor(
    private row: number,
    private column: number,
    private piece: Piece | undefined
  ) {}

  /**
   * Returns the row number of the tile.
   * @returns {number} - The row number of the tile.
   */
  public getRow(): number {
    return this.row;
  }

  /**
   * Returns the column number of the tile.
   * @returns {number} - The column number of the tile.
   */
  public getColumn(): number {
    return this.column;
  }

  /**
   * Sets a piece on the tile or sets the piece to undefined.
   * @param {Piece | undefined} piece - The piece to set on the tile;  `undefined` if there is no piece on the tile.
   */
  public setPiece(piece: Piece | undefined) {
    this.piece = piece;
  }

  /**
   * Returns the piece on the tile or `undefined` if there is no piece.
   * @returns {Piece | undefined} - The piece on the tile, `undefined` if there is no piece on the tile.
   */
  public getPiece(): Piece | undefined {
    return this.piece;
  }
}

/**
 * Represents a checkers board.
 */
export class Board {
  private tiles: Tile[] = [];
  /**
   * Constructs a new Board object.
   */
  constructor() {
    this.tiles = Array.from({ length: 64 }, (_, index) => {
      const column: number = index % 8;
      const row: number = Math.floor(index / 8);
      const tile = new Tile(row, column, undefined);
      if ((row + column) % 2 === 0) {
        if (index < 24) {
          const piece =
            index === 0
              ? new Piece("blue", "queen")
              : new Piece("blue", "pawn");
          tile.setPiece(piece);
        } else if (index > 40) {
          const piece =
            index === 63 ? new Piece("red", "queen") : new Piece("red", "pawn");
          tile.setPiece(piece);
        } else {
          tile.setPiece(undefined);
        }
      } else {
        tile.setPiece(undefined);
      }
      return tile;
    });
  }

  /**
   * Returns the tile at the specified row and column, or `undefined` if no such tile exists on the board.
   * @param {number} row - The row number of the tile.
   * @param {number} column - The column number of the tile.
   * @returns {Tile | undefined} - The tile at the specified row and column, or undefined if no such tile exists on the board.
   */
  public getTile(row: number, column: number): Tile | undefined {
    return this.tiles.find(
      (tile) => tile.getRow() === row && tile.getColumn() === column
    );
  }

  /**
   * Returns an array of the tiles on the board.
   * @returns {Tile[]} - An array of tiles on the board.
   */
  public getTiles(): Tile[] {
    return this.tiles;
  }
}
