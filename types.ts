
export type GestureState = 'idle' | 'scatter' | 'gather' | 'rotateLeft' | 'rotateRight' | 'pointing' | 'peace' | 'ok';

export type AppStage = 0 | 1 | 2; // 0: Hidden, 1: Star Only, 2: Active (Full Tree)

export interface TreeModuleData {
  id: string;
  type: 'sphere' | 'box' | 'cone' | 'photo' | 'dodecahedron' | 'torus';
  initialPos: [number, number, number];
  color: string;
  imageUrl?: string;
  scale?: number;
}

export interface HandData {
  isDetected: boolean;
  gesture: GestureState;
  palmX: number;
  palmY: number;
}
