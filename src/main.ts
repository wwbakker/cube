import * as THREE from "three"
import { initializeWindow } from "./layout/window"
import { updateFPSCounter } from "./layout/fps-counter"
import { loadBag, updateBag } from "./world/bag"
import { loadCursor3d, updateCursor3d } from "./layout/cursor3d"

const scene = new THREE.Scene()
const hud = new THREE.Scene()
const canvas = document.getElementById("webgl") as HTMLCanvasElement
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)

const renderer = new THREE.WebGLRenderer({ canvas })
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cursorPosition = new THREE.Vector3(0, 0, 0)
// const cube = new THREE.Mesh(geometry, material)
loadBag(scene) // Load bag slots into the scene
loadCursor3d(hud)
// scene.add(cube)

camera.position.z = 10
renderer.autoClear = false

const gameLoop = () => {
  updateFPSCounter()
  updateBag()
  updateCursor3d(cursorPosition)
  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01
  renderer.clear()
  renderer.render(scene, camera)
  renderer.clearDepth()
  renderer.render(hud, camera)

  requestAnimationFrame(gameLoop)
}

initializeWindow(renderer, camera)

gameLoop()
