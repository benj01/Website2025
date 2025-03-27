# Physics Implementation Notes

## Joint System

### Revolute Joints
Revolute joints allow rotation around a fixed point between two bodies. Key aspects of implementation:

1. **Local vs World Space**
   - Joints must be defined using local space coordinates relative to each body's center
   - World space coordinates must be converted to local space for each body
   - Example conversion:
   ```typescript
   const localAnchor = new Vector2(
     worldAnchor.x - bodyPosition.x,
     worldAnchor.y - bodyPosition.y
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
   - Can restrict rotation range using `limitsEnabled` and `limits`
   - Angles specified in radians
   - Example: -45° to +45° degrees
   ```json
   "limits": {
     "enabled": true,
     "min": -0.785398,  // -45 degrees
     "max": 0.785398    // +45 degrees
   }
   ```

4. **Collision Behavior**
   - `collideConnected`: Controls whether joined bodies can collide
   - `false`: Bodies pass through each other (useful for connected parts)
   - `true`: Bodies collide like separate objects

### Letter Composition

1. **Part Definition**
   ```json
   {
     "id": "vertical",
     "shape": "rectangle",
     "size": {
       "width": 10,
       "height": 50
     },
     "position": {
       "x": 5,
       "y": 25
     },
     "type": "dynamic"
   }
   ```

2. **Joint Definition**
   ```json
   {
     "type": "revolute",
     "between": ["vertical", "horizontal"],
     "anchor": {
       "x": 5,
       "y": 45
     },
     "breakForce": 1000,
     "collideConnected": false
   }
   ```

### Body Handles in Rapier.js
Rapier.js uses a handle system to reference physics bodies and other objects:

1. **Handle Format**
   - Handles appear as very small scientific notation numbers (e.g., `1e-323`)
   - These are internal memory references, not physical properties
   - Example log: `Bodies found for joint: {bodyA: 1e-323, bodyB: 1.5e-323}`

2. **Understanding Handles**
   - Handles are WebAssembly memory references
   - They uniquely identify objects in the physics world
   - Don't confuse these with physical properties like position or mass
   - These values are normal and expected in debug logs

3. **Best Practices**
   - Store handles when creating bodies for later reference
   - Use handles when querying body states or applying forces
   - Don't try to interpret handle values - they're internal identifiers

## Best Practices

1. **Position Calculations**
   - Always consider the center point of bodies when positioning
   - Account for body dimensions when placing joints
   - Use local space for joint anchors

2. **Physics Parameters**
   - Use appropriate break forces (e.g., 1000 for stable connections)
   - Set reasonable angle limits for natural movement
   - Consider collision flags based on desired behavior

3. **Debugging**
   - Log body positions and local anchors
   - Visualize joint connections and anchor points
   - Monitor joint forces and angles during simulation

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