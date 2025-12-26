// Combo and Score display with animated effects
import React, { useEffect, useState } from 'react';

interface ComboDisplayProps {
    combo: number;
    score: number;
    lastMatchPoints: number | null;
}

export const ComboDisplay: React.FC<ComboDisplayProps> = ({ combo, score, lastMatchPoints }) => {
    const [showPoints, setShowPoints] = useState(false);
    const [displayCombo, setDisplayCombo] = useState(0);
    const [comboScale, setComboScale] = useState(1);

    // Animate combo changes
    useEffect(() => {
        if (combo > 0) {
            setDisplayCombo(combo);
            setComboScale(1.5);
            setTimeout(() => setComboScale(1), 150);
        } else {
            // Fade out combo after delay
            const timer = setTimeout(() => setDisplayCombo(0), 1000);
            return () => clearTimeout(timer);
        }
    }, [combo]);

    // Show floating points
    useEffect(() => {
        if (lastMatchPoints) {
            setShowPoints(true);
            const timer = setTimeout(() => setShowPoints(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [lastMatchPoints]);

    const getComboColor = () => {
        if (combo >= 5) return 'linear-gradient(135deg, #ff1744 0%, #ff6d00 100%)';
        if (combo >= 3) return 'linear-gradient(135deg, #ff6d00 0%, #ffc107 100%)';
        if (combo >= 2) return 'linear-gradient(135deg, #ffc107 0%, #ffeb3b 100%)';
        return 'linear-gradient(135deg, #00e676 0%, #00bcd4 100%)';
    };

    const getComboText = () => {
        if (combo >= 5) return 'ON FIRE!';
        if (combo >= 4) return 'AMAZING!';
        if (combo >= 3) return 'GREAT!';
        if (combo >= 2) return 'NICE!';
        return '';
    };

    return (
        <>
            {/* Score display - fixed top right */}
            <div className="fixed top-16 right-4 z-50 text-right">
                <div className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider">Score</div>
                <div
                    className="text-3xl font-bold tabular-nums"
                    style={{
                        background: 'linear-gradient(135deg, #ffc107 0%, #ff6d00 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 2px 20px rgba(255, 193, 7, 0.3)',
                    }}
                >
                    {score.toLocaleString()}
                </div>

                {/* Floating points animation */}
                {showPoints && lastMatchPoints && (
                    <div
                        className="absolute right-0 text-xl font-bold"
                        style={{
                            color: combo > 1 ? '#ff6d00' : '#00e676',
                            animation: 'floatUp 1s ease-out forwards',
                        }}
                    >
                        +{lastMatchPoints}
                    </div>
                )}
            </div>

            {/* Combo display - center screen */}
            {displayCombo >= 2 && (
                <div
                    className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 text-center pointer-events-none"
                    style={{
                        animation: 'comboAppear 0.3s ease-out',
                    }}
                >
                    <div
                        className="text-6xl font-black mb-2"
                        style={{
                            background: getComboColor(),
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            transform: `scale(${comboScale})`,
                            transition: 'transform 0.15s ease-out',
                            filter: 'drop-shadow(0 4px 20px rgba(255, 107, 0, 0.5))',
                        }}
                    >
                        {combo}x
                    </div>
                    <div
                        className="text-xl font-bold text-white"
                        style={{
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {getComboText()}
                    </div>
                </div>
            )}

            {/* CSS for animations */}
            <style>{`
                @keyframes floatUp {
                    0% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-40px); }
                }
                @keyframes comboAppear {
                    0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
                    50% { transform: translate(-50%, 0) scale(1.2); }
                    100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                }
            `}</style>
        </>
    );
};

export default ComboDisplay;
