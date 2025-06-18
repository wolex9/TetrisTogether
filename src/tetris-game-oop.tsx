"use client";

import { useState, useRef, useCallback } from "react";
import { type GameAction as TetrisGameAction } from "@/components/tetris";

// Bag Randomizer System
function rotl(x: number, k: number): number {
  return (x << k) | (x >>> (32 - k));
}

function prng(s0: number, s1: number) {
  return function next(): number {
    const result = rotl(s0 * 0x9e3779bb, 5) * 5;

    s1 ^= s0;
    s0 = rotl(s0, 26) ^ s1 ^ (s1 << 9);
    s1 = rotl(s1, 13);

    return result >>> 0;
  };
}

function shuffle<T>(array: T[], rng: () => number): T[] {
  return array
    .map((value) => ({ value, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function* bagRandomizer<T>(items: T[], rng: () => number): Generator<T, never, unknown> {
  let bag: T[] = [];

  while (true) {
    if (bag.length === 0) bag = shuffle([...items], rng);
    yield bag.pop()!;
  }
}

// SRS Kick Tables
const SRS_KICK_TABLE_JLSTZ = {
  "0->1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ], // 0->R
  "1->0": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ], // R->0
  "1->2": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ], // R->2
  "2->1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ], // 2->R
  "2->3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ], // 2->L
  "3->2": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ], // L->2
  "3->0": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ], // L->0
  "0->3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ], // 0->L
};

const SRS_KICK_TABLE_I = {
  "0->1": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ], // 0->R
  "1->0": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ], // R->0
  "1->2": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ], // R->2
  "2->1": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ], // 2->R
  "2->3": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ], // 2->L
  "3->2": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ], // L->2
  "3->0": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ], // L->0
  "0->3": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ], // 0->L
};

