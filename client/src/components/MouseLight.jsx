import React, { useEffect, useState } from 'react';

const MouseLight = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-opacity duration-300"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        transform: 'translate(-50%, -50%)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Main glow */}
      <div
        className="absolute"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 30%, transparent 70%)',
          filter: 'blur(40px)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Inner bright spot */}
      <div
        className="absolute"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Core highlight */}
      <div
        className="absolute"
        style={{
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
          filter: 'blur(10px)',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};

export default MouseLight;
