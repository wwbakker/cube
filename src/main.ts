import * as THREE from "three"
import { initializeWindow } from "./layout/window"
import { updateFPSCounter } from "./layout/fps-counter"
import { bag } from "./world/bag"
import { cursor3d } from "./layout/cursor3d"

const scene = new THREE.Scene()
const canvas = document.getElementById("webgl") as HTMLCanvasElement
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)

const renderer = new THREE.WebGLRenderer({ canvas })
scene.add(bag)

// const cube = new THREE.Mesh(geometry, material)
// loadCursor3d(hud)
// scene.add(cube)

camera.position.z = 10
renderer.autoClear = false

const gameLoop = () => {
  updateFPSCounter()
  scene.rotation.y += 0.01
  cursor3d.rotation.y += 0.01

  renderer.clear()
  renderer.render(scene, camera)
  renderer.clearDepth()
  renderer.render(cursor3d, camera)

  requestAnimationFrame(gameLoop)
}

initializeWindow(renderer, camera)

gameLoop()
