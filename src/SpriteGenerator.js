import * as THREE from 'three'

/**
 * Procedural sprite generator for placeholder characters
 * Uses canvas to create simple character sprites on demand
 */
export class SpriteGenerator {
  static createCharacterSprite(skinColor = 0xffdbac, hairColor = 0x000000) {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    // Clear with transparency
    ctx.clearRect(0, 0, 32, 32)

    // Draw head
    ctx.fillStyle = `#${skinColor.toString(16).padStart(6, '0')}`
    ctx.beginPath()
    ctx.arc(16, 10, 6, 0, Math.PI * 2)
    ctx.fill()

    // Draw hair
    ctx.fillStyle = `#${hairColor.toString(16).padStart(6, '0')}`
    ctx.fillRect(10, 4, 12, 7)

    // Draw body
    ctx.fillStyle = `#${skinColor.toString(16).padStart(6, '0')}`
    ctx.fillRect(12, 16, 8, 10)

    // Draw arms
    ctx.fillRect(8, 17, 4, 8)
    ctx.fillRect(20, 17, 4, 8)

    // Draw legs
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(12, 26, 3, 6)
    ctx.fillRect(17, 26, 3, 6)

    // Eyes
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(13, 9, 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(19, 9, 1, 0, Math.PI * 2)
    ctx.fill()

    // Simple outline
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.5
    ctx.strokeRect(0.5, 0.5, 31, 31)

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    return texture
  }

  static createNPCSprite(type = 'npc') {
    const colors = {
      npc: { skin: 0xffdbac, hair: 0x8B4513 },
      merchant: { skin: 0xffdbac, hair: 0x4B0082 },
      quest: { skin: 0xffdbac, hair: 0xFF6347 }
    }

    const colorScheme = colors[type] || colors.npc
    return this.createCharacterSprite(colorScheme.skin, colorScheme.hair)
  }

  static createObjectSprite(type = 'object') {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, 32, 32)

    switch(type) {
      case 'chest':
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(6, 10, 20, 15)
        ctx.fillStyle = '#D4A574'
        ctx.fillRect(8, 12, 16, 11)
        ctx.fillStyle = '#FFD700'
        ctx.fillRect(12, 14, 8, 2)
        ctx.fillRect(14, 17, 4, 2)
        break

      case 'sign':
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(14, 8, 4, 18)
        ctx.fillStyle = '#D2B48C'
        ctx.fillRect(4, 6, 24, 10)
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
        ctx.strokeRect(4, 6, 24, 10)
        break

      case 'plant':
        ctx.fillStyle = '#228B22'
        ctx.beginPath()
        ctx.arc(16, 24, 8, 0, Math.PI)
        ctx.fill()
        ctx.fillStyle = '#32CD32'
        ctx.beginPath()
        ctx.arc(10, 18, 6, 0, Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(22, 18, 6, 0, Math.PI)
        ctx.fill()
        break

      default:
        ctx.fillStyle = '#FF6347'
        ctx.fillRect(8, 8, 16, 16)
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
        ctx.strokeRect(8, 8, 16, 16)
    }

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.5
    ctx.strokeRect(0.5, 0.5, 31, 31)

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    return texture
  }

  static createPlaceholderSprite(id) {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, 32, 32)

    // Create a simple colored square with ID
    const hue = (id * 137.5) % 360 // Golden angle for distinct colors
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
    ctx.fillRect(0, 0, 32, 32)

    // Draw outline
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, 32, 32)

    // Draw ID number
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(id), 16, 16)

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    return texture
  }
}
