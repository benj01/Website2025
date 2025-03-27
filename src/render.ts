import * as PIXI from 'pixi.js';

export class Renderer {
  private app: PIXI.Application;
  private ball: PIXI.Graphics;
  private ground: PIXI.Graphics;

  constructor() {
    // Create the PIXI Application
    this.app = new PIXI.Application({
      background: '#1099bb',
      resizeTo: window,
    });

    // Add the canvas to the DOM
    document.body.appendChild(this.app.view as HTMLCanvasElement);

    // Create ground
    this.ground = new PIXI.Graphics();
    this.ground.beginFill(0x00ff00);
    this.ground.drawRect(-50, 0, 100, 2);
    this.ground.endFill();
    this.app.stage.addChild(this.ground);

    // Create ball
    this.ball = new PIXI.Graphics();
    this.ball.beginFill(0xff0000);
    this.ball.drawCircle(0, 0, 10);
    this.ball.endFill();
    this.app.stage.addChild(this.ball);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });
  }

  updateBallPosition(x: number, y: number) {
    this.ball.position.set(x, y);
  }

  get stage() {
    return this.app.stage;
  }
}
