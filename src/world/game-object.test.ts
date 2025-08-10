import { describe, it, expect } from "vitest"
import {
  GameObject,
  getBoundingBox,
  getCenterY,
  getEdgeDistanceX,
  getEdgeDistanceY,
} from "./game-object"
import * as THREE from "three"

describe("gameObject", () => {
  const testObject: (x: number, y: number) => GameObject = (x, y) => ({
    type: "Character",
    position: new THREE.Vector2(x, y),
    size: new THREE.Vector3(1, 1, 1),
    obj3D: new THREE.Object3D(),
  })
  const objLow: GameObject = testObject(0, 0)
  const objHigh: GameObject = testObject(0, 2)
  // Visual representation of the objects:
  // Y |
  // 3 * /----\
  //   | |high|
  // 2 * \----/
  //   |
  // 1 * /----\
  //   | |low |
  // 0 * \----/
  //   +--------------------- X
  //     0    1    2    3

  it("centerY of objLow", () => {
    const centerY = getCenterY(objLow)
    expect(centerY).toBe(0.5)
  })

  it("centerY of objHigh", () => {
    const centerY = getCenterY(objHigh)
    expect(centerY).toBe(2.5)
  })

  it("centerX of objLow", () => {
    const centerX = objLow.position.x + objLow.size.x * 0.5
    expect(centerX).toBe(0.5)
  })

  it("bounding box of objHigh", () => {
    const boundingBox = getBoundingBox(objHigh)
    expect(boundingBox.min.x).toBe(0)
    expect(boundingBox.min.y).toBe(2)
    expect(boundingBox.max.x).toBe(1)
    expect(boundingBox.max.y).toBe(3)
  })

  it("returns correct distance Y1 when far away positive", () => {
    expect(getEdgeDistanceY(objLow, objHigh)).toBe(1)
  })
  it("returns correct distance Y2 when far away negative", () => {
    expect(getEdgeDistanceY(objHigh, objLow)).toBe(-1)
  })
  it("returns correct distance when clipped", () => {
    const obj1: GameObject = testObject(0, 0)
    const obj2: GameObject = testObject(0, 0.3)
    expect(getEdgeDistanceY(obj1, obj2)).toBe(-0.7)
  })
  it("returns correct distance when clipped other way", () => {
    const obj1: GameObject = testObject(0, 0)
    const obj2: GameObject = testObject(0, 0.3)
    expect(getEdgeDistanceY(obj2, obj1)).toBe(0.7)
  })
  it("returns zero when objects are touching on Y edge", () => {
    const obj1: GameObject = testObject(0, 0)
    const obj2: GameObject = testObject(0, 1)
    expect(getEdgeDistanceY(obj1, obj2)).toBe(0)
  })
  it("returns correct distance X1 when far away positive", () => {
    const obj1: GameObject = testObject(0, 0)
    const obj2: GameObject = testObject(2, 0)
    expect(getEdgeDistanceX(obj1, obj2)).toBe(1)
  })
})
