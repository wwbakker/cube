/**
 * Simulation state and tick-based movement rules.
 *
 * Game state updates follow an explicit sequence when computing a new state:
 * 1) Copy the previous game state.
 * 2) Apply consequences of game event triggers on the copy (update positions,
 *    create/advance ongoing events, etc.).
 * 3) Gather game event triggers based on the resulting state and player inputs.
 */

import { BoardState, createBoardState, getTile, isBlockedTile } from "./board"
import { CardinalDirection } from "../world/character"

export interface DiscretePosition {
  x: number
  y: number
}

export interface Position {
  x: number
  y: number
}

export interface MoveTransition {
  fromPos: Position
  toPos: Position
  fromTile: DiscretePosition
  toTile: DiscretePosition
  startedTick: number
  durationTicks: number
  direction: CardinalDirection
}

export interface PlayerState {
  id: string
  tile: DiscretePosition
  facing: CardinalDirection
  transition: MoveTransition | null
  queuedDirection: CardinalDirection | null
}

export type EventType =
  | "move_started"
  | "direction_reversed"
  | "move_blocked"
  | "move_completed"

export interface EventTrigger {
  happenedOnTick: number
  eventType: EventType
}

export interface EventTriggerLog {
  triggers: EventTrigger[]
}

export type OngoingEvent = {
  eventType: "move_transition"
  playerId: string
  transition: MoveTransition
}

export type GameEvent =
  | {
      tick: number
      type: "move_started"
      playerId: string
      from: DiscretePosition
      to: DiscretePosition
      direction: CardinalDirection
    }
  | {
      tick: number
      type: "direction_reversed"
      playerId: string
      from: DiscretePosition
      to: DiscretePosition
      direction: CardinalDirection
    }
  | {
      tick: number
      type: "move_blocked"
      playerId: string
      from: DiscretePosition
      to: DiscretePosition
      direction: CardinalDirection
      tile: string
    }
  | {
      tick: number
      type: "move_completed"
      playerId: string
      to: DiscretePosition
    }

export interface GameState {
  tick: number
  board: BoardState
  players: Record<string, PlayerState>
  // Simulation events emitted while producing this state.
  events: GameEvent[]
  // Derived view of stateful (multi-tick) events.
  ongoingEvents: OngoingEvent[]
  // Trigger log for this tick.
  eventTriggerLog: EventTriggerLog
}

export interface PlayerTickInput {
  direction: CardinalDirection | null
  placeBomb: boolean
}

export interface StepConfig {
  moveDurationTicks: number
  moveWarmupTicks: number
}

const oppositeDirection = (dir: CardinalDirection): CardinalDirection => {
  switch (dir) {
    case "up":
      return "down"
    case "down":
      return "up"
    case "left":
      return "right"
    case "right":
      return "left"
    default: {
      const _exhaustive: never = dir
      return _exhaustive
    }
  }
}

const getTransitionProgressAtTick = (
  t: MoveTransition,
  tick: number,
): number => {
  if (t.durationTicks <= 0) {
    return 1
  }
  const elapsed = tick - t.startedTick
  return Math.min(1, Math.max(0, elapsed / t.durationTicks))
}

const canQueueDuringTransitionAtTick = (
  t: MoveTransition,
  tick: number,
): boolean => {
  // Only allow queueing when >= 70% done.
  return getTransitionProgressAtTick(t, tick) >= 0.7
}

const getMoveStartedTickFromIdle = (
  tick: number,
  config: StepConfig,
): number => {
  // We advance the simulation tick at the end of each step.
  // Add an extra warmup tick so the first rendered tick after starting a move
  // still shows the player at the source tile.
  return tick + 1 + config.moveWarmupTicks
}

const moveByDirection = (
  pos: DiscretePosition,
  direction: CardinalDirection,
): DiscretePosition => {
  switch (direction) {
    case "up":
      return { x: pos.x, y: pos.y + 1 }
    case "down":
      return { x: pos.x, y: pos.y - 1 }
    case "left":
      return { x: pos.x - 1, y: pos.y }
    case "right":
      return { x: pos.x + 1, y: pos.y }
    default: {
      const _exhaustive: never = direction
      return _exhaustive
    }
  }
}

