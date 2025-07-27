import * as THREE from "three"
import { Object3D } from "three"

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
const cursorPosition = new THREE.Vector3(0, 0, 0)

export const cursor3d = new Object3D().add(cursorMesh)
cursor3d.position.copy(cursorPosition)
