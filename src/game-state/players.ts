import { CardinalDirection } from "../world/character"

type DiscreteNumber = number
interface DiscretePosition {
  x: DiscreteNumber
  y: DiscreteNumber
}

type PlayerInput = "move" | "none"

type StateTypeIdentifier = "in-between-nodes" | "at-node"

interface StateType {
  id: StateTypeIdentifier
}

interface State { }

interface PlayerState extends State {
  type: StateType
}

interface PlayerAtNodeState extends PlayerState {
}

interface PlayerInBetweenNodesState extends PlayerState {
  numberOfTicksLeft: DiscreteNumber
  sourcePosition: DiscretePosition
  destinationPosition: DiscretePosition
  currentDirection: CardinalDirection
}

interface Player {
  currentState: PlayerState
  position: DiscretePosition
  playerInput: PlayerInput
  directionRequests: CardinalDirection[]
}

interface Entity {
  currentState: EntityState
}

interface EntityState extends State {

}

interface World {
  players: Player[]
  entities: Entity[]
}

interface GameBoard {
  nodes: PositionNodes[]
}

interface Block {

}

interface PositionNodes {
}

interface PositionEdges {}

const world: World = {
  players: [],
  entities: [],
}

const getDestinationPosition = (direction: CardinalDirection, sourcePosition: DiscretePosition): DiscretePosition | null => {
  const connectedNode = getConnectedNodeForDirection(direction, sourcePosition)
  // return position of connected node
  return null
}

const getConnectedNodeForDirection = (direction: CardinalDirection, sourcePosition: DiscretePosition) => {
  //look up source position in node graph
  //find edges connected to found node
  //filter edges based on direction (one way edges with an associated direction)
  //do lookup for connected node
  //return node
}

const playerTick = (player: Player): PlayerState => {
  switch (player.currentState.type.id) {
    case "in-between-nodes":
      return playerInBetweenNodesTick(player, player.currentState as PlayerInBetweenNodesState)
    case "at-node":
      return playerAtNodeTick(player, player.currentState as PlayerAtNodeState)
    default:
      return player.currentState
  }
}

const playerAtNodeTick = (player: Player, state: PlayerAtNodeState): PlayerState => {
  const move =
    playerMoveToNodeInDirection(player, player.directionRequests[0])
    || playerMoveToNodeInDirection(player, player.directionRequests[1])
  if (move) {
    return move
  }

  return state
}

const playerMoveToNodeInDirection = (player: Player, requestedDirection: CardinalDirection): PlayerInBetweenNodesState | undefined => {
  if (requestedDirection) {
    const destinationPosition = getDestinationPosition(requestedDirection, player.position)
    if (destinationPosition) {
      return createPlayerInBetweenNodesState(player.position, destinationPosition)
    }
  }
}

const createPlayerInBetweenNodesState = (sourcePosition: DiscretePosition, destinationPosition: DiscretePosition, numberOfTicksLeft: number = 10): PlayerInBetweenNodesState => {
  // TODO determine direction between source and destination
  return {
    type: { id: "in-between-nodes" },
    destinationPosition,
    numberOfTicksLeft,
    sourcePosition,
    currentDirection: "left"
  }
}

const createPlayerAtNodeState = (): PlayerAtNodeState => {
  return {
    type: { id: "at-node" },
  }
}

const oppositeCardinalDirection = (dir: CardinalDirection) : CardinalDirection => {
  switch(dir)
  {
    case "up": return "down"
    case "down": return "up"
    case "left": return "right"
    case "right": return "left"
    default:
      throw new Error("Cardinal direction not found")
  }
}

const playerInBetweenNodesTick = (player: Player, state: PlayerInBetweenNodesState) => {
  const oppositeDirection = oppositeCardinalDirection(state.currentDirection)
  if (player.directionRequests.find(dir => dir === oppositeDirection)) {
    return createPlayerInBetweenNodesState(state.destinationPosition, state.sourcePosition, 10 - state.numberOfTicksLeft)
  }

  state.numberOfTicksLeft--
  if (state.numberOfTicksLeft === 0) {
    player.position = { ...state.destinationPosition }
    return createPlayerAtNodeState()
  }

  return state
}

const entityTick = (entity: Entity): EntityState => {
  return entity.currentState
}

const gameplayTick = () => {
  world.entities.forEach(e => {
    e.currentState = entityTick(e)
  })
  world.players.forEach(p => {
    p.currentState = playerTick(p)
  })
}

export const bindPlayer1Controls = (player: Player) => {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.repeat) {
      // Ignore repeated key presses to prevent multiple actions
      return
    }
    switch (event.key) {
      case "ArrowUp":
        player.playerInput = "move"
        player.directionRequests.push("up")
        break
      case "ArrowDown":
        player.playerInput = "move"
        player.directionRequests.push("down")
        break
      case "ArrowLeft":
        player.playerInput = "move"
        player.directionRequests.push("left")
        break
      case "ArrowRight":
        player.playerInput = "move"
        player.directionRequests.push("right")
        break
      case "Space":
        console.log("Action/Place Bomb")
        break
      default:
        break
    }
    console.log(`Direction Requests: ${player.directionRequests.join(", ")}`)
  })

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        // Remove the direction request when the key is released
        player.directionRequests = player.directionRequests.filter(
          (dir) =>
            dir !==
            (event.key.replace("Arrow", "").toLowerCase() as
              | "up"
              | "down"
              | "left"
              | "right"),
        )
        // If no direction requests are left, reset action request
        if (player.directionRequests.length === 0) {
          player.playerInput = "none"
        }
        break
      default:
        break
    }
  })
}
