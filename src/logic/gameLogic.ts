import { Board, Piece, Tile } from "./models";
import {
  Player,
  TileOwner,
  Instruction,
  GameStatus,
  TileInstruction,
} from "../types";

// Interfaces
interface Move {
  from: Tile | undefined;
  to: Tile | undefined;
  possiblePaths: Tile[][];
  validDestinations: ValidDestination[];
}

interface GameState {
  board: Board;
  status: GameStatus;
  winner: Player | undefined;
  move: Move;
  activePlayer: Player;
}

interface ValidDestination {
  path: Tile[];
  destination: Tile;
  captures: Tile[] | [];
}

/**
 * Represents a game of checkers.
 */
abstract class Game {
  protected gameState: GameState = {
    status: "active",
    board: new Board(),
    winner: undefined,
    move: {
      from: undefined,
      to: undefined,
      possiblePaths: [],
      validDestinations: [],
    },
    activePlayer: "blue",
  };

  /**
   * Restarts the game: restarts game state and give instructions to UI so that it can also reset the game board view.
   * @returns {Instruction} A set of instructions to update the UI.
   */
  public restartGame(): Instruction {
    // Restarts game state
    this.gameState = {
      status: "active",
      board: new Board(),
      winner: undefined,
      move: {
        from: undefined,
        to: undefined,
        possiblePaths: [],
        validDestinations: [],
      },
      activePlayer: "blue",
    };
    // Restarts UI
    const instructions: Instruction = {
      tileInstructions: [],
      playing: "blue",
      winner: undefined,
    };
    // Makes a set of instructions to update the UI
    this.getBoard()
      .getTiles()
      .forEach((tile, index) => {
        const column = tile.getColumn();
        const row = tile.getRow();
        let instruction: TileInstruction;
        if ((row + column) % 2 === 0 && index < 24) {
          instruction = {
            colToSet: column,
            rowToSet: row,
            newOwner: index === 0 ? "blue queen" : "blue pawn",
          };
        } else if ((row + column) % 2 === 0 && index > 40) {
          instruction = {
            colToSet: column,
            rowToSet: row,
            newOwner: index === 63 ? "red queen" : "red pawn",
          };
        } else {
          instruction = {
            colToSet: column,
            rowToSet: row,
            newOwner: "none",
          };
        }
        instructions.tileInstructions.push(instruction);
      });
    return instructions;
  }

  /**
   * Returns the current game board.
   * @returns {Board} The game board.
   */
  protected getBoard(): Board {
    return this.gameState.board;
  }

  /**
   * Returns the current status of the game.
   * @returns {GameStatus} The game status.
   */
  protected getGameStatus(): GameStatus {
    return this.gameState.status;
  }

  /**
   * Prints the current state of the game board in the console for debugging purposes.
   * @returns {void}
   */
  public printBoard(): void {
    const tiles = this.getBoard().getTiles();
    // Make an array of 8 rows (each of which will have 8 tiles)
    const rows = Array.from({ length: 8 }, (_, index) =>
      tiles.filter((tile) => tile.getRow() === index)
    );
    console.log("    C0   C1   C2   C3   C4   C5   C6   C7 ");
    // For each row print a string representing that row
    rows.forEach((row, index) => {
      // An array of strings that will be printed as a big string for each row
      const rowString = row.map((tile) => {
        let tileRep;
        const tileOwner = this.getTileOwnerString(tile);
        if (tileOwner === "none") {
          tileRep = "  ";
        } else if (tileOwner === "blue queen") {
          tileRep = "bq";
        } else if (tileOwner === "red queen") {
          tileRep = "rq";
        } else if (tileOwner === "blue pawn") {
          tileRep = "bp";
        } else if (tileOwner === "red pawn") {
          tileRep = "rp";
        }
        return `[${tileRep}]`;
      });
      console.log(`R${index} ${rowString}`);
    });
  }

