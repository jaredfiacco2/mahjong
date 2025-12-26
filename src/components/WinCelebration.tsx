// Win celebration with confetti and fireworks animation
import React, { useEffect, useState, useCallback, useMemo } from 'react';

interface Confetti {
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    rotation: number;
}

interface Firework {
    id: number;
    x: number;
    y: number;
    particles: {
        angle: number;
        velocity: number;
        color: string;
        size: number;
    }[];
}

interface WinCelebrationProps {
    elapsedTime: number;
    matchesMade: number;
    score: number;
    onPlayAgain: () => void;
    onChangeLayout: () => void;
}

const CONFETTI_COLORS = [
    '#ffd54f', '#ff6d00', '#ff1744', '#d500f9',
    '#651fff', '#00e676', '#00bcd4', '#2979ff'
];

const FIREWORK_COLORS = [
    '#ffd54f', '#ff6d00', '#ff5252', '#e040fb',
    '#7c4dff', '#00e676', '#00bcd4', '#448aff'
];

export const WinCelebration: React.FC<WinCelebrationProps> = ({
    elapsedTime,
    matchesMade,
    score,
    onPlayAgain,
    onChangeLayout,
}) => {
    const [confetti, setConfetti] = useState<Confetti[]>([]);
    const [fireworks, setFireworks] = useState<Firework[]>([]);
    const [showContent, setShowContent] = useState(false);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate rating based on time
    const rating = useMemo(() => {
        if (elapsedTime < 180) return { stars: 3, text: 'Perfect!' };
        if (elapsedTime < 300) return { stars: 2, text: 'Great!' };
        return { stars: 1, text: 'Good!' };
    }, [elapsedTime]);

    // Create confetti on mount
    useEffect(() => {
        const newConfetti: Confetti[] = [];
        for (let i = 0; i < 150; i++) {
            newConfetti.push({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 3,
                duration: 2 + Math.random() * 3,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                size: 8 + Math.random() * 8,
                rotation: Math.random() * 360,
            });
        }
        setConfetti(newConfetti);

        // Show content with delay for dramatic effect
        setTimeout(() => setShowContent(true), 300);
    }, []);

    // Create periodic fireworks
    const createFirework = useCallback(() => {
        const particles = [];
        const particleCount = 12;
        const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                angle: (Math.PI * 2 * i) / particleCount,
                velocity: 80 + Math.random() * 40,
                color,
                size: 6 + Math.random() * 6,
            });
        }

        const firework: Firework = {
            id: Date.now() + Math.random(),
            x: 15 + Math.random() * 70,
            y: 15 + Math.random() * 40,
            particles,
        };

        setFireworks(prev => [...prev.slice(-5), firework]);
    }, []);

    useEffect(() => {
        // Initial burst of fireworks
        setTimeout(createFirework, 100);
        setTimeout(createFirework, 300);
        setTimeout(createFirework, 500);

        // Periodic fireworks
        const interval = setInterval(createFirework, 1200);
        return () => clearInterval(interval);
    }, [createFirework]);

    // Remove old fireworks
    useEffect(() => {
        const cleanup = setInterval(() => {
            setFireworks(prev => prev.filter(f => Date.now() - f.id < 2000));
        }, 500);
        return () => clearInterval(cleanup);
    }, []);

    return (
        <div className="win-overlay">
            {/* Confetti layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {confetti.map(c => (
                    <div
                        key={c.id}
                        className="confetti"
                        style={{
                            left: `${c.x}%`,
                            top: '-20px',
                            width: `${c.size}px`,
                            height: `${c.size * 0.6}px`,
                            backgroundColor: c.color,
                            animationDelay: `${c.delay}s`,
                            animationDuration: `${c.duration}s`,
                            transform: `rotate(${c.rotation}deg)`,
                        }}
                    />
                ))}
            </div>

            {/* Fireworks layer */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {fireworks.map(fw => (
                    <g key={fw.id}>
                        {fw.particles.map((p, i) => {
                            const age = (Date.now() - fw.id) / 1000;
                            const progress = Math.min(age / 1.5, 1);
                            const x = (fw.x / 100) * window.innerWidth + Math.cos(p.angle) * p.velocity * progress;
                            const y = (fw.y / 100) * window.innerHeight + Math.sin(p.angle) * p.velocity * progress + 50 * progress * progress;
                            const opacity = 1 - progress;
                            const scale = 1 - progress * 0.5;

                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r={p.size * scale}
                                    fill={p.color}
                                    opacity={opacity}
                                    filter="url(#glow)"
                                />
                            );
                        })}
                    </g>
                ))}
            </svg>

            {/* Win message */}
            {showContent && (
                <div className="relative text-center p-8 z-10" style={{ animation: 'modalSlideIn 0.5s ease-out' }}>
                    <h1 className="win-title">
                        🎊 You Win! 🎊
                    </h1>

                    {/* Star rating */}
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3].map(star => (
                            <span
                                key={star}
                                className={`text-4xl transition-all duration-500 ${star <= rating.stars ? 'opacity-100 scale-100' : 'opacity-30 scale-75'}`}
                                style={{
                                    animation: star <= rating.stars ? 'winBounce 0.5s ease-out backwards' : 'none',
                                    animationDelay: `${0.3 + star * 0.15}s`
                                }}
                            >
                                ⭐
                            </span>
                        ))}
                    </div>
                    <p className="text-xl text-[var(--color-accent-gold)] font-semibold mb-6">{rating.text}</p>

                    <div className="stats-panel mx-auto mb-8 justify-center inline-flex">
                        <div className="stat-item">
                            <span className="stat-value text-3xl">{score.toLocaleString()}</span>
                            <span className="stat-label">Score</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 mx-4" />
                        <div className="stat-item">
                            <span className="stat-value text-3xl">{formatTime(elapsedTime)}</span>
                            <span className="stat-label">Time</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 mx-4" />
                        <div className="stat-item">
                            <span className="stat-value text-3xl">{matchesMade}</span>
                            <span className="stat-label">Matches</span>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            className="game-button game-button-primary text-lg px-8 py-4"
                            onClick={onPlayAgain}
                        >
                            🎮 Play Again
                        </button>
                        <button
                            className="game-button text-lg px-8 py-4"
                            onClick={onChangeLayout}
                        >
                            🔄 Change Layout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WinCelebration;
