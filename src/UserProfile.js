/**
 * UserProfile - Represents a player profile in the game
 */
export class UserProfile {
  constructor(id, username, options = {}) {
    // Core profile data
    this.id = id
    this.username = username
    this.avatar = options.avatar || null
    this.bio = options.bio || ''
    this.interests = options.interests || []
    this.posts = options.posts || []
    this.connections = {
      confirmed: options.confirmed || [],
      pending: options.pending || [],
      blocked: options.blocked || []
    }

    // Metadata
    this.createdAt = options.createdAt || Date.now()
    this.lastUpdated = options.lastUpdated || Date.now()
    this.reputation = options.reputation || 0
    this.onlineStatus = options.onlineStatus || 'offline'

    // Profile appearance
    this.skinColor = options.skinColor || 0xffdbac
    this.hairColor = options.hairColor || 0x000000
  }

  /**
   * Add a post to the profile
   */
  addPost(post) {
    this.posts.push(post)
    this.lastUpdated = Date.now()
  }

  /**
   * Add a connection request
   */
  addConnectionRequest(userId) {
    if (!this.connections.pending.includes(userId)) {
      this.connections.pending.push(userId)
      this.lastUpdated = Date.now()
    }
  }

  /**
   * Accept a connection request
   */
  acceptConnection(userId) {
    const index = this.connections.pending.indexOf(userId)
    if (index > -1) {
      this.connections.pending.splice(index, 1)
      if (!this.connections.confirmed.includes(userId)) {
        this.connections.confirmed.push(userId)
        this.lastUpdated = Date.now()
      }
    }
  }

  /**
   * Check if connected with another user
   */
  isConnectedWith(userId) {
    return this.connections.confirmed.includes(userId)
  }

  /**
   * Check if has pending request from user
   */
  hasPendingRequest(userId) {
    return this.connections.pending.includes(userId)
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      avatar: this.avatar,
      bio: this.bio,
      interests: this.interests,
      posts: this.posts,
      connections: this.connections,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
      reputation: this.reputation,
      onlineStatus: this.onlineStatus,
      skinColor: this.skinColor,
      hairColor: this.hairColor
    }
  }

  /**
   * Create from JSON
   */
  static fromJSON(data) {
    return new UserProfile(data.id, data.username, data)
  }
}
