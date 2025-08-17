import * as THREE from "three"
import { CardinalDirection } from "./character"

export interface BoardPosition extends THREE.Vector2 {}

export interface WorldPosition extends THREE.Vector2 {}

export const worldToBoardPosition = (
  worldPosition: WorldPosition,
): BoardPosition => worldPosition.add({x: 0.5, y: 0.5}).floor() as BoardPosition

export const moveIntoDirection = (
  from: BoardPosition,
  direction: CardinalDirection,
): BoardPosition =>
  new THREE.Vector2(
    from.x + (direction === "right" ? 1 : direction === "left" ? -1 : 0),
    from.y + (direction === "up" ? 1 : direction === "down" ? -1 : 0),
  ) as BoardPosition
