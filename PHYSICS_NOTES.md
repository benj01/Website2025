# Physics Implementation Notes

## Physics World Configuration

### Gravity and Time Steps
- Gravity: 980.0 units/s² (equivalent to 9.8 m/s² * 100 for pixel scale)
- Physics update rate: 120Hz (fixedTimeStep = 1/120)
- Max substeps: 4 per frame
- Delta time capped at 100ms to prevent instability

### Damping Settings
- Linear damping: 0.1 (for natural sliding motion)
- Angular damping: 0.8 (to reduce wobbling)

## Joint System

### Revolute Joints
Revolute joints allow rotation around a fixed point between two bodies. Key aspects of implementation:

1. **Local vs World Space**
   - Joints must be defined using local space coordinates relative to each body's center
   - World space coordinates must be converted to local space for each body
   - Example conversion:
   ```typescript
   const anchor1 = new this.RAPIER.Vector2(
     params.anchor.x - bodyAPos.x,
     params.anchor.y - bodyAPos.y
   );
   ```

2. **Anchor Points**
   - Anchor points define where bodies connect
   - Must be specified relative to each body's center of mass
   - For a letter "L":
     - Vertical bar center: (5, 25)
     - Horizontal bar center: (20, 45)
     - Joint anchor: (5, 45)

3. **Angle Limits**
   - Using `limitsEnabled` and `limits`
   - Current limits: ±22.5 degrees (±π/8 radians)
   ```typescript
   const minAngle = -Math.PI / 8;
   const maxAngle = Math.PI / 8;
   jointData.limitsEnabled = true;
   jointData.limits = [minAngle, maxAngle];
   ```

4. **Collision Behavior**
   - `collideConnected`: Controls whether joined bodies can collide
   - `false`: Bodies pass through each other (used for letter parts)
   - `true`: Bodies collide like separate objects

## Collision System

### Event Handling
- Collision events enabled via `enableCollisionEvents`
- Using EventQueue for collision detection
- Tracking unique collision pairs to prevent duplicate logging
- Example collision pair key: "1-2" (sorted object IDs)

### Ground Configuration
- Static body
- Position: (300, 500)
- Size: 600x10 units
- Friction: 3.0
- Restitution: 0.0
- Using 'max' friction combine rule
- Using 'min' restitution combine rule

## Letter Configuration

### Physics Properties
- Dynamic bodies
- Continuous Collision Detection (CCD) enabled
- Restitution: 0.2
- Friction: 1.0
- Using 'min' restitution combine rule
- Using 'max' friction combine rule

### Joint Properties
- Revolute joint with ±22.5° limits
- Break force: 1000
- Non-colliding connected parts
- Local space anchor calculations

## Best Practices

1. **Position Calculations**
   - Use local space for joint anchors
   - Center objects horizontally (x: 300)
   - Place ground lower in scene (y: 500)
   - Start letters higher up (y: 100)

2. **Physics Parameters**
   - High ground friction (3.0) for stability
   - Zero ground restitution to prevent bouncing
   - Moderate letter friction (1.0) for natural movement
   - High angular damping (0.8) to prevent wobbling
   - Low linear damping (0.1) for natural motion

3. **Performance**
   - Using fixed timestep (1/120s)
   - Maximum 4 substeps per frame
   - Delta time capping at 100ms
   - Efficient collision pair tracking

## Common Issues and Solutions

1. **Disconnected Parts**
   - Cause: Incorrect local space conversion
   - Solution: Properly calculate anchor points relative to body centers

2. **Unnatural Movement**
   - Cause: Inappropriate angle limits or anchor positions
   - Solution: Adjust limits and ensure anchor points align with intended pivot

3. **Performance**
   - Use appropriate substeps in physics simulation
   - Monitor joint forces to prevent instability
   - Consider using `collideConnected: false` when appropriate

## Implementation Example

```typescript
// Creating a revolute joint
const jointData = RAPIER.JointData.revolute(
  new RAPIER.Vector2(localAnchor1X, localAnchor1Y),
  new RAPIER.Vector2(localAnchor2X, localAnchor2Y)
);

// Setting joint properties
jointData.limitsEnabled = true;
jointData.limits = [-Math.PI/4, Math.PI/4];

// Creating the joint in the world
world.createImpulseJoint(jointData, bodyA, bodyB, true);
```

## Future Improvements

1. **Joint Visualization**
   - Add debug rendering for joints
   - Visualize angle limits and constraints

2. **Dynamic Joint Creation**
   - Support runtime joint modification
   - Allow dynamic angle limit adjustments

3. **Advanced Features**
   - Motor-driven joints
   - Spring constraints
   - Chain reactions

## Physics Parameters

### Damping
Damping is used to simulate energy loss in the physics system:

1. **Types of Damping**
   - `linearDamping`: Reduces sliding motion (0.0 to 1.0)
   - `angularDamping`: Reduces rotational motion (0.0 to 1.0)
   ```typescript
   rigidBodyDesc.setLinearDamping(0.3);   // Moderate sliding friction
   rigidBodyDesc.setAngularDamping(0.4);   // Moderate rotational friction
   ```

2. **Effects**
   - Higher values (closer to 1.0) = More friction, quicker energy loss
   - Lower values (closer to 0.0) = Less friction, objects keep moving
   - Current settings:
     - Linear: 0.3 (moderate sliding resistance)
     - Angular: 0.4 (moderate rotational resistance)

3. **Use Cases**
   - Prevent infinite sliding/spinning
   - Simulate surface friction
   - Create more realistic object interactions 