  /**
   * Sets a new queen on a tile for a player.
   * @param {Tile} tile - The tile on which to set the new queen.
   * @param {Player} player - The owner of the new queen
   * @returns {void}
   */
  protected setNewQueen(tile: Tile, player: Player): void {
    const piece = new Piece(player, "queen");
    tile.setPiece(piece);
  }

  /**
   * Determines whether a pawn can be promoted to queen on a specified tile for a specified player.
   * @param {Tile} tile - The tile to check
   * @param {Player} player - The player that is trying to promote the pawn to a queen
   * @returns {boolean} `true` if the pawn can be promoted to queen on this tile, `false` otherwise.
   */
  protected isValidQueen(tile: Tile, player: Player): boolean {
    return this.getIdlePieceTiles(player).some((idle) => idle === tile);
  }

  /**
   * Checks if a given piece is a queen.
   * @param {Piece} piece - The piece to check.
   * @returns {boolean} - `true` if the piece is a queen, `false` otherwise.
   */
  protected isQueen(piece: Piece): boolean {
    return piece.getType() === "queen";
  }

  /**
   * Returns the tile that the given player's queen is on, `undefined` if the player has no queen.
   * @param {Player} player - The player to check.
   * @returns {Tile | undefined} The tile with the player's queen or `undefined`.
   */
  protected getQueen(player: Player): Tile | undefined {
    return this.getBoard()
      .getTiles()
      .find((tile) => {
        const piece = tile.getPiece();
        const type = piece?.getType();
        const owner = piece?.getOwner();
        return owner === player && type === "queen";
      });
  }

  /**
   * Returns an array of tiles that have idle pieces (among the owned pieces furthest from the opposite side of the board)
   * for the given player.
   * @param {Player} player - The specified player to check for idle pieces
   * @returns {Tile[]} An array of tiles that have idle pieces.
   */
  protected getIdlePieceTiles(player: Player): Tile[] {
    const tiles = this.getBoard()
      .getTiles()
      .filter((tile) => tile.getPiece()?.getOwner() === player);
    let idlePieceTiles;
    let furthestRow: number;
    if (player === "blue") {
      // Finds the minimum row from 0 to 7 on which there is a blue piece
      furthestRow = tiles.reduce(
        (acc, tile) => (tile.getRow() < acc ? tile.getRow() : acc),
        7
      );
      // Finds the maximum row from 0 to 7 on which there is a red piece
    } else {
      furthestRow = tiles.reduce(
        (acc, tile) => (tile.getRow() > acc ? tile.getRow() : acc),
        0
      );
    }
    // Returns the pieces that are on the furthestRow
    idlePieceTiles = tiles.filter((tile) => tile.getRow() === furthestRow);
    return idlePieceTiles;
  }

  /**
   * Checks if the given player has a queen.
   * @param {Player} player - The player to check
   * @returns {boolean} `true` if the player has a queen, `false` otherwise.
   */
  protected playerHasQueen(player: Player): boolean {
    return this.getQueen(player) !== undefined;
  }

  /**
   * Determines whether the specified player has won the game by reaching the opposite end of the board with his queen.
   * @param {Player} player - The player to check.
   * @returns {boolean} `true` if player's queen is on the opposite end of the board, `false` otherwise.
   */
  protected hasPlayerWon(player: Player): boolean {
    const winningRow = player === "blue" ? 7 : 0;
    return this.getQueen(player)?.getRow() === winningRow;
  }

  /**
   * Sets the winner of the game to the specified player and changes the game status to 'inactive'.
   * @param {Player} player - The player who has won the game.
   * @returns {void}
   */
  protected setWinner(player: Player): void {
    this.gameState.winner = player;
    this.gameState.status = "inactive";
  }

  /**
   * Returns the winner of the game if there is one, `undefined` otherwise.
   * @returns {Player | undefined} The winner of the game, or `undefined`.
   */
  protected getWinner(): Player | undefined {
    return this.gameState.winner;
  }

  /**
   * Checks if the game is won.
   * @returns {boolean} `true` if the game is won, `false` otherwise.
   */
  protected isGameWon(): boolean {
    return this.getWinner() !== undefined;
  }

