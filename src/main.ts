import * as THREE from "three"
import { initializeWindow } from "./layout/window"
import { updateFPSCounter } from "./layout/fps-counter"
import { cursor3d } from "./layout/cursor3d"
import { createBoardDebug } from "./layout/board-debug"
import { createWorld } from "./world/world"
import { bindPlayer1Controls } from "./input/player-1-controls"
import { getDeltaTime } from "./world/delta-time"
import {
  createInitialGameState,
  describeGameStateAscii,
  getPlayerRenderPosition,
  stepGameState,
} from "./game-state/world"

const canvas = document.getElementById("webgl") as HTMLCanvasElement
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.autoClear = false

camera.rotateX(Math.PI / 4) // Rotate camera to look down
camera.position.z = 10
camera.position.y = -5
camera.position.x = 5

const debugMode = true
const world = createWorld(11, 11)
let gameState = createInitialGameState(world.board.width, world.board.height)

const tickRate = 10
const tickMs = 1000 / tickRate
const stepConfig = { moveDurationTicks: 4, moveWarmupTicks: 1 }
let accumulatorMs = 0

const debugPre = (() => {
  if (!debugMode) {
    return null
  }
  const pre = document.createElement("pre")
  pre.style.position = "absolute"
  pre.style.left = "12px"
  pre.style.top = "12px"
  pre.style.padding = "10px 12px"
  pre.style.background = "rgba(0,0,0,0.65)"
  pre.style.color = "white"
  pre.style.fontFamily =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  pre.style.fontSize = "12px"
  pre.style.lineHeight = "1.2"
  pre.style.pointerEvents = "none"
  pre.style.whiteSpace = "pre"
  document.body.appendChild(pre)
  return pre
})()

const createScene = () => {
  const scene = new THREE.Scene()
  scene.add(new THREE.AmbientLight())
  scene.add(world.board.obj3D)
  scene.add(world.player1.obj3D)

  return scene
}

const boardDebug = createBoardDebug(
  world.board.width,
  world.board.height,
  debugMode,
)

const controls = bindPlayer1Controls()

const gameLoop = () => {
  updateFPSCounter()
  cursor3d.rotation.y += 0.01
  const dt = getDeltaTime()
  accumulatorMs += dt
  while (accumulatorMs >= tickMs) {
    const input = controls.consumeTickInput()
    gameState = stepGameState(gameState, { p1: input }, stepConfig)
    accumulatorMs -= tickMs
  }
  const alpha = Math.min(1, Math.max(0, accumulatorMs / tickMs))
  const p1Pos = getPlayerRenderPosition(gameState, "p1", alpha)
  world.player1.obj3D.position.set(p1Pos.x, p1Pos.y, 0)
  world.player1.position.set(p1Pos.x, p1Pos.y)
  if (debugPre) {
    debugPre.textContent = describeGameStateAscii(gameState)
  }

  const scene = createScene()
  boardDebug.update(world.player1.obj3D.position)

  renderer.clear()
  renderer.render(scene, camera)
  renderer.clearDepth()
  renderer.render(cursor3d, camera)
  renderer.render(boardDebug.scene, camera)

  requestAnimationFrame(gameLoop)
}

initializeWindow(renderer, camera)

gameLoop()
