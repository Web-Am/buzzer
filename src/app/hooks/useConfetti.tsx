// useConfetti.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export type Particle = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    color: string;
    size: number;
    gravity: number;
    life: number;
    spawnTime: number;
};

type ParticleLayerProps = {
    particles?: Particle[];
    isWinner: boolean;
    showBackground: boolean;
};

export function useParticleEffect() {
    const [particles, setParticles] = useState<Particle[]>([]);
    const frameRef = useRef<number | null>(null);
    const lastSpawnRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    const fireParticles = useCallback((isWinner: boolean) => {
        if (typeof window === 'undefined') return;

        const colorsWin = ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF', '#B983FF'];
        const colorsLose = ['#FF4C4C', '#FF0000', '#B22222'];

        startTimeRef.current = performance.now();
        lastSpawnRef.current = startTimeRef.current;
        setParticles([]);

        const animate = (time: number) => {
            if (time - lastSpawnRef.current > 120) {
                lastSpawnRef.current = time;

                setParticles(prev => [
                    ...prev,
                    {
                        id: time + Math.random(),
                        x: Math.random() * window.innerWidth,
                        y: -5,
                        vx: (Math.random() - 0.5) * 0.6,
                        vy: Math.random() * 0.4 + 0.3,
                        rotation: Math.random() * 360,
                        rotationSpeed: (Math.random() - 0.5) * 0.4,
                        color: isWinner
                            ? colorsWin[Math.floor(Math.random() * colorsWin.length)]
                            : colorsLose[Math.floor(Math.random() * colorsLose.length)],
                        size: isWinner ? Math.random() * 14 + 18 : Math.random() * 8 + 10,
                        gravity: isWinner ? 0.02 : 0.03,
                        life: 30000,
                        spawnTime: time
                    }
                ]);
            }

            setParticles(prev =>
                prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.vx + Math.sin((time - p.spawnTime) / 800) * 0.2,
                        y: p.y + p.vy,
                        vy: p.vy + p.gravity,
                        rotation: p.rotation + p.rotationSpeed
                    }))
                    .filter(p => p.y < window.innerHeight + 120)
            );

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    return { particles, fireParticles };
}

export function ParticleLayer({ particles = [], isWinner, showBackground }: ParticleLayerProps) {
    if (!particles.length && !showBackground) return null;

    return (
        <>
            {showBackground && (
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        backgroundColor: isWinner
                            ? 'rgba(144, 238, 144, 0.25)'
                            : 'rgba(255, 99, 71, 0.25)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 49, // sotto il modal
                        margin: 0,
                        padding: 0,
                        top: 0,
                        left: 0
                    }}
                />
            )}

            <div
                className="fixed inset-0 pointer-events-none"
                style={{ zIndex: 51 }} // sopra il modal
            >
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="absolute"
                        style={{
                            left: p.x,
                            top: p.y,
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            borderRadius: isWinner ? 999 : 2,
                            transform: `rotate(${p.rotation}deg)`,
                            opacity: 0.9
                        }}
                    />
                ))}
            </div>
        </>
    );
}
