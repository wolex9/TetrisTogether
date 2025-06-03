"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Tetromino definitions as relative coordinates from center point
const TETROMINOES = {
  I: {
    coords: [
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2],
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
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const EMPTY_BOARD = Array(BOARD_HEIGHT)
  .fill(null)
  .map(() => Array(BOARD_WIDTH).fill(null))

type TetrominoType = keyof typeof TETROMINOES
type Position = { x: number; y: number }
type Piece = {
  type: TetrominoType
  position: Position
  rotation: number
}

export default function TetrisGame() {
  const [board, setBoard] = useState(EMPTY_BOARD)
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Get random tetromino
  const getRandomTetromino = (): Piece => {
    const types = Object.keys(TETROMINOES) as TetrominoType[]
    const type = types[Math.floor(Math.random() * types.length)]
    return {
      type,
      position: { x: Math.floor(BOARD_WIDTH / 2), y: 1 },
      rotation: 0,
    }
  }

  // Rotate coordinates
  const rotateCoords = (coords: number[][], rotation: number): number[][] => {
    let rotated = coords
    for (let i = 0; i < rotation; i++) {
      rotated = rotated.map(([x, y]) => [-y, x])
    }
    return rotated
  }

  // Get absolute coordinates for a piece
  const getPieceCoords = (piece: Piece): Position[] => {
    const tetromino = TETROMINOES[piece.type]
    const rotatedCoords = rotateCoords(tetromino.coords, piece.rotation)
    return rotatedCoords.map(([dx, dy]) => ({
      x: piece.position.x + dx,
      y: piece.position.y + dy,
    }))
  }

  // Check if position is valid
  const isValidPosition = (piece: Piece, board: (string | null)[][]): boolean => {
    const coords = getPieceCoords(piece)
    return coords.every(({ x, y }) => {
      // Allow pieces to be above the board (negative y) but not below or outside horizontally
      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false
      // Only check for collisions if the piece is within the board vertically
      if (y >= 0 && board[y][x]) return false
      return true
    })
  }

  // Get ghost piece position
  const getGhostPosition = (piece: Piece): Piece => {
    if (!piece) return piece
    let ghostY = piece.position.y

    // Keep moving down until we hit something
    while (true) {
      const testPiece = { ...piece, position: { ...piece.position, y: ghostY + 1 } }
      if (!isValidPosition(testPiece, board)) {
        break
      }
      ghostY++
    }

    return { ...piece, position: { ...piece.position, y: ghostY } }
  }

  // Place piece on board
  const placePiece = (piece: Piece, board: (string | null)[][]): (string | null)[][] => {
    const newBoard = board.map((row) => [...row])
    const coords = getPieceCoords(piece)
    const color = TETROMINOES[piece.type].color

    coords.forEach(({ x, y }) => {
      // Only place pieces that are within the board bounds
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        newBoard[y][x] = color
      }
    })

    return newBoard
  }

  // Clear completed lines
  const clearLines = (board: (string | null)[][]): { newBoard: (string | null)[][]; linesCleared: number } => {
    const newBoard = board.filter((row) => row.some((cell) => cell === null))
    const linesCleared = BOARD_HEIGHT - newBoard.length

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }

    return { newBoard, linesCleared }
  }

  // Move piece
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver || isPaused) return

      const newPiece = {
        ...currentPiece,
        position: { x: currentPiece.position.x + dx, y: currentPiece.position.y + dy },
      }

      if (isValidPosition(newPiece, board)) {
        setCurrentPiece(newPiece)
      } else if (dy > 0) {
        // Piece hit bottom, place it
        const newBoard = placePiece(currentPiece, board)
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

        setBoard(clearedBoard)
        setScore((prev) => prev + linesCleared * 100 + 10)
        setLines((prev) => prev + linesCleared)

        const nextPiece = getRandomTetromino()
        // Check if the new piece can spawn - game over if any part is blocked within the board
        const spawnCoords = getPieceCoords(nextPiece)
        const canSpawn = spawnCoords.every(({ x, y }) => {
          if (y < 0) return true // Above board is OK
          return y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !clearedBoard[y][x]
        })

        if (canSpawn) {
          setCurrentPiece(nextPiece)
        } else {
          setGameOver(true)
        }
      }
    },
    [currentPiece, board, gameOver, isPaused],
  )

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const newPiece = {
      ...currentPiece,
      rotation: (currentPiece.rotation + 1) % 4,
    }

    if (isValidPosition(newPiece, board)) {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, board, gameOver, isPaused])

  // Drop piece instantly
  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const ghostPiece = getGhostPosition(currentPiece)

    // Immediately place the piece at ghost position
    const newBoard = placePiece(ghostPiece, board)
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

    setBoard(clearedBoard)
    setScore((prev) => prev + linesCleared * 100 + 10)
    setLines((prev) => prev + linesCleared)

    const nextPiece = getRandomTetromino()
    // Check if the new piece can spawn
    const spawnCoords = getPieceCoords(nextPiece)
    const canSpawn = spawnCoords.every(({ x, y }) => {
      if (y < 0) return true // Above board is OK
      return y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !clearedBoard[y][x]
    })

    if (canSpawn) {
      setCurrentPiece(nextPiece)
    } else {
      setGameOver(true)
    }
  }, [currentPiece, board, gameOver, isPaused])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          movePiece(-1, 0)
          break
        case "ArrowRight":
          e.preventDefault()
          movePiece(1, 0)
          break
        case "ArrowDown":
          e.preventDefault()
          movePiece(0, 1)
          break
        case "ArrowUp":
          e.preventDefault()
          rotatePiece()
          break
        case " ":
          e.preventDefault()
          dropPiece()
          break
        case "p":
        case "P":
          setIsPaused((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiece, rotatePiece, dropPiece])

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return

    const interval = setInterval(
      () => {
        movePiece(0, 1)
      },
      Math.max(100, 1000 - lines * 50),
    )

    return () => clearInterval(interval)
  }, [movePiece, lines, gameOver, isPaused])

  // Initialize game
  useEffect(() => {
    if (!currentPiece && !gameOver) {
      setCurrentPiece(getRandomTetromino())
    }
  }, [currentPiece, gameOver])

  // Restart game
  const restartGame = () => {
    setBoard(EMPTY_BOARD)
    setCurrentPiece(null)
    setScore(0)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
  }

  // Render board with pieces
  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    // Add ghost piece first (so current piece renders on top)
    if (currentPiece && !gameOver) {
      const ghostPiece = getGhostPosition(currentPiece)
      // Only show ghost if it's different from current piece position
      if (ghostPiece.position.y !== currentPiece.position.y) {
        const ghostCoords = getPieceCoords(ghostPiece)
        ghostCoords.forEach(({ x, y }) => {
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !displayBoard[y][x]) {
            displayBoard[y][x] = "ghost"
          }
        })
      }
    }

    // Add current piece
    if (currentPiece && !gameOver) {
      const coords = getPieceCoords(currentPiece)
      const color = TETROMINOES[currentPiece.type].color
      coords.forEach(({ x, y }) => {
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          displayBoard[y][x] = color
        }
      })
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`w-6 h-6 border border-gray-300 ${cell === "ghost" ? "bg-gray-500" : cell || "bg-gray-100"}`}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="flex gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Tetris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-gray-400 inline-block">{renderBoard()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div>Score: {score}</div>
            <div>Lines: {lines}</div>
          </div>

          <div className="space-y-2">
            <Button onClick={() => setIsPaused(!isPaused)} className="w-full">
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button onClick={restartGame} className="w-full">
              Restart
            </Button>
          </div>

          {gameOver && <div className="text-center text-red-600 font-bold">Game Over!</div>}

          <div className="text-sm space-y-1">
            <div>Controls:</div>
            <div>← → Move</div>
            <div>↓ Soft drop</div>
            <div>↑ Rotate</div>
            <div>Space: Hard drop</div>
            <div>P: Pause</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
