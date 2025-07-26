import * as THREE from "three"
import { BufferGeometry } from "three"
// column, row, layer

// const bag = [
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
//   [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// ]

// Maximum bag size is 10x10x10

interface BagSlot {
  x: number
  y: number
  z: number
}

const bagSlots: BagSlot[] = [
  { x: 4, y: 4, z: 4 },
  { x: 5, y: 4, z: 4 },
  { x: 6, y: 4, z: 4 },
  { x: 4, y: 5, z: 4 },
  { x: 5, y: 5, z: 4 },
  { x: 6, y: 5, z: 4 },
  { x: 4, y: 6, z: 4 },
  { x: 5, y: 6, z: 4 },
  { x: 6, y: 6, z: 4 },
]

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
const lines = new THREE.LineSegments(cubeGeometry, material)

const createBagGeometry = () => {
  const result = new THREE.Mesh()
  bagSlots.forEach((bagSlot) => {
    const cube = lines.clone()
    cube.position.set(bagSlot.x - 0.5, bagSlot.y - 0.5, bagSlot.z - 0.5)
    result.add(cube)
  })
  result.position.set(-4.5, -4.5, -4.5) // Center the bag geometry to 0,0,0
  return result
}

const bagGeometry = createBagGeometry()
const bagWorldObject = new THREE.Object3D().add(bagGeometry)

export const loadBag = (scene: THREE.Scene) => {
  scene.add(bagWorldObject)
}

export const updateBag = () => {
  // bagWorldObject.rotation.x += 0.01
  bagWorldObject.rotation.y += 0.01
}

// const material = new THREE.MeshBasicMaterial({
//   color: 0xff0000,
//   wireframe: true,
// })
// const geometry = new THREE.BoxGeometry(1, 1, 1)
//

//
// export const loadBagSlots = (scene: THREE.Scene) => {
//   bagSlots.forEach((bagSlot) => {
//     bagSlot.cube = new THREE.Mesh(geometry, material)
//     bagSlot.cube.position.set(bagSlot.x, bagSlot.y, bagSlot.z)
//     bagGeometry.add(bagSlot.cube)
//   })
//   scene.add(bagGeometry)
//   bagGeometry.position.set(-4.5, -4.5, -4.5) // Center the bag geometry in the scene
// }
