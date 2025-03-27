import * as PIXI from 'pixi.js';
import { PhysicsObjectState } from './physics';

export interface RenderObjectParams {
  type: 'dynamic' | 'static' | 'kinematic';
  position: { x: number; y: number };
  shape?: 'circle' | 'rectangle';
  size?: { width: number; height: number } | { radius: number };
  color?: number;
}

export class Renderer {
  private app: PIXI.Application;
  private objects: Map<number, PIXI.Graphics>;
  private objectTypes: Map<number, string>;
  private nextObjectId: number;

  constructor() {
    console.log('[Renderer] PIXI.js version:', PIXI.VERSION);
    // Create the PIXI Application with proper initialization
    this.app = new PIXI.Application();
    this.objects = new Map();
    this.objectTypes = new Map();
    this.nextObjectId = 1;
    
    // Initialize the application properly
    this.init();
  }

  private async init() {
    console.log('[Renderer] Initializing PIXI application...');
    // Initialize the application with proper settings
    await this.app.init({
      background: '#1099bb',
      resizeTo: window,
    });
    console.log('[Renderer] PIXI application initialized');

    // Add the canvas to the DOM
    document.body.appendChild(this.app.canvas);
    console.log('[Renderer] Canvas added to DOM');

    // Don't center the stage, as we want to use screen coordinates directly
    // this.app.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      console.log('[Renderer] Window resized');
    });
  }

  createObject(params: RenderObjectParams): number {
    const id = this.nextObjectId++;
    const graphics = new PIXI.Graphics();

    // Set default color based on type
    const color = params.color || this.getDefaultColor(params.type);

    // Create shape
    if (params.shape === 'circle' && 'radius' in (params.size || {})) {
      const radius = (params.size as { radius: number }).radius;
      graphics
        .circle(0, 0, radius)
        .fill({ color });
    } else {
      // Default to rectangle
      const size = (params.size as { width: number; height: number }) || { width: 1, height: 1 };
      graphics
        .rect(-size.width/2, -size.height/2, size.width, size.height)
        .fill({ color });
    }

    // Set initial position
    graphics.position.set(params.position.x, params.position.y);

    // Store the object type
    this.objectTypes.set(id, params.type);

    // Add to stage and store
    this.app.stage.addChild(graphics);
    this.objects.set(id, graphics);

    return id;
  }

  removeObject(id: number): boolean {
    const graphics = this.objects.get(id);
    if (!graphics) return false;

    // Remove from stage and destroy
    this.app.stage.removeChild(graphics);
    graphics.destroy();
    this.objects.delete(id);
    this.objectTypes.delete(id);

    return true;
  }

  updateObject(id: number, state: PhysicsObjectState): void {
    const graphics = this.objects.get(id);
    if (!graphics) return;

    graphics.position.set(state.position.x, state.position.y);
    graphics.rotation = state.rotation;
  }

  private getDefaultColor(type: string): number {
    switch (type) {
      case 'static':
        return 0x00ff00; // Green
      case 'kinematic':
        return 0x0000ff; // Blue
      case 'dynamic':
      default:
        return 0xff0000; // Red
    }
  }

  // Legacy method for backward compatibility
  updateBallPosition(x: number, y: number) {
    // Find first dynamic object and update its position
    for (const [id, graphics] of this.objects.entries()) {
      if (this.objectTypes.get(id) === 'dynamic') {
        graphics.position.set(x, y);
        break;
      }
    }
  }

  get stage() {
    return this.app.stage;
  }
}
