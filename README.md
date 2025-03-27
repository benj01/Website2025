# Physics Game with Rapier.js and Pixi.js

A simple physics simulation using Rapier.js for physics and Pixi.js for rendering.

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

- `src/main.ts` - Main entry point that initializes the application
- `src/physics.ts` - Physics world setup using Rapier.js
- `src/render.ts` - Rendering setup using Pixi.js
- `src/index.html` - HTML entry point

## Features

- 2D physics simulation with gravity
- Real-time rendering
- Responsive canvas that adapts to window size
- Modern async/await WebAssembly loading
- TypeScript support

## Technologies Used

- Vite
- TypeScript
- Rapier.js (v0.15.0)
- Pixi.js (v8.9.0)
