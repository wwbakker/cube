import { describe, it, expect } from "vitest"
import { createInitialGameState, stepGameState } from "./world"

const transitionPosAt = (
  transition: {
    fromPos: { x: number; y: number }
    toPos: { x: number; y: number }
    startedTick: number
    durationTicks: number
  },
  tick: number,
): { x: number; y: number } => {
  if (transition.durationTicks <= 0) {
    return { x: transition.toPos.x, y: transition.toPos.y }
  }
  const raw = (tick - transition.startedTick) / transition.durationTicks
  const t = Math.min(1, Math.max(0, raw))
  return {
    x: transition.fromPos.x + (transition.toPos.x - transition.fromPos.x) * t,
    y: transition.fromPos.y + (transition.toPos.y - transition.fromPos.y) * t,
  }
}

describe("game-state movement", () => {
  it("starts a move transition into a free tile", () => {
    const state0 = createInitialGameState(11, 11)
    const state1 = stepGameState(
      state0,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 4, moveWarmupTicks: 1 },
    )

    const p1 = state1.players.p1
    expect(p1.transition).not.toBeNull()
    expect(p1.tile).toEqual({ x: 1, y: 1 })
    expect(p1.transition?.fromTile).toEqual({ x: 1, y: 1 })
    expect(p1.transition?.toTile).toEqual({ x: 2, y: 1 })
  })

  it("completes a move after durationTicks", () => {
    let state = createInitialGameState(11, 11)
    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 2, moveWarmupTicks: 1 },
    )

    // Warmup tick + duration ticks.
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      { moveDurationTicks: 2, moveWarmupTicks: 1 },
    )
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      { moveDurationTicks: 2, moveWarmupTicks: 1 },
    )
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      { moveDurationTicks: 2, moveWarmupTicks: 1 },
    )

    expect(state.players.p1.tile).toEqual({ x: 2, y: 1 })
    expect(state.players.p1.transition).toBeNull()
  })

  it("blocks a move into a wall", () => {
    const state0 = createInitialGameState(11, 11)
    const state1 = stepGameState(
      state0,
      { p1: { direction: "left", placeBomb: false } },
      { moveDurationTicks: 4, moveWarmupTicks: 1 },
    )
    expect(state1.players.p1.tile).toEqual({ x: 1, y: 1 })
    expect(state1.players.p1.transition).toBeNull()
    expect(state1.events.some((e) => e.type === "move_blocked")).toBe(true)
  })

  it("only allows queueing when transition is >= 70% done", () => {
    let state = createInitialGameState(11, 11)
    // Start moving right with duration 10 ticks.
    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )
    // At start of next tick, progress is 1/10 = 10% => queue ignored.
    state = stepGameState(
      state,
      { p1: { direction: "up", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )
    expect(state.players.p1.queuedDirection).toBeNull()

    // With warmup tick, movement starts later. Advance until queueing is allowed.
    for (let i = 0; i < 7; i++) {
      state = stepGameState(
        state,
        { p1: { direction: null, placeBomb: false } },
        { moveDurationTicks: 10, moveWarmupTicks: 1 },
      )
    }
    // Now try queueing; should be accepted.
    state = stepGameState(
      state,
      { p1: { direction: "up", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )
    expect(state.players.p1.queuedDirection).toBe("up")
  })

  it("queue length is one and new input overrides previous", () => {
    let state = createInitialGameState(11, 11)
    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )

    // Advance to a tick where queueing is allowed.
    for (let i = 0; i < 8; i++) {
      state = stepGameState(
        state,
        { p1: { direction: null, placeBomb: false } },
        { moveDurationTicks: 10, moveWarmupTicks: 1 },
      )
    }

    state = stepGameState(
      state,
      { p1: { direction: "up", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )
    expect(state.players.p1.queuedDirection).toBe("up")

    state = stepGameState(
      state,
      { p1: { direction: "down", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )
    expect(state.players.p1.queuedDirection).toBe("down")
  })

  it("clears queued input when all movement inputs are released during transition", () => {
    let state = createInitialGameState(11, 11)
    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )

    // Advance until queueing is allowed, then queue.
    for (let i = 0; i < 8; i++) {
      state = stepGameState(
        state,
        { p1: { direction: null, placeBomb: false } },
        { moveDurationTicks: 10, moveWarmupTicks: 1 },
      )
    }
    state = stepGameState(
      state,
      { p1: { direction: "up", placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )
    expect(state.players.p1.queuedDirection).toBe("up")

    // Release all movement inputs => direction null => clear queue.
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      { moveDurationTicks: 10, moveWarmupTicks: 1 },
    )
    expect(state.players.p1.queuedDirection).toBeNull()
  })

  it("reverses direction with consistent timing (supports multiple reversals)", () => {
    const config = { moveDurationTicks: 6, moveWarmupTicks: 0 }
    let state = createInitialGameState(11, 11)
    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      config,
    )

    // Move two ticks into the transition.
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      config,
    )
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      config,
    )

    const tickA = state.tick
    const beforeA = state.players.p1.transition
    expect(beforeA).not.toBeNull()

    const posBeforeA = transitionPosAt(beforeA as any, tickA)

    state = stepGameState(
      state,
      { p1: { direction: "left", placeBomb: false } },
      config,
    )

    const afterA = state.players.p1.transition
    expect(afterA).not.toBeNull()
    expect(afterA?.direction).toBe("left")
    expect(afterA?.durationTicks).toBe(config.moveDurationTicks)
    expect(afterA?.fromPos).toEqual({
      x: afterA!.fromTile.x,
      y: afterA!.fromTile.y,
    })
    expect(afterA?.toPos).toEqual({ x: afterA!.toTile.x, y: afterA!.toTile.y })
    expect(state.events.some((e) => e.type === "direction_reversed")).toBe(true)

    const posAfterAAtSameTick = transitionPosAt(afterA as any, tickA)
    expect(posAfterAAtSameTick.x).toBeCloseTo(posBeforeA.x, 8)
    expect(posAfterAAtSameTick.y).toBeCloseTo(posBeforeA.y, 8)

    // Reverse again on the next tick and ensure continuity still holds.
    const tickB = state.tick
    const beforeB = state.players.p1.transition
    expect(beforeB).not.toBeNull()
    const posBeforeB = transitionPosAt(beforeB as any, tickB)

    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      config,
    )
    const afterB = state.players.p1.transition
    expect(afterB).not.toBeNull()
    expect(afterB?.direction).toBe("right")
    expect(afterB?.durationTicks).toBe(config.moveDurationTicks)

    const posAfterBAtSameTick = transitionPosAt(afterB as any, tickB)
    expect(posAfterBAtSameTick.x).toBeCloseTo(posBeforeB.x, 8)
    expect(posAfterBAtSameTick.y).toBeCloseTo(posBeforeB.y, 8)
  })
})
