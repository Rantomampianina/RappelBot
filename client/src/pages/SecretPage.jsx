import React, { useEffect, useRef } from 'react';
import { Home, Rocket, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecretPage = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Stars
        const stars = Array.from({ length: 200 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.2, // Very slow horizontal drift
            vy: (Math.random() - 0.5) * 0.2, // Very slow vertical drift
            alpha: Math.random(),
            twinkleSpeed: Math.random() * 0.05
        }));

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 30, 0.2)'; // Trail effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                // Update position
                star.x += star.vx;
                star.y += star.vy;

                // Wrap around screen
                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;

                // Twinkle
                star.alpha += star.twinkleSpeed;
                if (star.alpha > 1 || star.alpha < 0.2) star.twinkleSpeed = -star.twinkleSpeed;

                // Draw star
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "white";
                ctx.fill();
            });

            animationFrameId = window.requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-black overflow-hidden text-white flex flex-col items-center justify-center font-mono">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            {/* Content */}
            <div className="relative z-10 text-center space-y-8 p-6">
                <div className="inline-block animate-bounce mb-8">
                    <Rocket className="w-24 h-24 text-purple-500 transform rotate-45" />
                </div>

                <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
                    SECRET LEVEL
                </h1>

                <p className="text-xl md:text-2xl text-purple-200 typewriter">
                    vous avez trouvé la galaxie cachée... 🌌
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl">
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:scale-110 cursor-pointer group">
                        <Star className="w-8 h-8 text-yellow-400 mx-auto mb-4 group-hover:rotate-180 transition-transform" />
                        <h3 className="font-bold text-lg mb-2">Projets Futurs</h3>
                        <p className="text-sm text-gray-400">Dashboard V3 avec IA prédictive</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all hover:scale-110 cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-4 animate-pulse"></div>
                        <h3 className="font-bold text-lg mb-2">Mode Sombre ?</h3>
                        <p className="text-sm text-gray-400">Déjà activé par défaut 😉</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all hover:scale-110 cursor-pointer group">
                        <code className="text-green-400 text-2xl font-bold block mb-2">{`{ code }`}</code>
                        <h3 className="font-bold text-lg mb-2">Dev Zone</h3>
                        <p className="text-sm text-gray-400">Rien à voir ici...</p>
                    </div>
                </div>

                <div className="mt-20">
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition text-sm">
                        <Home className="w-4 h-4" /> Retour sur Terre
                    </Link>
                </div>
            </div>

            <style>{`
        .typewriter {
            overflow: hidden;
            border-right: .15em solid orange;
            white-space: nowrap;
            margin: 0 auto;
            letter-spacing: .15em;
            animation: 
              typing 3.5s steps(40, end),
              blink-caret .75s step-end infinite;
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: rgba(168, 85, 247, 0.8) }
        }
      `}</style>
        </div>
    );
};

export default SecretPage;
