import { Application, Container, Graphics } from 'pixi.js';

export class Renderer {
    static async create() {
        const renderer = new Renderer();
        await renderer.init();
        return renderer;
    }

    constructor() {
        // Create the PIXI application with current API
        this.app = null;
        this.scene = null;
        this.testRect = null;  // Store reference to test rectangle
    }

    async init() {
        // Initialize PIXI Application
        this.app = new Application();
        
        // Initialize with proper settings
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: true,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1
        });

        // Add the canvas to the DOM
        document.body.appendChild(this.app.canvas);

        // Create a container for all game objects
        this.scene = new Container();
        this.app.stage.addChild(this.scene);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });

        // Add a test rectangle to verify rendering
        this.testRect = new Graphics()
            .clear()
            .fill({ color: 0xff0000 })
            .rect(-50, -50, 100, 100);
        
        this.testRect.position.set(
            window.innerWidth / 2,
            window.innerHeight / 2
        );
        this.scene.addChild(this.testRect);

        // Log to verify initialization
        console.log('Renderer initialized', {
            width: window.innerWidth,
            height: window.innerHeight,
            rect: this.testRect.position
        });

        // Start the animation loop
        this.app.ticker.add(() => this.update());
    }

    update(physicsObjects) {
        // Update visual objects based on physics state
        if (physicsObjects && physicsObjects.testRect) {
            const pos = physicsObjects.testRect.translation();
            this.testRect.position.set(pos.x, pos.y);
        }
    }

    // Method to add a sprite to the scene
    addSprite(sprite) {
        this.scene.addChild(sprite);
    }

    // Method to remove a sprite from the scene
    removeSprite(sprite) {
        this.scene.removeChild(sprite);
    }
}
