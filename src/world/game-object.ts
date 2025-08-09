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
    child.mesh.position.set(child.position.x, child.position.y, 0) // Assuming z
  })
}
