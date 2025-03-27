export interface PhysicsObjectState {
  position: { x: number; y: number };
  rotation: number;
  velocity: { x: number; y: number };
}

export interface PhysicsObjectParams {
  type: 'dynamic' | 'static' | 'kinematic';
  position: { x: number; y: number };
  shape?: 'circle' | 'rectangle';
  size?: { width: number; height: number } | { radius: number };
}

export class PhysicsWorld {
  private world: any;
  private RAPIER: any;
  private objects: Map<number, any>;
  private nextObjectId: number;

  constructor() {
    console.log('PhysicsWorld constructor called');
    this.objects = new Map();
    this.nextObjectId = 1;
  }

  async init() {
    try {
      console.log('Starting Rapier.js initialization...');
      
      try {
        console.log('Attempting to import Rapier.js...');
        this.RAPIER = await import('@dimforge/rapier2d');
        console.log('Rapier.js module loaded successfully:', {
          version: this.RAPIER.version(),
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
      this.world = new this.RAPIER.World({ x: 0.0, y: 30.0 });
      console.log('Physics world created successfully');

      // Create initial ground
      this.createObject({
        type: 'static',
        position: { x: 0, y: 0 },
        shape: 'rectangle',
        size: { width: 100, height: 2 }
      });

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

  createObject(params: PhysicsObjectParams): number {
    const id = this.nextObjectId++;
    
    let rigidBodyDesc;
    switch (params.type) {
      case 'static':
        rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed();
        break;
      case 'kinematic':
        rigidBodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;
      case 'dynamic':
      default:
        rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic();
        break;
    }

    // Set initial position
    rigidBodyDesc.setTranslation(params.position.x, params.position.y);

    // Create the rigid body
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Create collider based on shape
    let colliderDesc;
    if (params.shape === 'circle' && 'radius' in (params.size || {})) {
      colliderDesc = this.RAPIER.ColliderDesc.ball((params.size as { radius: number }).radius);
    } else {
      // Default to rectangle
      const size = (params.size as { width: number; height: number }) || { width: 1, height: 1 };
      colliderDesc = this.RAPIER.ColliderDesc.cuboid(size.width / 2, size.height / 2);
    }

    const collider = this.world.createCollider(colliderDesc, rigidBody);
    
    // Store the object
    this.objects.set(id, {
      rigidBody,
      collider,
      params
    });

    return id;
  }

  removeObject(id: number): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    // Remove from physics world
    this.world.removeRigidBody(object.rigidBody);
    this.objects.delete(id);
    return true;
  }

  getObjectState(id: number): PhysicsObjectState | null {
    const object = this.objects.get(id);
    if (!object) return null;

    const position = object.rigidBody.translation();
    const rotation = object.rigidBody.rotation();
    const velocity = object.rigidBody.linvel();

    return {
      position: { x: position.x, y: position.y },
      rotation,
      velocity: { x: velocity.x, y: velocity.y }
    };
  }

  step(deltaTime: number = 1/60): void {
    if (this.world) {
      // Step the physics simulation with the given timestep
      this.world.step();
      // Apply multiple substeps for better stability
      const numSubsteps = 1;
      for (let i = 0; i < numSubsteps; i++) {
        this.world.step();
      }
    }
  }

  // Legacy method for backward compatibility
  getBallPosition(): { x: number; y: number } {
    // Return position of the first dynamic object found, or default position
    for (const [_, object] of this.objects) {
      if (object.params.type === 'dynamic') {
        const pos = object.rigidBody.translation();
        return { x: pos.x, y: pos.y };
      }
    }
    return { x: 0, y: 0 };
  }
}
