import * as THREE from "three"
import { Object3D, Vector3 } from "three"
import { addChildren, BoardObject, GameObject } from "./game-object"
import { createWall, Wall } from "./wall"
import { createFloor } from "./floor"

export interface Board extends BoardObject {
  width: number
  height: number
  children: GameObject[]
}

const createOuterWalls: (width: number, height: number) => Wall[] = (
  width: number,
  height: number,
) => {
  const result: Wall[] = []
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        result.push(createWall("WallIndestructible", new THREE.Vector2(x, y)))
      }
    }
  }
  return result
}

const createInnerWalls: (width: number, height: number) => Wall[] = (
  width: number,
  height: number,
) => {
  const result: Wall[] = []
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      if (x % 2 === 0 && y % 2 === 0) {
        result.push(createWall("WallIndestructible", new THREE.Vector2(x, y)))
      } else if (!(x <= 3 && y <= 3)) {
        result.push(createWall("WallDestructable", new THREE.Vector2(x, y)))
      }
    }
  }
  return result
}

export const createBoard = (width: number, height: number): Board => {
  const board: Board = {
    type: "Board",
    position: new THREE.Vector2(0, 0), // Origin at bottom-left corner
    width,
    height,
    children: [],
    obj3D: new Object3D(),
    size: new Vector3(width, height, 0),
  }
  const floor = createFloor(width, height)
  const outerWalls = createOuterWalls(width, height)
  const innerWalls = createInnerWalls(width, height)
  addChildren(board, outerWalls)
  addChildren(board, innerWalls)
  addChildren(board, [floor])
  return board
}

export const getWalls = (board: Board): Wall[] => {
  return board.children.filter(
    (child): child is Wall =>
      child.type === "WallDestructable" || child.type === "WallIndestructible",
  )
}
