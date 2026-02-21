import { describe, it, expect } from "vitest"
import { createBoardState } from "./board"

describe("game-state board", () => {
  it("creates indestructible outer border", () => {
    const board = createBoardState(11, 11)
    for (let x = 0; x < board.width; x++) {
      expect(board.tiles[0][x]).toBe("WallIndestructible")
      expect(board.tiles[board.height - 1][x]).toBe("WallIndestructible")
    }
    for (let y = 0; y < board.height; y++) {
      expect(board.tiles[y][0]).toBe("WallIndestructible")
      expect(board.tiles[y][board.width - 1]).toBe("WallIndestructible")
    }
  })

  it("creates indestructible pillars on even/even tiles", () => {
    const board = createBoardState(11, 11)
    for (let y = 1; y < board.height - 1; y++) {
      for (let x = 1; x < board.width - 1; x++) {
        if (x % 2 === 0 && y % 2 === 0) {
          expect(board.tiles[y][x]).toBe("WallIndestructible")
        }
      }
    }
  })

  it("keeps spawn safe area mostly empty (except pillars)", () => {
    const board = createBoardState(11, 11)
    for (let y = 1; y <= 3; y++) {
      for (let x = 1; x <= 3; x++) {
        if (x % 2 === 0 && y % 2 === 0) {
          expect(board.tiles[y][x]).toBe("WallIndestructible")
        } else {
          expect(board.tiles[y][x]).toBe("Empty")
        }
      }
    }
  })
})
