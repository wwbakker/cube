import * as THREE from "three"

export interface GameObject {
  position: THREE.Vector2
  mesh: THREE.Mesh
  children?: GameObject[]
}

export const updatePosition = (
  object: GameObject,
  newPosition: THREE.Vector2,
) => {
  object["position"] = newPosition
  object.mesh.position.set(newPosition.x, newPosition.y, 0) // Assuming z
}

export const addChildren = (parent: GameObject, children: GameObject[]) => {
  if (!parent.children) {
    parent.children = []
  }
  parent.children.push(...children)
  children.forEach((child) => {
    parent.mesh.add(child.mesh)
    setOriginToParentBottomLeft(parent.mesh, child.mesh)
    placeOnTop(parent.mesh, child.mesh)
    child.mesh.translateX(child.position.x)
    child.mesh.translateY(child.position.y)
  })
}

export const getBoundingBox = (mesh: THREE.Mesh) : THREE.Box3 =>  {
  if (!mesh.geometry.boundingBox) {
    mesh.geometry.computeBoundingBox()
  }
  return mesh.geometry.boundingBox!;
}

export const setPositionToBottomLeft = (mesh: THREE.Mesh) => {
  const size = getMeshSize(mesh)
  mesh.translateX(size.x/2)
  mesh.translateY(size.y/2)
}

export const setOriginToParentBottomLeft = (parentmesh: THREE.Mesh, childmesh: THREE.Mesh) => {
  const parentsize = getMeshSize(parentmesh)
  childmesh.translateX(-parentsize.x/2)
  childmesh.translateY(-parentsize.y/2)
  childmesh.translateZ(-parentsize.z/2)
}

export const placeOnTop = (parentmesh: THREE.Mesh, childmesh: THREE.Mesh) => {
  const parentsize = getMeshSize(parentmesh)
  const childsize = getMeshSize(childmesh)
  childmesh.position.set(childmesh.position.x, childmesh.position.y, childmesh.position.z - parentsize.z/2 + (childsize.z/2)) // Assuming z
}

export const getMeshSize = (mesh: THREE.Mesh) => {
  const bb = getBoundingBox(mesh);
  const size = new THREE.Vector3;
  bb.getSize(size);
  return size;
}
