import { GameScene } from './Scene.js'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.scene = new GameScene(this.canvas)
    this.lastFrameTime = Date.now()
    this.frameCount = 0
    this.fps = 0
    this.running = true

    this.setupControls()
    this.startGameLoop()
  }

  setupControls() {
    document.addEventListener('keydown', (e) => this.handleInput(e))
  }

  handleInput(event) {
    const moveDistance = 2
    const { x, y, z } = this.scene.playerPosition

    switch(event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.scene.setPlayerPosition(x, y, z - moveDistance)
        event.preventDefault()
        break
      case 's':
      case 'arrowdown':
        this.scene.setPlayerPosition(x, y, z + moveDistance)
        event.preventDefault()
        break
      case 'a':
      case 'arrowleft':
        this.scene.setPlayerPosition(x - moveDistance, y, z)
        event.preventDefault()
        break
      case 'd':
      case 'arrowright':
        this.scene.setPlayerPosition(x + moveDistance, y, z)
        event.preventDefault()
        break
    }
  }

  startGameLoop() {
    const animate = () => {
      requestAnimationFrame(animate)

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
    const cameraPos = document.getElementById('cameraPos')

    if (fpsCounter) {
      fpsCounter.textContent = this.fps
    }

    if (cameraPos) {
      const cam = this.scene.camera.position
      cameraPos.textContent = `${cam.x.toFixed(0)}, ${cam.y.toFixed(0)}, ${cam.z.toFixed(0)}`
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
