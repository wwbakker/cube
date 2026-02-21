import { BoardState, createBoardState, getTile, isBlockedTile } from "./board"
import { CardinalDirection } from "../world/character"

export interface DiscretePosition {
  x: number
  y: number
}

export interface MoveTransition {
  from: DiscretePosition
  to: DiscretePosition
  startedTick: number
  durationTicks: number
}

export interface PlayerState {
  id: string
  tile: DiscretePosition
  facing: CardinalDirection
  transition: MoveTransition | null
  queuedDirection: CardinalDirection | null
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
  events: GameEvent[]
}

export interface PlayerTickInput {
  direction: CardinalDirection | null
  placeBomb: boolean
}

export interface StepConfig {
  moveDurationTicks: number
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
  }
}

const maybeStartMove = (
  state: GameState,
  player: PlayerState,
  direction: CardinalDirection,
  config: StepConfig,
) => {
  const from = player.tile
  const to = moveByDirection(from, direction)
  const tileAtTarget = getTile(state.board, to.x, to.y)
  if (isBlockedTile(tileAtTarget)) {
    state.events.push({
      tick: state.tick,
      type: "move_blocked",
      playerId: player.id,
      from,
      to,
      direction,
      tile: tileAtTarget,
    })
    return
  }

  player.transition = {
    from,
    to,
    startedTick: state.tick,
    durationTicks: config.moveDurationTicks,
  }
  player.facing = direction
  state.events.push({
    tick: state.tick,
    type: "move_started",
    playerId: player.id,
    from,
    to,
    direction,
  })
}

export const stepGameState = (
  prev: GameState,
  inputs: Record<string, PlayerTickInput>,
  config: StepConfig,
): GameState => {
  // Shallow-ish copy; core state is small for now.
  const state: GameState = {
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
                from: { ...p.transition.from },
                to: { ...p.transition.to },
              }
            : null,
        },
      ]),
    ) as Record<string, PlayerState>,
    events: [],
  }

  // 1) Apply inputs (start/queue moves) at the current tick.
  for (const [playerId, player] of Object.entries(state.players)) {
    const input = inputs[playerId]
    if (!input) {
      continue
    }

    if (input.direction) {
      if (player.transition) {
        player.queuedDirection = input.direction
        player.facing = input.direction
      } else {
        maybeStartMove(state, player, input.direction, config)
      }
    }

    // Bomb logic not implemented yet; this is a placeholder for future events.
    void input.placeBomb
  }

  // 2) Advance tick.
  state.tick = prev.tick + 1

  // 3) Complete transitions that have reached their duration.
  for (const player of Object.values(state.players)) {
    const t = player.transition
    if (!t) {
      continue
    }
    const elapsedAtEndOfTick = state.tick - t.startedTick
    if (elapsedAtEndOfTick >= t.durationTicks) {
      player.tile = { ...t.to }
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
    x: tr.from.x + (tr.to.x - tr.from.x) * t,
    y: tr.from.y + (tr.to.y - tr.from.y) * t,
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
