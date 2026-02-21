# Bomberman (Current Implementation Notes)

This repo contains the beginnings of a Bomberman-like grid game implemented with Three.js. The code currently focuses on:

- generating a tile-based board made of walls + a floor
- spawning a player-controlled character
- moving that character on the board with simple wall collision

Bomb placement/explosions are not implemented yet (Space only logs).

Key files:

- `src/world/board.ts`
- `src/world/world.ts`
- `src/world/position.ts`
- `src/world/character.ts`
- `src/input/player-1-controls.ts`
- `src/main.ts`

## World Model

There are two related coordinate spaces:

1. Board space (discrete tiles)

- integer coordinates `(x, y)`
- represented by `THREE.Vector2` but treated as grid-aligned
- used by walls and the board itself

2. World space (continuous movement)

- floating-point coordinates `(x, y)`
- used by the character while moving between tiles

Conversion from world space to board space happens here:

```ts
// src/world/position.ts
worldToBoardPosition(worldPosition)
  => (worldPosition + (0.5, 0.5)).floor()
```

Interpretation: the character is considered to be "in" the tile containing its center.

## Board Generation Logic

The board is a `Board` object with `width`, `height`, and `children` (walls + floor) created by:

```ts
// src/world/board.ts
createBoard(width, height)
```

### Tile Types

Walls exist in two types (`src/world/wall.ts`):

- `WallIndestructible` (blue)
- `WallDestructable` (red)

The floor is a single `PlaneGeometry` sized to cover the board (`src/world/floor.ts`).

### Outer Walls (Border)

For every tile on the border (`x == 0 || x == width-1 || y == 0 || y == height-1`), an indestructible wall is placed.

### Inner Walls (Pattern + Fill)

For each interior tile (`1..width-2`, `1..height-2`):

1. If `x` and `y` are both even (`x % 2 == 0 && y % 2 == 0`)
   - place `WallIndestructible`

2. Else, if the tile is NOT in the spawn-safe area `x <= 3 && y <= 3`
   - place `WallDestructable`

This yields a classic Bomberman feel:

- solid border
- indestructible pillars at even/even coordinates
- destructible blocks filling most remaining spaces
- a cleared area near the player spawn

### Spawn

Player 1 spawns at board/world position `(1, 1)`:

```ts
// src/world/world.ts
const player1 = createCharacter(new THREE.Vector2(1, 1))
```

Because the inner-wall generator leaves the `x <= 3 && y <= 3` area open (except the even/even pillars), the spawn region is mostly navigable.

## Player Controls (Input -> Intent)

Keyboard handling is bound in `src/input/player-1-controls.ts` and called from `src/main.ts`.

- Arrow keys:
  - set `character.actionRequest = "move"`
  - append a direction into `character.directionRequests`
- Keyup removes that direction from `directionRequests`
- if all directions are released, `actionRequest` is reset to `null`

Notes:

- Repeated keydown events are ignored (`event.repeat`) to avoid spamming requests.
- Space currently only does `console.log("Action/Place Bomb")`.

## Update Loop (Intent -> Movement)

The main loop calls:

```ts
// src/main.ts
updateWorld(world, deltaTime)
```

which currently updates only player 1:

```ts
// src/world/world.ts
updatePlayer(world.player1, world.board, deltaTime)
```

### Movement Step Size

The movement distance for a frame is:

```ts
distance = min(0.5, moveSpeed * (deltaTime * 0.001))
```

- `moveSpeed` is in units per second (`Character.moveSpeed`, default `2`)
- `deltaTime` is in milliseconds
- clamped to `0.5` so the character cannot advance more than half a tile per frame

### Direction Queue (Cornering)

When moving, `updatePlayer` tries:

1. the most recent direction request (`directionRequests[0]`)
2. then also tries `directionRequests[1]` (if present)

This is a simple "try primary direction, then secondary" approach that can help slide along walls when two keys are held.

## Collision: How The Board Interacts With The Character

Walls are discrete, tile-aligned board objects (`BoardObject.position` is integer tile coordinates). The character is continuous (`EntityObject.position` is floating point).

Collision is handled in `movePlayer` (`src/world/world.ts`) like this:

1. Convert the character's current world position into a board tile:

```ts
positionOnBoard = worldToBoardPosition(player.position)
```

2. Compute the target board tile in the requested direction:

```ts
target = moveIntoDirection(positionOnBoard, direction)
```

3. Check if there is a wall at the target tile:

```ts
wallAtTarget = getWalls(board).find((w) => w.position.equals(target))
```

4. If there is no wall, move freely by `requestedPositionDelta` in the given axis.

5. If there is a wall, still move, but only up to the wall's edge.

Edge distances are computed using bounding boxes based on `position` and `size` (`src/world/game-object.ts`):

- `getEdgeDistanceX(obj1, obj2)`
- `getEdgeDistanceY(obj1, obj2)`

Those functions:

- construct a `THREE.Box2` for each object from `(position .. position + size)`
- compare centers to determine which edge to measure to
- return a signed distance that represents how far `obj1` can still move before intersecting `obj2`

Then the movement delta is clamped, e.g. for moving right:

```ts
deltaX = min(requestedDelta, edgeDistanceX(player, wall))
```

So the board interaction is:

- discrete tile lookup to decide if the next tile is blocked
- continuous edge clamping to stop the character exactly at the wall boundary

## Board Layout Representation

Legend:

- `#` = `WallIndestructible` (border + pillars)
- `*` = `WallDestructable`
- `.` = empty floor
- `P` = player spawn at `(1, 1)`

For an 11x11 board, the structure is:

- full `#` border at `x=0`, `x=10`, `y=0`, `y=10`
- interior `#` at even/even tiles like `(2,2)`, `(2,4)`, ...
- interior `*` almost everywhere else, except the cleared spawn-safe area where `x<=3 && y<=3`

The spawn-safe region is not fully empty because the even/even pillar rule still applies (e.g. `(2,2)` becomes `#`).

## Current Gaps vs Classic Bomberman

- Bombs: not implemented (Space is a placeholder)
- Explosions / destructible wall removal: not implemented
- Powerups, enemies, win/loss rules: not implemented
- Discrete/tick-based game-state: there is WIP code in `src/game-state/players.ts`, but the actual running game uses the `src/world/*` continuous movement model.
