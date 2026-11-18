import { GameScene } from './Scene.js'
import { Player } from './Player.js'
import { SpriteGenerator } from './SpriteGenerator.js'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.player = new Player(0, 0)
    this.scene = new GameScene(this.canvas)
    this.lastFrameTime = Date.now()
    this.frameCount = 0
    this.fps = 0
    this.running = true
    this.spriteManager = this.scene.getSpriteManager()
    this.npcSprites = new Map()

    // Update scene with player position
    this.scene.setPlayerPosition(this.player.position.x, this.player.position.y, this.player.position.z)

    this.setupControls()
    this.createTestNPCs()
    this.startGameLoop()
  }

  createTestNPCs() {
    // Create some test NPCs scattered around the map
    const npcPositions = [
      { x: 50, z: 50, type: 'npc' },
      { x: -50, z: -50, type: 'merchant' },
      { x: 100, z: -50, type: 'quest' },
      { x: -100, z: 100, type: 'npc' },
      { x: 75, z: -100, type: 'npc' }
    ]

    npcPositions.forEach((pos, index) => {
      const texture = SpriteGenerator.createNPCSprite(pos.type)
      const { id } = this.spriteManager.createSprite(
        { x: pos.x, y: 0, z: pos.z },
        { width: 32, height: 32 }
      )

      // Update with generated texture
      const sprite = this.spriteManager.sprites.get(id).sprite
      sprite.material.map = texture
      sprite.material.needsUpdate = true

      this.npcSprites.set(id, { x: pos.x, z: pos.z, type: pos.type })
    })
  }

  setupControls() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e))
    document.addEventListener('keyup', (e) => this.handleKeyUp(e))
  }

  handleKeyDown(event) {
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) {
      this.player.setInput(event.key, true)
      event.preventDefault()
    }
  }

  handleKeyUp(event) {
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) {
      this.player.setInput(event.key, false)
      event.preventDefault()
    }
  }

  startGameLoop() {
    let lastTime = Date.now()
    const animate = () => {
      requestAnimationFrame(animate)

      const now = Date.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      // Update player movement
      this.player.update(deltaTime)

      // Update scene with new player position
      this.scene.setPlayerPosition(this.player.position.x, this.player.position.y, this.player.position.z)

      // Update sprites (billboarding and animation)
      this.scene.updateSprites(deltaTime)

      this.updateFPS()
      this.scene.render()
      this.updateUI()
    }
    animate()
  }

  updateFPS() {
    this.frameCount++
    const now = Date.now()
    const elapsed = now - this.lastFrameTime

    if (elapsed >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastFrameTime = now
    }
  }

  updateUI() {
    const fpsCounter = document.getElementById('fpsCounter')
    const playerPos = document.getElementById('playerPos')
    const playerVel = document.getElementById('playerVel')
    const spriteCount = document.getElementById('spriteCount')

    if (fpsCounter) {
      fpsCounter.textContent = this.fps
    }

    if (playerPos) {
      const pos = this.player.position
      playerPos.textContent = `${pos.x.toFixed(1)}, ${pos.z.toFixed(1)}`
    }

    if (playerVel) {
      const speed = this.player.velocity.length().toFixed(1)
      playerVel.textContent = speed
    }

    if (spriteCount) {
      spriteCount.textContent = this.spriteManager.getSpriteCount()
    }
  }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Game()
  })
} else {
  new Game()
}
