import React, { useState, useEffect, useRef } from 'react';
import type { TileInstance } from '../game/tiles';
import { getTileTypeById, getTileCategoryColor } from '../game/tiles';
import { useMobile } from '../hooks/useMobile';

interface TileProps {
    tile: TileInstance;
    isSelected: boolean;
    isFree: boolean;
    isHint: boolean;
    isMatching?: boolean;
    onClick: () => void;
}

// Sparkle effect component
const Sparkle: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => (
    <svg
        className="sparkle"
        style={{
            left: x,
            top: y,
            width: 20,
            height: 20,
            animationDelay: `${delay}ms`,
        }}
        viewBox="0 0 20 20"
    >
        <path
            d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z"
            fill="#ffd54f"
            opacity={0.9}
        />
    </svg>
);

export const Tile: React.FC<TileProps> = ({
    tile,
    isSelected,
    isFree,
    isHint,
    isMatching = false,
    onClick
}) => {
    const [showSparkles, setShowSparkles] = useState(false);
    const [sparklePositions, setSparklePositions] = useState<{ x: number; y: number; delay: number }[]>([]);
    const tileRef = useRef<HTMLDivElement>(null);

    const tileType = getTileTypeById(tile.typeId);

    // Create sparkles when selected
    useEffect(() => {
        if (isSelected && tileRef.current) {
            const rect = tileRef.current.getBoundingClientRect();
            const sparkles = [];
            for (let i = 0; i < 6; i++) {
                sparkles.push({
                    x: Math.random() * (rect.width + 20) - 10,
                    y: Math.random() * (rect.height + 20) - 10,
                    delay: i * 80,
                });
            }
            setSparklePositions(sparkles);
            setShowSparkles(true);
        } else {
            setShowSparkles(false);
        }
    }, [isSelected]);

    const { isMobile, isTablet } = useMobile();

    if (!tileType || tile.isRemoved) return null;

    const categoryColor = getTileCategoryColor(tileType.category);

    const layerClass = `tile-layer-${Math.min(tile.z + 1, 4)}`;
    const selectedClass = isSelected ? 'tile-selected' : '';
    const hintClass = isHint ? 'tile-hint' : '';
    const blockedClass = !isFree ? 'tile-blocked' : '';
    const matchingClass = isMatching ? 'tile-matched' : '';

    // Device-specific positioning (must match index.css and Board.tsx)
    const tileW = isMobile ? 32 : (isTablet ? 38 : 46);
    const tileH = isMobile ? 44 : (isTablet ? 52 : 62);

    return (
        <div
            ref={tileRef}
            className={`mahjong-tile ${layerClass} ${selectedClass} ${hintClass} ${blockedClass} ${matchingClass}`}
            style={{
                position: 'absolute',
                left: `${tile.x * tileW}px`,
                top: `${tile.y * tileH}px`,
                zIndex: tile.z * 100 + Math.floor(tile.y * 10),
            }}
            onClick={isFree && !isMatching ? onClick : undefined}
            role="button"
            tabIndex={isFree ? 0 : -1}
            aria-label={`${tileType.name}${!isFree ? ' (blocked)' : ''}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isFree && !isMatching) onClick();
                }
            }}
        >
            {/* Sparkle effects on selection */}
            {showSparkles && sparklePositions.map((pos, i) => (
                <Sparkle key={i} x={pos.x} y={pos.y} delay={pos.delay} />
            ))}

            <div
                className="tile-face w-full h-full"
                style={{ color: categoryColor }}
            >
                <span className="tile-symbol" style={{ position: 'relative', zIndex: 1 }}>
                    {tileType.symbol}
                </span>
            </div>
        </div>
    );
};

export default Tile;
