// Game controls - buttons for hints, shuffle, undo, new game with progress bar
import React, { useState } from 'react';
import type { Layout } from '../game/layouts';
import { LAYOUTS } from '../game/layouts';
import soundManager from '../game/sounds';

interface ControlsProps {
    onHint: () => void;
    onShuffle: () => void;
    onUndo: () => void;
    onNewGame: (layoutId?: string) => void;
    onShowStats: () => void;
    canUndo: boolean;
    currentLayout: Layout;
    tilesRemaining: number;
    matchesMade: number;
    elapsedTime: number;
    isComplete: boolean;
    isStuck: boolean;
    score: number;
}

export const Controls: React.FC<ControlsProps> = ({
    onHint,
    onShuffle,
    onUndo,
    onNewGame,
    onShowStats,
    canUndo,
    currentLayout,
    tilesRemaining,
    matchesMade,
    elapsedTime,
    isComplete,
    isStuck,
    score: _score, // Available for future use
}) => {
    const [showLayoutMenu, setShowLayoutMenu] = useState(false);
    const [isMuted, setIsMuted] = useState(soundManager.isMuted());

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        soundManager.setMuted(newMuted);
        setIsMuted(newMuted);
    };

    // Calculate progress percentage (144 tiles total)
    const progressPercent = ((144 - tilesRemaining) / 144) * 100;

    return (
        <div className="controls-wrapper w-full">
            {/* Top stats bar with progress */}
            <div className="stats-bar fixed top-0 left-0 right-0 z-50">
                {/* Progress bar at very top */}
                <div className="progress-bar" style={{ borderRadius: 0, height: '4px' }}>
                    <div
                        className="progress-fill"
                        style={{
                            width: `${progressPercent}%`,
                            borderRadius: 0,
                        }}
                    />
                </div>

                {/* Stats panel */}
                <div className="flex items-center justify-center gap-2 p-2"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(5, 13, 26, 0.95) 0%, rgba(5, 13, 26, 0.8) 80%, transparent 100%)',
                        backdropFilter: 'blur(12px)'
                    }}>
                    <div className="stats-panel">
                        <div className="stat-item">
                            <span className="stat-value">{formatTime(elapsedTime)}</span>
                            <span className="stat-label">Time</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{tilesRemaining}</span>
                            <span className="stat-label">Tiles</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{matchesMade}</span>
                            <span className="stat-label">Matches</span>
                        </div>
                    </div>

                    {/* Layout indicator */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 text-sm text-[var(--color-text-muted)]">
                        <span>🎯</span>
                        <span>{currentLayout.name}</span>
                    </div>
                </div>
            </div>

            {/* Bottom control bar */}
            <div className="control-bar z-50">
                <button
                    className="game-button game-button-icon"
                    onClick={onHint}
                    disabled={isComplete || isStuck}
                    title="Show hint"
                >
                    <span className="text-xl">💡</span>
                </button>

                <button
                    className="game-button game-button-icon"
                    onClick={onShuffle}
                    disabled={isComplete}
                    title="Shuffle tiles"
                >
                    <span className="text-xl">🔀</span>
                </button>

                <button
                    className="game-button game-button-icon"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo last move"
                >
                    <span className="text-xl">↩️</span>
                </button>

                <div className="relative">
                    <button
                        className="game-button game-button-icon game-button-primary"
                        onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                        title="New game"
                    >
                        <span className="text-xl">🎮</span>
                    </button>

                    {showLayoutMenu && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowLayoutMenu(false)}
                            />

                            {/* Menu */}
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2 rounded-2xl z-50 min-w-[180px]"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(26, 47, 79, 0.98) 0%, rgba(17, 34, 64, 0.99) 100%)',
                                    backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
                                }}>
                                <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider px-3 py-2 font-medium">
                                    Select Layout
                                </div>
                                {LAYOUTS.map(layout => (
                                    <button
                                        key={layout.id}
                                        className={`w-full px-4 py-3 text-left rounded-xl transition-all duration-200 flex items-center gap-3 ${layout.id === currentLayout.id
                                            ? 'bg-[var(--color-jade)] text-white shadow-lg'
                                            : 'hover:bg-white/10'
                                            }`}
                                        onClick={() => {
                                            onNewGame(layout.id);
                                            setShowLayoutMenu(false);
                                        }}
                                    >
                                        <span className="text-lg">{layout.id === 'turtle' ? '🐢' : layout.id === 'pyramid' ? '🔺' : layout.id === 'dragon' ? '🐉' : layout.id === 'fortress' ? '🏰' : '🌉'}</span>
                                        <span className="font-medium">{layout.name}</span>
                                        {layout.id === currentLayout.id && (
                                            <span className="ml-auto">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button
                    className="game-button game-button-icon"
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
                </button>

                <button
                    className="game-button game-button-icon"
                    onClick={onShowStats}
                    title="Statistics"
                >
                    <span className="text-xl">📊</span>
                </button>
            </div>
        </div>
    );
};

export default Controls;
