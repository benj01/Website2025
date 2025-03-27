import { PhysicsWorld } from './physics';
import { Renderer } from './render';

// Unique identifier for game objects
type ObjectId = string;

// Types of physics objects we can create
export enum PhysicsObjectType {
  DYNAMIC = 'dynamic',
  STATIC = 'static',
  KINEMATIC = 'kinematic'
}

// Base interface for object creation parameters
export interface ObjectCreateParams {
  id?: ObjectId;
  type: PhysicsObjectType;
  position: { x: number; y: number };
  shape?: 'circle' | 'rectangle';
  size?: { width: number; height: number } | { radius: number };
  color?: number;
}

export class ObjectManager {
  private physicsWorld: PhysicsWorld;
  private renderer: Renderer;
  private objects: Map<ObjectId, {
    physicsId: number;
    rendererId: number;
  }>;
  private nextId: number;

  constructor(physicsWorld: PhysicsWorld, renderer: Renderer) {
    this.physicsWorld = physicsWorld;
    this.renderer = renderer;
    this.objects = new Map();
    this.nextId = 1;
  }

  private generateId(): ObjectId {
    return `obj_${this.nextId++}`;
  }

  /**
   * Creates a new game object with both physics and visual representations
   */
  public createObject(params: ObjectCreateParams): ObjectId {
    const id = params.id || this.generateId();
    
    // Create physics object
    const physicsId = this.physicsWorld.createObject({
      type: params.type,
      position: params.position,
      shape: params.shape,
      size: params.size
    });

    // Create visual representation
    const rendererId = this.renderer.createObject({
      type: params.type,
      position: params.position,
      shape: params.shape,
      size: params.size
    });

    // Store the mapping
    this.objects.set(id, {
      physicsId,
      rendererId
    });

    return id;
  }

  /**
   * Removes an object and its representations from both physics and rendering
   */
  public removeObject(id: ObjectId): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    // Remove from physics and rendering
    this.physicsWorld.removeObject(object.physicsId);
    this.renderer.removeObject(object.rendererId);

    // Remove from our tracking
    this.objects.delete(id);
    return true;
  }

  /**
   * Updates the visual representation of all objects based on physics state
   */
  public sync(): void {
    for (const [id, object] of this.objects) {
      // Get current physics state
      const physicsState = this.physicsWorld.getObjectState(object.physicsId);
      
      // Update visual representation if state exists
      if (physicsState) {
        this.renderer.updateObject(object.rendererId, physicsState);
      }
    }
  }

  /**
   * Performs a single step of the simulation
   */
  public step(deltaTime: number): void {
    // Step physics simulation
    this.physicsWorld.step(deltaTime);
    
    // Sync visual representations with physics state
    this.sync();
  }

  /**
   * Gets the current state of an object
   */
  public getObjectState(id: ObjectId) {
    const object = this.objects.get(id);
    if (!object) return null;

    return this.physicsWorld.getObjectState(object.physicsId);
  }
} 