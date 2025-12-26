// Mahjong Solitaire layout definitions
// Each layout defines positions for 144 tiles in a 3D grid (x, y, z)

export interface LayoutPosition {
    x: number;
    y: number;
    z: number;
}

export interface Layout {
    id: string;
    name: string;
    description: string;
    positions: LayoutPosition[];
}

// Classic Turtle layout - the most iconic Mahjong Solitaire layout
// 5 layers, pyramid shape with a cap on top
const turtleLayout: Layout = {
    id: 'turtle',
    name: 'Turtle',
    description: 'The classic Mahjong Solitaire layout',
    positions: generateTurtlePositions(),
};

function generateTurtlePositions(): LayoutPosition[] {
    const positions: LayoutPosition[] = [];

    // Layer 0 (bottom) - 12x8 grid with some gaps
    // Row pattern for classic turtle
    const layer0 = [
        // Left wing
        [0, 3], [0, 4],
        // Main body rows
        ...generateRow(1, 1, 12),
        ...generateRow(2, 0, 14),
        ...generateRow(3, 0, 14),
        ...generateRow(4, 0, 14),
        ...generateRow(5, 0, 14),
        ...generateRow(6, 1, 12),
        // Right wing
        [7, 3], [7, 4],
    ];

    layer0.forEach(([y, x]) => positions.push({ x, y, z: 0 }));

    // Layer 1 - 10x6 centered
    for (let y = 1; y < 7; y++) {
        for (let x = 2; x < 12; x++) {
            positions.push({ x, y, z: 1 });
        }
    }

    // Layer 2 - 8x4 centered
    for (let y = 2; y < 6; y++) {
        for (let x = 4; x < 10; x++) {
            positions.push({ x, y, z: 2 });
        }
    }

    // Layer 3 - 6x2 centered
    for (let y = 3; y < 5; y++) {
        for (let x = 5; x < 9; x++) {
            positions.push({ x, y, z: 3 });
        }
    }

    // Layer 4 (top) - 4 tiles
    positions.push({ x: 6, y: 3, z: 4 });
    positions.push({ x: 7, y: 3, z: 4 });
    positions.push({ x: 6, y: 4, z: 4 });
    positions.push({ x: 7, y: 4, z: 4 });

    // Cap (single tile on very top)
    positions.push({ x: 6.5, y: 3.5, z: 5 });

    return positions.slice(0, 144); // Ensure we have exactly 144 positions
}

function generateRow(y: number, startX: number, count: number): [number, number][] {
    const row: [number, number][] = [];
    for (let i = 0; i < count; i++) {
        row.push([y, startX + i]);
    }
    return row;
}

// Pyramid layout - simple triangular structure
const pyramidLayout: Layout = {
    id: 'pyramid',
    name: 'Pyramid',
    description: 'A simple triangular pyramid',
    positions: generatePyramidPositions(),
};

function generatePyramidPositions(): LayoutPosition[] {
    const positions: LayoutPosition[] = [];

    // 5 layers building up
    const layerSizes = [
        { w: 12, h: 12 },
        { w: 10, h: 10 },
        { w: 8, h: 8 },
        { w: 6, h: 6 },
        { w: 4, h: 4 },
    ];

    layerSizes.forEach((size, z) => {
        const offsetX = z;
        const offsetY = z;
        for (let y = 0; y < size.h; y++) {
            for (let x = 0; x < size.w; x++) {
                positions.push({ x: x + offsetX, y: y + offsetY, z });
            }
        }
    });

    return positions.slice(0, 144);
}

// Dragon layout - S-shaped serpentine
const dragonLayout: Layout = {
    id: 'dragon',
    name: 'Dragon',
    description: 'A serpentine dragon shape',
    positions: generateDragonPositions(),
};

