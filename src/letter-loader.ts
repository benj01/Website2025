import { ObjectManager, PhysicsObjectType } from './object-manager';

interface LetterPart {
  id: string;
  shape: 'rectangle' | 'circle';
  size: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  type: string;
  color: string;
}

interface LetterJoint {
  type: string;
  between: [string, string];
  anchor: {
    x: number;
    y: number;
  };
  breakForce: number;
  collideConnected: boolean;
}

interface LetterMetadata {
  width: number;
  height: number;
  baseline: number;
  description: {
    [key: string]: string;
  };
}

interface LetterDefinition {
  parts: LetterPart[];
  joints: LetterJoint[];
  metadata: LetterMetadata;
}

interface LetterComposition {
  [key: string]: LetterDefinition;
}

export class LetterLoader {
  private objectManager: ObjectManager;
  private letterData: LetterComposition | null = null;

  constructor(objectManager: ObjectManager) {
    this.objectManager = objectManager;
  }

  async loadLetterData(): Promise<void> {
    try {
      const response = await fetch('/assets/letter-composition.json');
      this.letterData = await response.json();
    } catch (error) {
      console.error('Failed to load letter composition data:', error);
      throw error;
    }
  }

  createLetter(letter: string, position: { x: number; y: number }): string[] {
    if (!this.letterData || !this.letterData[letter]) {
      throw new Error(`Letter "${letter}" not found in composition data`);
    }

    const letterDef = this.letterData[letter];
    const partIds: string[] = [];

    // Create all parts
    for (const part of letterDef.parts) {
      const objectId = this.objectManager.createObject({
        id: `${letter}_${part.id}`,
        type: part.type === 'dynamic' ? PhysicsObjectType.DYNAMIC : PhysicsObjectType.STATIC,
        position: {
          x: position.x + part.position.x,
          y: position.y + part.position.y
        },
        shape: part.shape,
        size: part.size,
        color: parseInt(part.color)
      });
      partIds.push(objectId);
    }

    // TODO: Create joints between parts
    // This will be implemented when we add joint support to the ObjectManager

    return partIds;
  }
} 