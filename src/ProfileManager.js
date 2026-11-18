import * as THREE from 'three'
import { UserProfile } from './UserProfile.js'
import { ProfileZone } from './ProfileZone.js'

/**
 * ProfileManager - Manages all user profiles and their zones
 */
export class ProfileManager {
  constructor(scene) {
    this.scene = scene
    this.profiles = new Map() // id -> UserProfile
    this.zones = new Map() // id -> ProfileZone
    this.zoneGroup = new THREE.Group()
    this.scene.add(this.zoneGroup)

    this.playerInZone = null
    this.playerInZoneId = null
  }

  /**
   * Create a new profile and zone
   */
  createProfile(id, username, position, options = {}) {
    // Create the profile
    const profile = new UserProfile(id, username, options)
    this.profiles.set(id, profile)

    // Create the zone
    const zone = new ProfileZone(profile, position, {
      radius: options.zoneRadius || 40,
      shape: options.zoneShape || 'circle',
      normalColor: options.zoneColor || 0x4488ff,
      ...options
    })

    this.zones.set(id, zone)
    this.zoneGroup.add(zone.mesh)

    return { profile, zone }
  }

  /**
   * Get profile by ID
   */
  getProfile(id) {
    return this.profiles.get(id)
  }

  /**
   * Get zone by ID
   */
  getZone(id) {
    return this.zones.get(id)
  }

  /**
   * Get all profiles
   */
  getAllProfiles() {
    return Array.from(this.profiles.values())
  }

  /**
   * Get all zones
   */
  getAllZones() {
    return Array.from(this.zones.values())
  }

  /**
   * Find profiles by interest
   */
  findProfilesByInterest(interest) {
    return Array.from(this.profiles.values()).filter(profile =>
      profile.interests.includes(interest)
    )
  }

  /**
   * Find profiles near position
   */
  findProfilesNear(position, maxDistance) {
    return Array.from(this.zones.values())
      .filter(zone => zone.getDistance(position) <= maxDistance)
      .sort((a, b) => a.getDistance(position) - b.getDistance(position))
      .map(zone => zone.profile)
  }

  /**
   * Check which zone player is in
   */
  updatePlayerPosition(playerPosition) {
    let currentZone = null
    let currentZoneId = null

    for (const [id, zone] of this.zones) {
      if (zone.isPointInZone(playerPosition)) {
        currentZone = zone
        currentZoneId = id
        break
      }
    }

    // Handle zone entry/exit
    if (this.playerInZoneId !== currentZoneId) {
      // Exit old zone
      if (this.playerInZone) {
        this.playerInZone.setHighlighted(false)
      }

      // Enter new zone
      if (currentZone) {
        currentZone.setHighlighted(true)
      }

      this.playerInZone = currentZone
      this.playerInZoneId = currentZoneId
    }

    return currentZone
  }

  /**
   * Get current zone player is in
   */
  getCurrentZone() {
    return this.playerInZone
  }

  /**
   * Get current zone profile player is in
   */
  getCurrentProfile() {
    if (this.playerInZone) {
      return this.playerInZone.profile
    }
    return null
  }

  /**
   * Save profiles to JSON
   */
  toJSON() {
    const profilesData = Array.from(this.profiles.values()).map(p => p.toJSON())
    const zonesData = Array.from(this.zones.entries()).map(([id, zone]) => ({
      profileId: id,
      position: {
        x: zone.position.x,
        y: zone.position.y,
        z: zone.position.z
      },
      radius: zone.radius,
      shape: zone.shape
    }))

    return {
      profiles: profilesData,
      zones: zonesData
    }
  }

  /**
   * Load profiles from JSON
   */
  static fromJSON(data, scene) {
    const manager = new ProfileManager(scene)

    // Load profiles
    for (const profileData of data.profiles) {
      manager.createProfile(
        profileData.id,
        profileData.username,
        new THREE.Vector3(0, 0, 0),
        profileData
      )
    }

    // Update zone positions
    for (const zoneData of data.zones) {
      const zone = manager.zones.get(zoneData.profileId)
      if (zone) {
        zone.position.set(zoneData.position.x, zoneData.position.y, zoneData.position.z)
        zone.mesh.position.copy(zone.position)
      }
    }

    return manager
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    for (const zone of this.zones.values()) {
      zone.dispose()
    }
    this.zones.clear()
    this.profiles.clear()
    this.scene.remove(this.zoneGroup)
  }
}
