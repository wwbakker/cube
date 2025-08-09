import * as THREE from "three"
import { addChildren, GameObject } from "./game-object"
import { createWall, Wall } from "./wall"

const createBoardMesh = (width: number, height: number): THREE.Mesh => {
  // Floor
  const geometry = new THREE.PlaneGeometry(width, height)
  const material = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
  })
  return new THREE.Mesh(geometry, material)
}

interface Board extends GameObject {
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

export const createBoard = (width: number, height: number): Board => {
  const board: Board = {
    position: new THREE.Vector2(0, 0), // Origin at top-left corner
    width,
    height,
    children: [],
    mesh: createBoardMesh(width, height),
  }
  const outerWalls = createOuterWalls(width, height)
  addChildren(board, outerWalls)

  return board
}
