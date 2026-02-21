import { describe, it, expect } from "vitest"
import { createInitialGameState, stepGameState } from "./world"

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

  it("reverses direction and uses elapsed ticks as new duration", () => {
    let state = createInitialGameState(11, 11)
    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 6, moveWarmupTicks: 1 },
    )
    // Two ticks into the move.
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      { moveDurationTicks: 6, moveWarmupTicks: 1 },
    )
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      { moveDurationTicks: 6, moveWarmupTicks: 1 },
    )

    const beforeReverse = state.players.p1.transition
    expect(beforeReverse).not.toBeNull()
    const elapsed = Math.max(0, state.tick - (beforeReverse as any).startedTick)

    state = stepGameState(
      state,
      { p1: { direction: "left", placeBomb: false } },
      { moveDurationTicks: 6, moveWarmupTicks: 1 },
    )
    const afterReverse = state.players.p1.transition
    expect(afterReverse).not.toBeNull()
    expect(afterReverse?.direction).toBe("left")
    expect(afterReverse?.durationTicks).toBe(elapsed)
  })
})