  /**
   * Removes the captured pieces from the board.
   * @param {Tile[]} captures - Array of tiles with captured pieces
   * @returns {void}
   */
  protected capture(captures: Tile[]): void {
    captures.forEach((tile) => tile.setPiece(undefined));
  }

  /**
   * Places a given piece on a tile.
   * @param {Tile} tile - The tile on which to place the piece.
   * @param {Piece} piece - The piece to place.
   * @returns {void}
   */
  protected setTilePiece(tile: Tile, piece: Piece): void {
    tile.setPiece(piece);
  }

  /**
   * Gets the possible directions of movement of a piece depending on the player and the piece type.
   * @param {Piece} piece - The piece for which to get the possible directions.
   * @returns {number[][]} - An array of possible directions represented as [delta column, delta row] movements.
   */
  protected getDirections(piece: Piece): number[][] {
    if (this.isQueen(piece))
      return [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
    else if (piece.getOwner() === "blue")
      return [
        [-1, 1],
        [1, 1],
      ];
    else
      return [
        [-1, -1],
        [1, -1],
      ];
  }

  /**
   * Gets the adjacent tiles on which the given piece can land, depending on if the piece has captured an enemy.
   * @param {Tile} startingTile - The starting tile of a piece. This is given to let a piece land on its initial tile after a cycle in DFS.
   * @param {Tile} tile - The tile on which the piece is currently on.
   * @param {Piece} piece - The piece that is moving. Queens and pawns move differently.
   * @param {number} [captureXDirection] - The X direction in which the piece comes after a capture has been made, if any.
   * +1 if the direction of the capture is from left to right, -1 if the direction of the capture is from right to left.
   * @param {number} [captureYDirection] - The Y direction in which the piece comes after a capture has been made, if any.
   * +1 if the direction of the capture is from top to bottom, -1 if the direction of the capture is from bottom to top.
   * @returns {Tile[]} - An array of adjacent tiles on which the piece can land.
   */
  protected getAdjacentLandings(
    startingTile: Tile,
    tile: Tile,
    piece: Piece,
    captureXDirection: number | undefined = undefined,
    captureYDirection: number | undefined = undefined
  ): Tile[] {
    const destinations: Tile[] = [];
    const row: number = tile.getRow();
    const column: number = tile.getColumn();
    // Get piece's possible directions
    let directions = this.getDirections(piece);
    // Filtering landings after capturing
    if (captureXDirection !== undefined) {
      directions = directions.filter(
        (direction) => direction[0] === captureXDirection
      );
    }
    if (captureYDirection !== undefined) {
      directions = directions.filter(
        (direction) => direction[1] === captureYDirection
      );
    }
    // Get adjacent tiles and check if can land
    directions.forEach((direction) => {
      const destination = this.getBoard().getTile(
        row + direction[1],
        column + direction[0]
      );
      // Check if destination is empty
      if (destination !== undefined && !this.isTileOcuppied(destination)) {
        destinations.push(destination);
      }
      // Allow for the starting tile of a turn to be a possible end landing
      if (destination === startingTile) {
        destinations.push(destination);
      }
    });
    return destinations;
  }

  /**
   * Gets the adjacent enemies of a given piece on a given tile.
   * @param {Tile} tile - The tile on which the piece is currently on.
   * @param {Piece} piece - The piece to check for enemies.
   * @returns {Tile[]} - An array of adjacent tiles that have enemies on them.
   */
  protected getAdjacentEnemies(tile: Tile, piece: Piece): Tile[] {
    const destinations: Tile[] = [];
    const row: number = tile.getRow();
    const column: number = tile.getColumn();
    // Get piece's possible adjacent directions
    const directions = this.getDirections(piece);
    // Get adjacent tiles and check if enemy is on it
    directions.forEach((direction) => {
      const destination = this.getBoard().getTile(
        row + direction[1],
        column + direction[0]
      );
      // Check if destination has an enemy
      if (
        destination !== undefined &&
        this.isTileOcuppied(destination) &&
        !this.tileBelongsToPlayer(destination, piece.getOwner())
      ) {
        destinations.push(destination);
      }
    });
    return destinations;
  }

  /**
   * Determines whether this is the first movement of a tile depending on the length of a path of tiles.
   * @param {Tile[]} path - The path of tiles followed up until this point.
   * @returns {boolean} - `true` if the length of the path is 1, indicating that it is the first movement; `false` otherwise.
   */
  protected isFirstMove(path: Tile[]): boolean {
    return path.length === 1;
  }

  /**
   *Checks if there is a potential capture on the given tile depending on the length of a path of tiles.
   *@param {Tile} tile - The tile to check
   *@param {Tile[]} path - The path of tiles followed up until this point.
   *@returns {boolean} - `true` if the piece on the tile is owned by an enemy (the length of the path is greater than 1
   *and the tile is occupied), `false` otherwise
   */
  protected isPotentialCapture(tile: Tile, path: Tile[]): boolean {
    return this.isTileOcuppied(tile) && path.length > 1;
  }

  /**
   *Checks if a search for enemies can be done from the given tile and current path.
   *@param {Tile} tile - The current tile being evaluated.
   *@param {Tile} startingTile - The tile where the path starts.
   *@param {Tile[]} path - The path of tiles followed up until this point.
   *@returns {boolean} - `true` if the current tile is not occupied and the length of the path is greater than 2 or the current
   *tile is the starting tile and the length of the path is 1, `false` otherwise
   */
  protected canLookForEnemies(
    tile: Tile,
    startingTile: Tile,
    path: Tile[]
  ): boolean {
    return (
      (!this.isTileOcuppied(tile) && path.length > 2) || // from is empty tile and length of path > 2 (don't look for enemies after first jump to empty tile)
      (tile === startingTile && path.length === 1) // from is starting tile. First enemy encountered.
    );
  }

  /**
   *Recursive depth first search algorithm that builds all possible paths for a given piece on the board, starting from a given tile.
   *@param {Tile} startingTile - The starting tile of a piece. This is given to let a piece land on its initial tile after a cycle.
   *@param {Tile} from - The tile from which the recursive dfs is being conducted.
   *@param {Piece} piece - The piece for which paths are being generated.
   *@param {Tile[]} [path=[]] - The current path being followed. Starts as an empty array.
   *@returns {void}
   */
  protected setPathsDFS(
    startingTile: Tile,
    from: Tile,
    piece: Piece,
    path: Tile[] = []
  ): void {
    // path = path.concat([from]);
    path = [...path, from];
    // Look for landings: first move - left and right
    if (this.isFirstMove(path)) {
      const landings = this.getAdjacentLandings(startingTile, from, piece);
      landings.forEach((landing) => {
        this.setPathsDFS(startingTile, landing, piece, path);
      });
    }
    // Look for landings: after enemy - same direction
    if (this.isPotentialCapture(from, path)) {
      const fromColumn = path.at(-2)?.getColumn();
      const toColumn = path.at(-1)?.getColumn();
      const xDirection =
        fromColumn !== undefined && toColumn !== undefined
          ? toColumn - fromColumn
          : undefined;
      const fromRow = path.at(-2)?.getRow();
      const toRow = path.at(-1)?.getRow();
      const yDirection =
        fromRow !== undefined && toRow !== undefined
          ? toRow - fromRow
          : undefined;
      const landings = this.getAdjacentLandings(
        startingTile,
        from,
        piece,
        xDirection,
        yDirection
      );
      landings.forEach((landing) => {
        // Preventing queen from going back to places it has already been, except for the starting tile after a cycle
        if (!path.includes(landing)) {
          this.setPathsDFS(startingTile, landing, piece, path);
        } else if (landing === startingTile && path.length > 2) {
          // add starting tile afyer cycle (prevents queen from doing start-enemy-start)
          this.getCurrentMove().possiblePaths.push([...path, landing]);
        }
      });
    }
    // Look for enemies
    if (this.canLookForEnemies(from, startingTile, path)) {
      const enemies = this.getAdjacentEnemies(from, piece);
      enemies.forEach((enemy) => {
        // Preventing queen from going back to places it has already been
        if (!path.includes(enemy)) {
          this.setPathsDFS(startingTile, enemy, piece, path);
        }
      });
    }
    // Add path
    if (
      !this.isTileOcuppied(from) // add empty tile
    ) {
      this.getCurrentMove().possiblePaths.push(path);
    }
  }

  /**
   *Abstract method for getting the valid destinations of a game move depending on the type of game.
   *@param {Player} player - The current player.
   *@returns {void}
   */
  protected abstract setValidDestinations(player: Player): void;

  /**
   *Sets the `from` variable of the current move and generate all possible paths, destinations and captures from this tile.
   *@param {Tile} tile - The tile to be set as `from` for the current move.
   *@param {Player} player - The current player.
   *@returns {void}
   */
  protected setFrom(tile: Tile, player: Player): void {
    const piece = tile.getPiece()!;
    this.getCurrentMove().from = tile;
    this.setPathsDFS(tile, tile, piece);
    this.setValidDestinations(player);
  }

  /**
   *Sets the `to` variable of the current move.
   *@param {Tile} tile - The tile to be set as `to` for the current move.
   *@returns {void}
   */
  protected setTo(tile: Tile): void {
    this.getCurrentMove().to = tile;
  }

  /**
   *Resets move: Set `from` and `to` to `undefined` and the possible paths and valid destinations of the move to empty arrays.
   *@returns {void}
   */
  protected resetMove(): void {
    const currentMove = this.getCurrentMove();
    currentMove.from = undefined;
    currentMove.to = undefined;
    currentMove.possiblePaths = [];
    currentMove.validDestinations = [];
  }

  /**
   * Checks whether the given tile is occupied by a piece
   * @returns {boolean} `true` if the tile is occupied, `false` otherwise.
   */
  protected isTileOcuppied(tile: Tile): boolean {
    return tile.getPiece() !== undefined;
  }

  /**
   * Checks if the given tile has a piece owned by the given player.
   * @returns {boolean} `true` if the given tile has a piece owned by the given player, `false` otherwise.
   */
  protected tileBelongsToPlayer(tile: Tile, player: Player): boolean {
    return tile.getPiece()?.getOwner() === player;
  }

  /**
   *Abstract method for checking if a tile can be set as `from` depending on the type of game.
   *@param {Tile} tile - The tile to check.
   *@param {Player} player - The current player.
   *@returns {bolean} `true` if the given tile can be set as `from`.
   */
  protected abstract isFromValid(tile: Tile, player: Player): boolean;

  /**
   *Checks if a tile can be set as `to`, meaning it is a valid destination for the current move.
   *@param {Tile} tile - The tile to check.
   *@returns {bolean} `true` if the given tile can be set as `to`.
   */
  protected isToValid(tile: Tile): boolean {
    return this.getCurrentMove().validDestinations.some(
      (validDestination) => validDestination.destination === tile
    );
  }

  /**
   *Gets the current move from the game state
   *@returns {Move} - The current move
   */
  protected getCurrentMove(): Move {
    return this.gameState.move;
  }

  /**
   *Checks if the rival player has any pieces left on the board
   *@param {Player} player - The player whose rival is being checked
   *@returns {boolean} - `true` if the rival player has at least one piece on the board, `false` otherwise
   */
  protected rivalHasPieces(player: Player): boolean {
    const rival = player === "blue" ? "red" : "blue";
    return this.getBoard()
      .getTiles()
      .some((tile) => tile.getPiece()?.getOwner() === rival);
  }

  /**
   * Checks if `from` is set.
   * @returns {boolean} `true` if `from` has been set, `false` otherwise.
   */
  protected isFromSet(): boolean {
    const { from } = this.getCurrentMove();
    if (from === undefined) return false;
    return true;
  }

  /**
   * Checks if `to` is set.
   * @returns {boolean} `true` if `to` has been set, `false` otherwise.
   */
  protected isToSet(): boolean {
    const { to } = this.getCurrentMove();
    if (to === undefined) return false;
    return true;
  }

  /**
   *Checks if the `to` tile is the same as the `from` tile.
   *@param {Tile} from - The tile from which the piece is moving.
   *@param {Tile} to - The tile to which the piece is moving.
   *@returns {boolean} - `true` if the 'to' tile is the same as the 'from' `tile`, false otherwise.
   */
  protected isToTheSameAsFrom(from: Tile, to: Tile): boolean {
    return from === to;
  }

  /**
   *Builds a string that the UI is expecting so that it can render a tile accordingly.
   *@param {Tile} tile - The tile whose owner needs to be rendered by the UI.
   *@returns {TileOwner} - A string the UI is expecting so that it can render a tile accordingly.
   */
  protected getTileOwnerString(tile: Tile): TileOwner {
    const piece = tile.getPiece();
    if (piece !== undefined) {
      const color = piece.getOwner();
      const pieceType = piece.getType();
      return `${color} ${pieceType}`;
    }
    return "none";
  }

  /**
   *Gets the active player.
   *@returns {Player} - The active player.
   */
  protected getActivePlayer(): Player {
    return this.gameState.activePlayer;
  }

  /**
   *Creates an array of capture instructions for the UI to render from an array of tiles that were captured.
   *@param {Tile[]} captures - The tiles that were captured.
   *@returns {TileInstruction[]} - An array of instructions for the UI to render.
   */
  protected getCaptureInstructions(captures: Tile[]): TileInstruction[] {
    return captures.map((capture) => {
      return {
        rowToSet: capture.getRow(),
        colToSet: capture.getColumn(),
        newOwner: "none",
      };
    });
  }

  /**
   * Gets a list of captures for a specific destination.
   * @param {Tile} tile - The destination tile being checked for captures.
   * @returns {Tile[]} - An array of all pieces that would be captured for the given destination.
   */
  protected getCapturesForDestination(tile: Tile): Tile[] {
    // Get captures for destination
    const destination = this.getCurrentMove().validDestinations.find(
      (validDestination) => validDestination.destination === tile
    );
    return destination !== undefined ? destination.captures : [];
  }

  /**
   *Gets all the tiles that have pieces that belong to the opposing player to capture along a given path.
   *@param {Tile[]} path - The path being checked for captures.
   *@param {Player} player - The current player.
   *@returns {Tile[]} - An array of all pieces that would be captured along the given path.
   */
  protected getCapturesForPath(path: Tile[], player: Player): Tile[] {
    const captures = path.filter(
      (tile) =>
        this.isTileOcuppied(tile) && !this.tileBelongsToPlayer(tile, player)
    );
    return captures;
  }

  /**
   *Switches the active player.
   *@returns {void}
   */
  protected switchPlayer(): void {
    this.gameState.activePlayer =
      this.gameState.activePlayer === "blue" ? "red" : "blue";
  }

  /**
   *Plays the game by processing the click made by a player, updates the game state and returns the corresponding instructions to update
   *the UI.
   *@param {number} row - The row number of the tile selected by the player.
   *@param {number} column - The column number of the tile selected by the player.
   *@param {TileOwner} owner - The owner of the tile selected by the player.
   *@returns {Instruction | undefined} - The instructions for the UI to render, or `undefined` if no change needs to be done.
   */
  public playGame(
    row: number,
    column: number,
    owner: TileOwner
  ): Instruction | undefined {
    const activePlayer = this.getActivePlayer();
    const clickedTile = this.getBoard().getTile(row, column);

    // Check if tile is valid
    if (clickedTile === undefined) return undefined;

    if (this.isGameWon()) return undefined;

    // Check if a new queen needs to be selected
    if (!this.playerHasQueen(activePlayer)) {
      if (this.isValidQueen(clickedTile, activePlayer)) {
        // Update game state
        this.setNewQueen(clickedTile, activePlayer);

        // Check if winner
        if (this.hasPlayerWon(activePlayer)) {
          this.setWinner(activePlayer);
        }

        // Update UI: New queen is selected
        return {
          tileInstructions: [
            {
              rowToSet: row,
              colToSet: column,
              newOwner: `${activePlayer} ${"queen"}`,
            },
          ],
          playing: activePlayer,
          winner: this.getWinner(),
        };
      } else {
        return undefined;
      }
    }

    // Set from and calculate paths, and valid moves
    if (!this.isFromSet()) {
      if (this.isFromValid(clickedTile, activePlayer)) {
        this.setFrom(clickedTile, activePlayer);
        this.getCurrentMove().possiblePaths.forEach((path) =>
          console.log(path)
        );
        // Update UI: Player picks up the selected piece
        return {
          tileInstructions: [
            {
              rowToSet: row,
              colToSet: column,
              newOwner: "none",
            },
          ],
          playing: activePlayer,
          winner: this.getWinner(),
        };
      } else return undefined;
    }

    // Try to set to only if from is set
    if (this.isFromSet() && !this.isToSet()) {
      // Remember the from owner
      const fromOwner = this.getTileOwnerString(this.getCurrentMove().from!);
      // Player selected the same tile as destination
      if (this.isToTheSameAsFrom(this.getCurrentMove().from!, clickedTile)) {
        const instruction = {
          tileInstructions: [
            {
              rowToSet: row,
              colToSet: column,
              newOwner: fromOwner,
            },
          ],
          playing: activePlayer,
          winner: this.getWinner(),
        };
        // Reset move
        this.resetMove();
        // update UI: Place the piece back
        return instruction;

        // Destination is a valid move
      } else if (this.isToValid(clickedTile)) {
        // Set to
        this.setTo(clickedTile);

        // Get captures for destination
        const captures = this.getCapturesForDestination(clickedTile);

        // Generate captureInstructions for UI
        const captureInstructions = this.getCaptureInstructions(captures);

        // Update gameState: board
        this.capture(captures);
        // Make move
        this.setTilePiece(clickedTile, this.getCurrentMove().from?.getPiece()!);
        this.setTilePiece(
          this.getCurrentMove().from!,
          undefined as unknown as Piece
        );

        // Check if winner
        if (this.hasPlayerWon(activePlayer)) {
          this.setWinner(activePlayer);
        }
        // Check if player needs to be switched
        else if (this.rivalHasPieces(activePlayer)) {
          this.switchPlayer();
        }

        // Instruction for the UI: Captures and set active player on `to` tile
        const instruction = {
          tileInstructions: [
            {
              rowToSet: row,
              colToSet: column,
              newOwner: fromOwner,
            },
            ...captureInstructions,
          ],
          playing: this.getActivePlayer(),
          winner: this.getWinner(),
        };

        // Reset Move
        this.resetMove();
        // Update UI
        return instruction;
      } else {
        return undefined;
      }
    }
  }
}

/**
 * Represents a `base` game of checkers: Doesn't allow multiple jumps and does not force captures.
 */
export class BaseGame extends Game {
  /**
   *Checks if the selected tile is owned by the player and if the selected piece on the tile has valid moves.
   *@param {Tile} tile - The selected tile.
   *@param {Player} player - The current player.
   *@returns {boolean} - `true` if the selected tile is a valid `from`, `false` otherwise.
   */
  protected isFromValid(tile: Tile, player: Player): boolean {
    // Check if the selected tile is owned by player
    if (this.tileBelongsToPlayer(tile, player)) {
      this.resetMove();
      // Get possible destinations of this "from": Make sure this piece can move. (run a simulation for this from)
      const move = this.getCurrentMove();
      const piece = tile.getPiece();
      // Guard clause
      if (piece === undefined) return false;
      move.from = tile;
      // Check if this piece has destinations
      this.setPathsDFS(tile, tile, piece);
      this.setValidDestinations(player);
      const { validDestinations } = move;
      const isValid = validDestinations.length !== 0 ? true : false;
      this.resetMove();
      return isValid;
    }
    return false;
  }

