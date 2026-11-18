import * as THREE from 'three'

export class GameScene {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = null
    this.camera = null
    this.renderer = null
    this.playerPosition = new THREE.Vector3(0, 0, 0)
    this.cameraOffset = new THREE.Vector3(50, 60, 50)
    this.targetCameraPosition = new THREE.Vector3(50, 60, 50)
    this.cameraSmoothness = 0.1

    this.init()
  }

  init() {
    this.setupRenderer()
    this.setupScene()
    this.setupCamera()
    this.setupLighting()
    this.setupEnvironment()
    this.handleWindowResize()

    window.addEventListener('resize', () => this.onWindowResize())
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap
    this.renderer.shadowMap.resolution = new THREE.Vector2(2048, 2048)
    this.renderer.setClearColor(0x87ceeb)
  }

  setupScene() {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x87ceeb, 300, 600)
  }

  setupCamera() {
    const aspect = window.innerWidth / window.innerHeight
    const fov = 50
    const near = 0.1
    const far = 1000

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.updateCameraPosition()
  }

  setupLighting() {
    // Directional light (sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(100, 150, 100)
    directionalLight.target.position.set(0, 0, 0)
    directionalLight.castShadow = true

    // Shadow map configuration for performance
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.left = -300
    directionalLight.shadow.camera.right = 300
    directionalLight.shadow.camera.top = 300
    directionalLight.shadow.camera.bottom = -300
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.bias = -0.0005

    this.scene.add(directionalLight)
    this.scene.add(directionalLight.target)

    // Ambient light for fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Store for potential dynamic updates
    this.directionalLight = directionalLight
    this.ambientLight = ambientLight
  }

  setupEnvironment() {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      metalness: 0.0,
      roughness: 0.8
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Add some subtle grid lines to visualize the 10x10 zone grid
    const gridHelper = new THREE.GridHelper(500, 10, 0x444444, 0x888888)
    gridHelper.position.y = 0.01
    this.scene.add(gridHelper)

    // Create a simple skybox using a background gradient
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 64)
    gradient.addColorStop(0, '#87CEEB')
    gradient.addColorStop(1, '#E0F6FF')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)
    this.scene.background = new THREE.Color(0x87ceeb)

    // Add some basic environmental elements - trees
    this.addEnvironmentalElements()
  }

  addEnvironmentalElements() {
    // Add a few trees scattered around
    const treePositions = [
      { x: 100, z: 100 },
      { x: -100, z: 100 },
      { x: 100, z: -100 },
      { x: -100, z: -100 },
      { x: 150, z: 50 },
      { x: -150, z: -50 }
    ]

    treePositions.forEach(pos => {
      this.createTree(pos.x, pos.z)
    })
  }

  createTree(x, z) {
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(5, 6, 20, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.9
    })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.set(x, 10, z)
    trunk.castShadow = true
    trunk.receiveShadow = true
    this.scene.add(trunk)

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(20, 8, 8)
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.8
    })
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial)
    foliage.position.set(x, 35, z)
    foliage.castShadow = true
    foliage.receiveShadow = true
    this.scene.add(foliage)
  }

  updateCameraPosition() {
    const targetX = this.playerPosition.x + this.cameraOffset.x
    const targetY = this.playerPosition.y + this.cameraOffset.y
    const targetZ = this.playerPosition.z + this.cameraOffset.z

    // Store target for smooth lerping in render loop
    this.targetCameraPosition.set(targetX, targetY, targetZ)

    // Look at player with slight height offset for better viewing angle
    this.camera.lookAt(this.playerPosition.x, this.playerPosition.y + 5, this.playerPosition.z)
  }

  smoothCameraToTarget() {
    // Smooth camera movement using lerp
    this.camera.position.lerp(this.targetCameraPosition, this.cameraSmoothness)
  }

  setPlayerPosition(x, y, z) {
    this.playerPosition.set(x, y, z)
    this.updateCameraPosition()
  }

  onWindowResize() {
    this.handleWindowResize()
  }

  handleWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  render() {
    this.smoothCameraToTarget()
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.renderer.dispose()
  }
}
