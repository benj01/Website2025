import * as PIXI from 'pixi.js';

export class Renderer {
  private app: PIXI.Application;
  private ball!: PIXI.Graphics;
  private ground!: PIXI.Graphics;

  constructor() {
    console.log('[Renderer] PIXI.js version:', PIXI.VERSION);
    // Create the PIXI Application with proper initialization
    this.app = new PIXI.Application();
    
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

    // Center the stage
    this.app.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);
    console.log('[Renderer] Stage centered at:', {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    // Create ground
    console.log('[Renderer] Creating ground graphics...');
    this.ground = new PIXI.Graphics()
      .rect(-50, 0, 100, 2)
      .fill({ color: 0x00ff00 });
    console.log('[Renderer] Ground created:', this.ground);
    this.app.stage.addChild(this.ground);

    // Create ball
    console.log('[Renderer] Creating ball graphics...');
    this.ball = new PIXI.Graphics()
      .circle(0, 0, 10)
      .fill({ color: 0xff0000 });
    console.log('[Renderer] Ball created:', this.ball);
    this.app.stage.addChild(this.ball);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      // Update stage position on resize
      this.app.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);
      console.log('[Renderer] Window resized, stage repositioned');
    });
  }

  updateBallPosition(x: number, y: number) {
    this.ball.position.set(x, y);
  }

  get stage() {
    return this.app.stage;
  }
}
