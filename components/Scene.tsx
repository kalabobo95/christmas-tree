
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { TreeModuleData, GestureState, AppStage } from '../types';
import { COLORS, TREE_HEIGHT, TREE_RADIUS } from '../constants';

interface SceneProps {
  modules: TreeModuleData[];
  gesture: GestureState;
  palmX: number;
  palmY: number;
  appStage: AppStage;
}

const Star: React.FC<{ position: [number, number, number]; visible: boolean }> = ({ position, visible }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      meshRef.current.scale.set(pulse, pulse, pulse);
      meshRef.current.visible = visible;
    }
  });
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const outer = 1;
    const inner = 0.4;
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (i * Math.PI) / 5;
      if (i === 0) s.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else s.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    s.closePath();
    return s;
  }, []);
  return (
    <mesh ref={meshRef} position={position}>
      <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: false }]} />
      <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={5} transparent opacity={visible ? 1 : 0} />
    </mesh>
  );
};

const Snowman: React.FC<{ position: [number, number, number]; visible: boolean }> = ({ position, visible }) => {
  if (!visible) return null;
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color={COLORS.WHITE} emissive={COLORS.WHITE} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color={COLORS.WHITE} emissive={COLORS.WHITE} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={COLORS.WHITE} emissive={COLORS.WHITE} emissiveIntensity={0.2} />
      </mesh>
      {/* Scarf */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        <meshStandardMaterial color={COLORS.RED} />
      </mesh>
      {/* Arms */}
      <mesh position={[0.5, 1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.05, 0.05]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      <mesh position={[-0.5, 1.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.05, 0.05]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial color={COLORS.BLACK} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 16]} />
        <meshStandardMaterial color={COLORS.BLACK} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.8, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.2, 8]} />
        <meshStandardMaterial color={COLORS.ORANGE} emissive={COLORS.ORANGE} emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

