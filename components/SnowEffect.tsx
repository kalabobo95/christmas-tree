import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
  opacity: number;
}

const SnowEffect: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Generate 30 snowflakes with random properties
    const flakes: Snowflake[] = [];
    for (let i = 0; i < 30; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100, // Random horizontal position (0-100%)
        animationDuration: 10 + Math.random() * 10, // Faster fall: 10-20 seconds (50% faster)
        size: 15 + Math.random() * 20, // Size: 15-35px
        delay: Math.random() * 10, // Random start delay: 0-10s
        opacity: 0.3 + Math.random() * 0.4, // Opacity: 0.3-0.7 (more transparent)
      });
    }
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-fall"
          style={{
            left: `${flake.left}%`,
            top: '-50px',
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            opacity: flake.opacity,
          }}
        >
          {/* White Circle Snowflake */}
          <div
            style={{
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.6), 0 0 8px rgba(255, 255, 255, 0.3)',
            }}
          />
        </div>
      ))}
      
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        .animate-fall {
          animation-name: fall;
        }
      `}</style>
    </div>
  );
};

export default SnowEffect;
