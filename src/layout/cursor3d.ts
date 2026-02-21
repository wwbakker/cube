import * as THREE from "three"
import { Object3D } from "three"

export const createCursorMesh = (
  color: THREE.ColorRepresentation,
  size: number,
) => {
  const points = [
    new THREE.Vector3(-size, 0, 0),
    new THREE.Vector3(size, 0, 0),

    new THREE.Vector3(0, -size, 0),
    new THREE.Vector3(0, size, 0),

    new THREE.Vector3(0, 0, -size),
    new THREE.Vector3(0, 0, size),
  ]
  const cubeGeometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color })
  const lines = new THREE.LineSegments(cubeGeometry, material)

  const cursorMesh = new THREE.Mesh().add(lines)
  return cursorMesh
}

const cursorMesh = createCursorMesh(0xffffff, 0.5)
const cursorPosition = new THREE.Vector3(0, 0, 0)

export const cursor3d = new Object3D().add(cursorMesh)
cursor3d.position.copy(cursorPosition)
