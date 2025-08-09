let lastTime = performance.now()

export const getDeltaTime = () => {
  const currentTime = performance.now()
  const deltaTime = currentTime - lastTime
  lastTime = currentTime
  return deltaTime
}
