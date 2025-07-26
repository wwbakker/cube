let lastTime = performance.now()
let frames = 0
let fps = 0
const fpsCounterElement = document.getElementById("fps-counter") as HTMLElement

export const updateFPSCounter = () => {
  const currentTime = performance.now()
  frames++

  if (currentTime - lastTime >= 1000) {
    fps = frames
    frames = 0
    lastTime = currentTime
  }

  fpsCounterElement.textContent = `FPS: ${fps}`
}
