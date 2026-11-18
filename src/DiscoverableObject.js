/**
 * DiscoverableObject - Represents an in-game object that can be discovered and posted about
 */
export class DiscoverableObject {
  constructor(id, name, position, options = {}) {
    this.id = id
    this.name = name
    this.position = position.clone()
    this.description = options.description || ''
    this.category = options.category || 'landmark' // nature, landmark, building, food, art, sports
    this.tags = options.tags || []
    this.discoveredBy = new Set()
    this.postsAbout = []
    this.discoveryDate = null
    this.popularity = 0
    this.mesh = null
  }

  /**
   * Discover this object
   */
  discover(playerId) {
    if (!this.discoveredBy.has(playerId)) {
      this.discoveredBy.add(playerId)
      this.discoveryDate = Date.now()
      return true
    }
    return false
  }

  /**
   * Check if discovered by player
   */
  isDiscoveredBy(playerId) {
    return this.discoveredBy.has(playerId)
  }

  /**
   * Add a post about this object
   */
  addPost(post) {
    this.postsAbout.push(post)
    this.popularity += 1
  }

  /**
   * Get posts about this object
   */
  getPosts() {
    return this.postsAbout
  }

  /**
   * Serialize
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      description: this.description,
      category: this.category,
      tags: this.tags,
      popularity: this.popularity,
      discoveryDate: this.discoveryDate
    }
  }
}