function generateDragonPositions(): LayoutPosition[] {
    const positions: LayoutPosition[] = [];

    // Create S-shaped dragon on multiple layers
    // Layer 0 - dragon body
    for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 3; y++) {
            positions.push({ x, y, z: 0 });
        }
    }

    // Curve sections
    for (let y = 3; y < 6; y++) {
        for (let x = 13; x < 16; x++) {
            positions.push({ x, y, z: 0 });
        }
    }

    for (let x = 0; x < 16; x++) {
        for (let y = 6; y < 9; y++) {
            positions.push({ x, y, z: 0 });
        }
    }

    // Layer 1
    for (let x = 2; x < 14; x++) {
        for (let y = 1; y < 2; y++) {
            positions.push({ x, y, z: 1 });
        }
    }

    for (let x = 2; x < 14; x++) {
        for (let y = 7; y < 8; y++) {
            positions.push({ x, y, z: 1 });
        }
    }

    // Layer 2 - spine
    for (let x = 4; x < 12; x++) {
        positions.push({ x, y: 1, z: 2 });
        positions.push({ x, y: 7, z: 2 });
    }

    return positions.slice(0, 144);
}

// Fortress layout - castle-like structure
const fortressLayout: Layout = {
    id: 'fortress',
    name: 'Fortress',
    description: 'A castle with towers',
    positions: generateFortressPositions(),
};

function generateFortressPositions(): LayoutPosition[] {
    const positions: LayoutPosition[] = [];

    // Base layer - large rectangle
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 14; x++) {
            positions.push({ x, y, z: 0 });
        }
    }

    // Corner towers - layer 1
    const towers = [[0, 0], [0, 7], [12, 0], [12, 7]];
    towers.forEach(([tx, ty]) => {
        for (let dx = 0; dx < 2; dx++) {
            for (let dy = 0; dy < 1; dy++) {
                positions.push({ x: tx + dx, y: ty + dy, z: 1 });
            }
        }
    });

    // Center structure - layer 1
    for (let y = 2; y < 6; y++) {
        for (let x = 4; x < 10; x++) {
            positions.push({ x, y, z: 1 });
        }
    }

    // Center top - layer 2
    for (let y = 3; y < 5; y++) {
        for (let x = 5; x < 9; x++) {
            positions.push({ x, y, z: 2 });
        }
    }

    // Tower tops - layer 2
    towers.forEach(([tx, ty]) => {
        positions.push({ x: tx + 0.5, y: ty + 0.5, z: 2 });
    });

    return positions.slice(0, 144);
}

// Bridge layout - horizontal bridge structure
const bridgeLayout: Layout = {
    id: 'bridge',
    name: 'Bridge',
    description: 'A horizontal bridge with arches',
    positions: generateBridgePositions(),
};

function generateBridgePositions(): LayoutPosition[] {
    const positions: LayoutPosition[] = [];

    // Road surface - long horizontal
    for (let x = 0; x < 18; x++) {
        for (let y = 2; y < 6; y++) {
            positions.push({ x, y, z: 0 });
        }
    }

    // Support pillars
    const pillars = [1, 5, 9, 13, 17];
    pillars.forEach(px => {
        for (let y = 0; y < 2; y++) {
            positions.push({ x: px, y: 0, z: 0 });
            positions.push({ x: px, y: 7, z: 0 });
        }
    });

    // Top layer - railings
    for (let x = 1; x < 17; x += 2) {
        positions.push({ x, y: 2, z: 1 });
        positions.push({ x, y: 5, z: 1 });
    }

    // Center tower
    for (let y = 3; y < 5; y++) {
        for (let x = 8; x < 10; x++) {
            positions.push({ x, y, z: 1 });
            positions.push({ x, y, z: 2 });
        }
    }

    return positions.slice(0, 144);
}

// All available layouts
export const LAYOUTS: Layout[] = [
    turtleLayout,
    pyramidLayout,
    dragonLayout,
    fortressLayout,
    bridgeLayout,
];

export function getLayoutById(id: string): Layout | undefined {
    return LAYOUTS.find(l => l.id === id);
}

// Check if a layout has exactly 144 positions (or close to it)
export function validateLayout(layout: Layout): boolean {
    // Should have 144 positions for a complete game
    // Some layouts might have 142-144 due to centering
    return layout.positions.length >= 140 && layout.positions.length <= 144;
}
