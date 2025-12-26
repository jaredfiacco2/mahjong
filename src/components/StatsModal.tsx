// Statistics modal - premium styling with icons and animations
import React from 'react';
import type { Statistics, LayoutStats } from '../hooks/useStatistics';
import { LAYOUTS } from '../game/layouts';

interface StatsModalProps {
    statistics: Statistics;
    onClose: () => void;
    onReset: () => void;
}

const LAYOUT_ICONS: Record<string, string> = {
    turtle: '🐢',
    pyramid: '🔺',
    dragon: '🐉',
    fortress: '🏰',
    bridge: '🌉',
};

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
            <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="text-center mb-6">
                    <span className="text-4xl mb-2 block">📊</span>
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
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{LAYOUT_ICONS[layout.id] || '🎯'}</span>
                                        <span className="font-medium">{layout.name}</span>
                                    </div>
                                    <div className="flex gap-3 text-sm">
                                        <span className="text-[var(--color-text-secondary)]">
                                            {stats.gamesWon}/{stats.gamesPlayed}
                                        </span>
                                        <span className="text-[var(--color-accent-gold)] font-mono">
                                            🏆 {formatTime(stats.bestTime)}
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
                        className="game-button flex-1 text-[var(--color-accent-red)]"
                        onClick={onReset}
                    >
                        🗑️ Reset
                    </button>
                    <button
                        className="game-button game-button-primary flex-1"
                        onClick={onClose}
                    >
                        ✓ Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsModal;
