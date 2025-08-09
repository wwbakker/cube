import * as THREE from "three"
import { addChildren, GameObject, setPositionToBottomLeft } from "./game-object"
import { createWall, Wall } from "./wall"

const createBoardMesh = (width: number, height: number): THREE.Mesh => {
  // Floor
  const geometry = new THREE.PlaneGeometry(width, height)
  const material = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh;
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

const createInnerWalls: (width: number, height: number) => Wall[] = (
  width: number,
  height: number,
) => {
  const result: Wall[] = []
  for (let x = 1; x < width-1; x++) {
    for (let y = 1; y < height-1; y++) {
      if (x % 2 === 0 && y % 2 === 0) {
        result.push(createWall("WallIndestructible", new THREE.Vector2(x, y)))
      }
      else if (!(x <= 2 && y <= 2))
      {
        result.push(createWall("WallDestructable", new THREE.Vector2(x, y)))
      }
    }
  }
  return result
}

export const createBoard = (width: number, height: number): Board => {
  const board: Board = {
    position: new THREE.Vector2(0, 0), // Origin at bottom-left corner
    width,
    height,
    children: [],
    obj3D: createBoardMesh(width, height),
    boundingbox: new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(width, height, 0))
  }
  setPositionToBottomLeft(board);
  const outerWalls = createOuterWalls(width, height)
  const innerWalls = createInnerWalls(width, height)
  addChildren(board, outerWalls)
  addChildren(board, innerWalls)

  return board
}
