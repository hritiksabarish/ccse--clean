import React, { useMemo } from 'react';

const StarfieldBackground = () => {
    // Generate 120 static random star positions exactly once
    const stars = useMemo(() => {
        return Array.from({ length: 120 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            size: Math.random() * 1.5 + 0.5 + 'px',  // 0.5px to 2px
            opacity: Math.random() * 0.6 + 0.3,      // 0.3 to 0.9
            animationDelay: Math.random() * 3 + 's',
            animationDuration: Math.random() * 3 + 2 + 's' // 2s to 5s twinkle cycle
        }));
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden'
            }}
        >
            {stars.map(star => (
                <div
                    key={star.id}
                    style={{
                        position: 'absolute',
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        opacity: star.opacity,
                        animation: `twinkle ${star.animationDuration} infinite alternate ease-in-out`,
                        animationDelay: star.animationDelay
                    }}
                />
            ))}
        </div>
    );
};

export default StarfieldBackground;
