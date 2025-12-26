// Mahjong tile definitions
// 144 tiles total: 36 unique designs × 4 copies each

export type TileCategory = 'circles' | 'bamboo' | 'characters' | 'winds' | 'dragons' | 'seasons' | 'flowers';

export interface TileType {
    id: string;
    category: TileCategory;
    value: number | string;
    symbol: string;
    name: string;
    matchGroup?: string; // For bonus tiles that match within their category
}

export interface TileInstance {
    id: string;
    typeId: string;
    x: number;
    y: number;
    z: number;
    isRemoved: boolean;
}

// Circles (Dots) 1-9
const circles: TileType[] = Array.from({ length: 9 }, (_, i) => ({
    id: `circles-${i + 1}`,
    category: 'circles' as TileCategory,
    value: i + 1,
    symbol: ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'][i],
    name: `${i + 1} Circle${i > 0 ? 's' : ''}`,
}));

// Bamboo (Sticks) 1-9
const bamboo: TileType[] = Array.from({ length: 9 }, (_, i) => ({
    id: `bamboo-${i + 1}`,
    category: 'bamboo' as TileCategory,
    value: i + 1,
    symbol: ['🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘'][i],
    name: `${i + 1} Bamboo`,
}));

// Characters (Numbers) 1-9
const characters: TileType[] = Array.from({ length: 9 }, (_, i) => ({
    id: `characters-${i + 1}`,
    category: 'characters' as TileCategory,
    value: i + 1,
    symbol: ['一', '二', '三', '四', '五', '六', '七', '八', '九'][i],
    name: `${i + 1} Character`,
}));

// Winds
const winds: TileType[] = [
    { id: 'wind-east', category: 'winds', value: 'E', symbol: '東', name: 'East Wind' },
    { id: 'wind-south', category: 'winds', value: 'S', symbol: '南', name: 'South Wind' },
    { id: 'wind-west', category: 'winds', value: 'W', symbol: '西', name: 'West Wind' },
    { id: 'wind-north', category: 'winds', value: 'N', symbol: '北', name: 'North Wind' },
];

// Dragons
const dragons: TileType[] = [
    { id: 'dragon-red', category: 'dragons', value: 'R', symbol: '中', name: 'Red Dragon' },
    { id: 'dragon-green', category: 'dragons', value: 'G', symbol: '發', name: 'Green Dragon' },
    { id: 'dragon-white', category: 'dragons', value: 'W', symbol: '白', name: 'White Dragon' },
];

// Seasons (bonus tiles - any season matches any season)
const seasons: TileType[] = [
    { id: 'season-spring', category: 'seasons', value: 1, symbol: '春', name: 'Spring', matchGroup: 'seasons' },
    { id: 'season-summer', category: 'seasons', value: 2, symbol: '夏', name: 'Summer', matchGroup: 'seasons' },
    { id: 'season-autumn', category: 'seasons', value: 3, symbol: '秋', name: 'Autumn', matchGroup: 'seasons' },
    { id: 'season-winter', category: 'seasons', value: 4, symbol: '冬', name: 'Winter', matchGroup: 'seasons' },
];

// Flowers (bonus tiles - any flower matches any flower)
const flowers: TileType[] = [
    { id: 'flower-plum', category: 'flowers', value: 1, symbol: '梅', name: 'Plum', matchGroup: 'flowers' },
    { id: 'flower-orchid', category: 'flowers', value: 2, symbol: '蘭', name: 'Orchid', matchGroup: 'flowers' },
    { id: 'flower-chrysanthemum', category: 'flowers', value: 3, symbol: '菊', name: 'Chrysanthemum', matchGroup: 'flowers' },
    { id: 'flower-bamboo', category: 'flowers', value: 4, symbol: '竹', name: 'Bamboo', matchGroup: 'flowers' },
];

// All unique tile types (36 total for standard tiles + 4 seasons + 4 flowers = 44 unique)
// But we only use 36 unique types with 4 copies each = 144 tiles
// Standard Mahjong: 34 unique tiles x 4 = 136 + 8 bonus = 144
export const ALL_TILE_TYPES: TileType[] = [
    ...circles,      // 9
    ...bamboo,       // 9
    ...characters,   // 9
    ...winds,        // 4
    ...dragons,      // 3
    ...seasons,      // 4 (but only 1 of each in real mahjong)
    ...flowers,      // 4 (but only 1 of each in real mahjong)
];

// For Solitaire, we use 34 standard tiles × 4 = 136 + 4 seasons + 4 flowers = 144
export const STANDARD_TILES: TileType[] = [
    ...circles,      // 9
    ...bamboo,       // 9  
    ...characters,   // 9
    ...winds,        // 4
    ...dragons,      // 3
];

export function getTileTypeById(typeId: string): TileType | undefined {
    return ALL_TILE_TYPES.find(t => t.id === typeId);
}

// Check if two tile types match
export function tilesMatch(type1: TileType, type2: TileType): boolean {
    // Same tile type always matches
    if (type1.id === type2.id) return true;

    // Bonus tiles match within their category
    if (type1.matchGroup && type2.matchGroup && type1.matchGroup === type2.matchGroup) {
        return true;
    }

    return false;
}

// Get color for tile category (for visual styling)
export function getTileCategoryColor(category: TileCategory): string {
    switch (category) {
        case 'circles': return '#1e40af'; // blue
        case 'bamboo': return '#15803d';  // green
        case 'characters': return '#b91c1c'; // red
        case 'winds': return '#7c3aed'; // purple
        case 'dragons': return '#dc2626'; // red
        case 'seasons': return '#0891b2'; // cyan
        case 'flowers': return '#db2777'; // pink
        default: return '#374151'; // gray
    }
}
