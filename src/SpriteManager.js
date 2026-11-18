import * as THREE from 'three'
import { Sprite } from './Sprite.js'

export class SpriteManager {
  constructor(scene) {
    this.scene = scene
    this.sprites = new Map()
    this.spriteIdCounter = 0
    this.textureCache = new Map()
    this.textureLoader = new THREE.TextureLoader()
  }

  async loadTexture(url) {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.magFilter = THREE.NearestFilter
          texture.minFilter = THREE.NearestFilter
          this.textureCache.set(url, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  createDefaultTexture(color = 0x00ff00) {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
    ctx.fillRect(0, 0, 32, 32)

    // Add outline
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, 30, 30)

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    return texture
  }

  createSprite(position, options = {}) {
    const {
      width = 32,
      height = 32,
      textureUrl = null,
      color = 0x00ff00
    } = options

    let texture
    if (textureUrl) {
      texture = this.textureCache.get(textureUrl) || this.createDefaultTexture(color)
    } else {
      texture = this.createDefaultTexture(color)
    }

    const sprite = new Sprite(position, texture, width, height)
    this.scene.add(sprite.mesh)

    const spriteId = this.spriteIdCounter++
    this.sprites.set(spriteId, sprite)

    return { id: spriteId, sprite }
  }

  updateSprite(spriteId, position, animationState = null) {
    const spriteData = this.sprites.get(spriteId)
    if (spriteData) {
      const { sprite } = spriteData
      sprite.setPosition(position.x, position.y, position.z)
      if (animationState) {
        sprite.setAnimationState(animationState)
      }
    }
  }

  getSpritePosition(spriteId) {
    const spriteData = this.sprites.get(spriteId)
    if (spriteData) {
      return spriteData.sprite.position.clone()
    }
    return null
  }

  updateBillboards(cameraPosition) {
    this.sprites.forEach(({ sprite }) => {
      sprite.updateBillboard(cameraPosition)
    })
  }

  update(deltaTime) {
    this.sprites.forEach(({ sprite }) => {
      sprite.update(deltaTime)
    })
  }

  removeSprite(spriteId) {
    const spriteData = this.sprites.get(spriteId)
    if (spriteData) {
      const { sprite } = spriteData
      this.scene.remove(sprite.mesh)
      sprite.dispose()
      this.sprites.delete(spriteId)
      return true
    }
    return false
  }

  getSpriteCount() {
    return this.sprites.size
  }

  dispose() {
    this.sprites.forEach(({ sprite }) => {
      this.scene.remove(sprite.mesh)
      sprite.dispose()
    })
    this.sprites.clear()
    this.textureCache.forEach(texture => {
      texture.dispose()
    })
    this.textureCache.clear()
  }
}
