import * as THREE from "three"
import { addPosition, getEdgeDistanceX, getEdgeDistanceY } from "./game-object"
import { Board, createBoard, getWalls } from "./board"
import { CardinalDirection, Character, createCharacter } from "./character"
import { debug } from "../layout/debug-info"

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
) => Math.min(0.5, character.moveSpeed * (deltaTime * 0.001)) // Convert speed to units per millisecond

export const determineTargetPositionOnBoard = (
  playerPositionOnBoard: THREE.Vector2,
  actionRequest: CardinalDirection,
) => {
  switch (actionRequest) {
    case "up":
      return playerPositionOnBoard.clone().add(new THREE.Vector2(0, 1)).floor()
    case "down":
      return playerPositionOnBoard.clone().add(new THREE.Vector2(0, -1)).ceil()
    case "left":
      return playerPositionOnBoard.clone().add(new THREE.Vector2(-1, 0)).ceil()
    case "right":
      return playerPositionOnBoard.clone().add(new THREE.Vector2(1, 0)).floor()
    default:
      return playerPositionOnBoard
  }
}

const movePlayer = (
  player: Character,
  board: Board,
  directionRequest: CardinalDirection,
  requestedPositionDelta: number,
) => {
  // const playerPositionOnBoard = player.position.clone()
  const targetPositionOnBoard = determineTargetPositionOnBoard(
    player.position,
    directionRequest,
  )
  debug("target position", targetPositionOnBoard)
  const wallAtTargetPosition = getWalls(board).find((wall) =>
    wall.position.equals(targetPositionOnBoard),
  )
  debug("wall at target position", !!wallAtTargetPosition)

  switch (directionRequest) {
    case "up":
      {
        if (!wallAtTargetPosition) {
          addPosition(player, new THREE.Vector2(0, requestedPositionDelta))
          break
        }
        const edgeDistance = getEdgeDistanceY(player, wallAtTargetPosition)

        addPosition(
          player,
          new THREE.Vector2(0, Math.min(requestedPositionDelta, edgeDistance)),
        )
      }
      break
    case "down":
      {
        if (!wallAtTargetPosition) {
          addPosition(player, new THREE.Vector2(0, -requestedPositionDelta))
          break
        }
        const edgeDistance = getEdgeDistanceY(player, wallAtTargetPosition)
        // debug("edge distance", edgeDistance)
        debug("requested position delta", requestedPositionDelta)
        addPosition(
          player,
          new THREE.Vector2(0, Math.max(-requestedPositionDelta, edgeDistance)),
        )
      }
      break
    case "left":
      {
        if (!wallAtTargetPosition) {
          addPosition(player, new THREE.Vector2(-requestedPositionDelta, 0))
          break
        }
        const edgeDistance = getEdgeDistanceX(player, wallAtTargetPosition)
        addPosition(
          player,
          new THREE.Vector2(Math.max(-requestedPositionDelta, edgeDistance), 0),
        )
      }
      break

    case "right":
      {
        if (!wallAtTargetPosition) {
          addPosition(player, new THREE.Vector2(requestedPositionDelta, 0))
          break
        }
        const edgeDistance = getEdgeDistanceX(player, wallAtTargetPosition)
        addPosition(
          player,
          new THREE.Vector2(Math.min(requestedPositionDelta, edgeDistance), 0),
        )
      }
      break
    default:
      break
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
  // Consider the first direction request, is it allowed?
  const currentDirectionRequest = player.directionRequests[0]
  if (!currentDirectionRequest) {
    return
  }
  const deltaPosition = determineDeltaPosition(player, deltaTime)
  movePlayer(player, board, currentDirectionRequest, deltaPosition)
  // Consider the second direction request, is it allowed?
  const previousDirectionRequest = player.directionRequests[1]
  if (previousDirectionRequest) {
    movePlayer(player, board, previousDirectionRequest, deltaPosition)
  }

  debug("p1 position", player.position)
}

export const updateWorld = (world: World, deltaTime: number) => {
  updatePlayer(world.player1, world.board, deltaTime)
}
