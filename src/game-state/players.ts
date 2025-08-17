import { CardinalDirection } from "../world/character"

type DiscreteNumber = number
interface DiscretePosition {
  x: DiscreteNumber
  y: DiscreteNumber
}

type PlayerInput = "move-up" | "move-down" | "move-left" | "move-right" | "none"

type ActionTypeIdentifier = "move" | "idle"

interface ActionType {
  id: ActionTypeIdentifier
}

interface Action {
  type: ActionType
  numberOfTicksLeft: DiscreteNumber
}

interface Idle extends Action {}

interface MoveAction extends Action {
  sourcePosition: DiscretePosition
  destinationPosition: DiscretePosition
}

interface Player {
  currentAction: Action
}

const createIdleAction = (): Idle => ({
  type: { id: "idle" },
  numberOfTicksLeft: Number.POSITIVE_INFINITY,
})

type ActionFunction = (a: Action) => Action
type AvailableActions = Record<PlayerInput, ActionFunction>

const directionFromPlayerInput = (
  playerInput: PlayerInput,
): CardinalDirection => "left" // TODO

// const createMoveAction = (
//   sourcePosition: DiscretePosition,
//   destinationPosition: DiscretePosition,
// ): MoveAction => {
//   return {
//     sourcePosition,
//     destinationPosition,
//     numberOfTicksLeft: 10,
//   }
// }

interface World {
  players: Player[]
}

const world: World = {
  players: [],
}

const applyMoveAction = (
  playerIndex: number,
  playerInput: PlayerInput,
): Action => {
  const currentAction = world.players[playerIndex].currentAction as MoveAction
  const currentDirection: CardinalDirection = "right" // TODO
  const oppositeDirection: CardinalDirection = "left" // TODO
  const requestedDirection = directionFromPlayerInput(playerInput)
  if (requestedDirection === oppositeDirection) {
    return {
      type: { id: "move" },
      sourcePosition: currentAction.destinationPosition,
      destinationPosition: currentAction.sourcePosition,
      numberOfTicksLeft: 10 - currentAction.numberOfTicksLeft,
    } as MoveAction
  }
  currentAction.numberOfTicksLeft--
  return currentAction
}

const applyPlayerInput = (player: Player, playerInput: PlayerInput) => {
  if (player.currentAction.type.id === "move") {
    if (playerInput === "none") {
      player.currentAction.numberOfTicksLeft -= 1
    }
  }

  if (player.currentAction.numberOfTicksLeft === 0) {
    player.currentAction = createIdleAction()
  }
}
