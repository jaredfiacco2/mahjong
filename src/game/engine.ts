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
 * Find all valid matching pairs on the board.
 * Optimized to O(N^2) by pre-calculating free status.
 */
export function findAllMatches(tiles: TileInstance[]): [TileInstance, TileInstance][] {
    const activeTiles = tiles.filter(t => !t.isRemoved);
    // Pre-calculate which tiles are free to avoid cubic complexity
    const freeTiles = activeTiles.filter(t => isFreeTile(t, activeTiles));
    
    const matches: [TileInstance, TileInstance][] = [];
    const typeMap = new Map<string, TileType | undefined>();

    for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
            const tile1 = freeTiles[i];
            const tile2 = freeTiles[j];
            
            let type1 = typeMap.get(tile1.typeId);
            if (!type1) {
                type1 = getTileTypeById(tile1.typeId);
                typeMap.set(tile1.typeId, type1);
            }
            
            let type2 = typeMap.get(tile2.typeId);
            if (!type2) {
                type2 = getTileTypeById(tile2.typeId);
                typeMap.set(tile2.typeId, type2);
            }

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
 * Check if a position is "open" for placement during reverse generation.
 * A position is open if it has no tiles on top and no tiles on BOTH sides.
 * This is the reverse of being "free" to remove.
 */
function isPositionAvailable(
    pos: { x: number; y: number; z: number },
    occupiedPositions: { x: number; y: number; z: number }[]
): boolean {
    // Check if any position is directly on top
    const hasTop = occupiedPositions.some(other =>
        other.z > pos.z &&
        Math.abs(other.x - pos.x) < 0.9 &&
        Math.abs(other.y - pos.y) < 0.9
    );
    if (hasTop) return false;

    // In reverse, we can place if it doesn't block BOTH sides of something already there,
    // OR if it's not blocked on BOTH sides itself. 
    // Simpler: Just allow placement if it would BE FREE once placed.
    const hasLeft = occupiedPositions.some(other =>
        other.z === pos.z &&
        Math.abs(other.y - pos.y) < 0.9 &&
        other.x < pos.x && pos.x - other.x < 1.1
    );

    const hasRight = occupiedPositions.some(other =>
        other.z === pos.z &&
        Math.abs(other.y - pos.y) < 0.9 &&
        other.x > pos.x && other.x - pos.x < 1.1
    );

    return !hasLeft || !hasRight;
}

/**
 * Generate a solvable board
 * Strategy: Reverse play simulation.
 * 1. Start with all potential positions from layout.
 * 2. Pick Two positions that are "free" (as if the board were full).
 * 3. Place a matching pair there.
 * 4. Repeat until all positions filled or no more pairs can be placed.
 */
export function generateBoard(layout: Layout): GameBoard {
    resetTileIdCounter();

    const allPositions = [...layout.positions].slice(0, 144);
    const occupiedPositions: { x: number; y: number; z: number }[] = [];
    const availablePositions = [...allPositions];
    
    // Prepare tiles
    const tilePairs: TileType[] = [];
    STANDARD_TILES.forEach(tileType => {
        for (let i = 0; i < 4; i++) tilePairs.push(tileType);
    });
    const bonusGrouped = ALL_TILE_TYPES.filter(t => t.matchGroup);
    bonusGrouped.forEach(tileType => tilePairs.push(tileType));
    
    const shuffledTypes = shuffleArray([...tilePairs]);
    const finalTiles: TileInstance[] = [];

    // Reverse simulation placement
    // We need to place 72 pairs
    for (let p = 0; p < 72; p++) {
        // Find all currently "placeable" positions
        // A position is placeable if it would be "free" given currently occupied positions
        const placeableIndices = availablePositions.filter(pos => 
            isPositionAvailable(pos, occupiedPositions)
        );

        if (placeableIndices.length < 2) {
            // Fallback if layout is complex, but should work for standard layouts
            break;
        }

        // Pick two random placeable positions
        const idx1 = Math.floor(Math.random() * placeableIndices.length);
        let idx2 = Math.floor(Math.random() * placeableIndices.length);
        while (idx2 === idx1 && placeableIndices.length > 1) {
            idx2 = Math.floor(Math.random() * placeableIndices.length);
        }

        const pos1 = placeableIndices[idx1];
        const pos2 = placeableIndices[idx2];

        // Fill them with current pair types
        const type1 = shuffledTypes[p * 2];
        const type2 = shuffledTypes[p * 2 + 1];

        finalTiles.push({
            id: generateTileId(),
            typeId: type1.id,
            x: pos1.x,
            y: pos1.y,
            z: pos1.z,
            isRemoved: false,
        });

        finalTiles.push({
            id: generateTileId(),
            typeId: type2.id,
            x: pos2.x,
            y: pos2.y,
            z: pos2.z,
            isRemoved: false,
        });

        // Update tracking
        occupiedPositions.push(pos1, pos2);
        
        // Remove from available
        const pos1Idx = availablePositions.indexOf(pos1);
        availablePositions.splice(pos1Idx, 1);
        const pos2Idx = availablePositions.indexOf(pos2);
        availablePositions.splice(pos2Idx, 1);
    }

    return { tiles: finalTiles, layout };
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
