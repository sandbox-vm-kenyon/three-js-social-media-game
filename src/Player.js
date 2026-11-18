import * as THREE from 'three'

export class Player {
  constructor(startX = 0, startZ = 0) {
    this.position = new THREE.Vector3(startX, 0, startZ)
    this.velocity = new THREE.Vector3(0, 0, 0)

    // Movement properties
    this.maxSpeed = 25
    this.acceleration = 100
    this.friction = 0.92
    this.boundaryMin = -500
    this.boundaryMax = 500

    // Input state tracking
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    }

    // Movement direction (for sprite orientation)
    this.facingDirection = new THREE.Vector3(0, 0, -1)
    this.isMoving = false
  }

  update(deltaTime) {
    // Calculate acceleration direction from input
    const moveDirection = new THREE.Vector3(0, 0, 0)
    let hasInput = false

    if (this.keys.forward) {
      moveDirection.z -= 1
      hasInput = true
    }
    if (this.keys.backward) {
      moveDirection.z += 1
      hasInput = true
    }
    if (this.keys.left) {
      moveDirection.x -= 1
      hasInput = true
    }
    if (this.keys.right) {
      moveDirection.x += 1
      hasInput = true
    }

    // Normalize diagonal movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize()
      this.facingDirection.copy(moveDirection)
      this.isMoving = true
    } else {
      this.isMoving = false
      // Apply friction when no input
      this.velocity.multiplyScalar(this.friction)
    }

    // Apply acceleration
    if (hasInput) {
      this.velocity.addScaledVector(moveDirection, this.acceleration * deltaTime)
    }

    // Limit speed
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.normalize().multiplyScalar(this.maxSpeed)
    }

    // Update position
    this.position.addScaledVector(this.velocity, deltaTime)

    // Apply world boundaries
    this.position.x = Math.max(this.boundaryMin, Math.min(this.boundaryMax, this.position.x))
    this.position.z = Math.max(this.boundaryMin, Math.min(this.boundaryMax, this.position.z))

    // Keep y at ground level
    this.position.y = 0
  }

  setInput(key, pressed) {
    switch(key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.keys.forward = pressed
        break
      case 's':
      case 'arrowdown':
        this.keys.backward = pressed
        break
      case 'a':
      case 'arrowleft':
        this.keys.left = pressed
        break
      case 'd':
      case 'arrowright':
        this.keys.right = pressed
        break
    }
  }

  getPosition() {
    return this.position.clone()
  }

  getMovementDirection() {
    return this.facingDirection.clone()
  }

  dispose() {
    // Cleanup if needed
  }
}
