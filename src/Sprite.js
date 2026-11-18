import * as THREE from 'three'

export class Sprite {
  constructor(position, texture, width = 32, height = 32) {
    this.position = position.clone()
    this.width = width
    this.height = height
    this.texture = texture

    // Animation state
    this.animationState = 'idle' // idle, walking, running
    this.animationFrame = 0
    this.animationSpeed = 0.1
    this.isAnimating = false

    // Billboard object
    this.mesh = null
    this.material = null
    this.geometry = null

    this.createMesh()
  }

  createMesh() {
    // Create plane geometry for billboard
    this.geometry = new THREE.PlaneGeometry(this.width / 10, this.height / 10)

    // Create material with the texture
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.copy(this.position)
    this.mesh.position.y = this.height / 20
  }

  updateBillboard(cameraPosition) {
    // Make sprite face camera
    if (this.mesh) {
      const direction = new THREE.Vector3()
        .subVectors(cameraPosition, this.mesh.position)
        .normalize()

      // Create quaternion for rotation towards camera
      const quaternion = new THREE.Quaternion()
      const up = new THREE.Vector3(0, 1, 0)

      // Calculate rotation matrix to face camera
      const axis = new THREE.Vector3()
        .crossVectors(up, direction)
        .normalize()

      if (axis.length() > 0.001) {
        const angle = Math.acos(Math.max(-1, Math.min(1, up.dot(direction))))
        quaternion.setFromAxisAngle(axis, angle)
      }

      this.mesh.quaternion.copy(quaternion)
    }
  }

  setAnimationState(state) {
    if (state !== this.animationState) {
      this.animationState = state
      this.animationFrame = 0
      this.isAnimating = state !== 'idle'
    }
  }

  update(deltaTime) {
    if (this.isAnimating) {
      this.animationFrame += this.animationSpeed * deltaTime * 10

      // Reset animation frame if it loops
      if (this.animationFrame >= 4) {
        this.animationFrame = 0
      }
    }
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z)
    if (this.mesh) {
      this.mesh.position.copy(this.position)
      this.mesh.position.y += this.height / 20
    }
  }

  dispose() {
    if (this.geometry) {
      this.geometry.dispose()
    }
    if (this.material) {
      this.material.dispose()
    }
  }
}
