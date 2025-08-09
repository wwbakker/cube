import * as THREE from "three"
import { GameObject } from "./game-object"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface Character extends GameObject {
  position: THREE.Vector2 // Floating point numbers
  direction: "up" | "down" | "left" | "right"
}

export const createCharacter = () => { 
    
}

let characterData : THREE.Group<THREE.Object3DEventMap> | undefined;

export const createCharacterMesh = () => {
    if (!characterData)
    {
        const loader = new GLTFLoader(); 
        loader.load("models/bomberman/bomberman.glb", (data) => {
            data.scene.rotateX(Math.PI / 2)
            data.scene.scale.set(0.5, 0.5, 0.5)
            characterData = data.scene
        })
    }
    return characterData;
}

