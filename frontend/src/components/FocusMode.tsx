import { useState, useEffect, useCallback } from 'react';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const FocusMode = ({ isOpen, onClose }: FocusModeProps) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [completedTime, setCompletedTime] = useState(25);

  const presets = [5, 10, 15, 25];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    setShowCongrats(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(completedTime * 60);
    setShowCongrats(false);
  };

  const setPreset = (minutes: number) => {
    setCompletedTime(minutes);
    setTimeLeft(minutes * 60);
    setIsActive(false);
    setIsPaused(false);
    setShowCongrats(false);
  };

  const startNewSession = () => {
    setShowCongrats(false);
    setTimeLeft(completedTime * 60);
    setIsActive(false);
    setIsPaused(false);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;


    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setShowCongrats(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content focus-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">&times;</button>
        
        {!showCongrats ? (
          <div id="focus-timer-view">
            <h2><i className="fas fa-brain"></i> Focus Mode</h2>
            <p className="focus-subtitle">Stay productive and achieve your goals</p>
            
            <div className="timer-display">
              <div className="timer-circle">
                <svg viewBox="0 0 100 100" className="timer-svg">
                  <circle
                    className="timer-bg"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    className="timer-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - timeLeft / (completedTime * 60))}`
                    }}
                  />
                </svg>
                <span className="timer-text">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="timer-controls">
              <button 
                id="start-timer" 
                className="timer-btn start-btn"
                onClick={startTimer}
                disabled={isActive}
              >
                <i className="fas fa-play"></i> {isPaused ? 'Resume' : 'Start'}
              </button>
              <button 
                id="pause-timer" 
                className="timer-btn pause-btn"
                onClick={pauseTimer}
                disabled={!isActive}
              >
                <i className="fas fa-pause"></i> Pause
              </button>
              <button 
                id="reset-timer" 
                className="timer-btn reset-btn"
                onClick={resetTimer}
              >
                <i className="fas fa-redo"></i> Reset
              </button>
            </div>

            <div className="timer-presets">
              {presets.map((preset) => (
                <button
                  key={preset}
                  className={`preset-btn ${completedTime === preset ? 'active' : ''}`}
                  onClick={() => setPreset(preset)}
                >
                  {preset} min
                </button>
              ))}
            </div>

            <div className="focus-tips">
              <h4><i className="fas fa-lightbulb"></i> Focus Tips</h4>
              <ul>
                <li>Turn off notifications on your devices</li>
                <li>Keep a water bottle nearby</li>
                <li>Take deep breaths before starting</li>
                <li>Focus on one task at a time</li>
              </ul>
            </div>
          </div>
        ) : (
          <div id="focus-congrats-view">
            <div className="congrats-content">
              <div className="congrats-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <h2>🎉 Congratulations!</h2>
              <p className="congrats-message">
                Great job! You've completed your focus session. Take a well-deserved break and relax.
              </p>
              <div className="congrats-stats">
                <p>You stayed focused for <strong>{completedTime} minutes</strong>!</p>
                <div className="stats-badges">
                  <span className="badge"><i className="fas fa-fire"></i> Streak +1</span>
                  <span className="badge"><i className="fas fa-star"></i> XP +{completedTime * 10}</span>
                </div>
              </div>
              <button 
                id="start-new-session" 
                className="timer-btn start-btn"
                onClick={startNewSession}
              >
                <i className="fas fa-play"></i> Start New Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;
