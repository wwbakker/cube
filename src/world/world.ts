import * as THREE from "three"
import { addPosition, getEdgeDistanceX, getEdgeDistanceY } from "./game-object"
import { Board, createBoard, getWalls } from "./board"
import { CardinalDirection, Character, createCharacter } from "./character"
import { debug } from "../layout/debug-info"
import { moveIntoDirection, worldToBoardPosition } from "./position"

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

export const determineDeltaDistance = (
  character: Character,
  deltaTime: number,
) => Math.min(0.5, character.moveSpeed * (deltaTime * 0.001)) // Convert speed to units per millisecond

enum MovePlayerResult {
  Moved,
  Blocked,
}
const movePlayer = (
  player: Character,
  board: Board,
  directionRequest: CardinalDirection,
  requestedPositionDelta: number,
) => {
  // const playerPositionOnBoard = player.position.clone()
  debug("player world position", player.position)
  const positionOnBoard = worldToBoardPosition(player.position.clone())
  debug("player board position", positionOnBoard)
  const targetPositionOnBoard = moveIntoDirection(
    positionOnBoard.clone(),
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
      return
    case "down":
      {
        if (!wallAtTargetPosition) {
          addPosition(player, new THREE.Vector2(0, -requestedPositionDelta))
          break
        }
        const edgeDistance = getEdgeDistanceY(player, wallAtTargetPosition)
        addPosition(
          player,
          new THREE.Vector2(0, Math.max(-requestedPositionDelta, edgeDistance)),
        )
      }
      return
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
      return
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
      return
    default:
      break
  }
  return
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
  const distance = determineDeltaDistance(player, deltaTime)
  movePlayer(
    player,
    board,
    currentDirectionRequest,
    distance,
  )
  // Consider the second direction request, is it allowed?
  const previousDirectionRequest = player.directionRequests[1]
  if (previousDirectionRequest) {
    movePlayer(player, board, previousDirectionRequest, distance)
  }

  debug("p1 position", player.position)
}

export const updateWorld = (world: World, deltaTime: number) => {
  updatePlayer(world.player1, world.board, deltaTime)
}
