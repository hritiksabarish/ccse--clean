import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Torus, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const CoreScene = ({ onFinish }) => {
    const sphereRef = useRef();
    const ring1Ref = useRef();
    const ring2Ref = useRef();
    const particlesRef = useRef();
    const materialRef = useRef();

    // Create particles data
    const particlesCount = 200;
    const positions = useMemo(() => {
        const pos = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount; i++) {
            const r = 3 + Math.random() * 5;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        return pos;
    }, [particlesCount]);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;

        // Phase 1 (0–2 sec): Sphere appears and starts glowing
        if (t < 2) {
            const progress = t / 2; // 0 to 1
            if (sphereRef.current) {
                sphereRef.current.scale.setScalar(progress);
            }
            if (materialRef.current) {
                materialRef.current.emissiveIntensity = progress * 2;
                materialRef.current.opacity = progress;
            }
        } else if (t >= 2 && t < 4) {
            // Phase 2 (2–4 sec): Rings and particles begin orbiting, Camera moves
            const progress = (t - 2) / 2;
            if (ring1Ref.current && ring2Ref.current) {
                ring1Ref.current.scale.setScalar(Math.min(progress * 2, 1));
                ring2Ref.current.scale.setScalar(Math.min(progress * 2, 1));
                ring1Ref.current.rotation.x += delta * 1.5;
                ring1Ref.current.rotation.y += delta * 1.2;
                ring2Ref.current.rotation.x -= delta * 1.1;
                ring2Ref.current.rotation.z += delta * 1.3;
            }
            if (particlesRef.current) {
                particlesRef.current.rotation.y += delta * 0.5;
                // Fade in particles
                particlesRef.current.material.opacity = Math.min(progress * 2, 1);
            }

            // Camera slowly moves forward (initial roughly at z=10)
            state.camera.position.z = THREE.MathUtils.lerp(10, 5, progress);
            state.camera.lookAt(0, 0, 0);
        } else if (t >= 4 && t < 6) {
            // Phase 3 (4–6 sec): Sphere intensifies glow, rings speed up
            if (materialRef.current) {
                // Intensify to create a flash effect toward the end
                const intensify = (t - 4) / 2; // 0 to 1
                materialRef.current.emissiveIntensity = 2 + (intensify * 5); // Glows brighter
            }
            if (ring1Ref.current && ring2Ref.current) {
                ring1Ref.current.rotation.x += delta * (1.5 + (t - 4));
                ring1Ref.current.rotation.y += delta * (1.2 + (t - 4));
                ring2Ref.current.rotation.x -= delta * (1.1 + (t - 4));
                ring2Ref.current.rotation.z += delta * (1.3 + (t - 4));
            }
            if (particlesRef.current) {
                particlesRef.current.rotation.y += delta * 1.5;
            }
            // Continue camera zoom slightly
            state.camera.position.z = THREE.MathUtils.lerp(5, 3, (t - 4) / 2);
        } else if (t >= 6) {
            // Animation complete
            if (onFinish) {
                onFinish();
            }
        }

        // Constant gentle orbit for sphere
        if (sphereRef.current) {
            sphereRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group>
            {/* Ambient and directional light for subtle shading */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#f97316" />

            {/* Core Sphere */}
            <Sphere ref={sphereRef} args={[1.5, 64, 64]} scale={0}>
                <meshStandardMaterial
                    ref={materialRef}
                    color="#f97316"
                    emissive="#fb923c"
                    emissiveIntensity={0}
                    transparent
                    opacity={0}
                    wireframe={true}
                />
            </Sphere>

            {/* Core Inner Solid Glow */}
            <Sphere args={[1.4, 32, 32]}>
                <meshBasicMaterial color="#f97316" transparent opacity={0.3} />
            </Sphere>

            {/* Orbiting Rings */}
            <Torus ref={ring1Ref} args={[2.5, 0.02, 16, 100]} scale={0} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#fb923c" transparent opacity={0.6} />
            </Torus>
            <Torus ref={ring2Ref} args={[3.2, 0.015, 16, 100]} scale={0} rotation={[0, Math.PI / 2, 0]}>
                <meshBasicMaterial color="#f97316" transparent opacity={0.4} />
            </Torus>

            {/* Floating Particles/Data Points */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particlesCount}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.08}
                    color="#fb923c"
                    transparent
                    opacity={0}
                    sizeAttenuation={true}
                />
            </points>

            {/* Background Stars/Noise to represent data */}
            <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
        </group>
    );
};

const OpeningAnimation = ({ onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#0a0a0a',
                zIndex: 99999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <CoreScene onFinish={onComplete} />
            </Canvas>

            {/* Optional text overlay that fades in then out */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
                transition={{ duration: 6, times: [0, 0.3, 0.8, 1] }}
                style={{
                    position: 'absolute',
                    bottom: '15%',
                    color: '#fb923c',
                    fontFamily: 'sans-serif',
                    letterSpacing: '0.2em',
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}
            >
                Climate Intelligence Core<br />
                <span style={{ fontSize: '0.8rem', color: '#f97316', opacity: 0.8, letterSpacing: '0.4em' }}>Initializing</span>
            </motion.div>
        </motion.div>
    );
};

export default OpeningAnimation;
