import { PhysicsWorld } from './physics';
import { Renderer } from './render';

async function initPhysics() {
  console.log('[Physics] Starting initialization...');
  const physics = new PhysicsWorld();
  const initialized = await physics.init();
  if (!initialized) {
    throw new Error('Physics initialization failed');
  }
  console.log('[Physics] Initialization successful');
  return physics;
}

async function initRenderer() {
  console.log('[Renderer] Starting initialization...');
  try {
    const renderer = new Renderer();
    console.log('[Renderer] Initialization successful');
    return renderer;
  } catch (error) {
    console.error('[Renderer] Initialization failed:', error);
    throw error;
  }
}

async function init() {
  try {
    console.log('Starting application initialization...');
    
    // Initialize physics first
    console.log('Step 1: Initializing physics engine...');
    const physics = await initPhysics().catch(error => {
      console.error('Physics initialization error:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      throw error;
    });

    // Then initialize renderer
    console.log('Step 2: Initializing renderer...');
    const renderer = await initRenderer().catch(error => {
      console.error('Renderer initialization error:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      throw error;
    });

    console.log('Both physics and renderer initialized successfully');

    // Game loop
    function gameLoop() {
      // Step physics
      physics.step();

      // Update ball position
      const ballPos = physics.getBallPosition();
      renderer.updateBallPosition(ballPos.x, ballPos.y);

      // Request next frame
      requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    console.log('Starting game loop...');
    gameLoop();
    console.log('Application initialization completed successfully');
  } catch (error: any) {
    console.error('Failed to initialize:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    // You might want to show an error message to the user here
  }
}

// Start the application
console.log('Application starting...');
init();
