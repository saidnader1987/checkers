import "./styles.css";
import { useGlobalState } from "./state";
import { onTileClick, onRestart } from "../events";

export default function App() {
  const { board, winner, turn } = useGlobalState();
  function renderBoard() {
    const rows = Array(8).fill(0);
    const cols = Array(8).fill(0);

    return (
      <>
        {rows.map((row, ir) => {
          return (
            <div key={ir} className="row">
              {cols.map((col, ic) => {
                const color = (ic + ir) % 2 === 1 ? "light" : "dark";
                return (
                  <div
                    onClick={() => onTileClick(ir, ic, board[ic][ir])}
                    key={`${ic} ${ir}`}
                    className={`tile ${color}`}
                  >
                    {board[ic][ir] === "blue pawn" && (
                      <div className="pawn p1" />
                    )}
                    {board[ic][ir] === "red pawn" && (
                      <div className="pawn p2" />
                    )}

                    {board[ic][ir] === "blue queen" && (
                      <div className="queen p1" />
                    )}
                    {board[ic][ir] === "red queen" && (
                      <div className="queen p2" />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      <h1
        style={{
          visibility: winner ? "visible" : "hidden"
        }}
      >
        The Winner is {winner}
      </h1>
      <button onClick={onRestart}>Restart</button>
      <div
        style={{
          fontSize: "22px",
          visibility: turn ? "visible" : "hidden"
        }}
      >
        <span style={{ color: turn }}>{turn}</span> is playing.
      </div>
      <div className="board">{renderBoard()}</div>
    </>
  );
}
