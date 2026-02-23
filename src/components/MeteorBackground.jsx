import React, { useMemo } from 'react';

const MeteorBackground = () => {
    const meteors = useMemo(() => {
        return Array.from({ length: 35 }).map((_, i) => ({
            id: i,
            left: Math.random() * 150 + '%',
            top: Math.random() * -50 + '%',
            duration: Math.random() * 3 + 2, // 2 to 5 seconds
            delay: Math.random() * 5, // 0 to 5 seconds delay
            height: Math.random() * 120 + 80 // 80 to 200px tail length
        }));
    }, []);

    return (
        <div
            className="meteor-container"
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
            {meteors.map(meteor => (
                <div
                    key={meteor.id}
                    className="meteor-particle"
                    style={{
                        position: 'absolute',
                        left: meteor.left,
                        top: meteor.top,
                        width: Math.random() > 0.5 ? '2px' : '3px',
                        height: `${meteor.height}px`,
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(249, 115, 22, 0.6) 80%, rgba(255, 255, 255, 0.9) 100%)',
                        borderRadius: '2px',
                        opacity: 0,
                        transform: 'rotate(45deg)',
                        animation: `meteor-fall ${meteor.duration}s linear infinite`,
                        animationDelay: `${meteor.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default MeteorBackground;
