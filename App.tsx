import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import Scene from './components/Scene';
import HandTracker from './components/HandTracker';
import SnowEffect from './components/SnowEffect';
import { GestureState, TreeModuleData, AppStage } from './types';
import { MODULE_COUNT, COLORS, TREE_HEIGHT, TREE_RADIUS } from './constants';

// Fixed images array - place your images in public/images/ folder
const FIXED_IMAGES = [
  `${import.meta.env.BASE_URL}images/1.jpg`,
  `${import.meta.env.BASE_URL}images/2.jpg`,
  `${import.meta.env.BASE_URL}images/3.jpg`,
  `${import.meta.env.BASE_URL}images/4.jpg`,
  `${import.meta.env.BASE_URL}images/5.jpg`,
  `${import.meta.env.BASE_URL}images/6.jpg`,
  `${import.meta.env.BASE_URL}images/7.jpg`,
  `${import.meta.env.BASE_URL}images/8.jpg`,
  `${import.meta.env.BASE_URL}images/9.jpg`,
];

// Music files array - place your music in public/music/ folder
const MUSIC_FILES = [
  `${import.meta.env.BASE_URL}music/all-I-want-for-christmas-is-you.mp3`,
  `${import.meta.env.BASE_URL}music/jingle-bells.mp3`,
  `${import.meta.env.BASE_URL}music/beautiful-christmas.mp3`,
];

