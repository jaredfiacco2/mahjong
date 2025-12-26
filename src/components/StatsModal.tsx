// Statistics modal - premium styling with icons and animations
import React from 'react';
import type { Statistics, LayoutStats } from '../hooks/useStatistics';
import { LAYOUTS } from '../game/layouts';

// SVG Icons
const StatsIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const TrophyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

interface StatsModalProps {
    statistics: Statistics;
    onClose: () => void;
    onReset: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
    statistics,
    onClose,
    onReset,
}) => {
    const formatTime = (seconds: number | null): string => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getWinRate = (stats: LayoutStats): number => {
        if (stats.gamesPlayed === 0) return 0;
        return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
    };

    const overallWinRate = statistics.totalGamesPlayed > 0
        ? Math.round((statistics.totalGamesWon / statistics.totalGamesPlayed) * 100)
        : 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="text-center mb-6">
                    <span className="text-[var(--color-accent-gold)] mb-2 block flex justify-center">
                        <StatsIcon />
                    </span>
                    <h2 className="text-2xl font-bold" style={{
                        background: 'linear-gradient(135deg, var(--color-accent-gold) 0%, #ffeb3b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Statistics
                    </h2>
                </div>

                {/* Overall stats - large numbers */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-black/20">
                        <div className="text-3xl font-bold text-[var(--color-accent-cyan)]">
                            {statistics.totalGamesPlayed}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                            Played
                        </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-black/20">
                        <div className="text-3xl font-bold text-[var(--color-accent-emerald)]">
                            {statistics.totalGamesWon}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                            Won
                        </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-black/20">
                        <div className="text-3xl font-bold text-[var(--color-accent-gold)]">
                            {overallWinRate}%
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                            Win Rate
                        </div>
                    </div>
                </div>

                {/* Per-layout stats with progress bars */}
                <div className="space-y-3 mb-6">
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium px-1">
                        By Layout
                    </div>
                    {LAYOUTS.map(layout => {
                        const stats = statistics.layouts[layout.id] || {
                            gamesPlayed: 0,
                            gamesWon: 0,
                            bestTime: null,
                            totalTime: 0,
                        };
                        const winRate = getWinRate(stats);

                        return (
                            <div
                                key={layout.id}
                                className="p-3 rounded-xl"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(26, 47, 79, 0.5) 0%, rgba(17, 34, 64, 0.5) 100%)',
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{layout.name}</span>
                                    <div className="flex gap-3 text-sm items-center">
                                        <span className="text-[var(--color-text-secondary)]">
                                            {stats.gamesWon}/{stats.gamesPlayed}
                                        </span>
                                        <span className="text-[var(--color-accent-gold)] font-mono flex items-center gap-1">
                                            <TrophyIcon /> {formatTime(stats.bestTime)}
                                        </span>
                                    </div>
                                </div>

                                {/* Win rate progress bar */}
                                <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${winRate}%`,
                                            background: winRate >= 50
                                                ? 'linear-gradient(90deg, var(--color-accent-emerald) 0%, var(--color-accent-cyan) 100%)'
                                                : 'linear-gradient(90deg, var(--color-accent-gold) 0%, #ff9800 100%)',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        className="game-button flex-1 text-[var(--color-accent-red)] flex items-center justify-center gap-2"
                        onClick={onReset}
                    >
                        <TrashIcon /> Reset
                    </button>
                    <button
                        className="game-button game-button-primary flex-1 flex items-center justify-center gap-2"
                        onClick={onClose}
                    >
                        <CloseIcon /> Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsModal;
