import { GameScene } from './Scene.js'
import { Player } from './Player.js'
import { SpriteGenerator } from './SpriteGenerator.js'
import * as THREE from 'three'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.scene = new GameScene(this.canvas)
    this.collisionDetector = this.scene.getCollisionDetector()
    this.player = new Player(0, 0, this.collisionDetector)
    this.lastFrameTime = Date.now()
    this.frameCount = 0
    this.fps = 0
    this.running = true
    this.spriteManager = this.scene.getSpriteManager()
    this.profileManager = this.scene.getProfileManager()
    this.npcSprites = new Map()

    // Update scene with player position
    this.scene.setPlayerPosition(this.player.position.x, this.player.position.y, this.player.position.z)

    this.setupControls()
    this.createTestProfiles()
    this.createTestNPCs()
    this.startGameLoop()
  }

  createTestProfiles() {
    // Create test user profiles with zones
    const testProfiles = [
      {
        id: 'alice',
        username: 'Alice',
        position: { x: 50, y: 0, z: 50 },
        interests: ['nature', 'photography'],
        bio: 'Nature lover and photographer',
        skinColor: 0xffdbac,
        hairColor: 0x8B4513
      },
      {
        id: 'bob',
        username: 'Bob',
        position: { x: -50, y: 0, z: -50 },
        interests: ['gaming', 'tech'],
        bio: 'Tech enthusiast and gamer',
        skinColor: 0xffdbac,
        hairColor: 0x000000
      },
      {
        id: 'charlie',
        username: 'Charlie',
        position: { x: 100, y: 0, z: -50 },
        interests: ['art', 'music'],
        bio: 'Artist exploring interactive media',
        skinColor: 0xffdbac,
        hairColor: 0xFF6347
      },
      {
        id: 'diana',
        username: 'Diana',
        position: { x: -100, y: 0, z: 100 },
        interests: ['nature', 'gardening'],
        bio: 'Master gardener and botanist',
        skinColor: 0xffdbac,
        hairColor: 0x4B0082
      },
      {
        id: 'eve',
        username: 'Eve',
        position: { x: 75, y: 0, z: -100 },
        interests: ['science', 'nature'],
        bio: 'Science communicator',
        skinColor: 0xffdbac,
        hairColor: 0xDC143C
      }
    ]

    testProfiles.forEach(profileData => {
      this.profileManager.createProfile(
        profileData.id,
        profileData.username,
        new THREE.Vector3(profileData.position.x, profileData.position.y, profileData.position.z),
        {
          interests: profileData.interests,
          bio: profileData.bio,
          skinColor: profileData.skinColor,
          hairColor: profileData.hairColor,
          zoneRadius: 40,
          zoneShape: 'circle'
        }
      )
    })
  }

  createTestNPCs() {
    // Create NPCs at profile locations
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

      // Update profile zones
      this.scene.updateProfileZones(this.player.position)

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
    const profileInfo = document.getElementById('profileInfo')

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

    if (profileInfo) {
      const currentProfile = this.profileManager.getCurrentProfile()
      if (currentProfile) {
        profileInfo.innerHTML = `
          <strong>In Zone:</strong> ${currentProfile.username}<br/>
          <small>${currentProfile.bio}</small>
        `
      } else {
        profileInfo.innerHTML = '<small>Explore the world to find profiles. Collisions enabled.</small>'
      }
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
