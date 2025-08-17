import * as THREE from "three"
import { BoardObject, GameObject, setPositionToBottomLeft } from "./game-object"

export type WallType = "WallDestructable" | "WallIndestructible" // rest is floor

const createWallMesh = (type: WallType): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: type === "WallDestructable" ? 0xff0000 : 0x0000ff, // Red for destructible, blue for indestructible
  })

  return new THREE.Mesh(geometry, material)
}

export interface Wall extends BoardObject {
  type: WallType
  obj3D: THREE.Mesh
}

export const createWall = (type: WallType, position: THREE.Vector2): Wall => {
  const wall: Wall = {
    position,
    type,
    obj3D: createWallMesh(type),
    size: new THREE.Vector3(1, 1, 1),
  }
  setPositionToBottomLeft(wall)
  return wall
}
