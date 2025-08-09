import * as THREE from "three"
import { GameObject, setPositionToBottomLeft } from "./game-object"

export type WallType = "WallDestructable" | "WallIndestructible" // rest is floor

const createWallMesh = (type: WallType): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: type === "WallDestructable" ? 0xff0000 : 0x0000ff, // Red for destructible, blue for indestructible
  })
  const mesh = new THREE.Mesh(geometry, material)
  setPositionToBottomLeft(mesh)
  return mesh
}

export interface Wall extends GameObject {
  type: WallType
  position: THREE.Vector2 // Natural numbers
  mesh: THREE.Mesh
}

export const createWall = (type: WallType, position: THREE.Vector2): Wall => ({
  position,
  type,
  mesh: createWallMesh(type),
})
