import * as THREE from "three"
import { addPosition, getBoundingBox } from "./game-object"
import { Board, createBoard, getWalls } from "./board"
import { CardinalDirection, Character, createCharacter } from "./character"

export interface World {
  board: Board
  player1: Character
}

export const createWorld = (width: number, height: number): World => {
  const board = createBoard(width, height)
  const player1 = createCharacter(new THREE.Vector2(1, 1))
  return {
    board,
    player1,
  }
}

export const determineDeltaPosition = (
  character: Character,
  deltaTime: number,
) => character.moveSpeed * (deltaTime * 0.001) // Convert speed to units per millisecond

export const determineTargetPositionOnBoard = (
  playerPositionOnBoard: THREE.Vector2,
  actionRequest: CardinalDirection,
) => {
  switch (actionRequest) {
    case "up":
      return playerPositionOnBoard.add(new THREE.Vector2(0, 1))
    case "down":
      return playerPositionOnBoard.add(new THREE.Vector2(0, -1))
    case "left":
      return playerPositionOnBoard.add(new THREE.Vector2(-1, 0))
    case "right":
      return playerPositionOnBoard.add(new THREE.Vector2(1, 0))
    default:
      return playerPositionOnBoard
  }
}
export const updatePlayer = (
  player: Character,
  board: Board,
  deltaTime: number,
) => {
  if (player.actionRequest !== "move") {
    return
  }
  const currentDirectionRequest = player.directionRequests[0]
  if (!currentDirectionRequest) {
    return
  }

  // Consider the first direction request, is it allowed?
  const playerPositionOnBoard = player.position.clone().floor()
  const targetPositionOnBoard = determineTargetPositionOnBoard(
    playerPositionOnBoard,
    currentDirectionRequest,
  )
  const wallAtTargetPosition = getWalls(board).find((wall) =>
    wall.position.equals(targetPositionOnBoard),
  )
  const deltaPosition = determineDeltaPosition(player, deltaTime)
  switch (currentDirectionRequest) {
    case "up":
      const proposedPosition = player.position.clone()
      proposedPosition.y += deltaPosition // TODO: do clamping for low FPS
      if (!wallAtTargetPosition) {
        addPosition(player, new THREE.Vector2(0, deltaPosition))
        break
      }
      const wallBoundingBox = getBoundingBox(wallAtTargetPosition)
      const playerBoundingBox = getBoundingBox(player)

      if (!wallBoundingBox.intersectsBox(playerBoundingBox)) {
        addPosition(player, new THREE.Vector2(0, deltaPosition))
      }
      break
    default:
      break
  }
}

export const updateWorld = (world: World, deltaTime: number) => {
  updatePlayer(world.player1, world.board, deltaTime)
}
