export const TETROMINOES = {
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

export type TetrominoType = keyof typeof TETROMINOES;

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BUFFER_ROWS = 4;
export const TOTAL_HEIGHT = BOARD_HEIGHT + BUFFER_ROWS;
