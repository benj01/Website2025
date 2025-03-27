import { ObjectManager, PhysicsObjectType, JointType } from './object-manager';

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
  restitution: number;
  restitutionCombineRule: 'average' | 'min' | 'max' | 'multiply';
  friction: number;
  frictionCombineRule: 'average' | 'min' | 'max' | 'multiply';
  enableCollisionEvents: boolean;
  enableContactForceEvents: boolean;
  contactForceEventThreshold: number;
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
  private createdParts: Map<string, string> = new Map(); // Maps part IDs to object IDs

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

  private getJointType(type: string): JointType {
    switch (type.toLowerCase()) {
      case 'fixed':
        return JointType.FIXED;
      case 'revolute':
        return JointType.REVOLUTE;
      case 'prismatic':
        return JointType.PRISMATIC;
      default:
        return JointType.FIXED; // Default to fixed joint
    }
  }

  createLetter(letter: string, position: { x: number; y: number }): string[] {
    if (!this.letterData || !this.letterData[letter]) {
      throw new Error(`Letter "${letter}" not found in composition data`);
    }

    const letterDef = this.letterData[letter];
    const partIds: string[] = [];
    this.createdParts.clear();

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
        color: parseInt(part.color),
        restitution: part.restitution,
        restitutionCombineRule: part.restitutionCombineRule,
        friction: part.friction,
        frictionCombineRule: part.frictionCombineRule,
        enableCollisionEvents: part.enableCollisionEvents,
        enableContactForceEvents: part.enableContactForceEvents,
        contactForceEventThreshold: part.contactForceEventThreshold
      });
      partIds.push(objectId);
      this.createdParts.set(part.id, objectId);
    }

    // Create joints between parts
    for (const joint of letterDef.joints) {
      const bodyAId = this.createdParts.get(joint.between[0]);
      const bodyBId = this.createdParts.get(joint.between[1]);

      if (!bodyAId || !bodyBId) {
        console.error(`Could not find objects for joint between ${joint.between[0]} and ${joint.between[1]}`);
        continue;
      }

      try {
        this.objectManager.createJoint({
          type: this.getJointType(joint.type),
          bodyA: bodyAId,
          bodyB: bodyBId,
          anchor: {
            x: position.x + joint.anchor.x,
            y: position.y + joint.anchor.y
          },
          breakForce: joint.breakForce,
          collideConnected: joint.collideConnected
        });
      } catch (error) {
        console.error('Failed to create joint:', error);
      }
    }

    return partIds;
  }
} 