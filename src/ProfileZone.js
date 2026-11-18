import * as THREE from 'three'

/**
 * ProfileZone - Represents a profile's zone in the game world
 */
export class ProfileZone {
  constructor(profile, position, options = {}) {
    this.profile = profile
    this.position = position.clone() // Vector3
    this.radius = options.radius || 40
    this.shape = options.shape || 'circle' // 'circle' or 'square'

    // Visual representation
    this.mesh = null
    this.boundaryMesh = null
    this.isPlayerInZone = false
    this.highlightColor = options.highlightColor || 0x44ff44
    this.normalColor = options.normalColor || 0x4488ff

    this.createMesh()
  }

  /**
   * Create visual representation of the zone
   */
  createMesh() {
    const group = new THREE.Group()
    group.position.copy(this.position)

    // Create zone floor/base
    let geometry
    if (this.shape === 'circle') {
      geometry = new THREE.CircleGeometry(this.radius, 32)
    } else {
      geometry = new THREE.PlaneGeometry(this.radius * 2, this.radius * 2)
    }

    const material = new THREE.MeshBasicMaterial({
      color: this.normalColor,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    })

    const floor = new THREE.Mesh(geometry, material)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0.05
    group.add(floor)

    // Create boundary line
    if (this.shape === 'circle') {
      const boundaryGeometry = new THREE.BufferGeometry()
      const points = []
      const segments = 64
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        const x = Math.cos(angle) * this.radius
        const z = Math.sin(angle) * this.radius
        points.push(new THREE.Vector3(x, 0.1, z))
      }
      boundaryGeometry.setFromPoints(points)

      const boundaryMaterial = new THREE.LineBasicMaterial({
        color: this.normalColor,
        linewidth: 2
      })

      this.boundaryMesh = new THREE.Line(boundaryGeometry, boundaryMaterial)
      group.add(this.boundaryMesh)
    } else {
      const boundaryGeometry = new THREE.BufferGeometry()
      const halfSize = this.radius
      const points = [
        new THREE.Vector3(-halfSize, 0.1, -halfSize),
        new THREE.Vector3(halfSize, 0.1, -halfSize),
        new THREE.Vector3(halfSize, 0.1, halfSize),
        new THREE.Vector3(-halfSize, 0.1, halfSize),
        new THREE.Vector3(-halfSize, 0.1, -halfSize)
      ]
      boundaryGeometry.setFromPoints(points)

      const boundaryMaterial = new THREE.LineBasicMaterial({
        color: this.normalColor,
        linewidth: 2
      })

      this.boundaryMesh = new THREE.Line(boundaryGeometry, boundaryMaterial)
      group.add(this.boundaryMesh)
    }

    // Add username label above zone
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(68, 136, 255, 0.8)'
    ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.profile.username, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const labelGeometry = new THREE.PlaneGeometry(80, 20)
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    })
    const label = new THREE.Mesh(labelGeometry, labelMaterial)
    label.position.y = this.radius + 10
    group.add(label)

    this.mesh = group
  }

  /**
   * Check if a position is inside the zone
   */
  isPointInZone(position) {
    const dx = position.x - this.position.x
    const dz = position.z - this.position.z

    if (this.shape === 'circle') {
      return Math.sqrt(dx * dx + dz * dz) <= this.radius
    } else {
      return Math.abs(dx) <= this.radius && Math.abs(dz) <= this.radius
    }
  }

  /**
   * Get distance from position to zone center
   */
  getDistance(position) {
    return position.distanceTo(this.position)
  }

  /**
   * Highlight the zone
   */
  setHighlighted(highlighted) {
    if (this.mesh) {
      this.mesh.children[0].material.color.setHex(
        highlighted ? this.highlightColor : this.normalColor
      )
      if (this.boundaryMesh) {
        this.boundaryMesh.material.color.setHex(
          highlighted ? this.highlightColor : this.normalColor
        )
      }
    }
  }

  /**
   * Dispose of resources
   */
  dispose() {
    if (this.mesh) {
      this.mesh.traverse((node) => {
        if (node.geometry) node.geometry.dispose()
        if (node.material) node.material.dispose()
      })
    }
  }
}
