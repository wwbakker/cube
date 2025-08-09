import * as THREE from "three"
import { WallType } from "./wall"
import { Vector3 } from "three"

export type GameObjectType = "Board" | "Character" | WallType

export interface GameObject {
  type: GameObjectType
  position: THREE.Vector2
  size: THREE.Vector3
  obj3D: THREE.Object3D
  // boundingBox: THREE.Box3
  children?: GameObject[]
}

export const addPosition = (object: GameObject, distance: THREE.Vector2) => {
  object.position.add(distance)
  object.obj3D.position.add(new Vector3(distance.x, distance.y, 0))
}

export const addChildren = (parent: GameObject, children: GameObject[]) => {
  if (!parent.children) {
    parent.children = []
  }
  parent.children.push(...children)
  children.forEach((child) => {
    parent.obj3D.add(child.obj3D)
    setOriginToParentBottomLeft(parent, child)
    placeOnTop(parent, child)
    child.obj3D.translateX(child.position.x)
    child.obj3D.translateY(child.position.y)
  })
}

export const setPositionToBottomLeft = (obj: GameObject) => {
  const size = obj.size
  obj.obj3D.translateX(size.x / 2)
  obj.obj3D.translateY(size.y / 2)
}

export const setOriginToParentBottomLeft = (
  parent: GameObject,
  child: GameObject,
) => {
  const parentsize = parent.size
  child.obj3D.translateX(-parentsize.x / 2)
  child.obj3D.translateY(-parentsize.y / 2)
  child.obj3D.translateZ(-parentsize.z / 2)
}

export const placeOnTop = (parent: GameObject, child: GameObject) => {
  const parentsize = parent.size
  const childsize = child.size
  child.obj3D.translateZ(-parentsize.z / 2 + childsize.z / 2) // Assuming z
}

export const getBoundingBox = (obj: GameObject): THREE.Box2 => {
  const min = obj.position.clone()
  const max = new THREE.Vector2(
    obj.position.x + obj.size.x,
    obj.position.y + obj.size.y,
  )
  return new THREE.Box2(min, max)
}

// export const getMeshSize = (obj: GameObject) => {
//   const bb = obj.boundingBox
//   const size = new THREE.Vector3()
//   bb.getSize(size)
//   return size
// }
