# Adidas Checkers - Interview Project

This repository contains the code for a checkers game logic I developed for an interview process with Adidas. A basic front-end representation of the checkers board and pieces were supplied, and I was tasked with implementing the game logic using TypeScript.

## Project Overview

The core of this project is the game logic, which dictates how the pieces move across the checkers board. I modeled the checkers board as a graph where each reachable tile is a node and each potential move is an edge. This approach allowed me to effectively represent the complex interactions between pieces during a game of checkers.

## Key Concepts Used

- **Graph Theory**: Used to model the movements of the pieces as a graph.
- **Recursion**: Employed extensively to traverse the graph and calculate possible moves.
- **Depth-First Search (DFS)**: DFS was utilized for traversing the graph, effectively identifying all potential moves for a piece.

## Game Variants

Two types of games can be instantiated, but you need to configure it manually within `src/events.ts`:

```typescript
// Instantiate game
// const game: BaseGame = new BaseGame();
const game: BonusGame = new BonusGame();
```

The differences between these two games are as follows:

**Base Game:**

- This game is a remake of traditional Chinese checkers with a few changes.
- The board is an 8x8 square.
- Each player has 11 pawns and a queen. Queens start on opposite corners of the board.
- Pieces can capture other pieces of opposite color by "jumping" diagonally over them.
- To capture, a piece must be diagonal to the piece and have an empty space in the same direction, next to the piece being captured.
- Pieces move diagonally towards the opposite player's side. The queen can move diagonally in any direction.
- If a queen gets captured, the owner of the queen must choose a new queen from among any of the idle pieces. A piece is considered "idle" if it is among the owned pieces furthest from the opposite side of the board.
- The player that places its queen on the first line of the opponent's battlefield will win the game.

**Bonus Game:**

- This game includes all the rules of the base game plus:
  - Allows multiple jumps.
  - Forces the capture of pieces.

## How to Run

1. Install npm if you don't have it already.
2. Open a terminal in the project directory.
3. Type `npm install` to install the necessary dependencies.
4. To run the project, type `npm run start`.
5. Open your web browser and go to `localhost:3000` to start playing.

## Documentation

In the [wiki](https://github.com/saidnader1987/checkers/wiki) of this project, you will find additional resources to understand the development process, including a flowchart and a class diagram that guided the development of the solution.

## Acknowledgements

I would like to extend my heartfelt gratitude to the team at Adidas for providing me with the opportunity to tackle this intriguing problem. The front-end board and piece representations served as a fantastic springboard for the development of the game logic.
