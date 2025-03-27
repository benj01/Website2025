import { PhysicsWorld } from './physics';
import { Renderer } from './render';

// Unique identifier for game objects
type ObjectId = string;
type JointId = string;

// Types of physics objects we can create
export enum PhysicsObjectType {
  DYNAMIC = 'dynamic',
  STATIC = 'static',
  KINEMATIC = 'kinematic'
}

export enum JointType {
  FIXED = 'fixed',
  REVOLUTE = 'revolute',
  PRISMATIC = 'prismatic'
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

export interface JointCreateParams {
  id?: JointId;
  type: JointType;
  bodyA: ObjectId;
  bodyB: ObjectId;
  anchor: { x: number; y: number };
  breakForce?: number;
  collideConnected?: boolean;
}

export class ObjectManager {
  private physicsWorld: PhysicsWorld;
  private renderer: Renderer;
  private objects: Map<ObjectId, {
    physicsId: number;
    rendererId: number;
  }>;
  private joints: Map<JointId, {
    physicsJointId: number;
    bodyA: ObjectId;
    bodyB: ObjectId;
  }>;
  private nextId: number;
  private nextJointId: number;

  constructor(physicsWorld: PhysicsWorld, renderer: Renderer) {
    this.physicsWorld = physicsWorld;
    this.renderer = renderer;
    this.objects = new Map();
    this.joints = new Map();
    this.nextId = 1;
    this.nextJointId = 1;
  }

  private generateId(): ObjectId {
    return `obj_${this.nextId++}`;
  }

  private generateJointId(): JointId {
    return `joint_${this.nextJointId++}`;
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
      size: params.size,
      color: params.color
    });

    // Store the mapping
    this.objects.set(id, {
      physicsId,
      rendererId
    });

    return id;
  }

  /**
   * Creates a joint between two objects
   */
  public createJoint(params: JointCreateParams): JointId {
    const id = params.id || this.generateJointId();
    
    const bodyAObj = this.objects.get(params.bodyA);
    const bodyBObj = this.objects.get(params.bodyB);
    
    if (!bodyAObj || !bodyBObj) {
      throw new Error('Invalid object IDs for joint creation');
    }

    const physicsJointId = this.physicsWorld.createJoint({
      type: params.type,
      bodyA: bodyAObj.physicsId,
      bodyB: bodyBObj.physicsId,
      anchor: params.anchor,
      breakForce: params.breakForce,
      collideConnected: params.collideConnected
    });

    this.joints.set(id, {
      physicsJointId,
      bodyA: params.bodyA,
      bodyB: params.bodyB
    });

    return id;
  }

  /**
   * Removes a joint between objects
   */
  public removeJoint(id: JointId): boolean {
    const joint = this.joints.get(id);
    if (!joint) return false;

    this.physicsWorld.removeJoint(joint.physicsJointId);
    this.joints.delete(id);
    return true;
  }

  /**
   * Removes an object and its representations from both physics and rendering
   */
  public removeObject(id: ObjectId): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    // Remove any joints connected to this object
    for (const [jointId, joint] of this.joints) {
      if (joint.bodyA === id || joint.bodyB === id) {
        this.removeJoint(jointId);
      }
    }

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