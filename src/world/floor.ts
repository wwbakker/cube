import * as THREE from "three"
import { Object3D, Vector3 } from "three"
import { addChildren, BoardObject } from "./game-object"
import { Board } from "./board"

export interface Floor extends BoardObject {
  type: "Floor"
}

const createFloorMesh = (width: number, height: number): THREE.Mesh => {
  // Floor
  const geometry = new THREE.PlaneGeometry(width, height)
  const material = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
  })

  return new THREE.Mesh(geometry, material)
}

export const createFloor = (width: number, height: number): Floor => {
  const floorMesh = createFloorMesh(width, height)

  const floor: Floor = {
    type: "Floor",
    position: new THREE.Vector2(width / 2 - 0.5, height / 2 - 0.5), // Origin at bottom-left corner
    children: [],
    obj3D: floorMesh,
    size: new Vector3(width + 1, height + 1, 0),
  }
  return floor
}
