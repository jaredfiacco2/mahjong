// Game controls - buttons for hints, shuffle, undo, new game with progress bar
import React, { useState } from 'react';
import type { Layout } from '../game/layouts';
import { LAYOUTS } from '../game/layouts';
import soundManager from '../game/sounds';

// Premium SVG Icons
const Icons = {
    hint: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
    ),
    shuffle: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5" />
            <path d="M4 20L21 3" />
            <path d="M21 16v5h-5" />
            <path d="M15 15l6 6" />
            <path d="M4 4l5 5" />
        </svg>
    ),
    undo: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
    ),
    newGame: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    soundOn: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
    ),
    soundOff: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
    ),
    stats: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    layout: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
    ),
    check: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
};

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
                        {Icons.layout}
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
                    {Icons.hint}
                </button>

                <button
                    className="game-button game-button-icon"
                    onClick={onShuffle}
                    disabled={isComplete}
                    title="Shuffle tiles"
                >
                    {Icons.shuffle}
                </button>

                <button
                    className="game-button game-button-icon"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo last move"
                >
                    {Icons.undo}
                </button>

                <div className="relative">
                    <button
                        className="game-button game-button-icon game-button-primary"
                        onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                        title="New game"
                    >
                        {Icons.newGame}
                    </button>

                    {showLayoutMenu && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowLayoutMenu(false)}
                            />

                            {/* Menu */}
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2 rounded-2xl z-50 min-w-[200px] max-h-[60vh] overflow-y-auto"
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
                                        className={`w-full px-4 py-3 text-left rounded-xl transition-all duration-200 flex items-center justify-between ${layout.id === currentLayout.id
                                            ? 'bg-[var(--color-jade)] text-white shadow-lg'
                                            : 'hover:bg-white/10'
                                            }`}
                                        onClick={() => {
                                            onNewGame(layout.id);
                                            setShowLayoutMenu(false);
                                        }}
                                    >
                                        <span className="font-medium">{layout.name}</span>
                                        {layout.id === currentLayout.id && (
                                            <span className="ml-2">{Icons.check}</span>
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
                    {isMuted ? Icons.soundOff : Icons.soundOn}
                </button>

                <button
                    className="game-button game-button-icon"
                    onClick={onShowStats}
                    title="Statistics"
                >
                    {Icons.stats}
                </button>
            </div>
        </div>
    );
};

export default Controls;