const Reindeer: React.FC<{ position: [number, number, number]; rotation: [number, number, number] }> = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      {/* Legs */}
      <mesh position={[0.2, -0.3, 0.1]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      <mesh position={[0.2, -0.3, -0.1]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      <mesh position={[-0.2, -0.3, 0.1]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      <mesh position={[-0.2, -0.3, -0.1]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      {/* Head */}
      <mesh position={[0.4, 0.3, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.2]} />
        <meshStandardMaterial color={COLORS.BROWN} />
      </mesh>
      {/* Antlers */}
      <mesh position={[0.45, 0.5, 0.1]}>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.45, 0.5, -0.1]}>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

const SantaSleigh: React.FC<{ visible: boolean }> = ({ visible }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && visible) {
      const t = state.clock.elapsedTime * 0.4;
      const radius = 13;
      groupRef.current.position.x = Math.cos(t) * radius;
      groupRef.current.position.z = Math.sin(t) * radius;
      groupRef.current.position.y = Math.sin(t * 1.5) * 1.5 + 3; // Flying bobbing
      groupRef.current.rotation.y = -t + Math.PI;
      groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.1; // Bank turn
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Sleigh Runners */}
      <mesh position={[0, -0.2, 0.35]}>
        <boxGeometry args={[1.4, 0.05, 0.05]} />
        <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.2, -0.35]}>
        <boxGeometry args={[1.4, 0.05, 0.05]} />
        <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={0.5} />
      </mesh>
      {/* Sleigh Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.8]} />
        <meshStandardMaterial color={COLORS.RED} emissive={COLORS.RED} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.5, 0.4, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.8]} />
        <meshStandardMaterial color={COLORS.RED} />
      </mesh>
      {/* Santa */}
      <mesh position={[-0.1, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color={COLORS.RED} />
      </mesh>
      <mesh position={[-0.1, 0.7, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={COLORS.WHITE} />
      </mesh>
      {/* Santa's Hat */}
      <mesh position={[-0.1, 0.85, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color={COLORS.RED} />
      </mesh>
      {/* Gift Bag */}
      <mesh position={[0.3, 0.3, 0]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color={COLORS.GREEN} />
      </mesh>

      {/* Team of Reindeer */}
      <group position={[2.5, 0, 0]}>
        <Reindeer position={[0, 0, 0.35]} rotation={[0, 0, 0]} />
        <Reindeer position={[0, 0, -0.35]} rotation={[0, 0, 0]} />
        <Reindeer position={[1.8, 0.2, 0.35]} rotation={[0, 0, 0]} />
        <Reindeer position={[1.8, 0.2, -0.35]} rotation={[0, 0, 0]} />
        
        {/* Reins (Neon leads) */}
        <mesh position={[-0.6, 0.1, 0.35]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.02, 0.02]} />
          <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.6, 0.1, -0.35]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.02, 0.02]} />
          <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  );
};

const TreeModule: React.FC<{ 
  data: TreeModuleData; 
  gesture: GestureState; 
  isFocused: boolean;
  isVisible: boolean;
  parentGroupRef: React.RefObject<THREE.Group>;
}> = ({ data, gesture, isFocused, isVisible, parentGroupRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const treePos = useMemo(() => new THREE.Vector3(...data.initialPos), [data.initialPos]);
  const baseScale = data.scale || 1;
  const scatterPos = useMemo(() => new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40), []);
  
  const displayMode = useRef<'tree' | 'scatter'>('tree');
  const texture = data.imageUrl ? useLoader(THREE.TextureLoader, data.imageUrl) : null;
  const aspectRatio = useMemo(() => (texture?.image ? texture.image.width / texture.image.height : 1), [texture]);

  const restingQuat = useMemo(() => {
    if (data.type !== 'photo') return new THREE.Quaternion();
    const [x, , z] = data.initialPos;
    const angleY = Math.atan2(x, z);
    const slope = Math.atan2(TREE_RADIUS, TREE_HEIGHT);
    const q = new THREE.Quaternion();
    const e = new THREE.Euler(slope, angleY, 0, 'YXZ');
    q.setFromEuler(e);
    return q;
  }, [data.initialPos, data.type]);

  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !parentGroupRef.current) return;

    if (!isVisible) {
      meshRef.current.visible = false;
      meshRef.current.scale.set(0,0,0);
      return;
    }
    meshRef.current.visible = true;

    if (gesture === 'scatter') displayMode.current = 'scatter';
    if (gesture === 'gather') displayMode.current = 'tree';

    let targetPos = new THREE.Vector3();
    let lerpRate = 0.08;

    if (isFocused && data.type === 'photo') {
      tempVec.set(0, 0, 8);
      parentGroupRef.current.worldToLocal(tempVec);
      targetPos.copy(tempVec);
      lerpRate = 0.12;
    } else if (displayMode.current === 'scatter') {
      targetPos.copy(scatterPos);
    } else {
      targetPos.copy(treePos);
      if (gesture === 'gather') lerpRate = 0.15;
    }
    
    meshRef.current.position.lerp(targetPos, lerpRate);

    if (isFocused && data.type === 'photo') {
      parentGroupRef.current.getWorldQuaternion(tempQuat).invert();
      meshRef.current.quaternion.slerp(tempQuat, 0.1);
      const zoomSize = 7;
      const targetScale = aspectRatio > 1 
        ? new THREE.Vector3(zoomSize * aspectRatio, zoomSize, 1) 
        : new THREE.Vector3(zoomSize, zoomSize / aspectRatio, 1);
      meshRef.current.scale.lerp(targetScale, 0.12);
    } else if (gesture === 'pointing') {
      meshRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.15);
    } else {
      const scaleVal = data.type === 'photo' ? baseScale * 0.8 : baseScale;
      const targetScale = data.type === 'photo' 
        ? (aspectRatio > 1 ? new THREE.Vector3(scaleVal * aspectRatio, scaleVal, 1) : new THREE.Vector3(scaleVal, scaleVal / aspectRatio, 1))
        : new THREE.Vector3(scaleVal, scaleVal, scaleVal);
      meshRef.current.scale.lerp(targetScale, 0.1);
      if (data.type === 'photo') meshRef.current.quaternion.slerp(restingQuat, 0.1);
      else {
        tempQuat.set(0, 0, 0, 1);
        meshRef.current.quaternion.slerp(tempQuat, 0.1);
      }
    }
  });

  const Geometry = () => {
    switch (data.type) {
      case 'box': return <boxGeometry args={[0.3, 0.3, 0.3]} />;
      case 'cone': return <coneGeometry args={[0.2, 0.4, 8]} />;
      case 'photo': return <planeGeometry args={[1, 1]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.2]} />;
      case 'torus': return <torusGeometry args={[0.15, 0.05, 12, 24]} />;
      default: return <sphereGeometry args={[0.15, 16, 16]} />;
    }
  };

  return (
    <mesh ref={meshRef}>
      <Geometry />
      {data.type === 'photo' ? (
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
      ) : (
        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2.5} />
      )}
    </mesh>
  );
};

