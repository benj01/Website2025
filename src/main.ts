import { PhysicsWorld } from './physics';
import { Renderer } from './render';
import { ObjectManager, PhysicsObjectType } from './object-manager';
import { LetterLoader } from './letter-loader';

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
    // Wait for the renderer to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 100)); // Give time for PIXI initialization
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

    // Create object manager
    const objectManager = new ObjectManager(physics, renderer);

    // Create letter loader
    const letterLoader = new LetterLoader(objectManager);
    await letterLoader.loadLetterData();

    // Create ground
    objectManager.createObject({
      type: PhysicsObjectType.STATIC,
      position: { x: 0, y: 100 },
      shape: 'rectangle',
      size: { width: 800, height: 10 }
    });

    // Create letter L
    console.log('Creating letter L...');
    const letterParts = letterLoader.createLetter('L', { x: 0, y: 0 });
    console.log('Letter parts created:', letterParts);

    // Track last update time for fixed timestep
    let lastTime = performance.now();
    const fixedTimeStep = 1/240; // Physics at 240Hz
    const maxSubSteps = 5;
    let accumulator = 0;

    // Game loop
    function gameLoop() {
      const currentTime = performance.now();
      let deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Prevent spiral of death
      if (deltaTime > 0.25) {
        deltaTime = 0.25;
      }

      // Accumulate time to step
      accumulator += deltaTime;

      // Step physics multiple times if needed to catch up
      let numSteps = 0;
      while (accumulator >= fixedTimeStep && numSteps < maxSubSteps) {
        objectManager.step(fixedTimeStep);
        accumulator -= fixedTimeStep;
        numSteps++;
      }

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