export const createInitialGameState = (
  width: number,
  height: number,
): GameState => {
  const board = createBoardState(width, height)
  return {
    tick: 0,
    board,
    players: {
      p1: {
        id: "p1",
        tile: { x: 1, y: 1 },
        facing: "down",
        transition: null,
        queuedDirection: null,
      },
    },
    events: [],
    ongoingEvents: [],
    eventTriggerLog: { triggers: [] },
  }
}

const cloneGameState = (prev: GameState): GameState => {
  return {
    tick: prev.tick,
    board: prev.board,
    players: Object.fromEntries(
      Object.entries(prev.players).map(([id, p]) => [
        id,
        {
          ...p,
          tile: { ...p.tile },
          transition: p.transition
            ? {
                ...p.transition,
                fromPos: { ...p.transition.fromPos },
                toPos: { ...p.transition.toPos },
                fromTile: { ...p.transition.fromTile },
                toTile: { ...p.transition.toTile },
              }
            : null,
        },
      ]),
    ) as Record<string, PlayerState>,
    events: [],
    ongoingEvents: [],
    eventTriggerLog: { triggers: [] },
  }
}

const syncOngoingEventsFromPlayers = (state: GameState): void => {
  const ongoing: OngoingEvent[] = []
  for (const p of Object.values(state.players)) {
    if (!p.transition) {
      continue
    }
    ongoing.push({
      eventType: "move_transition",
      playerId: p.id,
      transition: {
        ...p.transition,
        fromPos: { ...p.transition.fromPos },
        toPos: { ...p.transition.toPos },
        fromTile: { ...p.transition.fromTile },
        toTile: { ...p.transition.toTile },
      },
    })
  }
  state.ongoingEvents = ongoing
}

const maybeStartMove = (
  state: GameState,
  player: PlayerState,
  direction: CardinalDirection,
  config: StepConfig,
): void => {
  const fromTile = player.tile
  const toTile = moveByDirection(fromTile, direction)
  const tileAtTarget = getTile(state.board, toTile.x, toTile.y)
  if (isBlockedTile(tileAtTarget)) {
    state.events.push({
      tick: state.tick,
      type: "move_blocked",
      playerId: player.id,
      from: fromTile,
      to: toTile,
      direction,
      tile: tileAtTarget,
    })
    return
  }

  player.transition = {
    fromPos: { x: fromTile.x, y: fromTile.y },
    toPos: { x: toTile.x, y: toTile.y },
    fromTile,
    toTile,
    startedTick: getMoveStartedTickFromIdle(state.tick, config),
    durationTicks: config.moveDurationTicks,
    direction,
  }
  player.facing = direction
  state.events.push({
    tick: state.tick,
    type: "move_started",
    playerId: player.id,
    from: fromTile,
    to: toTile,
    direction,
  })
}

const reverseTransition = (
  state: GameState,
  player: PlayerState,
  requestedDirection: CardinalDirection,
): void => {
  const t = player.transition
  if (!t) {
    return
  }

  // Reverse by swapping the transition endpoints and shifting startedTick.
  // This keeps speed (ticks per tile) constant across multiple reversals,
  // and keeps interpolation anchored to board tile centers.
  const currentProgress = getTransitionProgressAtTick(t, state.tick)
  const durationTicks = t.durationTicks
  const startedTick = state.tick - (1 - currentProgress) * durationTicks

  const fromTile = { ...t.toTile }
  const toTile = { ...t.fromTile }

  player.transition = {
    fromPos: { x: fromTile.x, y: fromTile.y },
    toPos: { x: toTile.x, y: toTile.y },
    fromTile,
    toTile,
    startedTick,
    durationTicks,
    direction: requestedDirection,
  }
  player.queuedDirection = null
  player.facing = requestedDirection

  state.events.push({
    tick: state.tick,
    type: "direction_reversed",
    playerId: player.id,
    from: { ...fromTile },
    to: { ...toTile },
    direction: requestedDirection,
  })
}

