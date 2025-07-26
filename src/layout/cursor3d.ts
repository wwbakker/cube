import * as THREE from "three"

const points = [
  new THREE.Vector3(-0.5, 0, 0),
  new THREE.Vector3(0.5, 0, 0),

  new THREE.Vector3(0, -0.5, 0),
  new THREE.Vector3(0, 0.5, 0),

  new THREE.Vector3(0, 0, -0.5),
  new THREE.Vector3(0, 0, 0.5),
]
const cubeGeometry = new THREE.BufferGeometry().setFromPoints(points)
const material = new THREE.LineBasicMaterial({ color: 0xffffff })
const lines = new THREE.LineSegments(cubeGeometry, material)

const cursorMesh = new THREE.Mesh().add(lines)

export const loadCursor3d = (scene: THREE.Scene) => {
  scene.add(cursorMesh)
}

export const updateCursor3d = (position: THREE.Vector3) => {
  cursorMesh.position.copy(position)
}
