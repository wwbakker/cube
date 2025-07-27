import * as THREE from "three"
import { Vector3 } from "three"
import { cubeWireFrame } from "./bag-geometry"
// column, row, layer

// Maximum bag size is 10x10x10

interface BagSlot {
  position: THREE.Vector3
  lines: THREE.LineSegments
}

interface ShapeInBag {
  positionInBag: THREE.Vector3
  blockShape: Vector3[]
}

const createBagSlot = (x: number, y: number, z: number): BagSlot => {
  const lines = cubeWireFrame.clone()
  lines.position.set(x, y, z)
  return {
    position: new Vector3(x, y, z),
    lines,
  }
}

const availableBagSlots: BagSlot[] = [
  createBagSlot(3, 3, 4),
  createBagSlot(4, 3, 4),
  createBagSlot(5, 3, 4),
  createBagSlot(3, 4, 4),
  createBagSlot(4, 4, 4),
  createBagSlot(5, 4, 4),
  createBagSlot(3, 5, 4),
  createBagSlot(4, 5, 4),
  createBagSlot(5, 5, 4),
]

const selectedShapeInBag: ShapeInBag = {
  positionInBag: new Vector3(4, 4, 4),
  blockShape: [new Vector3(0, 0, 0), new Vector3(1, 0, 0)],
}

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

const createSelectedShapeGeometry = () => {
  const result = new THREE.Mesh()
  selectedShapeInBag.blockShape.forEach((block) => {
    const shape = new THREE.Mesh(geometry, material)
    shape.position.copy(block)
    shape.scale.set(0.95, 0.95, 0.95) // Scale down, so it doesn't overlap with the wireframe of the bag slot
    result.add(shape)
  })
  return result
}

const createBagGeometry = () => {
  const result = new THREE.Mesh()
  availableBagSlots.forEach((bagSlot) => {
    // const cube = cubeWireFrame.clone()
    // cube.position.set(bagSlot.x - 0.5, bagSlot.y - 0.5, bagSlot.z - 0.5)
    result.add(bagSlot.lines)
  })
  result.position.set(-4.5, -4.5, -4.5) // Center the bag geometry to 0,0,0
  return result
}

const bagGeometry = createBagGeometry()
const selectedShapeGeometry = createSelectedShapeGeometry()
const bagWorldObject = new THREE.Object3D().add(
  bagGeometry,
  selectedShapeGeometry,
)

export const loadBag = (scene: THREE.Scene) => {
  scene.add(bagWorldObject)
}

export const updateBag = () => {
  // bagWorldObject.rotation.x += 0.01
  bagWorldObject.rotation.y += 0.01
}