const applyConsequencesFromInputs = (
  state: GameState,
  inputs: Record<string, PlayerTickInput>,
  config: StepConfig,
): void => {
  for (const [playerId, player] of Object.entries(state.players)) {
    const input = inputs[playerId]
    if (!input) {
      continue
    }

    if (player.transition) {
      if (!input.direction) {
        // Releasing all movement input clears the queue.
        player.queuedDirection = null
      } else {
        player.facing = input.direction
        const opposite = oppositeDirection(player.transition.direction)
        if (input.direction === opposite) {
          reverseTransition(state, player, input.direction)
        } else if (
          canQueueDuringTransitionAtTick(player.transition, state.tick)
        ) {
          // Queue length is 1; new input overrides the previous queued input.
          player.queuedDirection = input.direction
        }
      }
    } else {
      if (input.direction) {
        maybeStartMove(state, player, input.direction, config)
      }
    }

    // Bomb logic not implemented yet; this is a placeholder for future events.
    void input.placeBomb
  }
}

const advanceTickAndResolveOngoingEvents = (
  state: GameState,
  config: StepConfig,
): void => {
  // Advance tick.
  state.tick = state.tick + 1

  // Complete transitions that have reached their duration.
  for (const player of Object.values(state.players)) {
    const t = player.transition
    if (!t) {
      continue
    }
    const elapsedAtEndOfTick = state.tick - t.startedTick
    if (elapsedAtEndOfTick >= t.durationTicks) {
      player.tile = { ...t.toTile }
      player.transition = null
      state.events.push({
        tick: state.tick,
        type: "move_completed",
        playerId: player.id,
        to: { ...player.tile },
      })

      if (player.queuedDirection) {
        const dir = player.queuedDirection
        player.queuedDirection = null
        maybeStartMove(state, player, dir, config)
      }
    }
  }
}

const gatherEventTriggerLog = (events: GameEvent[]): EventTriggerLog => {
  return {
    triggers: events.map((e) => ({
      happenedOnTick: e.tick,
      eventType: e.type,
    })),
  }
}

export const stepGameState = (
  prev: GameState,
  inputs: Record<string, PlayerTickInput>,
  config: StepConfig,
): GameState => {
  // 1) Copy the previous game state.
  const state = cloneGameState(prev)

  // 2) Apply consequences on the copied state.
  applyConsequencesFromInputs(state, inputs, config)
  advanceTickAndResolveOngoingEvents(state, config)
  syncOngoingEventsFromPlayers(state)

  // 3) Gather game event triggers based on the resulting state and inputs.
  state.eventTriggerLog = gatherEventTriggerLog(state.events)

  return state
}

export const getPlayerRenderPosition = (
  state: GameState,
  playerId: string,
  alpha: number,
): { x: number; y: number } => {
  const player = state.players[playerId]
  if (!player) {
    return { x: 0, y: 0 }
  }
  const tr = player.transition
  if (!tr || tr.durationTicks <= 0) {
    return { x: player.tile.x, y: player.tile.y }
  }
  const timeInTicks = state.tick + alpha
  const progress = (timeInTicks - tr.startedTick) / tr.durationTicks
  const t = Math.min(1, Math.max(0, progress))
  return {
    x: tr.fromPos.x + (tr.toPos.x - tr.fromPos.x) * t,
    y: tr.fromPos.y + (tr.toPos.y - tr.fromPos.y) * t,
  }
}

export const describeGameStateAscii = (state: GameState): string => {
  const legend = "#=solid *=soft .=empty P=player"
  const lines: string[] = []
  lines.push(`tick ${state.tick}`)
  lines.push(legend)

  const playerTiles = new Map<string, string>()
  for (const p of Object.values(state.players)) {
    playerTiles.set(`${p.tile.x},${p.tile.y}`, "P")
  }

  for (let y = state.board.height - 1; y >= 0; y--) {
    let row = ""
    for (let x = 0; x < state.board.width; x++) {
      const p = playerTiles.get(`${x},${y}`)
      if (p) {
        row += p
        continue
      }
      const tile = state.board.tiles[y][x]
      row +=
        tile === "WallIndestructible"
          ? "#"
          : tile === "WallDestructable"
            ? "*"
            : "."
    }
    lines.push(row)
  }
  return lines.join("\n")
}
