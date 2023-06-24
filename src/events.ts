import { TileOwner, TileInstruction } from "./types";
import { setTile, setTurn, setWinner } from "./UI/state";
import { BaseGame, BonusGame } from "./logic/gameLogic";

// Instantiate game
// const game: BaseGame = new BaseGame();
const game: BonusGame = new BonusGame();

// Set initial player to blue
setTurn("blue");

/**
 * Called when the user clicks on a tile. Render the tile based on the instruction recieved from the logic.
 * @param {number} row - of the clicked tile.
 * @param {number} column - of the clicked tile.
 * @param {number} owner - of the clicked tile.
 * @returns {void}
 */
export function onTileClick(
  row: number,
  column: number,
  owner: TileOwner
): void {
  const instruction = game.playGame(row, column, owner);
  if (instruction !== undefined) {
    const { tileInstructions, winner, playing } = instruction;
    tileInstructions.forEach((instruction: TileInstruction) => {
      const { colToSet, rowToSet, newOwner } = instruction;
      setTile(rowToSet, colToSet, newOwner);
    });
    setTurn(playing);
    if (winner !== undefined) setWinner(playing);
    game.printBoard();
  }
}

/**
 * Called when the user clicks on the "restart" button. Restarts the game.
 * @returns {void}
 */
export function onRestart(): void {
  const { tileInstructions } = game.restartGame();
  setWinner(undefined);
  setTurn("blue");
  tileInstructions.forEach((instruction: TileInstruction) => {
    const { colToSet, rowToSet, newOwner } = instruction;
    setTile(rowToSet, colToSet, newOwner);
  });
}
