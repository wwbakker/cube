import * as THREE from "three"
import { initializeWindow } from "./layout/window"
import { updateFPSCounter } from "./layout/fps-counter"
import { cursor3d } from "./layout/cursor3d"
import { createBoard } from "./world/board"

const canvas = document.getElementById("webgl") as HTMLCanvasElement
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)

const renderer = new THREE.WebGLRenderer({ canvas })
// scene.add(bag)

// const cube = new THREE.Mesh(geometry, material)
// loadCursor3d(hud)
// scene.add(cube)

camera.rotateX(Math.PI / 4) // Rotate camera to look down
camera.position.z = 10
camera.position.y = -10
camera.position.x = 0
// camera.lookAt(new THREE.Vector3(0, 0, 0))
renderer.autoClear = false

const board = createBoard(10, 10) // Assuming createBoard is defined in board.ts

const createScene = () => {
  const scene = new THREE.Scene()
  scene.add(board.mesh)

  return scene
}

const gameLoop = () => {
  updateFPSCounter()

  cursor3d.rotation.y += 0.01
  const scene = createScene()

  renderer.clear()
  renderer.render(scene, camera)
  renderer.clearDepth()
  renderer.render(cursor3d, camera)

  requestAnimationFrame(gameLoop)
}

initializeWindow(renderer, camera)

gameLoop()