const App: React.FC = () => {
  const [gesture, setGesture] = useState<GestureState>('idle');
  const [palmX, setPalmX] = useState(0.5);
  const [palmY, setPalmY] = useState(0.5);
  const [appStage, setAppStage] = useState<AppStage>(0);
  const lastGestureRef = useRef<GestureState>('idle');
  const controlsRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showOkMessage, setShowOkMessage] = useState(false);

  const [modules, setModules] = useState<TreeModuleData[]>(() => {
    const initial: TreeModuleData[] = [];
    for (let i = 0; i < MODULE_COUNT; i++) {
      const h = Math.random() * TREE_HEIGHT;
      const r = (TREE_RADIUS * (TREE_HEIGHT - h)) / TREE_HEIGHT;
      const theta = Math.random() * Math.PI * 2;
      const types: ('sphere' | 'box' | 'cone' | 'dodecahedron' | 'torus')[] = 
        ['sphere', 'box', 'cone', 'dodecahedron', 'torus'];
      const type = types[Math.floor(Math.random() * types.length)];
      let color = COLORS.RED;
      if (type === 'box') color = COLORS.GREEN;
      else if (type === 'cone') color = COLORS.BLUE;
      else if (type === 'dodecahedron') color = COLORS.GOLD;
      else if (type === 'torus') color = '#ff00ff';
      initial.push({
        id: `mod-${i}`,
        type,
        color,
        scale: 1,
        initialPos: [Math.cos(theta) * r, h - TREE_HEIGHT / 2, Math.sin(theta) * r]
      });
    }
    const ORANGE_COUNT = Math.floor(MODULE_COUNT / 2);
    for (let i = 0; i < ORANGE_COUNT; i++) {
      const h = Math.random() * TREE_HEIGHT;
      const r = (TREE_RADIUS * (TREE_HEIGHT - h)) / TREE_HEIGHT;
      const theta = Math.random() * Math.PI * 2;
      initial.push({
        id: `orange-${i}`,
        type: 'sphere',
        color: COLORS.ORANGE,
        scale: 0.6,
        initialPos: [Math.cos(theta) * r, h - TREE_HEIGHT / 2, Math.sin(theta) * r]
      });
    }
    // Add fixed photo modules
    FIXED_IMAGES.forEach((url, index) => {
      const h = Math.random() * (TREE_HEIGHT - 1) + 0.5;
      const r = (TREE_RADIUS * (TREE_HEIGHT - h)) / TREE_HEIGHT + 0.25;
      const theta = Math.random() * Math.PI * 2;
      initial.push({
        id: `fixed-photo-${index}`,
        type: 'photo',
        color: '#ffffff',
        imageUrl: url,
        scale: 1.2,
        initialPos: [Math.cos(theta) * r, h - TREE_HEIGHT / 2, Math.sin(theta) * r],
      });
    });
    return initial;
  });

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = 5;
      controlsRef.current.maxDistance = 35;
      controlsRef.current.dampingFactor = 0.05;
    }
  }, []);

  // Music playback effect - start playing when tree is fully revealed
  useEffect(() => {
    const isFullyRevealed = appStage === 2;
    
    if (isFullyRevealed && !isMusicPlaying) {
      // Initialize audio element if not exists
      if (!audioRef.current) {
        audioRef.current = new Audio(MUSIC_FILES[currentMusicIndex]);
        audioRef.current.volume = 0.5;
      }
      
      // Play music
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
      setIsMusicPlaying(true);
    } else if (!isFullyRevealed && isMusicPlaying) {
      // Pause music if tree is not fully revealed
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsMusicPlaying(false);
    }
    
    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [appStage, isMusicPlaying]);

  // Effect to change music when currentMusicIndex changes
  useEffect(() => {
    if (audioRef.current && isMusicPlaying) {
      // Remove old event listener
      const handleMusicEnd = () => {
        setCurrentMusicIndex((prevIndex) => (prevIndex + 1) % MUSIC_FILES.length);
      };
      
      // Change music source
      audioRef.current.src = MUSIC_FILES[currentMusicIndex];
      
      // Add new event listener for this song
      audioRef.current.addEventListener('ended', handleMusicEnd);
      
      // Play the new song
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
      
      // Cleanup function to remove event listener
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleMusicEnd);
        }
      };
    }
  }, [currentMusicIndex, isMusicPlaying]);



  const onGestureChange = useCallback((newGesture: GestureState, x: number, y: number) => {
    // Stage transition logic on 'peace' gesture event (transition from not-peace to peace)
    if (newGesture === 'peace' && lastGestureRef.current !== 'peace') {
      setAppStage(prev => (prev < 2 ? (prev + 1) as AppStage : prev));
    }
    // OK gesture logic - show message when OK gesture is detected
    if (newGesture === 'ok' && lastGestureRef.current !== 'ok') {
      setShowOkMessage(true);
    } else if (newGesture !== 'ok' && lastGestureRef.current === 'ok') {
      setShowOkMessage(false);
    }
    lastGestureRef.current = newGesture;
    setGesture(newGesture);
    setPalmX(x);
    setPalmY(y);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Snow Effect - Always visible */}
      <SnowEffect />
      
      {/* OK Gesture Message */}
      {showOkMessage && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-4">
          <div className="bg-black/70 backdrop-blur-xl px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 lg:px-16 lg:py-12 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-yellow-400/50 shadow-2xl animate-pulse max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw]">
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-400 to-pink-500 text-center leading-relaxed"
               style={{
                 textShadow: `
                   0 0 20px rgba(255, 215, 0, 0.8),
                   0 0 40px rgba(255, 100, 100, 0.6),
                   0 0 60px rgba(255, 100, 100, 0.4)
                 `,
                 fontFamily: "'Pacifico', 'Lobster', cursive"
               }}>
              🎄 愿我的小vicky每一天都充满欢乐与温暖 🎄
            </p>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-yellow-200 text-center mt-3 sm:mt-4 md:mt-5 lg:mt-6 font-light"
               style={{
                 textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
               }}>
              Merry Christmas ! 🎅✨
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-pink-200 text-center mt-4 sm:mt-5 md:mt-6 lg:mt-8 leading-relaxed max-w-full mx-auto font-light italic"
               style={{
                 textShadow: '0 0 8px rgba(255, 182, 193, 0.6)',
                 fontFamily: "'Georgia', 'Times New Roman', serif"
               }}>
              I like you. It's not because you look good, but because of the feelings you give me at special moments. You make me feel things that others can't. As for your appearance, I like that too. 💕
            </p>
          </div>
        </div>
      )}
      
      {/* Merry Christmas Title - Only show at stage 0 */}
      {appStage === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-300 via-green-400 via-yellow-300 to-red-600 animate-pulse text-center"
            style={{
              fontFamily: "'Pacifico', 'Lobster', 'Dancing Script', 'Great Vibes', 'Satisfy', cursive",
              textShadow: `
                0 0 15px rgba(255, 215, 0, 1),
                0 0 30px rgba(255, 215, 0, 0.8),
                0 0 45px rgba(255, 100, 100, 0.6),
                0 0 60px rgba(255, 100, 100, 0.5),
                0 0 75px rgba(100, 255, 100, 0.4),
                0 0 90px rgba(100, 255, 100, 0.3),
                0 8px 20px rgba(0, 0, 0, 0.6)
              `,
              WebkitTextStroke: '2px #FFD700',
              letterSpacing: '0.1em',
              transform: 'rotate(-3deg) scale(1.05)',
              filter: 'drop-shadow(0 15px 30px rgba(255, 215, 0, 0.5))',
              fontWeight: '900'
            }}
          >
            Merry Christmas
          </h1>
        </div>
      )}

      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          Neon Xmas Tree
        </h1>
        <div className="mt-2 space-y-1">
          {appStage === 0 && <p className="text-yellow-400 font-bold animate-pulse">✌️ Make a Peace sign to ignite the star!</p>}
          {appStage === 1 && <p className="text-green-400 font-bold animate-pulse">✌️ Peace sign again to reveal the tree!</p>}
          {appStage === 2 && (
            <>
              <p className="text-slate-400 font-light">
                🖐 Open: Scatter | ✊ Fist: Gather | 👈/👉 Move: Rotate | ☝ Point: Cycle Photos | 👌 OK: Show Message
              </p>
              <p className="text-slate-500 text-xs">✌️ Peace to toggle stages (debug)</p>
            </>
          )}
        </div>
      </div>

      {appStage === 2 && (
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-4 items-end">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-[10px] uppercase tracking-widest text-slate-400">
            Status: <span className="text-green-400 font-bold ml-1">{gesture}</span>
          </div>
        </div>
      )}

      <div className="absolute top-6 right-6 z-10 w-48 h-36 border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-black/40">
        <HandTracker onGestureUpdate={onGestureChange} />
      </div>

      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 2, 18]} fov={45} />
        <color attach="background" args={['#010409']} />
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} color={COLORS.GOLD} />
        <Scene modules={modules} gesture={gesture} palmX={palmX} palmY={palmY} appStage={appStage} />
        <OrbitControls ref={controlsRef} enableDamping />
      </Canvas>
    </div>
  );
};

export default App;
