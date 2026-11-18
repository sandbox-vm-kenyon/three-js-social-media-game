# Three.js Social Media Game

A 3D social media game built with Three.js where you walk around to visit profiles, discover objects and places, and connect with other players.

## Project Overview

This project is built in stages, with each stage leaving something playable:
- **Stage 1**: Foundational 3D environment with camera, lighting, and player movement
- **Stage 2+**: Player character sprites, NPC interactions, posting system, and social connections

## Current Stage: Foundation

This initial implementation provides:
- **Scene Setup**: WebGL renderer with proper canvas sizing and pixel ratio handling
- **Camera System**: Isometric third-person camera that follows the player
- **Lighting**: Directional light (sunlight simulation), ambient light, and dynamic shadow mapping
- **Environment**: Ground plane with 10×10 zone grid visualization, trees, and atmospheric fog
- **Performance**: Frustum culling infrastructure, optimized shadow mapping, responsive resizing
- **Controls**: WASD or arrow keys to move the camera view around the game world

## Setup

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The game will open at `http://localhost:3000`

### Build

Create a production build:

```bash
npm run build
```

Output is in the `dist/` directory.

## Controls

- **W / Up Arrow**: Move forward
- **S / Down Arrow**: Move backward
- **A / Left Arrow**: Move left
- **D / Right Arrow**: Move right

## Technical Architecture

### Scene.js
Manages the core Three.js scene, camera, lighting, and environment rendering. Handles:
- WebGL renderer initialization with shadow mapping
- Isometric camera positioning and updates
- Directional and ambient lighting with shadow configuration
- Ground plane, grid visualization, and environmental elements
- Window resize handling and aspect ratio management

### main.js
Game loop and input handling:
- RequestAnimationFrame-based animation loop
- Keyboard input processing
- FPS monitoring and UI updates
- Player position tracking

## Performance Targets

- Target: 60+ FPS on target hardware
- Shadow map resolution: 2048×2048 for quality
- Frustum culling enabled for optimization
- Responsive to viewport changes

## Asset Credits

Environmental elements are procedurally generated for now. Future versions will incorporate freely licensed 2D sprites from sources like:
- OpenGameArt.org
- Itch.io (freely licensed assets)
- Other Creative Commons sources

All attribution will be documented as external assets are added.

## Future Tasks

1. Implement 2D sprite billboarding in 3D environment
2. Create player character with walking animations
3. Implement collision detection
4. Add NPC profile areas
5. Create posting/discovery mechanic
6. Implement social connection system
7. Deploy to GitHub Pages

## Repository

This is part of the Three.js Social Media Game project.

## License

To be determined - MIT or similar open source license pending.
