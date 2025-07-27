import * as THREE from "three"

const cubePoints = [
  // Front face
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 0, 0),

  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(1, 1, 0),

  new THREE.Vector3(1, 1, 0),
  new THREE.Vector3(0, 1, 0),

  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),

  // Back face
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 1),

  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1, 1, 1),

  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(0, 1, 1),

  new THREE.Vector3(0, 1, 1),
  new THREE.Vector3(0, 0, 1),

  // Connect front and back faces
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 1),

  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(1, 0, 1),

  new THREE.Vector3(1, 1, 0),
  new THREE.Vector3(1, 1, 1),

  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 1, 1),
]
const cubeGeometry = new THREE.BufferGeometry().setFromPoints(cubePoints)
const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
export const cubeWireFrame = new THREE.LineSegments(cubeGeometry, material)
