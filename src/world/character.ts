import * as THREE from "three"
import { GameObject, setPositionToBottomLeft } from "./game-object"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export type CardinalDirection = "up" | "down" | "left" | "right"

export interface Character extends GameObject {
  // position: THREE.Vector2 // Floating point numbers
  directionRequests: CardinalDirection[]
  actionRequest: ActionRequest
  moveSpeed: number // Speed in units per second
}

const characterData: THREE.Object3D = new THREE.Object3D()

const createCharacterMesh = () => {
  const loader = new GLTFLoader()
  loader.load("models/bomberman/bomberman.glb", (data: GLTF) => {
    data.scene.rotateX(Math.PI / 2)
    data.scene.scale.set(0.5, 0.5, 0.5)
    characterData.add(data.scene)
  })
  return characterData
}

export const createCharacter = (position: THREE.Vector2) => {
  const character: Character = {
    type: "Character",
    position, // Origin at bottom-left corner
    directionRequests: [],
    obj3D: createCharacterMesh(),
    size: new THREE.Vector3(1, 1, 1),
    actionRequest: null,
    moveSpeed: 2, // Speed in units per second
  }
  character.obj3D.position.set(character.position.x, character.position.y, 0)
  setPositionToBottomLeft(character)
  return character
}

export type ActionRequest = "move" | null

export const setActionRequest = (
  character: Character,
  action: ActionRequest,
) => {
  character.actionRequest = action
}
// type CharacterAction = "moveUp" | "moveDown" | "moveLeft" | "moveRight"
