import { useEffect, useState } from "react";
import { Player, TileOwner } from "../types";

export type GameState = {
  board: TileOwner[][];
  turn?: Player;
  winner?: Player;
};

function initializeBoard() {
  const empty: TileOwner[] = Array(64).fill("none");
  const getRow = (i: number) => Math.floor(i / 8);
  const getCol = (i: number) => i % 8;
  const withPieces = empty.map((_, i) => {
    if ((getRow(i) + getCol(i)) % 2 === 0) {
      if (i < 24) {
        return "blue pawn";
      } else if (i > 40) {
        return "red pawn";
      }
    }
    return "none";
  });
  const rows: TileOwner[] = Array(8).fill(0);
  const cols: TileOwner[] = Array(8).fill(0);
  const board: TileOwner[][] = rows.map((_, i) => {
    return cols.map((_, j) => {
      return withPieces[j * rows.length + i];
    });
  });

  board[0][0] = "blue queen";
  board[7][7] = "red queen";

  return board;
}

export const initialize = (): GameState => {
  return {
    board: initializeBoard(),
    turn: undefined
  };
};

type Sub = {
  id: number;
  exec: (a: GameState) => void;
};

const Store = (() => {
  let subs = [] as Sub[];
  let state = initialize();
  let id = 0;

  return {
    set: (fn: GameState | ((s: GameState) => GameState)) => {
      state = fn instanceof Function ? fn(state) : fn;
      subs.forEach(({ exec }) => exec(state));
    },
    get: () => state,
    subscribe: (fn: (s: GameState) => void) => {
      const cId = id++;
      subs.push({ exec: fn, id: cId });
      return () => {
        subs = subs.filter(({ id }) => id !== cId);
      };
    }
  };
})();

export const useGlobalState = () => {
  const [val, setVal] = useState(Store.get());

  useEffect(() => Store.subscribe(setVal), []);

  return val;
};

export const setTile = (row: number, column: number, owner: TileOwner) =>
  Store.set((s) => {
    const board = s.board;
    board[column][row] = owner;
    return {
      ...s,
      board
    };
  });

export const setTurn = (player?: Player) =>
  Store.set((s) => ({ ...s, turn: player }));

export const setWinner = (player: Player | undefined) =>
  Store.set((s) => ({ ...s, winner: player }));
