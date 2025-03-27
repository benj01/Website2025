# Interactive Physics-Based Website with Rapier.js & Pixi.js

Transform a traditional text-based website into an interactive, physics-driven scene where every element behaves like a dynamic object.

## Project Overview

This project aims to create an interactive, physics-driven scene where every letter and graphical element behaves like a dynamic object. Letters will be decomposed into physical shapes connected by joints, allowing real-time interactions such as breaking connections, applying forces, or responding to gravity.

## Technology Stack

- **Physics Engine**: Rapier.js (v0.15.0) for 2D physics simulation
- **Rendering Engine**: Pixi.js (v8.9.0) for GPU-accelerated WebGL-based 2D rendering
- **Build Tool**: Vite for modern web development
- **Language**: TypeScript for type-safe development
- **Data Storage**: JSON for storing website structure and letter compositions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

- `src/main.ts` - Main entry point that initializes physics and rendering
- `src/physics.ts` - Physics world setup using Rapier.js
- `src/render.ts` - Rendering setup using Pixi.js
- `src/index.html` - HTML entry point
- `assets/` - JSON files for website structure and letter compositions

## Features & Functionality

### 1. Text Decomposition into Physics Objects
- Each letter is decomposed into a set of rigid bodies
- Connections between bodies using joints
- Example: Letter "L" consists of two blocks connected by a joint

### 2. Physics-Driven Interactions
- Dynamic reactions to user interactions
- Mouse click/touch to remove constraints or apply force
- Drag & Drop functionality
- Gravity toggle for floating effects
- Natural collisions between objects

### 3. Structured Data Storage
Two main JSON structures:

#### Website Structure JSON
```json
{
  "elements": [
    {
      "type": "text",
      "content": "Hello",
      "position": { "x": 100, "y": 50 }
    },
    {
      "type": "image",
      "src": "logo.png",
      "position": { "x": 200, "y": 100 }
    }
  ]
}
```

#### Letter Composition JSON
```json
{
  "L": {
    "parts": [
      { "shape": "rectangle", "size": [10, 50], "position": [0, 0] },
      { "shape": "rectangle", "size": [30, 10], "position": [5, 40] }
    ],
    "joints": [
      { "type": "fixed", "between": [0, 1], "position": [5, 40] }
    ]
  }
}
```

### 4. Technical Features
- 2D physics simulation with gravity
- Real-time WebGL rendering
- Responsive canvas that adapts to window size
- Modern async/await WebAssembly loading
- TypeScript support for type safety

## Implementation Phases

### Phase 1: Initial Setup ✓
- [x] Set up Pixi.js rendering
- [x] Integrate Rapier.js physics
- [ ] Load and parse JSON data

### Phase 2: Object Construction
- [ ] Convert text characters into physics objects
- [ ] Implement joint constraints for letters

### Phase 3: User Interaction
- [ ] Add mouse/touch interactions
- [ ] Implement dynamic constraints
- [ ] Add realistic physics effects

### Phase 4: Optimization & Styling
- [ ] Improve Pixi.js performance
- [ ] Add visual effects (shadows, textures, animations)

### Phase 5: Testing & Deployment
- [ ] Cross-device testing
- [ ] Performance optimization
- [ ] Production deployment

## Future Expansions
- 3D Support with Three.js integration
- Sound effects for interactions
- Mobile-optimized touch interactions
- Additional physics-based effects

## Development Status
Currently in Phase 1, with basic physics and rendering integration complete. The system can render simple shapes and apply basic physics simulations.

## Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License
[MIT License](LICENSE)
