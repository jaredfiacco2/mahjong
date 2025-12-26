// Game board component - renders all tiles with auto-scaling and match animations
import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import type { TileInstance } from '../game/tiles';
import Tile from './Tile';

interface BoardProps {
    tiles: TileInstance[];
    selectedTileId: string | null;
    hintPair: [string, string] | null;
    freeTiles: Set<string>;
    onTileClick: (tileId: string) => void;
    userZoom?: number;
}

export const Board: React.FC<BoardProps> = ({
    tiles,
    selectedTileId,
    hintPair,
    freeTiles,
    onTileClick,
    userZoom = 1,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [matchingTiles, _setMatchingTiles] = useState<Set<string>>(new Set());
    const previousTilesRef = useRef<TileInstance[]>(tiles);

    // Detect matched tiles and trigger animation
    useEffect(() => {
        const previousIds = new Set(previousTilesRef.current.filter(t => !t.isRemoved).map(t => t.id));
        const currentIds = new Set(tiles.filter(t => !t.isRemoved).map(t => t.id));

        // Find tiles that were just removed
        const removedIds = new Set<string>();
        previousIds.forEach(id => {
            if (!currentIds.has(id)) {
                removedIds.add(id);
            }
        });

        if (removedIds.size > 0) {
            // Briefly show the matching animation before they disappear
            // (In a more complex setup, we'd delay the actual removal)
        }

        previousTilesRef.current = tiles;
    }, [tiles]);

    // Calculate board dimensions for centering
    const { width, height, offsetX, offsetY, baseWidth, baseHeight } = useMemo(() => {
        const activeTiles = tiles.filter(t => !t.isRemoved);
        if (activeTiles.length === 0) {
            return { width: 0, height: 0, offsetX: 0, offsetY: 0, baseWidth: 0, baseHeight: 0 };
        }

        const minX = Math.min(...activeTiles.map(t => t.x));
        const maxX = Math.max(...activeTiles.map(t => t.x));
        const minY = Math.min(...activeTiles.map(t => t.y));
        const maxY = Math.max(...activeTiles.map(t => t.y));

        const bWidth = (maxX - minX + 1) * 46 + 60; // tile width + spacing + padding
        const bHeight = (maxY - minY + 1) * 62 + 80; // tile height + spacing + padding

        return {
            width: bWidth,
            height: bHeight,
            offsetX: -minX * 46 + 20,
            offsetY: -minY * 62 + 20,
            baseWidth: bWidth,
            baseHeight: bHeight,
        };
    }, [tiles]);

    // Auto-scale the board to fit the viewport
    const updateScale = useCallback(() => {
        if (!containerRef.current || baseWidth === 0 || baseHeight === 0) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth - 32; // padding
        const containerHeight = container.clientHeight - 32;

        const scaleX = containerWidth / baseWidth;
        const scaleY = containerHeight / baseHeight;
        const autoScale = Math.min(scaleX, scaleY, 1.2); // Max auto scale 1.2x

        // Apply user zoom on top of auto scale
        const finalScale = Math.max(0.4, autoScale) * userZoom;
        setScale(finalScale);
    }, [baseWidth, baseHeight, userZoom]);

    // Use ResizeObserver for smooth scaling
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            updateScale();
        });

        observer.observe(containerRef.current);
        updateScale(); // Initial call

        return () => observer.disconnect();
    }, [updateScale]);

    // Also update when tiles change (layout change)
    useEffect(() => {
        updateScale();
    }, [tiles, updateScale]);

    const hintSet = useMemo(() => {
        if (!hintPair) return new Set<string>();
        return new Set(hintPair);
    }, [hintPair]);

    return (
        <div
            ref={containerRef}
            className="board-container"
        >
            <div
                className="board-wrapper relative"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                }}
            >
                <div
                    className="board-inner relative"
                    style={{
                        transform: `translate(${offsetX}px, ${offsetY}px)`,
                    }}
                >
                    {tiles
                        .filter(t => !t.isRemoved)
                        .map(tile => (
                            <Tile
                                key={tile.id}
                                tile={tile}
                                isSelected={tile.id === selectedTileId}
                                isFree={freeTiles.has(tile.id)}
                                isHint={hintSet.has(tile.id)}
                                isMatching={matchingTiles.has(tile.id)}
                                onClick={() => onTileClick(tile.id)}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Board;
