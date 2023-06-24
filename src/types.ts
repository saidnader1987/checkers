export type TileOwner =
  | "blue pawn"
  | "red pawn"
  | "blue queen"
  | "red queen"
  | "none";

export type Player = "blue" | "red";

export type PieceType = "queen" | "pawn";

export type GameStatus = "active" | "inactive";

export interface Instruction {
  tileInstructions: TileInstruction[];
  playing: Player;
  winner: Player | undefined;
}

export interface TileInstruction {
  colToSet: number;
  rowToSet: number;
  newOwner: TileOwner;
}
