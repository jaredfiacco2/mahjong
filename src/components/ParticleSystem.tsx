// Particle effect system for match celebrations
import React, { useEffect, useState, useCallback } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
    maxLife: number;
    rotation: number;
    rotationSpeed: number;
    type: 'circle' | 'star' | 'square';
}

interface MatchEffect {
    id: number;
    x: number;
    y: number;
    scale: number;
    opacity: number;
}

interface ParticleSystemProps {
    trigger: { x: number; y: number; combo: number } | null;
    onComplete?: () => void;
}

const COLORS = [
    '#ffd54f', '#ffab00', '#ff6d00', '#ff5252',
    '#e040fb', '#7c4dff', '#448aff', '#00e676', '#00bcd4'
];

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ trigger, onComplete }) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [matchEffects, setMatchEffects] = useState<MatchEffect[]>([]);

    // Create explosion of particles at position
    const createExplosion = useCallback((x: number, y: number, combo: number) => {
        const particleCount = 15 + combo * 8; // More particles for combos
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 3 + Math.random() * 5 + combo;
            const types: ('circle' | 'star' | 'square')[] = ['circle', 'star', 'square'];

            newParticles.push({
                id: Date.now() + i + Math.random(),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: 4 + Math.random() * 6 + combo,
                life: 60 + combo * 10,
                maxLife: 60 + combo * 10,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 20,
                type: types[Math.floor(Math.random() * types.length)],
            });
        }

        setParticles(prev => [...prev, ...newParticles]);

        // Add match ring effect
        setMatchEffects(prev => [...prev, {
            id: Date.now(),
            x,
            y,
            scale: 0,
            opacity: 1,
        }]);
    }, []);

    // Trigger explosion when position changes
    useEffect(() => {
        if (trigger) {
            createExplosion(trigger.x, trigger.y, trigger.combo);
        }
    }, [trigger, createExplosion]);

    // Animate particles
    useEffect(() => {
        if (particles.length === 0 && matchEffects.length === 0) return;

        const animate = () => {
            setParticles(prev =>
                prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.vx,
                        y: p.y + p.vy + 0.3, // gravity
                        vy: p.vy + 0.15,
                        vx: p.vx * 0.98,
                        life: p.life - 1,
                        rotation: p.rotation + p.rotationSpeed,
                        size: p.size * 0.98,
                    }))
                    .filter(p => p.life > 0)
            );

            setMatchEffects(prev =>
                prev
                    .map(e => ({
                        ...e,
                        scale: e.scale + 0.15,
                        opacity: e.opacity - 0.03,
                    }))
                    .filter(e => e.opacity > 0)
            );
        };

        const interval = setInterval(animate, 16);
        return () => clearInterval(interval);
    }, [particles.length, matchEffects.length]);

    // Notify complete
    useEffect(() => {
        if (particles.length === 0 && matchEffects.length === 0 && trigger) {
            onComplete?.();
        }
    }, [particles.length, matchEffects.length, trigger, onComplete]);

    if (particles.length === 0 && matchEffects.length === 0) return null;

    return (
        <svg
            className="fixed inset-0 pointer-events-none z-[200]"
            style={{ width: '100%', height: '100%' }}
        >
            <defs>
                <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Match ring effects */}
            {matchEffects.map(effect => (
                <circle
                    key={effect.id}
                    cx={effect.x}
                    cy={effect.y}
                    r={30 + effect.scale * 50}
                    fill="none"
                    stroke="#ffc107"
                    strokeWidth={3 - effect.scale * 2}
                    opacity={effect.opacity}
                    filter="url(#particleGlow)"
                />
            ))}

            {/* Particles */}
            {particles.map(p => {
                const opacity = p.life / p.maxLife;

                if (p.type === 'star') {
                    // 4-point star
                    const points = [];
                    for (let i = 0; i < 8; i++) {
                        const angle = (Math.PI * 2 * i) / 8 + (p.rotation * Math.PI / 180);
                        const r = i % 2 === 0 ? p.size : p.size * 0.4;
                        points.push(`${p.x + Math.cos(angle) * r},${p.y + Math.sin(angle) * r}`);
                    }
                    return (
                        <polygon
                            key={p.id}
                            points={points.join(' ')}
                            fill={p.color}
                            opacity={opacity}
                            filter="url(#particleGlow)"
                        />
                    );
                }

                if (p.type === 'square') {
                    return (
                        <rect
                            key={p.id}
                            x={p.x - p.size / 2}
                            y={p.y - p.size / 2}
                            width={p.size}
                            height={p.size}
                            fill={p.color}
                            opacity={opacity}
                            transform={`rotate(${p.rotation} ${p.x} ${p.y})`}
                            filter="url(#particleGlow)"
                        />
                    );
                }

                return (
                    <circle
                        key={p.id}
                        cx={p.x}
                        cy={p.y}
                        r={p.size}
                        fill={p.color}
                        opacity={opacity}
                        filter="url(#particleGlow)"
                    />
                );
            })}
        </svg>
    );
};

export default ParticleSystem;
