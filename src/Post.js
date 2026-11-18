/**
 * Post - Represents a player's post about a discovered object or place
 */
export class Post {
  constructor(authorId, content, discoverableObjectId, options = {}) {
    this.id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.authorId = authorId
    this.content = content
    this.objectId = discoverableObjectId
    this.timestamp = Date.now()
    this.visibility = options.visibility || 'public' // public, friends, private
    this.tags = options.tags || []
    this.likes = new Set()
    this.comments = []
    this.images = options.images || []
  }

  /**
   * Add a like
   */
  like(userId) {
    this.likes.add(userId)
  }

  /**
   * Remove a like
   */
  unlike(userId) {
    this.likes.delete(userId)
  }

  /**
   * Get like count
   */
  getLikeCount() {
    return this.likes.size
  }

  /**
   * Check if user liked
   */
  isLikedBy(userId) {
    return this.likes.has(userId)
  }

  /**
   * Add a comment
   */
  addComment(userId, text) {
    this.comments.push({
      userId,
      text,
      timestamp: Date.now()
    })
  }

  /**
   * Serialize
   */
  toJSON() {
    return {
      id: this.id,
      authorId: this.authorId,
      content: this.content,
      objectId: this.objectId,
      timestamp: this.timestamp,
      visibility: this.visibility,
      tags: this.tags,
      likeCount: this.likes.size,
      commentCount: this.comments.length,
      images: this.images
    }
  }

  /**
   * Check visibility for user
   */
  isVisibleTo(userId, authorProfile, viewerProfile) {
    if (this.visibility === 'public') return true
    if (this.authorId === userId) return true
    if (this.visibility === 'private') return false
    if (this.visibility === 'friends') {
      return authorProfile?.isConnectedWith(userId) || false
    }
    return false
  }
}