  /**
   * Sets the array of validDestinations objects of the current move.
   * Valid destinations are those that implies only one jump of a piece,
   * whether to land on an empty tile, or to capture one enemy piece.
   *@param {Player} player - The current player.
   *@returns {void}
   */
  protected setValidDestinations(player: Player): void {
    // Filter those paths of the form [x, x] and [x, x, x]
    const validPaths = this.getCurrentMove().possiblePaths.filter(
      (path) => path.length === 3 || path.length === 2
    );
    // For each of the filtered paths, build the valid destination object
    validPaths.forEach((path) => {
      const validDestination: ValidDestination = {
        destination: path.at(-1)!,
        captures: this.getCapturesForPath(path, player),
        path,
      };
      this.getCurrentMove().validDestinations.push(validDestination);
    });
  }
}

/**
 * Represents a `bonus` game of checkers: Allows multiple jumps and forces captures.
 */
export class BonusGame extends Game {
  /**
   *Loops over all tiles owned by the player and ensures force capturing if any. If there are no captures
   *checks if the selected tile is owned by the player and if the selected piece has valid moves.
   *@param {Tile} tile - The selected tile.
   *@param {Player} player - The current player
   *@returns {boolean} - `true` if the selected tile is a valid `from`, ensuring captures if any.
   */
  protected isFromValid(tile: Tile, player: Player): boolean {
    if (this.tileBelongsToPlayer(tile, player)) {
      const fromsWithCaptures: Tile[] = [];
      const fromsWithDestinations: Tile[] = [];
      this.resetMove();
      // Get all player's pieces
      const allFroms = this.getBoard()
        .getTiles()
        .filter((tile) => tile.getPiece()?.getOwner() === player);
      // Generate all paths for each possible from (run a simulation for each possible from)
      allFroms.forEach((from) => {
        const move = this.getCurrentMove();
        const piece = from.getPiece();
        move.from = from;
        this.setPathsDFS(from, from, piece!);
        this.setValidDestinations(player);
        const { validDestinations } = move;
        // If there are captures on this path, add this from to fromsWithCaptures
        if (
          validDestinations.some(
            (validDestination) => validDestination.captures.length > 0
          )
        ) {
          fromsWithCaptures.push(from);
        }
        // If there are destinations on this path, add this from to fromsWithDestinations
        if (validDestinations.length > 0) {
          fromsWithDestinations.push(from);
        }
        this.resetMove();
      });
      // If fromWithCaptures is emppty, check if the input tile is in the array
      if (fromsWithCaptures.length === 0) {
        return fromsWithDestinations.includes(tile);
      } else {
        // Else check if the input tile is in the array with cpatures
        return fromsWithCaptures.includes(tile);
      }
    }
    return false;
  }

  /**
   * Sets the array of validDestinations objects of the current move.
   * Valid destinations for the bonus game enforce capturing if any.
   *@param {Player} player - The current player.
   *@returns {void}
   */
  protected setValidDestinations(player: Player): void {
    // Get all paths
    const paths = this.getCurrentMove().possiblePaths;
    let validPaths;
    // filter paths
    // If there is at least one path with captures, forces capture
    if (paths.some((path) => path.length > 2)) {
      validPaths = paths.filter((path) => path.length > 2);
      // If there is no path with captures, consider all paths
    } else {
      validPaths = paths;
    }
    // For each of the filtered path, build the validDestinations object
    validPaths.forEach((path) => {
      const validDestination: ValidDestination = {
        destination: path.at(-1)!,
        captures: this.getCapturesForPath(path, player),
        path,
      };
      this.getCurrentMove().validDestinations.push(validDestination);
    });
  }
}
