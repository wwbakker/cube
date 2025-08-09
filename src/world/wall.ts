import * as THREE from "three"
import { GameObject, setPositionToBottomLeft } from "./game-object"

export type WallType = "WallDestructable" | "WallIndestructible" // rest is floor

const createWallMesh = (type: WallType): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: type === "WallDestructable" ? 0xff0000 : 0x0000ff, // Red for destructible, blue for indestructible
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

export interface Wall extends GameObject {
  type: WallType
  position: THREE.Vector2 // Natural numbers
  obj3D: THREE.Mesh
}

export const createWall = (type: WallType, position: THREE.Vector2): Wall => {
  const wall : Wall =  {
    position,
    type,
    obj3D: createWallMesh(type),
    boundingbox: new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1))
  }
  setPositionToBottomLeft(wall)
  return wall;
}