const Scene: React.FC<SceneProps> = ({ modules, gesture, palmX, palmY, appStage }) => {
  const rotationSpeed = useRef(-0.02);
  const groupRef = useRef<THREE.Group>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const shownIdsRef = useRef<Set<string>>(new Set());
  const lastFocusTime = useRef(0);

  // Reveal logic
  const [revealedCount, setRevealedCount] = useState(0);
  const revealTimeoutRef = useRef<number | null>(null);
  const revealDelayRef = useRef(300); // Starting delay

  const isFullyRevealed = appStage === 2 && revealedCount >= modules.length;

  useEffect(() => {
    if (appStage === 2 && revealedCount < modules.length) {
      const revealNext = () => {
        setRevealedCount(prev => prev + 1);
        revealDelayRef.current = Math.max(10, revealDelayRef.current * 0.95); // Accelerating reveal
        revealTimeoutRef.current = window.setTimeout(revealNext, revealDelayRef.current);
      };
      revealTimeoutRef.current = window.setTimeout(revealNext, revealDelayRef.current);
    } else if (appStage < 2) {
      setRevealedCount(0);
      revealDelayRef.current = 300;
      if (revealTimeoutRef.current) window.clearTimeout(revealTimeoutRef.current);
    }
    return () => { if (revealTimeoutRef.current) window.clearTimeout(revealTimeoutRef.current); };
  }, [appStage, modules.length, revealedCount]);

  useEffect(() => {
    if (gesture === 'rotateLeft') rotationSpeed.current = Math.max(rotationSpeed.current - 0.005, -0.1);
    else if (gesture === 'rotateRight') rotationSpeed.current = Math.min(rotationSpeed.current + 0.005, 0.1);
  }, [gesture]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (gesture === 'pointing') {
      const now = state.clock.elapsedTime;
      const photoModules = modules.slice(0, revealedCount).filter(m => m.type === 'photo');
      if (!focusedId && photoModules.length > 0 && now - lastFocusTime.current > 0.5) {
        const ry = groupRef.current.rotation.y;
        const cosY = Math.cos(ry);
        const sinY = Math.sin(ry);
        const candidates = photoModules.map(m => {
          const [lx, , lz] = m.initialPos;
          const worldZ = lx * sinY + lz * cosY;
          const isShown = shownIdsRef.current.has(m.id);
          const score = worldZ - (isShown ? 100 : 0);
          return { id: m.id, score, worldZ };
        });
        candidates.sort((a, b) => b.score - a.score);
        const best = candidates[0];
        if (shownIdsRef.current.has(best.id)) {
          shownIdsRef.current.clear();
          candidates.sort((a, b) => b.worldZ - a.worldZ);
          const first = candidates[0];
          setFocusedId(first.id);
          shownIdsRef.current.add(first.id);
        } else {
          setFocusedId(best.id);
          shownIdsRef.current.add(best.id);
        }
        lastFocusTime.current = now;
      }
    } else {
      if (focusedId) {
        setFocusedId(null);
        lastFocusTime.current = state.clock.elapsedTime;
      }
    }

    let speed = rotationSpeed.current;
    const minDrift = 0.003 * Math.sign(rotationSpeed.current || -1);

    if (focusedId) {
      speed = 0;
    } else {
      if (gesture === 'scatter') speed *= 0.4;
      if (Math.abs(speed) < Math.abs(minDrift)) speed = minDrift;
    }

    if (appStage === 0) speed = 0; // Don't rotate when hidden

    groupRef.current.rotation.y += speed * delta * 60;
    const targetTilt = (palmY - 0.5) * 0.8;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTilt, 0.06);
    groupRef.current.rotation.order = 'YXZ';
  });

  return (
    <>
      <group ref={groupRef}>
        <Star position={[0, TREE_HEIGHT / 2 + 1.5, 0]} visible={appStage >= 1} />
        {modules.map((mod, index) => (
          <TreeModule 
            key={mod.id} 
            data={mod} 
            gesture={gesture} 
            isVisible={appStage === 2 && index < revealedCount}
            isFocused={mod.id === focusedId}
            parentGroupRef={groupRef}
          />
        ))}
        {/* Ground level characters */}
        <Snowman position={[6, -TREE_HEIGHT / 2, 4]} visible={isFullyRevealed} />
      </group>

      {/* Characters that follow their own orbit (not the tree group rotation) */}
      <SantaSleigh visible={isFullyRevealed} />
      
      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={1.0} intensity={1.8} mipmapBlur radius={0.5} />
        {gesture === 'pointing' && <Vignette darkness={1.2} />}
      </EffectComposer>
    </>
  );
};

export default Scene;
