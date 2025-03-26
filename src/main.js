import { Renderer } from './render.js';
import { PhysicsWorld } from './physics.js';

class Game {
    constructor() {
        // Bind the game loop
        this.gameLoop = this.gameLoop.bind(this);
    }

    async init() {
        // Initialize renderer
        this.renderer = await Renderer.create();

        // Initialize physics
        this.physics = await PhysicsWorld.create();
        
        // Load website structure data
        await this.loadWebsiteStructure();

        // Start the game loop
        requestAnimationFrame(this.gameLoop);
    }

    async loadWebsiteStructure() {
        try {
            const response = await fetch('./website-structure.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            try {
                this.websiteStructure = JSON.parse(text);
                console.log('Website structure loaded:', this.websiteStructure);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                console.log('Received text:', text);
            }
        } catch (error) {
            console.error('Error loading website structure:', error);
        }
    }

    gameLoop() {
        // Update physics and get current state
        const physicsState = this.physics.update();
        
        // Update renderer with physics state
        this.renderer.update(physicsState);

        // Continue the game loop
        requestAnimationFrame(this.gameLoop);
    }
}

// Start the game when the page loads
window.addEventListener('load', async () => {
    const game = new Game();
    await game.init();
});
