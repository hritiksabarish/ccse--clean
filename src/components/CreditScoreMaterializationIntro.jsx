import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const PARTICLE_COUNT = 4000;

// Helper to sample text into an array of localized 3D points
const sampleTextPoints = (text, width, height, density) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const points = [];
    // Sample pixels
    for (let y = 0; y < height; y += density) {
        for (let x = 0; x < width; x += density) {
            const index = (y * width + x) * 4;
            if (data[index] > 128) {
                // Map 2D pixel coordinates to 3D center space
                const px = (x - width / 2) * 0.04;
                const py = -(y - height / 2) * 0.04;
                points.push(new THREE.Vector3(px, py, 0));
            }
        }
    }
    return points;
};

const ParticleSystem = () => {
    const pointsRef = useRef();
    const materialRef = useRef();
    const { mouse, viewport } = useThree();

    // Generate target points for all texts once
    const targets = useMemo(() => {
        const w = 800;
        const h = 300;
        const density = 4;
        return {
            climate: sampleTextPoints('CLIMATE', w, h, density),
            credit: sampleTextPoints('CREDIT', w, h, density),
            score: sampleTextPoints('SCORE', w, h, density),
            ai: sampleTextPoints('AI', w, h, density),
        };
    }, []);

    // Initialize particle properties
    const { positions, colors, randomOffsets, randomSpeeds } = useMemo(() => {
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        const col = new Float32Array(PARTICLE_COUNT * 3);
        const ropts = new Float32Array(PARTICLE_COUNT * 3);
        const rspeeds = new Float32Array(PARTICLE_COUNT);

        const color1 = new THREE.Color('#ffffff');
        const color2 = new THREE.Color('#f97316'); // Orange

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Initial random spread across the screen
            pos[i * 3] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;

            // Random drift properties
            ropts[i * 3] = (Math.random() - 0.5) * 2;
            ropts[i * 3 + 1] = (Math.random() - 0.5) * 2;
            ropts[i * 3 + 2] = (Math.random() - 0.5) * 2;
            rspeeds[i] = Math.random() * 2 + 1;

            // Mix 70% orange, 30% white
            const mixedColor = Math.random() > 0.3 ? color2 : color1;
            col[i * 3] = mixedColor.r;
            col[i * 3 + 1] = mixedColor.g;
            col[i * 3 + 2] = mixedColor.b;
        }

        return { positions: pos, colors: col, randomOffsets: ropts, randomSpeeds: rspeeds };
    }, []);

    const currentTargetsRef = useRef(new Float32Array(PARTICLE_COUNT * 3));

    // Frame loop
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (!pointsRef.current) return;

        const posAttribute = pointsRef.current.geometry.attributes.position;

        // Time logic mapping
        // Phase 1 (0-0.5s): Black screen, opacity 0
        // Phase 2 (0.5-1.5s): Particles appear randomly (chaos)
        // Phase 3 (1.5-2.5s): Morphing phase
        // Morph sub-phases:
        // 1.5 - 1.75: CLIMATE
        // 1.75 - 2.0: CREDIT
        // 2.0 - 2.25: SCORE
        // 2.25 - 2.5: AI
        // Phase 4 (2.5-3.5s): Transform out/fade

        let opacity = 0;
        let targetDataset = null;
        let isMorphing = false;
        let collapseProgress = 0; // for Phase 4

        if (t < 0.5) {
            opacity = 0;
        } else if (t < 1.5) {
            // Phase 2: Chaos fade in
            opacity = Math.min(1, (t - 0.5) * 2);
        } else if (t < 2.5) {
            // Phase 3: Morphing sequence
            opacity = 1;
            isMorphing = true;
            if (t < 1.75) targetDataset = targets.climate;
            else if (t < 2.0) targetDataset = targets.credit;
            else if (t < 2.25) targetDataset = targets.score;
            else targetDataset = targets.ai;
        } else if (t < 3.5) {
            // Phase 4: Collapse and fade
            opacity = Math.max(0, 1 - (t - 2.5));
            isMorphing = true;
            targetDataset = targets.ai;
            collapseProgress = (t - 2.5) * 5; // explode outward or collapse
        }

        if (materialRef.current) {
            materialRef.current.opacity = opacity;
        }

        // Mouse position in world space
        const mx = (mouse.x * viewport.width) / 2;
        const my = (mouse.y * viewport.height) / 2;

        // Update positions
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const idx = i * 3;

            let tx, ty, tz;

            if (isMorphing && targetDataset && targetDataset.length > 0) {
                // Pick a mapped target point (looping over if fewer targets than particles)
                const target = targetDataset[i % targetDataset.length];
                tx = target.x;
                ty = target.y;
                tz = target.z;

                // Add slight jitter so it doesn't look too rigid
                tx += Math.sin(t * randomSpeeds[i] + randomOffsets[idx]) * 0.05;
                ty += Math.cos(t * randomSpeeds[i] + randomOffsets[idx + 1]) * 0.05;

                if (t >= 2.5) {
                    // Phase 4 explosion scaling
                    tx *= (1 + collapseProgress);
                    ty *= (1 + collapseProgress);
                    tz += collapseProgress * randomOffsets[idx + 2] * 5;
                }

            } else {
                // Chaos mode target (moving randomly)
                tx = positions[idx] + Math.sin(t * randomSpeeds[i]) * 2;
                ty = positions[idx + 1] + Math.cos(t * randomSpeeds[i]) * 2;
                tz = positions[idx + 2] + Math.sin(t * randomSpeeds[i]) * 2;
            }

            // Mouse repulsion
            const dx = tx - mx;
            const dy = ty - my;
            const distSq = dx * dx + dy * dy;
            if (distSq < 4 && isMorphing) {
                const force = (4 - distSq) / 4;
                tx += dx * force * 0.5;
                ty += dy * force * 0.5;
            }

            // Interpolate current position to target
            const currentX = posAttribute.array[idx];
            const currentY = posAttribute.array[idx + 1];
            const currentZ = posAttribute.array[idx + 2];

            const lerpFactor = isMorphing ? 0.2 : 0.05;

            posAttribute.array[idx] = currentX + (tx - currentX) * lerpFactor;
            posAttribute.array[idx + 1] = currentY + (ty - currentY) * lerpFactor;
            posAttribute.array[idx + 2] = currentZ + (tz - currentZ) * lerpFactor;
        }

        posAttribute.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                size={0.06}
                vertexColors
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default function CreditScoreMaterializationIntro({ onComplete }) {
    useEffect(() => {
        // Exactly 3.5 seconds duration
        const timer = setTimeout(() => {
            onComplete();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ position: 'fixed', inset: 0, backgroundColor: '#0a0a0a', zIndex: 9999 }}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }} gl={{ alpha: false, antialias: true }}>
                <fog attach="fog" args={['#0a0a0a', 5, 20]} />
                <ParticleSystem />
            </Canvas>
        </motion.div>
    );
}
