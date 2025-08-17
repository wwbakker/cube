import * as THREE from "three"
import { initializeWindow } from "./layout/window"
import { updateFPSCounter } from "./layout/fps-counter"
import { createCursorMesh, cursor3d } from "./layout/cursor3d"
import { createWorld, updateWorld } from "./world/world"
import { bindPlayer1Controls } from "./input/player-1-controls"
import { getDeltaTime } from "./world/delta-time"

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

const createScene = () => {
  const scene = new THREE.Scene()
  scene.add(new THREE.AmbientLight())
  scene.add(world.board.obj3D)
  scene.add(world.player1.obj3D)

  return scene
}


let boardcursors = Array.from({ length: world.board.width * world.board.height }, (_, key) => key).map((i) => {
  const cursor = createCursorMesh(0x00ff00, 0.15)
  const plane = new THREE.PlaneGeometry(1, 1)
  const wireframe = new THREE.WireframeGeometry(plane)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide,
  })
  const line = new THREE.LineSegments(wireframe, material);

  const group = new THREE.Group().add(cursor).add(line)
  group.position.set(i % world.board.width, Math.floor(i / world.board.height), 0)
  return group
})

const playercursor = createCursorMesh(0xffffff, 0.25)
const createDebugScene = () => {
  const scene = new THREE.Scene()
  if (debugMode) {
    playercursor.position.copy(world.player1.obj3D.position)
    scene.add(playercursor)
    for (const cursor of boardcursors) {
      scene.add(cursor)
    }
  }
  return scene
}

bindPlayer1Controls(world.player1)

const gameLoop = () => {
  updateFPSCounter()
  cursor3d.rotation.y += 0.01
  updateWorld(world, getDeltaTime())
  const scene = createScene()
  const debugscene = createDebugScene()

  renderer.clear()
  renderer.render(scene, camera)
  renderer.clearDepth()
  renderer.render(cursor3d, camera)
  renderer.render(debugscene, camera)

  requestAnimationFrame(gameLoop)
}

initializeWindow(renderer, camera)

gameLoop()
