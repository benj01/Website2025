import RAPIER from '@dimforge/rapier2d-compat';

export class PhysicsWorld {
    static async create() {
        // Wait for RAPIER to be initialized with proper parameters
        await RAPIER.init({
            // You can add initialization options here if needed
        });
        return new PhysicsWorld();
    }

    constructor() {
        // Initialize the physics world with gravity using a single object parameter
        this.world = new RAPIER.World({
            x: 0.0,
            y: 9.81
        });
        
        // Create a ground collider
        const groundDesc = RAPIER.RigidBodyDesc.fixed();
        groundDesc.setTranslation(0, 500);
        const groundBody = this.world.createRigidBody(groundDesc);
        const groundCollider = RAPIER.ColliderDesc.cuboid(1000, 1);
        this.world.createCollider(groundCollider, groundBody);

        // Create left wall
        const leftWallDesc = RAPIER.RigidBodyDesc.fixed();
        leftWallDesc.setTranslation(-500, 0);
        const leftWallBody = this.world.createRigidBody(leftWallDesc);
        const leftWallCollider = RAPIER.ColliderDesc.cuboid(1, 1000);
        this.world.createCollider(leftWallCollider, leftWallBody);

        // Create right wall
        const rightWallDesc = RAPIER.RigidBodyDesc.fixed();
        rightWallDesc.setTranslation(500, 0);
        const rightWallBody = this.world.createRigidBody(rightWallDesc);
        const rightWallCollider = RAPIER.ColliderDesc.cuboid(1, 1000);
        this.world.createCollider(rightWallCollider, rightWallBody);
    }

    update() {
        // Step the physics simulation
        this.world.step();
    }

    // Method to create a new rigid body
    createRigidBody(desc) {
        return this.world.createRigidBody(desc);
    }

    // Method to create a new collider
    createCollider(desc, body) {
        return this.world.createCollider(desc, body);
    }
}
