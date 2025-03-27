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
  restitution?: number;  // Bounciness (0.0 to 1.0)
  restitutionCombineRule?: 'average' | 'min' | 'max' | 'multiply';
  friction?: number;  // Surface friction (0.0 to 1.0)
  frictionCombineRule?: 'average' | 'min' | 'max' | 'multiply';
  contactForceEventThreshold?: number;  // Minimum force required to trigger contact events
  enableCollisionEvents?: boolean;      // Whether to enable collision events
  enableContactForceEvents?: boolean;   // Whether to enable contact force events
}

export interface JointParams {
  type: 'fixed' | 'revolute' | 'prismatic';
  bodyA: number;  // ID of first body
  bodyB: number;  // ID of second body
  anchor: { x: number; y: number };  // World space anchor point
  breakForce?: number;  // Force required to break the joint
  collideConnected?: boolean;  // Whether connected bodies should collide
}

export class PhysicsWorld {
  private world: any;
  private RAPIER: any;
  private objects: Map<number, any>;
  private joints: Map<number, any>;
  private nextObjectId: number;
  private nextJointId: number;
  private eventQueue: any;  // RAPIER.EventQueue
  private collidedPairs: Set<string>;  // Track which pairs have collided

  constructor() {
    console.log('PhysicsWorld constructor called');
    this.objects = new Map();
    this.joints = new Map();
    this.nextObjectId = 1;
    this.nextJointId = 1;
    this.collidedPairs = new Set();  // Initialize empty set
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

        // Initialize event queue
        this.eventQueue = new this.RAPIER.EventQueue(true);

        // Log available joint-related classes
        console.log('Joint APIs available:', {
          JointData: !!this.RAPIER.JointData,
          Vector2: !!this.RAPIER.Vector2,
          'JointData.fixed': !!this.RAPIER.JointData?.fixed,
          'JointData.revolute': !!this.RAPIER.JointData?.revolute,
          'JointData.prismatic': !!this.RAPIER.JointData?.prismatic
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
      this.world = new this.RAPIER.World({ x: 0.0, y: 980.0 });  // Standard gravity (roughly 9.8 m/s^2 * 100 for pixel scale)

      // Log available methods on the world object
      console.log('World methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.world)));
      
      // Verify joint-related methods exist
      console.log('Joint-related methods available:', {
        createJoint: !!this.world.createJoint,
        removeJoint: !!this.world.removeJoint,
        createImpulseJoint: !!this.world.createImpulseJoint
      });

      console.log('Physics world created successfully');
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
        // Add damping to reduce energy over time
        rigidBodyDesc.setLinearDamping(0.3);  // Increased linear damping for more stability
        rigidBodyDesc.setAngularDamping(1.2); // Increased angular damping to reduce wobbling
        break;
    }

    // Set initial position
    rigidBodyDesc.setTranslation(params.position.x, params.position.y);

    // Create the rigid body
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Enable CCD for dynamic bodies
    if (params.type === 'dynamic') {
      rigidBody.enableCcd(true);
    }

    // Create collider based on shape
    let colliderDesc;
    if (params.shape === 'circle' && 'radius' in (params.size || {})) {
      colliderDesc = this.RAPIER.ColliderDesc.ball((params.size as { radius: number }).radius);
    } else {
      // Default to rectangle
      const size = (params.size as { width: number; height: number }) || { width: 1, height: 1 };
      colliderDesc = this.RAPIER.ColliderDesc.cuboid(size.width / 2, size.height / 2);
    }

    // Set restitution (bounciness) if provided
    if (params.restitution !== undefined) {
      colliderDesc.setRestitution(params.restitution);
    }

    // Set restitution combine rule if provided
    if (params.restitutionCombineRule) {
      switch (params.restitutionCombineRule) {
        case 'average':
          colliderDesc.setRestitutionCombineRule(this.RAPIER.CoefficientCombineRule.Average);
          break;
        case 'min':
          colliderDesc.setRestitutionCombineRule(this.RAPIER.CoefficientCombineRule.Min);
          break;
        case 'max':
          colliderDesc.setRestitutionCombineRule(this.RAPIER.CoefficientCombineRule.Max);
          break;
        case 'multiply':
          colliderDesc.setRestitutionCombineRule(this.RAPIER.CoefficientCombineRule.Multiply);
          break;
      }
    }

    // Set friction if provided
    if (params.friction !== undefined) {
      colliderDesc.setFriction(params.friction);
    }

    // Set friction combine rule if provided
    if (params.frictionCombineRule) {
      switch (params.frictionCombineRule) {
        case 'average':
          colliderDesc.setFrictionCombineRule(this.RAPIER.CoefficientCombineRule.Average);
          break;
        case 'min':
          colliderDesc.setFrictionCombineRule(this.RAPIER.CoefficientCombineRule.Min);
          break;
        case 'max':
          colliderDesc.setFrictionCombineRule(this.RAPIER.CoefficientCombineRule.Max);
          break;
        case 'multiply':
          colliderDesc.setFrictionCombineRule(this.RAPIER.CoefficientCombineRule.Multiply);
          break;
      }
    }

    const collider = this.world.createCollider(colliderDesc, rigidBody);
    
    // Set up collision and contact force events if enabled
    if (params.enableCollisionEvents || params.enableContactForceEvents) {
      let activeEvents = 0;
      if (params.enableCollisionEvents) {
        activeEvents |= this.RAPIER.ActiveEvents.COLLISION_EVENTS;
      }
      if (params.enableContactForceEvents) {
        activeEvents |= this.RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS;
      }
      collider.setActiveEvents(activeEvents);

      // Set contact force threshold if provided
      if (params.contactForceEventThreshold !== undefined) {
        collider.setContactForceEventThreshold(params.contactForceEventThreshold);
      }
    }
    
    // Store the object
    this.objects.set(id, {
      rigidBody,
      collider,
      params
    });

    return id;
  }

  createJoint(params: JointParams): number {
    console.log('Creating joint with params:', params);
    const bodyA = this.objects.get(params.bodyA)?.rigidBody;
    const bodyB = this.objects.get(params.bodyB)?.rigidBody;

    if (!bodyA || !bodyB) {
      console.error('Joint creation failed: Invalid body IDs', {
        bodyAId: params.bodyA,
        bodyBId: params.bodyB,
        bodyAExists: !!bodyA,
        bodyBExists: !!bodyB
      });
      throw new Error('Invalid body IDs for joint creation');
    }

    console.log('Bodies found for joint:', {
      bodyA: bodyA.handle,
      bodyB: bodyB.handle
    });

    try {
      // Get body positions
      const bodyAPos = bodyA.translation();
      const bodyBPos = bodyB.translation();

      // Create the joint data
      let jointData;
      switch (params.type) {
        case 'fixed':
          console.log('Creating fixed joint at:', params.anchor);
          jointData = this.RAPIER.JointData.fixed(
            new this.RAPIER.Vector2(0, 0),  // Use body center as anchor
            0,  // frame1
            new this.RAPIER.Vector2(0, 0),  // Use body center as anchor
            0   // frame2
          );
          break;
        case 'revolute':
          console.log('Creating revolute joint at:', params.anchor);
          
          // Get the positions of both bodies
          const bodyAPos = bodyA.translation();
          const bodyBPos = bodyB.translation();
          
          // Calculate local space anchors relative to body centers
          const anchor1 = new this.RAPIER.Vector2(
            params.anchor.x - bodyAPos.x,
            params.anchor.y - bodyAPos.y
          );
          
          const anchor2 = new this.RAPIER.Vector2(
            params.anchor.x - bodyBPos.x,
            params.anchor.y - bodyBPos.y
          );
          
          console.log('Body positions:', {
            bodyA: { x: bodyAPos.x, y: bodyAPos.y },
            bodyB: { x: bodyBPos.x, y: bodyBPos.y }
          });
          
          console.log('Local anchors:', {
            anchor1: { x: anchor1.x, y: anchor1.y },
            anchor2: { x: anchor2.x, y: anchor2.y }
          });
          
          // Create revolute joint with the local anchors
          jointData = this.RAPIER.JointData.revolute(anchor1, anchor2);
          
          // Set angle limits (in radians) and damping
          const minAngle = -Math.PI / 8;  // -22.5 degrees
          const maxAngle = Math.PI / 8;   // +22.5 degrees
          jointData.limitsEnabled = true;
          jointData.limits = [minAngle, maxAngle];
          
          // Add joint damping and stiffness
          jointData.damping = 10.0;        // Add significant damping to joints
          jointData.stiffness = 50.0;      // Make joints stiffer
          jointData.restitution = 0.0;     // No bouncing at joint limits
          
          break;
        case 'prismatic':
          console.log('Creating prismatic joint at:', params.anchor);
          const axis = new this.RAPIER.Vector2(1.0, 0.0);
          jointData = this.RAPIER.JointData.prismatic(
            new this.RAPIER.Vector2(0, 0),
            new this.RAPIER.Vector2(0, 0),
            axis
          );
          break;
        default:
          throw new Error(`Unsupported joint type: ${params.type}`);
      }

      console.log('Joint data created:', jointData);

      // Create the joint in the physics world
      const handle = this.world.createImpulseJoint(jointData, bodyA, bodyB, true);
      console.log('Joint added to world:', handle);

      const id = this.nextJointId++;
      this.joints.set(id, {
        handle,
        params,
        bodyAId: params.bodyA,
        bodyBId: params.bodyB
      });

      return id;
    } catch (error) {
      console.error('Failed to create joint:', {
        error,
        type: params.type,
        anchor: params.anchor,
        bodyA: bodyA?.handle,
        bodyB: bodyB?.handle
      });
      throw error;
    }
  }

  removeJoint(id: number): boolean {
    const joint = this.joints.get(id);
    if (!joint) return false;

    try {
      // Remove the joint using the world's impulseJoints
      this.world.removeImpulseJoint(joint.handle, true); // true to wake up the bodies
      this.joints.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to remove joint:', error);
      return false;
    }
  }

  removeObject(id: number): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    // Remove any joints connected to this object
    for (const [jointId, joint] of this.joints) {
      if (joint.bodyAId === id || joint.bodyBId === id) {
        this.removeJoint(jointId);
      }
    }

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

  step(deltaTime: number = 1/60, maxSubsteps: number = 1): void {
    if (this.world) {
      // Use the provided timestep and maxSubsteps
      this.world.step(this.eventQueue, deltaTime, maxSubsteps);

      // Process collision events
      this.eventQueue.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
        // Find the objects involved in the collision
        const obj1 = Array.from(this.objects.entries()).find(([_, obj]) => obj.collider.handle === handle1);
        const obj2 = Array.from(this.objects.entries()).find(([_, obj]) => obj.collider.handle === handle2);
        
        if (obj1 && obj2) {
          // Create a unique key for this pair of objects (order-independent)
          const id1 = obj1[0];
          const id2 = obj2[0];
          const pairKey = [id1, id2].sort().join('-');

          // Only log if this is a new collision that's starting
          if (started && !this.collidedPairs.has(pairKey)) {
            this.collidedPairs.add(pairKey);
            console.log('First Collision Between Objects:', {
              object1: {
                id: id1,
                type: obj1[1].params.type
              },
              object2: {
                id: id2,
                type: obj2[1].params.type
              }
            });
          }
        }
      });

      // Drain contact force events without processing to clear the queue
      this.eventQueue.drainContactForceEvents(() => {});
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
