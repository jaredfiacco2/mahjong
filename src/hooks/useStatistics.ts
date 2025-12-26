// Statistics tracking hook with localStorage persistence
import { useState, useEffect, useCallback } from 'react';

export interface LayoutStats {
    gamesPlayed: number;
    gamesWon: number;
    bestTime: number | null; // in seconds
    totalTime: number; // in seconds
}

export interface Statistics {
    layouts: Record<string, LayoutStats>;
    totalGamesPlayed: number;
    totalGamesWon: number;
}

const STORAGE_KEY = 'mahjong-statistics';

const defaultStats: Statistics = {
    layouts: {},
    totalGamesPlayed: 0,
    totalGamesWon: 0,
};

function loadStatistics(): Statistics {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // localStorage not available or corrupted
    }
    return defaultStats;
}

function saveStatistics(stats: Statistics): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
        // localStorage not available
    }
}

export interface UseStatisticsReturn {
    statistics: Statistics;
    recordGameStart: (layoutId: string) => void;
    recordGameWin: (layoutId: string, timeSeconds: number) => void;
    getLayoutStats: (layoutId: string) => LayoutStats;
    resetStatistics: () => void;
}

export function useStatistics(): UseStatisticsReturn {
    const [statistics, setStatistics] = useState<Statistics>(loadStatistics);

    // Save whenever statistics change
    useEffect(() => {
        saveStatistics(statistics);
    }, [statistics]);

    const recordGameStart = useCallback((layoutId: string) => {
        setStatistics(prev => {
            const layoutStats = prev.layouts[layoutId] || {
                gamesPlayed: 0,
                gamesWon: 0,
                bestTime: null,
                totalTime: 0,
            };

            return {
                ...prev,
                layouts: {
                    ...prev.layouts,
                    [layoutId]: {
                        ...layoutStats,
                        gamesPlayed: layoutStats.gamesPlayed + 1,
                    },
                },
                totalGamesPlayed: prev.totalGamesPlayed + 1,
            };
        });
    }, []);

    const recordGameWin = useCallback((layoutId: string, timeSeconds: number) => {
        setStatistics(prev => {
            const layoutStats = prev.layouts[layoutId] || {
                gamesPlayed: 0,
                gamesWon: 0,
                bestTime: null,
                totalTime: 0,
            };

            const newBestTime = layoutStats.bestTime === null
                ? timeSeconds
                : Math.min(layoutStats.bestTime, timeSeconds);

            return {
                ...prev,
                layouts: {
                    ...prev.layouts,
                    [layoutId]: {
                        ...layoutStats,
                        gamesWon: layoutStats.gamesWon + 1,
                        bestTime: newBestTime,
                        totalTime: layoutStats.totalTime + timeSeconds,
                    },
                },
                totalGamesWon: prev.totalGamesWon + 1,
            };
        });
    }, []);

    const getLayoutStats = useCallback((layoutId: string): LayoutStats => {
        return statistics.layouts[layoutId] || {
            gamesPlayed: 0,
            gamesWon: 0,
            bestTime: null,
            totalTime: 0,
        };
    }, [statistics]);

    const resetStatistics = useCallback(() => {
        setStatistics(defaultStats);
    }, []);

    return {
        statistics,
        recordGameStart,
        recordGameWin,
        getLayoutStats,
        resetStatistics,
    };
}
