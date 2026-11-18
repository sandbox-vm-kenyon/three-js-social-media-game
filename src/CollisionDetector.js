import * as THREE from 'three'

/**
 * CollisionDetector - Manages raycasting and collision detection
 */
export class CollisionDetector {
  constructor(scene) {
    this.scene = scene
    this.raycaster = new THREE.Raycaster()
    this.collisionMeshes = []
    this.collisionGeometry = null
    this.rayDistance = 15 // Distance to look ahead for collisions
    this.collisionMargin = 2 // Distance to maintain from obstacles
  }

  /**
   * Register a mesh for collision detection
   */
  registerCollisionMesh(mesh) {
    if (mesh && !this.collisionMeshes.includes(mesh)) {
      this.collisionMeshes.push(mesh)
    }
  }

  /**
   * Unregister a collision mesh
   */
  unregisterCollisionMesh(mesh) {
    const index = this.collisionMeshes.indexOf(mesh)
    if (index > -1) {
      this.collisionMeshes.splice(index, 1)
    }
  }

  /**
   * Check if movement is blocked in a direction
   * Returns intersection info or null if no collision
   */
  checkCollision(position, direction, distance = this.rayDistance) {
    if (this.collisionMeshes.length === 0) {
      return null
    }

    // Normalize direction
    const normalizedDir = direction.clone().normalize()

    // Set up raycaster
    this.raycaster.set(position, normalizedDir)

    // Check intersections
    const intersections = this.raycaster.intersectObjects(this.collisionMeshes, true)

    // Find closest intersection within distance
    for (const intersection of intersections) {
      if (intersection.distance < distance) {
        return {
          distance: intersection.distance,
          point: intersection.point,
          normal: intersection.normal,
          object: intersection.object
        }
      }
    }

    return null
  }

  /**
   * Check multiple rays in a cone for better obstacle detection
   */
  checkCollisionCone(position, direction, distance = this.rayDistance) {
    const rays = [
      { angle: 0, name: 'center' },
      { angle: Math.PI / 8, name: 'right45' },
      { angle: -Math.PI / 8, name: 'left45' },
      { angle: Math.PI / 12, name: 'right30' },
      { angle: -Math.PI / 12, name: 'left30' }
    ]

    let closestCollision = null
    let closestDistance = distance

    for (const ray of rays) {
      // Rotate direction by angle in horizontal plane
      const rotatedDir = new THREE.Vector3()
        .copy(direction)
        .normalize()

      // Simple horizontal rotation
      const cos = Math.cos(ray.angle)
      const sin = Math.sin(ray.angle)
      const newX = rotatedDir.x * cos - rotatedDir.z * sin
      const newZ = rotatedDir.x * sin + rotatedDir.z * cos
      rotatedDir.x = newX
      rotatedDir.z = newZ

      const collision = this.checkCollision(position, rotatedDir, closestDistance)
      if (collision && collision.distance < closestDistance) {
        closestCollision = collision
        closestDistance = collision.distance
      }
    }

    return closestCollision
  }

  /**
   * Get safe movement vector that avoids collisions
   */
  getSafeMovement(currentPos, desiredMovement) {
    // Check if direct movement is blocked
    const collision = this.checkCollisionCone(
      currentPos,
      desiredMovement,
      desiredMovement.length()
    )

    if (!collision) {
      // No collision, movement is safe
      return desiredMovement.clone()
    }

    // Collision detected, try to slide along obstacle
    if (collision.distance <= this.collisionMargin) {
      // Too close to obstacle, block movement
      return new THREE.Vector3(0, 0, 0)
    }

    // Allow partial movement toward obstacle
    const moveDistance = Math.max(0, collision.distance - this.collisionMargin)
    const normalizedMovement = desiredMovement.clone().normalize()
    const safeMovement = normalizedMovement.multiplyScalar(moveDistance)

    // Try sliding along wall (simple perpendicular movement)
    const slideDir = new THREE.Vector3()
      .crossVectors(normalizedMovement, new THREE.Vector3(0, 1, 0))
      .cross(collision.normal)
      .normalize()

    // Add small sliding movement
    safeMovement.addScaledVector(slideDir, moveDistance * 0.1)

    return safeMovement
  }

  /**
   * Check if point is within world bounds
   */
  checkWorldBounds(position, bounds = 500) {
    return (
      Math.abs(position.x) <= bounds &&
      Math.abs(position.z) <= bounds
    )
  }

  /**
   * Clamp position to world bounds
   */
  clampToBounds(position, bounds = 500) {
    position.x = Math.max(-bounds, Math.min(bounds, position.x))
    position.z = Math.max(-bounds, Math.min(bounds, position.z))
    return position
  }

  /**
   * Check zone collision (whether player is in a zone)
   */
  checkZoneCollision(position, zones) {
    for (const zone of zones) {
      if (zone.isPointInZone(position)) {
        return zone
      }
    }
    return null
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.collisionMeshes.length = 0
  }
}
