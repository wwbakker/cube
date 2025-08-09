import * as THREE from "three"

export interface GameObject {
  position: THREE.Vector2
  obj3D: THREE.Object3D
  boundingbox: THREE.Box3
  children?: GameObject[]
}

export const updatePosition = (
  object: GameObject,
  newPosition: THREE.Vector2,
) => {
  object["position"] = newPosition
  object.obj3D.position.set(newPosition.x, newPosition.y, 0) // Assuming z
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
  const size = getMeshSize(obj)
  obj.obj3D.translateX(size.x/2)
  obj.obj3D.translateY(size.y/2)
}

export const setOriginToParentBottomLeft = (parent: GameObject, child: GameObject) => {
  const parentsize = getMeshSize(parent)
  child.obj3D.translateX(-parentsize.x/2)
  child.obj3D.translateY(-parentsize.y/2)
  child.obj3D.translateZ(-parentsize.z/2)
}

export const placeOnTop = (parent: GameObject, child: GameObject) => {
  const parentsize = getMeshSize(parent)
  const childsize = getMeshSize(child)
  child.obj3D.translateZ(-parentsize.z/2 + (childsize.z/2)) // Assuming z
}

export const getMeshSize = (obj: GameObject) => {
  const bb = obj.boundingbox
  const size = new THREE.Vector3;
  bb.getSize(size);
  return size;
}
