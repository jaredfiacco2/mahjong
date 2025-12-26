// Game over modal for stuck state - premium styling
import React from 'react';

interface GameOverModalProps {
    onShuffle: () => void;
    onNewGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
    onShuffle,
    onNewGame,
}) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content text-center">
                {/* Animated warning icon */}
                <div className="text-6xl mb-4" style={{ animation: 'winBounce 0.5s ease-out' }}>
                    😔
                </div>

                <h2 className="text-2xl font-bold mb-2" style={{
                    background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    No Moves Left
                </h2>

                <p className="text-[var(--color-text-secondary)] mb-6">
                    There are no more matching pairs available.
                    <br />
                    <span className="text-sm text-[var(--color-text-muted)]">
                        Try shuffling the board or start a new game.
                    </span>
                </p>

                <div className="flex gap-3">
                    <button
                        className="game-button flex-1 py-4 text-lg"
                        onClick={onShuffle}
                    >
                        🔀 Shuffle
                    </button>
                    <button
                        className="game-button game-button-primary flex-1 py-4 text-lg"
                        onClick={onNewGame}
                    >
                        🎮 New Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameOverModal;
