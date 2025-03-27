export class PhysicsWorld {
  private world: any;
  private ground: any;
  private groundCollider: any;
  private ball: any;
  private ballCollider: any;
  private RAPIER: any;

  constructor() {
    console.log('PhysicsWorld constructor called');
  }

  async init() {
    try {
      console.log('Starting Rapier.js initialization...');
      
      // Initialize Rapier using dynamic import
      try {
        console.log('Attempting to import Rapier.js...');
        this.RAPIER = await import('@dimforge/rapier2d');
        console.log('Rapier.js module loaded successfully:', {
          version: this.RAPIER.version,
          available: Object.keys(this.RAPIER)
        });
      } catch (importError: any) {
        console.error('Failed to import Rapier.js:', {
          name: importError?.name,
          message: importError?.message,
          stack: importError?.stack
        });
        throw importError;
      }
      
      // Initialize the physics world with gravity
      console.log('Creating physics world with gravity...');
      this.world = new this.RAPIER.World({ x: 0.0, y: 9.81 });
      console.log('Physics world created successfully');

      // Create ground
      console.log('Creating ground...');
      this.ground = this.world.createRigidBody(this.RAPIER.RigidBodyDesc.fixed());
      this.groundCollider = this.world.createCollider(
        this.RAPIER.ColliderDesc.cuboid(50.0, 1.0),
        this.ground
      );
      console.log('Ground created successfully');

      // Create a ball
      console.log('Creating ball...');
      this.ball = this.world.createRigidBody(
        this.RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, -10.0)
      );
      this.ballCollider = this.world.createCollider(
        this.RAPIER.ColliderDesc.ball(0.5),
        this.ball
      );
      console.log('Ball created successfully');

      console.log('Physics initialization completed successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to initialize physics:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      return false;
    }
  }

  step() {
    if (this.world) {
      this.world.step();
    }
  }

  getBallPosition(): { x: number; y: number } {
    if (!this.ball) return { x: 0, y: 0 };
    const position = this.ball.translation();
    return { x: position.x, y: position.y };
  }
}
