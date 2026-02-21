import * as THREE from "three"
import { createCursorMesh } from "./cursor3d"

export interface BoardDebug {
  scene: THREE.Scene
  update: (playerWorldPosition: THREE.Vector3) => void
}

export const createBoardDebug = (
  width: number,
  height: number,
  enabled: boolean,
): BoardDebug => {
  const scene = new THREE.Scene()
  if (!enabled) {
    return {
      scene,
      update: () => {},
    }
  }

  const boardCursors = Array.from(
    { length: width * height },
    (_, key) => key,
  ).map((i) => {
    const cursor = createCursorMesh(0x00ff00, 0.15)
    const plane = new THREE.PlaneGeometry(1, 1)
    const wireframe = new THREE.WireframeGeometry(plane)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    })
    const line = new THREE.LineSegments(wireframe, material)

    const group = new THREE.Group().add(cursor).add(line)
    group.position.set(i % width, Math.floor(i / height), 0)
    return group
  })

  for (const cursor of boardCursors) {
    scene.add(cursor)
  }

  const playerCursor = createCursorMesh(0xffffff, 0.25)
  scene.add(playerCursor)

  return {
    scene,
    update: (playerWorldPosition: THREE.Vector3) => {
      playerCursor.position.copy(playerWorldPosition)
    },
  }
}
