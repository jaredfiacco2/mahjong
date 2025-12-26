// Core Mahjong Solitaire game engine
// Handles tile matching, free tile detection, and board generation

import type { TileInstance, TileType } from './tiles';
import { STANDARD_TILES, ALL_TILE_TYPES, tilesMatch, getTileTypeById } from './tiles';
import type { Layout } from './layouts';

export interface GameBoard {
    tiles: TileInstance[];
    layout: Layout;
}

export interface GameState {
    board: GameBoard;
    selectedTileId: string | null;
    history: TileInstance[][]; // For undo functionality
    tilesRemaining: number;
    matchesMade: number;
    startTime: number;
    isComplete: boolean;
    isStuck: boolean;
    hintPair: [string, string] | null;
}

// Generate a unique ID
let tileIdCounter = 0;
function generateTileId(): string {
    return `tile-${++tileIdCounter}`;
}

// Reset counter for new games
export function resetTileIdCounter(): void {
    tileIdCounter = 0;
}

/**
 * Check if a tile is "free" (can be selected/matched)
 * A tile is free if:
 * 1. No tiles are directly on top of it (higher z, overlapping x/y)
 * 2. It has at least one free side (left OR right not blocked)
 */
export function isFreeTile(tile: TileInstance, allTiles: TileInstance[]): boolean {
    if (tile.isRemoved) return false;

    const activeTiles = allTiles.filter(t => !t.isRemoved);

    // Check if any tile is on top (overlapping and higher z)
    const hasBlockingTop = activeTiles.some(other =>
        other.id !== tile.id &&
        other.z > tile.z &&
        Math.abs(other.x - tile.x) < 0.9 &&
        Math.abs(other.y - tile.y) < 0.9
    );

    if (hasBlockingTop) return false;

    // Check left and right blocking
    const hasBlockingLeft = activeTiles.some(other =>
        other.id !== tile.id &&
        other.z === tile.z &&
        Math.abs(other.y - tile.y) < 0.9 &&
        other.x < tile.x && tile.x - other.x < 1.1
    );

    const hasBlockingRight = activeTiles.some(other =>
        other.id !== tile.id &&
        other.z === tile.z &&
        Math.abs(other.y - tile.y) < 0.9 &&
        other.x > tile.x && other.x - tile.x < 1.1
    );

    // Free if at least one side is open
    return !hasBlockingLeft || !hasBlockingRight;
}

/**
 * Find all valid matching pairs on the board
 */
export function findAllMatches(tiles: TileInstance[]): [TileInstance, TileInstance][] {
    const freeTiles = tiles.filter(t => !t.isRemoved && isFreeTile(t, tiles));
    const matches: [TileInstance, TileInstance][] = [];

    for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
            const tile1 = freeTiles[i];
            const tile2 = freeTiles[j];
            const type1 = getTileTypeById(tile1.typeId);
            const type2 = getTileTypeById(tile2.typeId);

            if (type1 && type2 && tilesMatch(type1, type2)) {
                matches.push([tile1, tile2]);
            }
        }
    }

    return matches;
}

/**
 * Check if the game is won (all tiles removed)
 */
export function checkWin(tiles: TileInstance[]): boolean {
    return tiles.every(t => t.isRemoved);
}

/**
 * Check if the game is stuck (no valid moves)
 */
export function checkStuck(tiles: TileInstance[]): boolean {
    if (checkWin(tiles)) return false;
    return findAllMatches(tiles).length === 0;
}

/**
 * Generate a solvable board
 * Strategy: Place tiles in pairs, ensuring each pair can eventually be matched
 */
export function generateBoard(layout: Layout): GameBoard {
    resetTileIdCounter();

    const positions = [...layout.positions].slice(0, 144);

    // If we don't have exactly 144 positions, pad or trim
    while (positions.length < 144) {
        // Add more positions if needed (shouldn't happen with proper layouts)
        const lastPos = positions[positions.length - 1] || { x: 0, y: 0, z: 0 };
        positions.push({ x: lastPos.x + 1, y: lastPos.y, z: lastPos.z });
    }

    // Create tile pairs
    // We need 72 pairs - use 34 standard tile types x 2 pairs each = 68 pairs
    // Plus 4 bonus pairs (seasons, flowers)
    const tilePairs: TileType[] = [];

    // Add each standard tile 4 times (making 2 pairs)
    STANDARD_TILES.forEach(tileType => {
        for (let i = 0; i < 4; i++) {
            tilePairs.push(tileType);
        }
    });

    // Add bonus tiles (each appears once, but matches within category)
    const bonusTiles = ALL_TILE_TYPES.filter(t => t.matchGroup);
    bonusTiles.forEach(tileType => {
        tilePairs.push(tileType);
    });

    // Shuffle tile types
    const shuffledTypes = shuffleArray([...tilePairs]).slice(0, 144);

    // Sort positions by z (top to bottom), then by accessibility
    // We want to place pairs such that one is always accessible before the other
    const sortedPositions = [...positions].sort((a, b) => {
        // Higher z first (will be placed last = more accessible)
        if (b.z !== a.z) return b.z - a.z;
        // Then by y
        if (a.y !== b.y) return a.y - b.y;
        // Then by x (edges first)
        return Math.abs(a.x - 7) - Math.abs(b.x - 7);
    });

    // Place tiles
    const tiles: TileInstance[] = sortedPositions.map((pos, index) => ({
        id: generateTileId(),
        typeId: shuffledTypes[index % shuffledTypes.length].id,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        isRemoved: false,
    }));

    return { tiles, layout };
}

/**
 * Shuffle remaining tiles on the board
 */
export function shuffleBoard(board: GameBoard): GameBoard {
    const activeTiles = board.tiles.filter(t => !t.isRemoved);
    const removedTiles = board.tiles.filter(t => t.isRemoved);

    // Extract current positions and types
    const positions = activeTiles.map(t => ({ x: t.x, y: t.y, z: t.z }));
    const types = shuffleArray(activeTiles.map(t => t.typeId));

    // Reassign types to positions
    const newActiveTiles: TileInstance[] = positions.map((pos, i) => ({
        id: generateTileId(),
        typeId: types[i],
        x: pos.x,
        y: pos.y,
        z: pos.z,
        isRemoved: false,
    }));

    return {
        ...board,
        tiles: [...newActiveTiles, ...removedTiles],
    };
}

/**
 * Remove a matched pair of tiles
 */
export function removeTilePair(
    tiles: TileInstance[],
    tile1Id: string,
    tile2Id: string
): TileInstance[] {
    return tiles.map(t => {
        if (t.id === tile1Id || t.id === tile2Id) {
            return { ...t, isRemoved: true };
        }
        return t;
    });
}

/**
 * Undo last move by restoring tiles from history
 */
export function undoMove(
    _currentTiles: TileInstance[],
    previousTiles: TileInstance[]
): TileInstance[] {
    return previousTiles;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Create initial game state
 */
export function createGameState(layout: Layout): GameState {
    const board = generateBoard(layout);
    return {
        board,
        selectedTileId: null,
        history: [],
        tilesRemaining: 144,
        matchesMade: 0,
        startTime: Date.now(),
        isComplete: false,
        isStuck: false,
        hintPair: null,
    };
}

/**
 * Get a hint (find one valid match)
 */
export function getHint(tiles: TileInstance[]): [string, string] | null {
    const matches = findAllMatches(tiles);
    if (matches.length === 0) return null;
    return [matches[0][0].id, matches[0][1].id];
}
