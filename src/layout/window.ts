import * as THREE from "three"

const resizeCanvas = (
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
) => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

export const initializeWindow = (
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
) => {
  window.addEventListener("resize", () => resizeCanvas(renderer, camera))
  resizeCanvas(renderer, camera)
}
