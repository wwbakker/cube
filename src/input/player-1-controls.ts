import { CardinalDirection } from "../world/character"

export interface PlayerTickInput {
  direction: CardinalDirection | null
  placeBomb: boolean
}

export interface Player1Controls {
  consumeTickInput: () => PlayerTickInput
}

export const bindPlayer1Controls = (): Player1Controls => {
  // Most recent direction is at the end.
  let directionRequests: CardinalDirection[] = []
  let placeBombRequested = false

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.repeat) {
      // Ignore repeated key presses to prevent multiple actions
      return
    }
    switch (event.key) {
      case "ArrowUp":
        directionRequests = directionRequests.filter((d) => d !== "up")
        directionRequests.push("up")
        break
      case "ArrowDown":
        directionRequests = directionRequests.filter((d) => d !== "down")
        directionRequests.push("down")
        break
      case "ArrowLeft":
        directionRequests = directionRequests.filter((d) => d !== "left")
        directionRequests.push("left")
        break
      case "ArrowRight":
        directionRequests = directionRequests.filter((d) => d !== "right")
        directionRequests.push("right")
        break
      case "Space":
        placeBombRequested = true
        break
      default:
        break
    }
  })

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        // Remove the direction request when the key is released
        directionRequests = directionRequests.filter(
          (dir) =>
            dir !==
            (event.key.replace("Arrow", "").toLowerCase() as
              | "up"
              | "down"
              | "left"
              | "right"),
        )
        break
      default:
        break
    }
  })

  return {
    consumeTickInput: () => {
      const direction =
        directionRequests.length > 0
          ? directionRequests[directionRequests.length - 1]
          : null
      const placeBomb = placeBombRequested
      placeBombRequested = false
      return { direction, placeBomb }
    },
  }
}
