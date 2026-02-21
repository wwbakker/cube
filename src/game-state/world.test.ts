import { describe, it, expect } from "vitest"
import { createInitialGameState, stepGameState } from "./world"

describe("game-state movement", () => {
  it("starts a move transition into a free tile", () => {
    const state0 = createInitialGameState(11, 11)
    const state1 = stepGameState(
      state0,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 4 },
    )

    const p1 = state1.players.p1
    expect(p1.transition).not.toBeNull()
    expect(p1.tile).toEqual({ x: 1, y: 1 })
    expect(p1.transition?.from).toEqual({ x: 1, y: 1 })
    expect(p1.transition?.to).toEqual({ x: 2, y: 1 })
  })

  it("completes a move after durationTicks", () => {
    let state = createInitialGameState(11, 11)
    state = stepGameState(
      state,
      { p1: { direction: "right", placeBomb: false } },
      { moveDurationTicks: 2 },
    )
    state = stepGameState(
      state,
      { p1: { direction: null, placeBomb: false } },
      { moveDurationTicks: 2 },
    )
    // After 2 ticks elapsed since start, move should complete.
    expect(state.players.p1.tile).toEqual({ x: 2, y: 1 })
    expect(state.players.p1.transition).toBeNull()
  })

  it("blocks a move into a wall", () => {
    const state0 = createInitialGameState(11, 11)
    const state1 = stepGameState(
      state0,
      { p1: { direction: "left", placeBomb: false } },
      { moveDurationTicks: 4 },
    )
    expect(state1.players.p1.tile).toEqual({ x: 1, y: 1 })
    expect(state1.players.p1.transition).toBeNull()
    expect(state1.events.some((e) => e.type === "move_blocked")).toBe(true)
  })
})
