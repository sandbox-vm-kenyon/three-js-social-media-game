import * as THREE from 'three'
import { DiscoverableObject } from './DiscoverableObject.js'
import { Post } from './Post.js'

/**
 * DiscoveryManager - Manages discoverable objects, posts, and the discovery mechanic
 */
export class DiscoveryManager {
  constructor(scene) {
    this.scene = scene
    this.discoverableObjects = new Map() // id -> DiscoverableObject
    this.posts = new Map() // id -> Post
    this.playerDiscoveries = new Map() // playerId -> Set of objectIds
    this.discoveryRadius = 30
    this.objectGroup = new THREE.Group()
    this.scene.add(this.objectGroup)
  }

  /**
   * Create a discoverable object
   */
  createObject(id, name, position, options = {}) {
    const obj = new DiscoverableObject(id, name, position, options)
    this.discoverableObjects.set(id, obj)

    // Create visual marker
    const markerGeometry = new THREE.SphereGeometry(2, 8, 8)
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: this.getCategoryColor(obj.category),
      transparent: true,
      opacity: 0.6
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(position)
    marker.position.y = 2
    obj.mesh = marker
    this.objectGroup.add(marker)

    return obj
  }

  /**
   * Get color for category
   */
  getCategoryColor(category) {
    const colors = {
      nature: 0x228B22,
      landmark: 0xFFD700,
      building: 0x8B7355,
      food: 0xFF6347,
      art: 0xFF1493,
      sports: 0x4169E1
    }
    return colors[category] || 0x888888
  }

  /**
   * Check for discoveries near position
   */
  checkDiscoveries(playerId, position) {
    const discovered = []
    for (const obj of this.discoverableObjects.values()) {
      const distance = position.distanceTo(obj.position)
      if (distance <= this.discoveryRadius && obj.discover(playerId)) {
        discovered.push(obj)
        if (!this.playerDiscoveries.has(playerId)) {
          this.playerDiscoveries.set(playerId, new Set())
        }
        this.playerDiscoveries.get(playerId).add(obj.id)

        // Visual feedback
        this.highlightObject(obj)
      }
    }
    return discovered
  }

  /**
   * Highlight recently discovered object
   */
  highlightObject(obj) {
    if (obj.mesh) {
      obj.mesh.scale.set(1.5, 1.5, 1.5)
      setTimeout(() => {
        if (obj.mesh) obj.mesh.scale.set(1, 1, 1)
      }, 2000)
    }
  }

  /**
   * Create a post about an object
   */
  createPost(authorId, content, objectId, options = {}) {
    if (!this.discoverableObjects.has(objectId)) {
      return null
    }

    const post = new Post(authorId, content, objectId, options)
    this.posts.set(post.id, post)
    this.discoverableObjects.get(objectId).addPost(post)
    return post
  }

  /**
   * Get posts for object
   */
  getObjectPosts(objectId) {
    if (!this.discoverableObjects.has(objectId)) {
      return []
    }
    return this.discoverableObjects.get(objectId).getPosts()
  }

  /**
   * Get posts by category
   */
  getPostsByCategory(category) {
    const result = []
    for (const obj of this.discoverableObjects.values()) {
      if (obj.category === category) {
        result.push(...obj.getPosts())
      }
    }
    return result
  }

  /**
   * Get player's discoveries
   */
  getPlayerDiscoveries(playerId) {
    if (!this.playerDiscoveries.has(playerId)) {
      return []
    }
    const ids = this.playerDiscoveries.get(playerId)
    return Array.from(ids).map(id => this.discoverableObjects.get(id))
  }

  /**
   * Get discovery stats
   */
  getDiscoveryStats(playerId) {
    const discoveries = this.getPlayerDiscoveries(playerId)
    const categories = {}
    for (const obj of discoveries) {
      categories[obj.category] = (categories[obj.category] || 0) + 1
    }
    return {
      totalDiscovered: discoveries.length,
      byCategory: categories
    }
  }

  /**
   * Get nearby objects
   */
  getNearbyObjects(position, radius = 100) {
    const nearby = []
    for (const obj of this.discoverableObjects.values()) {
      if (position.distanceTo(obj.position) <= radius) {
        nearby.push(obj)
      }
    }
    return nearby.sort((a, b) =>
      position.distanceTo(a.position) - position.distanceTo(b.position)
    )
  }

  /**
   * Dispose
   */
  dispose() {
    this.discoverableObjects.clear()
    this.posts.clear()
    this.playerDiscoveries.clear()
    this.objectGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) child.material.dispose()
    })
  }
}
