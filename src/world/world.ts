import * as THREE from "three"
import { GameObject } from "./game-object"

interface Character extends GameObject {
  position: THREE.Vector2 // Floating point numbers
  direction: "up" | "down" | "left" | "right"
}
