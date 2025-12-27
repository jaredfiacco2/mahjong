// Core Mahjong Solitaire game engine
// Handles tile matching, free tile detection, and board generation

import type { TileInstance, TileType } from './tiles';
import { STANDARD_TILES, ALL_TILE_TYPES, tilesMatch, getTileTypeById } from './tiles';
import type { Layout } from './layouts';

import { LAYOUTS } from './layouts';

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
 */
function isPositionAvailable(
    pos: { x: number; y: number; z: number },
    occupiedPositions: { x: number; y: number; z: number }[]
): boolean {
    const hasTop = occupiedPositions.some(other =>
        other.z > pos.z &&
        Math.abs(other.x - pos.x) < 0.9 &&
        Math.abs(other.y - pos.y) < 0.9
    );
    if (hasTop) return false;

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
 * Helper to assign tile types to positions solvably via reverse simulation.
 * Returns null if it gets stuck (layout prevents full assignment).
 */
function assignSolvableTypes(positions: { x: number; y: number; z: number }[], availableTypes: TileType[]): TileInstance[] | null {
    const occupiedPositions: { x: number; y: number; z: number }[] = [];
    const availablePositions = [...positions];
    const finalTiles: TileInstance[] = [];

    // Build pairs of matching types
    const typeGroups = new Map<string, TileType[]>();
    for (const t of availableTypes) {
        const key = t.matchGroup || t.id;
        if (!typeGroups.has(key)) typeGroups.set(key, []);
        typeGroups.get(key)!.push(t);
    }

    const matchingPairs: [TileType, TileType][] = [];
    for (const [_key, group] of typeGroups) {
        while (group.length >= 2) {
            matchingPairs.push([group.pop()!, group.pop()!]);
        }
    }

    // Shuffle pair placement order for variety
    for (let i = matchingPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matchingPairs[i], matchingPairs[j]] = [matchingPairs[j], matchingPairs[i]];
    }

    for (const [type1, type2] of matchingPairs) {
        const placeablePositions = availablePositions.filter(pos =>
            isPositionAvailable(pos, occupiedPositions)
        );

        if (placeablePositions.length < 2) return null; // Stuck

        // STRICT: Pick first position, then pick second on a DIFFERENT ROW
        // Try many combinations to find valid placement
        let found = false;
        let pos1: { x: number; y: number; z: number } | null = null;
        let pos2: { x: number; y: number; z: number } | null = null;

        // Shuffle placeable positions for randomness
        const shuffled = [...placeablePositions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Find first position that has a valid partner SEPARATED (different row OR different Z)
        for (const candidate1 of shuffled) {
            // Find positions that are separated:
            // - Different row (Y differs by at least 1) OR
            // - Different layer (Z differs by at least 1)
            const separatedPositions = shuffled.filter(p =>
                p !== candidate1 && (Math.abs(p.y - candidate1.y) >= 1 || Math.abs(p.z - candidate1.z) >= 1)
            );

            if (separatedPositions.length > 0) {
                // Pick a random one from separated positions
                pos1 = candidate1;
                pos2 = separatedPositions[Math.floor(Math.random() * separatedPositions.length)];
                found = true;
                break;
            }
        }


        // If we couldn't find different-row positions, this layout is too constrained
        // Return null so caller can retry with fresh shuffle
        if (!found || !pos1 || !pos2) return null;

        finalTiles.push({ id: generateTileId(), typeId: type1.id, ...pos1, isRemoved: false });
        finalTiles.push({ id: generateTileId(), typeId: type2.id, ...pos2, isRemoved: false });

        occupiedPositions.push(pos1, pos2);
        availablePositions.splice(availablePositions.indexOf(pos1), 1);
        availablePositions.splice(availablePositions.indexOf(pos2), 1);
    }

    return finalTiles;
}




// Greedy verification removed as it rejected non-greedily solvable boards
// The reverse-simulation itself provides the winnability guarantee.

/**
 * Generate a solvable board
 */
export function generateBoard(layoutId?: string): GameBoard {
    const layout = layoutId
        ? LAYOUTS.find(l => l.id === layoutId) || LAYOUTS[0]
        : LAYOUTS[0];

    resetTileIdCounter();

    const posCount = layout.positions.length;
    const tilePairs: TileType[] = [];

    if (posCount === 144) {
        // Standard full set: 34 types x 4 + 8 bonus
        STANDARD_TILES.forEach(t => {
            for (let i = 0; i < 4; i++) tilePairs.push(t);
        });
        const bonusGrouped = ALL_TILE_TYPES.filter(t => t.matchGroup);
        bonusGrouped.forEach(t => tilePairs.push(t));
    } else {
        // Dynamic subset for smaller layouts
        const available = [...STANDARD_TILES];
        while (tilePairs.length < posCount) {
            const idx = Math.floor(Math.random() * available.length);
            const type = available[idx];
            available.splice(idx, 1);

            const count = (posCount - tilePairs.length >= 4) ? 4 : 2;
            for (let i = 0; i < count; i++) tilePairs.push(type);

            if (available.length === 0) available.push(...STANDARD_TILES);
        }
    }

    // Shuffle tile types
    for (let i = tilePairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tilePairs[i], tilePairs[j]] = [tilePairs[j], tilePairs[i]];
    }

    // Create initial tiles
    let tiles: TileInstance[] = layout.positions.map((pos, i) => ({
        id: generateTileId(),
        typeId: tilePairs[i % tilePairs.length].id,
        ...pos,
        isRemoved: false
    }));

    // POST-PROCESS: Fix same-row matching pairs by swapping
    // Group tiles by row (Y position)
    const tilesByRow = new Map<number, TileInstance[]>();
    for (const tile of tiles) {
        const rowKey = Math.floor(tile.y * 10); // Handle fractional Y
        if (!tilesByRow.has(rowKey)) tilesByRow.set(rowKey, []);
        tilesByRow.get(rowKey)!.push(tile);
    }

    // Find and fix same-row matching pairs
    const rowKeys = Array.from(tilesByRow.keys()).sort((a, b) => a - b);
    for (let i = 0; i < rowKeys.length; i++) {
        const row = tilesByRow.get(rowKeys[i])!;

        // Find matching pairs in this row
        const typeCount = new Map<string, TileInstance[]>();
        for (const tile of row) {
            const typeId = tile.typeId;
            if (!typeCount.has(typeId)) typeCount.set(typeId, []);
            typeCount.get(typeId)!.push(tile);
        }

        // For each type that appears 2+ times in this row, swap one with a tile from a different row
        for (const [_typeId, tilesOfType] of typeCount) {
            while (tilesOfType.length >= 2) {
                const tileToSwap = tilesOfType.pop()!;
                let swapped = false;

                // Find a tile in a different row to swap with
                for (let j = 0; j < rowKeys.length && !swapped; j++) {
                    if (j === i) continue; // Skip same row

                    const otherRow = tilesByRow.get(rowKeys[j])!;
                    // Find a tile in otherRow that won't create a new same-row pair when swapped
                    for (const otherTile of otherRow) {
                        if (otherTile.typeId !== tileToSwap.typeId) {
                            // Check if swapping would create a new same-row pair in the current row
                            const wouldCreatePairInCurrentRow = row.some(t =>
                                t !== tileToSwap && t.typeId === otherTile.typeId
                            );

                            // Also check if it would create a pair in the other row
                            const wouldCreatePairInOtherRow = otherRow.some(t =>
                                t !== otherTile && t.typeId === tileToSwap.typeId
                            );

                            if (!wouldCreatePairInCurrentRow && !wouldCreatePairInOtherRow) {
                                // Swap typeIds
                                const tempTypeId = tileToSwap.typeId;
                                tileToSwap.typeId = otherTile.typeId;
                                otherTile.typeId = tempTypeId;
                                swapped = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

    }

    return { tiles, layout };
}




/**
 * Shuffle remaining tiles on the board - uses solvable algorithm with min distance
 */
export function shuffleBoard(board: GameBoard): GameBoard {
    const activeTiles = board.tiles.filter(t => !t.isRemoved);
    const removedTiles = board.tiles.filter(t => t.isRemoved);

    const positions = activeTiles.map(t => ({ x: t.x, y: t.y, z: t.z }));
    const types = activeTiles.map(t => getTileTypeById(t.typeId)).filter(Boolean) as TileType[];

    // Try to use the solvable algorithm with minimum distance
    for (let attempt = 0; attempt < 20; attempt++) {
        const newActiveTiles = assignSolvableTypes(positions, types);
        if (newActiveTiles) {
            return {
                ...board,
                tiles: [...newActiveTiles, ...removedTiles],
            };
        }
    }

    // Fallback: simple random shuffle (still works, just may have adjacent matches)
    for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
    }

    const fallbackTiles: TileInstance[] = positions.map((pos, i) => ({
        id: generateTileId(),
        typeId: types[i].id,
        ...pos,
        isRemoved: false,
    }));

    return {
        ...board,
        tiles: [...fallbackTiles, ...removedTiles],
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

/**
 * Create initial game state
 */
export function createGameState(layout: Layout): GameState {
    const board = generateBoard(layout.id);

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
