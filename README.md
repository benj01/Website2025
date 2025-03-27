# Interactive Physics-Based Website with Rapier.js & Pixi.js

Transform a traditional text-based website into an interactive, physics-driven scene where every element behaves like a dynamic object.

## Project Overview

This project aims to create an interactive, physics-driven scene where every letter and graphical element behaves like a dynamic object. Letters are decomposed into physical shapes connected by joints, allowing real-time interactions such as breaking connections, applying forces, or responding to gravity.

## Technology Stack

- **Physics Engine**: Rapier.js (v0.15.0) for 2D physics simulation
- **Rendering Engine**: Pixi.js (v8.9.0) for GPU-accelerated WebGL-based 2D rendering
- **Build Tool**: Vite for modern web development
- **Language**: TypeScript for type-safe development
- **Data Storage**: JSON for storing website structure and letter compositions

## Current Features

### 1. Physics System
- Gravity simulation (980 units/s²)
- 120Hz physics update rate
- Continuous Collision Detection (CCD)
- Efficient collision event handling
- Customizable damping:
  - Linear: 0.1 for natural sliding
  - Angular: 0.8 to reduce wobbling

### 2. Letter Decomposition
- Letters broken into rigid body parts
- Revolute joints with ±22.5° limits
- Non-colliding connected parts
- Configurable physics properties:
  - Restitution: 0.2
  - Friction: 1.0
  - Combine rules for multi-body interactions

### 3. Ground System
- Static body for stability
- High friction (3.0)
- Zero restitution
- Centered positioning
- Collision event detection

### 4. Scene Management
- Centered layout (x: 300)
- Strategic positioning:
  - Ground: y: 500
  - Letters: Start at y: 100
- Efficient object tracking
- Collision pair monitoring

### 5. Performance Optimization
- Fixed timestep (1/120s)
- Maximum 4 substeps per frame
- Delta time capping at 100ms
- Efficient event queue management

## Implementation Status

### Completed ✓
- [x] Physics engine integration
- [x] Rendering system setup
- [x] Letter decomposition
- [x] Joint system
- [x] Collision detection
- [x] Basic scene layout
- [x] Performance optimization

### In Progress
- [ ] User interactions
- [ ] Multiple letter support
- [ ] Dynamic scene composition
- [ ] UI elements

### Planned
- [ ] Touch support
- [ ] Visual effects
- [ ] Sound effects
- [ ] Scene transitions

## Project Structure

- `src/physics.ts` - Physics world implementation
- `src/render.ts` - Rendering system
- `src/object-manager.ts` - Object lifecycle management
- `src/letter-loader.ts` - Letter composition handling
- `src/main.ts` - Application entry point
- `assets/letter-composition.json` - Letter definitions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Contributing
Contributions welcome! Please read our contributing guidelines before submitting pull requests.

## License
[MIT License](LICENSE)
