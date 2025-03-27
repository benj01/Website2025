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
      position: { x: 300, y: 500 },  // Centered horizontally
      shape: 'rectangle',
      size: { width: 600, height: 10 },  // Slightly smaller width
      friction: 3.0,
      frictionCombineRule: 'max',
      restitution: 0.0,
      restitutionCombineRule: 'min',
      enableCollisionEvents: true,
      enableContactForceEvents: false
    });

    // Create letter L
    console.log('Creating letter L...');
    const letterParts = letterLoader.createLetter('L', { x: 300, y: 100 });  // Centered horizontally
    console.log('Letter parts created:', letterParts);

    // Track last update time for fixed timestep
    let lastTime = performance.now();
    const fixedTimeStep = 1/120;  // Run physics at 120Hz for smoother simulation
    const maxSubSteps = 4;  // Fewer substeps but more frequent updates
    let accumulator = 0;

    // Game loop
    function gameLoop() {
      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
      lastTime = currentTime;

      accumulator += deltaTime;
      
      while (accumulator >= fixedTimeStep) {
        physics.step(fixedTimeStep, maxSubSteps);
        accumulator -= fixedTimeStep;
      }

      // Update visual representations
      objectManager.sync();

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
