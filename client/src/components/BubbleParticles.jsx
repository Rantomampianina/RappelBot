import React, { useState } from 'react';

const BubbleParticles = () => {
  // Helper function defined inside or outside, but here inside to keep it self-contained in the diff
  // Initializing state lazily to avoid useEffect and extra renders
  const [bubbles] = useState(() => {
    const getRandomColor = () => {
      const colors = [
        'rgba(6, 182, 212, 0.3)', // Cyan
        'rgba(124, 58, 237, 0.3)', // Purple
        'rgba(59, 130, 246, 0.3)', // Blue
        'rgba(255, 255, 255, 0.2)', // White transparent
        'rgba(167, 139, 250, 0.3)', // Light purple
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (%)
      size: Math.random() * 40 + 20, // Size between 20-60px
      duration: Math.random() * 10 + 15, // Animation duration 15-25s
      delay: Math.random() * 10, // Random start delay
      opacity: Math.random() * 0.4 + 0.1, // Opacity 0.1-0.5
      color: getRandomColor(),
    }));
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bubble"
          style={{
            left: `${bubble.left}%`,
            bottom: '-100px',
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: `radial-gradient(circle at 30% 30%, ${bubble.color}, transparent)`,
            backdropFilter: 'blur(2px)',
            border: `1px solid ${bubble.color}`,
            animation: `rise ${bubble.duration}s ease-in infinite`,
            animationDelay: `${bubble.delay}s`,
            opacity: bubble.opacity,
          }}
        />
      ))}
      
      <style>{`
        @keyframes rise {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-110vh) translateX(30px) scale(1.5);
            opacity: 0;
          }
        }
        
        .bubble {
          box-shadow: 
            inset -5px -5px 15px rgba(255, 255, 255, 0.2),
            0 0 20px rgba(6, 182, 212, 0.1);
        }
      `}</style>
    </div>
  );
};

export default BubbleParticles;