// Tetromino definitions
const TETROMINOES = {
  I: {
    coords: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    color: "bg-cyan-500",
  },
  O: {
    coords: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    color: "bg-yellow-500",
  },
  T: {
    coords: [
      [0, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
    color: "bg-purple-500",
  },
  S: {
    coords: [
      [-1, 0],
      [0, 0],
      [0, -1],
      [1, -1],
    ],
    color: "bg-green-500",
  },
  Z: {
    coords: [
      [-1, -1],
      [0, -1],
      [0, 0],
      [1, 0],
    ],
    color: "bg-red-500",
  },
  J: {
    coords: [
      [0, -1],
      [0, 0],
      [0, 1],
      [-1, 1],
    ],
    color: "bg-blue-500",
  },
  L: {
    coords: [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    color: "bg-orange-500",
  },
};

type TetrominoType = keyof typeof TETROMINOES;
type Position = { x: number; y: number };

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BUFFER_ROWS = 4;
const TOTAL_HEIGHT = BOARD_HEIGHT + BUFFER_ROWS;

class Tetromino {
  type: TetrominoType;
  position: Position;
  rotation: number;

  constructor(type: TetrominoType, x = 5, y = 1) {
    this.type = type;
    this.position = { x, y };
    this.rotation = 0;
  }

  getCoords(): Position[] {
    const tetromino = TETROMINOES[this.type];
    const rotated = this.rotateCoords(tetromino.coords, this.rotation);
    return rotated.map(([dx, dy]) => ({
      x: this.position.x + dx,
      y: this.position.y + dy,
    }));
  }

  private rotateCoords(coords: number[][], rotation: number): number[][] {
    let rotated = coords;
    for (let i = 0; i < rotation; i++) {
      rotated = rotated.map(([x, y]) => [-y, x]);
    }
    return rotated;
  }

  move(dx: number, dy: number): Tetromino {
    const newPiece = new Tetromino(this.type, this.position.x + dx, this.position.y + dy);
    newPiece.rotation = this.rotation;
    return newPiece;
  }

  rotate(clockwise = true): Tetromino {
    const newPiece = new Tetromino(this.type, this.position.x, this.position.y);
    if (clockwise) {
      newPiece.rotation = (this.rotation + 1) % 4;
    } else {
      newPiece.rotation = (this.rotation + 3) % 4; // Same as -1 but positive
    }
    return newPiece;
  }

  getColor(): string {
    return TETROMINOES[this.type].color;
  }

  clone(): Tetromino {
    const newPiece = new Tetromino(this.type, this.position.x, this.position.y);
    newPiece.rotation = this.rotation;
    return newPiece;
  }

  resetPosition(): Tetromino {
    const newPiece = new Tetromino(this.type);
    newPiece.rotation = 0;
    return newPiece;
  }
}

class GameBoard {
  private board: (string | null)[][];
  private width: number;
  private height: number;
  private bufferRows: number;

  constructor(width = BOARD_WIDTH, height = BOARD_HEIGHT, bufferRows = BUFFER_ROWS) {
    this.width = width;
    this.height = height;
    this.bufferRows = bufferRows;
    this.board = Array(height + bufferRows)
      .fill(null)
      .map(() => Array(width).fill(null));
  }

  isValidPosition(piece: Tetromino): boolean {
    const coords = piece.getCoords();
    return coords.every(({ x, y }) => {
      // Check horizontal bounds and bottom bound
      if (x < 0 || x >= this.width || y >= this.height + this.bufferRows) return false;
      // Check for collisions with placed pieces
      if (y >= 0 && this.board[y][x]) return false;
      return true;
    });
  }

  placePiece(piece: Tetromino): void {
    const coords = piece.getCoords();
    const color = piece.getColor();

    coords.forEach(({ x, y }) => {
      if (y >= 0 && y < this.height + this.bufferRows && x >= 0 && x < this.width) {
        this.board[y][x] = color;
      }
    });
  }

  clearLines(): number {
    // Filter out completed lines from the entire board
    const newBoard = this.board.filter((row) => row.some((cell) => cell === null));
    const linesCleared = this.height + this.bufferRows - newBoard.length;

    // Add empty rows at the top
    while (newBoard.length < this.height + this.bufferRows) {
      newBoard.unshift(Array(this.width).fill(null));
    }

    this.board = newBoard;
    return linesCleared;
  }

  addGarbage(lines: number): void {
    // Remove lines from the top to make room for garbage
    this.board.splice(0, lines);

    // Add garbage lines at the bottom
    for (let i = 0; i < lines; i++) {
      // Use semantic 'garbage' as cell value, mapped in the UI to a tailwind class
      const garbageLine = Array(this.width).fill("garbage");
      // Add a random hole in each garbage line
      const holePosition = Math.floor(Math.random() * this.width);
      garbageLine[holePosition] = null;
      this.board.push(garbageLine);
    }
  }

  getBoard(): (string | null)[][] {
    return this.board.map((row) => [...row]);
  }

  reset(): void {
    this.board = Array(this.height + this.bufferRows)
      .fill(null)
      .map(() => Array(this.width).fill(null));
  }

  getGhostPosition(piece: Tetromino): Tetromino {
    let ghostPiece = piece.clone();
    while (this.isValidPosition(ghostPiece.move(0, 1))) {
      ghostPiece = ghostPiece.move(0, 1);
    }
    return ghostPiece;
  }

  // SRS Rotation with kick tests
  tryRotate(piece: Tetromino, clockwise = true): Tetromino | null {
    // O piece doesn't rotate
    if (piece.type === "O") {
      return null;
    }

    const rotatedPiece = piece.rotate(clockwise);

    // Try basic rotation first
    if (this.isValidPosition(rotatedPiece)) {
      return rotatedPiece;
    }

    // Get appropriate kick table
    const kickTable = piece.type === "I" ? SRS_KICK_TABLE_I : SRS_KICK_TABLE_JLSTZ;

    // Determine kick key based on rotation transition
    const fromRotation = piece.rotation;
    const toRotation = rotatedPiece.rotation;
    const kickKey = `${fromRotation}->${toRotation}` as keyof typeof kickTable;

    const kicks = kickTable[kickKey];
    if (!kicks) return null;

    // Try each kick position
    for (const [dx, dy] of kicks) {
      const kickedPiece = rotatedPiece.move(dx, dy);
      if (this.isValidPosition(kickedPiece)) {
        return kickedPiece;
      }
    }

    return null; // No valid rotation found
  }
}

class TetrisGame {
  private board: GameBoard;
  private currentPiece: Tetromino | null = null;
  private heldPiece: Tetromino | null = null;
  private nextPieces: TetrominoType[] = [];
  private canHold = true;
  private score = 0;
  private lines = 0;
  private gameOver = false;
  private isPaused = false;
  private onStateChange: () => void;
  private onLinesCleared?: (lines: number) => void;
  private pieceGenerator!: Generator<TetrominoType, never, unknown>;
  private seed: number;
  private queueSize = 5; // Number of pieces to show in the queue

  constructor(onStateChange: () => void, initialSeed: number, onLinesCleared?: (lines: number) => void) {
    this.board = new GameBoard();
    this.onStateChange = onStateChange;
    this.onLinesCleared = onLinesCleared;
    this.seed = initialSeed;
    this.initializePieceGenerator();
    this.fillQueue();
  }

  private initializePieceGenerator(): void {
    const rng = prng(this.seed, 31);
    const pieces: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
    this.pieceGenerator = bagRandomizer(pieces, rng);
  }

  private fillQueue(): void {
    while (this.nextPieces.length < this.queueSize) {
      this.nextPieces.push(this.pieceGenerator.next().value);
    }
  }

  start(): void {
    this.currentPiece = this.getNextPiece();
    this.onStateChange();
  }

  private getNextPiece(): Tetromino {
    const type = this.nextPieces.shift()!;
    this.fillQueue(); // Refill the queue
    return new Tetromino(type);
  }

  movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece || this.gameOver || this.isPaused) return false;

    const newPiece = this.currentPiece.move(dx, dy);

    if (this.board.isValidPosition(newPiece)) {
      this.currentPiece = newPiece;
      this.onStateChange();
      return true;
    } else if (dy > 0) {
      // Piece hit bottom
      this.lockPiece();
      return false;
    }
    return false;
  }

  rotatePiece(clockwise = true): boolean {
    if (!this.currentPiece || this.gameOver || this.isPaused) return false;

    const rotatedPiece = this.board.tryRotate(this.currentPiece, clockwise);

    if (rotatedPiece) {
      this.currentPiece = rotatedPiece;
      this.onStateChange();
      return true;
    }
    return false;
  }

  hardDrop(): void {
    if (!this.currentPiece || this.gameOver || this.isPaused) return;

    this.currentPiece = this.board.getGhostPosition(this.currentPiece);
    this.lockPiece();
  }

  hold(): void {
    if (!this.currentPiece || this.gameOver || this.isPaused || !this.canHold) return;

    if (this.heldPiece) {
      // Swap current piece with held piece
      const tempPiece = this.heldPiece.resetPosition();
      this.heldPiece = new Tetromino(this.currentPiece.type);
      this.currentPiece = tempPiece;

      // Check if swapped piece can be placed
      if (!this.board.isValidPosition(this.currentPiece)) {
        this.gameOver = true;
        this.currentPiece = null;
      }
    } else {
      // Hold current piece and spawn new one
      this.heldPiece = new Tetromino(this.currentPiece.type);
      this.currentPiece = this.getNextPiece();

      // Check if new piece can be placed
      if (!this.board.isValidPosition(this.currentPiece)) {
        this.gameOver = true;
        this.currentPiece = null;
      }
    }

    this.canHold = false;
    this.onStateChange();
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;

    // Get piece coordinates before placing it
    const coords = this.currentPiece.getCoords();

    // Place the piece on the board
    this.board.placePiece(this.currentPiece);
    const linesCleared = this.board.clearLines();

    this.score += linesCleared * 100 + 10;
    this.lines += linesCleared;

    // Notify about lines cleared for garbage system
    if (linesCleared > 0) {
      console.log(`TetrisGame: ${linesCleared} lines cleared`);
      if (this.onLinesCleared) {
        console.log(`TetrisGame: Calling onLinesCleared callback`);
        this.onLinesCleared(linesCleared);
      } else {
        console.log(`TetrisGame: No onLinesCleared callback available`);
      }
    }

    // Check if any part of the locked piece was in the buffer zone
    const isGameOver = coords.some(({ y }) => y < BUFFER_ROWS);

    if (isGameOver) {
      this.gameOver = true;
      this.currentPiece = null;
      this.onStateChange();
      return;
    }

    // Spawn next piece
    const nextPiece = this.getNextPiece();
    if (this.board.isValidPosition(nextPiece)) {
      this.currentPiece = nextPiece;
      this.canHold = true; // Reset hold ability for new piece
    } else {
      this.gameOver = true;
      this.currentPiece = null;
    }

    this.onStateChange();
  }

  tick(): void {
    this.movePiece(0, 1);
  }

  pause(): void {
    this.isPaused = !this.isPaused;
    this.onStateChange();
  }

  // Getters for React component
  getDisplayBoard(): (string | null)[][] {
    const displayBoard = this.board.getBoard();

    // Add ghost piece
    if (this.currentPiece && !this.gameOver) {
      const ghostPiece = this.board.getGhostPosition(this.currentPiece);
      if (ghostPiece.position.y !== this.currentPiece.position.y) {
        const ghostCoords = ghostPiece.getCoords();
        ghostCoords.forEach(({ x, y }) => {
          if (y >= 0 && y < TOTAL_HEIGHT && x >= 0 && x < BOARD_WIDTH && !displayBoard[y][x]) {
            displayBoard[y][x] = "ghost";
          }
        });
      }
    }

    // Add current piece
    if (this.currentPiece && !this.gameOver) {
      const coords = this.currentPiece.getCoords();
      const color = this.currentPiece.getColor();
      coords.forEach(({ x, y }) => {
        if (y >= 0 && y < TOTAL_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          displayBoard[y][x] = color;
        }
      });
    }

    return displayBoard;
  }

  getScore(): number {
    return this.score;
  }
  getLines(): number {
    return this.lines;
  }
  isGameOver(): boolean {
    return this.gameOver;
  }
  isPausedState(): boolean {
    return this.isPaused;
  }
  getHeldPiece(): Tetromino | null {
    return this.heldPiece;
  }
  canHoldPiece(): boolean {
    return this.canHold;
  }
  getSeed(): number {
    return this.seed;
  }
  getNextPieces(): TetrominoType[] {
    return [...this.nextPieces];
  }

  receiveGarbage(lines: number): void {
    if (this.gameOver || this.isPaused) return;
    this.board.addGarbage(lines);
  }
}

export type GameAction = TetrisGameAction;

export function useGame(initialSeed: number, onLinesCleared?: (lines: number) => void) {
  console.log(`useGame called with seed ${initialSeed}, onLinesCleared:`, !!onLinesCleared);
  const [, forceUpdate] = useState({});
  const gameRef = useRef<TetrisGame>(null);

  const restartGame = useCallback(() => {
    const currentSeed = gameRef.current?.getSeed() ?? initialSeed;
    gameRef.current = new TetrisGame(() => forceUpdate({}), currentSeed + 1, onLinesCleared);
    gameRef.current.start();
  }, [initialSeed, onLinesCleared]);

  const dispatch = useCallback((action: GameAction) => {
    if (!gameRef.current) return;

    switch (action.type) {
      case "MOVE_PIECE":
        gameRef.current.movePiece(action.payload.dx, action.payload.dy);
        break;
      case "ROTATE_PIECE":
        gameRef.current.rotatePiece(action.payload.clockwise);
        break;
      case "HARD_DROP":
        gameRef.current.hardDrop();
        break;
      case "HOLD":
        gameRef.current.hold();
        break;
      case "PAUSE":
        gameRef.current.pause();
        break;
      case "RECEIVE_GARBAGE":
        gameRef.current.receiveGarbage(action.payload.lines);
        break;
    }
  }, []);

  // Initialize game on first render
  if (!gameRef.current) {
    gameRef.current = new TetrisGame(() => forceUpdate({}), initialSeed, onLinesCleared);
    gameRef.current.start();
  }

  return {
    game: gameRef.current!,
    dispatch,
    restartGame,
  };
}
