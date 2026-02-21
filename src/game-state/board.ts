export type Tile = "Empty" | "WallIndestructible" | "WallDestructable"

export interface BoardState {
  width: number
  height: number
  tiles: Tile[][] // [y][x]
}

const createEmptyTiles = (width: number, height: number): Tile[][] => {
  const tiles: Tile[][] = []
  for (let y = 0; y < height; y++) {
    const row: Tile[] = []
    for (let x = 0; x < width; x++) {
      row.push("Empty")
    }
    tiles.push(row)
  }
  return tiles
}

export const createBoardState = (width: number, height: number): BoardState => {
  const tiles = createEmptyTiles(width, height)

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const isOuter = x === 0 || x === width - 1 || y === 0 || y === height - 1
      if (isOuter) {
        tiles[y][x] = "WallIndestructible"
        continue
      }

      const isPillar = x % 2 === 0 && y % 2 === 0
      if (isPillar) {
        tiles[y][x] = "WallIndestructible"
        continue
      }

      const isSpawnSafeArea = x <= 3 && y <= 3
      if (!isSpawnSafeArea) {
        tiles[y][x] = "WallDestructable"
      }
    }
  }

  return { width, height, tiles }
}

export const getTile = (board: BoardState, x: number, y: number): Tile => {
  if (x < 0 || y < 0 || x >= board.width || y >= board.height) {
    return "WallIndestructible"
  }
  return board.tiles[y][x]
}

export const isBlockedTile = (tile: Tile): boolean => {
  return tile === "WallIndestructible" || tile === "WallDestructable"
}
