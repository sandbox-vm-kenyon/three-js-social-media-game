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
    this.discoveryManager = this.scene.getDiscoveryManager()
    this.npcSprites = new Map()
    this.discoveryNotifications = []

    // Update scene with player position
    this.scene.setPlayerPosition(this.player.position.x, this.player.position.y, this.player.position.z)

    this.setupControls()
    this.createTestProfiles()
    this.createTestNPCs()
    this.createDiscoverableObjects()
    this.createSamplePosts()
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

  createDiscoverableObjects() {
    const objects = [
      { id: 'tree1', name: 'Ancient Oak', pos: { x: 100, y: 0, z: 100 }, category: 'nature', desc: 'A majestic old oak tree' },
      { id: 'tree2', name: 'Pine Grove', pos: { x: -100, y: 0, z: 100 }, category: 'nature', desc: 'Dense pine forest' },
      { id: 'tree3', name: 'Birch Cluster', pos: { x: 100, y: 0, z: -100 }, category: 'nature', desc: 'White birch trees' },
      { id: 'tree4', name: 'Willow Tree', pos: { x: -100, y: 0, z: -100 }, category: 'nature', desc: 'Drooping willow by water' },
      { id: 'landmark1', name: 'Stone Circle', pos: { x: 150, y: 0, z: 50 }, category: 'landmark', desc: 'Ancient stone arrangement' },
      { id: 'landmark2', name: 'Bell Tower', pos: { x: -150, y: 0, z: -50 }, category: 'landmark', desc: 'Historic bell tower ruins' },
      { id: 'landmark3', name: 'Fountain', pos: { x: 75, y: 0, z: -100 }, category: 'landmark', desc: 'Central water fountain' },
      { id: 'art1', name: 'Mural Wall', pos: { x: 50, y: 0, z: 75 }, category: 'art', desc: 'Street art mural' },
      { id: 'art2', name: 'Sculpture Garden', pos: { x: -75, y: 0, z: 50 }, category: 'art', desc: 'Open air sculpture display' },
      { id: 'food1', name: 'Fruit Stand', pos: { x: 120, y: 0, z: -75 }, category: 'food', desc: 'Local market stall' }
    ]

    objects.forEach(obj => {
      this.discoveryManager.createObject(obj.id, obj.name,
        new THREE.Vector3(obj.pos.x, obj.pos.y, obj.pos.z),
        {
          category: obj.category,
          description: obj.desc,
          tags: [obj.category]
        }
      )
    })
  }

  createSamplePosts() {
    // Create some sample posts for discovered objects
    const samplePosts = [
      { objectId: 'tree1', author: 'alice', text: 'Such a beautiful old tree! Great spot for photos.' },
      { objectId: 'tree1', author: 'eve', text: 'The ecosystem around this tree is amazing.' },
      { objectId: 'landmark1', author: 'bob', text: 'Cool historical site. Worth a visit!' },
      { objectId: 'art1', author: 'charlie', text: 'The colors on this mural are incredible.' },
      { objectId: 'art2', author: 'diana', text: 'Such inspiring sculptures in this space.' }
    ]

    samplePosts.forEach(post => {
      this.discoveryManager.createPost(post.author, post.text, post.objectId, {
        visibility: 'public',
        tags: ['discovery', 'shared']
      })
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

      // Check for nearby discoveries
      this.checkDiscoveries()

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
      const discoveries = this.discoveryManager.getPlayerDiscoveries('player1')
      if (currentProfile) {
        profileInfo.innerHTML = `
          <strong>In Zone:</strong> ${currentProfile.username}<br/>
          <small>${currentProfile.bio}</small>
        `
      } else {
        profileInfo.innerHTML = `<small>Discoveries: ${discoveries.length} | Collisions enabled</small>`
      }
    }

    // Display discovery notifications
    const notifArea = document.getElementById('discoveryNotif')
    if (notifArea && this.discoveryNotifications.length > 0) {
      notifArea.textContent = `Discovered: ${this.discoveryNotifications[this.discoveryNotifications.length - 1]}`
    }
  }

  checkDiscoveries() {
    const discovered = this.discoveryManager.checkDiscoveries('player1', this.player.position)
    if (discovered.length > 0) {
      discovered.forEach(obj => {
        this.discoveryNotifications.push(obj.name)
        setTimeout(() => {
          this.discoveryNotifications.shift()
        }, 3000)
      })
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
