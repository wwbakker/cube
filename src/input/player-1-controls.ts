import { Character } from "../world/character"

export const bindPlayer1Controls = (character: Character) => {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.repeat) {
      // Ignore repeated key presses to prevent multiple actions
      return
    }
    switch (event.key) {
      case "ArrowUp":
        character.actionRequest = "move"
        character.directionRequests.push("up")
        break
      case "ArrowDown":
        character.actionRequest = "move"
        character.directionRequests.push("down")
        break
      case "ArrowLeft":
        character.actionRequest = "move"
        character.directionRequests.push("left")
        break
      case "ArrowRight":
        character.actionRequest = "move"
        character.directionRequests.push("right")
        break
      case "Space":
        console.log("Action/Place Bomb")
        break
      default:
        break
    }
    console.log(`Direction Requests: ${character.directionRequests.join(", ")}`)
  })

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        // Remove the direction request when the key is released
        character.directionRequests = character.directionRequests.filter(
          (dir) =>
            dir !==
            (event.key.replace("Arrow", "").toLowerCase() as
              | "up"
              | "down"
              | "left"
              | "right"),
        )
        // If no direction requests are left, reset action request
        if (character.directionRequests.length === 0) {
          character.actionRequest = null
        }
        break
      default:
        break
    }
  })
}
