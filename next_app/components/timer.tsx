import React, { useState } from 'react';
import { useTimer } from 'react-timer-hook';

interface TimerProps {
  onStart: (duration: number) => void,
  onRestart: () => void, // handling quiz restart
  onTimeOut: () => void; // handling quiz timeout

}

const Timer: React.FC<TimerProps> = ({ onStart, onRestart, onTimeOut}) => {
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'notStarted' | 'running' | 'paused' | 'expired'>('notStarted');
  const [error, setError] = useState<string | null>(null);
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(false);

  const {
    seconds: timerSeconds,
    minutes: timerMinutes,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp: new Date(),
    autoStart: false,
    onExpire: () => {
      setTimerStatus('expired');
      onTimeOut(); // Call the onTimeOut function when the timer expires
    },
  });

  const handleStartClick = () => {
    if (isTimerEnabled) {
      if (minutes < 0 || seconds < 0 || seconds > 59) {
        setError('Invalid minutes/seconds range');
        return;
      }
      setError(null);
      const totalSeconds = minutes * 60 + seconds;
      const time = new Date();
      time.setSeconds(time.getSeconds() + totalSeconds);
      restart(time);
      onStart(totalSeconds);
      setTimerStatus('running');
    } else {
      setTimerStatus('running');
      onStart(0); // Start the quiz with no timer
    }
  };

  const handleStopClick = () => {
    const time = new Date();
    restart(time, false);
    setTimerStatus('notStarted');
  };

  const handlePauseClick = () => {
    pause();
    setTimerStatus('paused');
  };

  const handleResumeClick = () => {
    resume();
    setTimerStatus('running');
  };

  const handleRestartClick = () => {
    const time = new Date();
    restart(time, false);
    setMinutes(0);
    setSeconds(0);
    setTimerStatus('notStarted');
    setError(null);
    setIsTimerEnabled(false);
    onRestart(); // Call the onRestart prop to handle quiz restart
  };

  return (
    <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-white border border-gray-200/75 shadow-sm">
      {timerStatus === 'notStarted' && (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row space-x-3 items-center justify-center">
            <input
              type="number"
              value={Number(minutes).toString()}
              className="w-20 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
              onChange={(e) => setMinutes(Number(e.target.value))}
              placeholder="Min"
              disabled={!isTimerEnabled}
              min="0"
            />
            <p className="text-2xl font-medium text-gray-400">:</p>
            <input
              type="number"
              value={Number(seconds).toString()}
              className="w-20 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
              onChange={(e) => setSeconds(Number(e.target.value))}
              placeholder="Sec"
              min="0"
              max="59"
              disabled={!isTimerEnabled}
            />
          </div>
          <div className="flex items-center justify-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isTimerEnabled}
                onChange={(e) => setIsTimerEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">Enable Timer</span>
            </label>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button 
            onClick={handleStartClick} 
            className="w-full px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Start Quiz
          </button>
        </div>
      )}

      {timerStatus === 'expired' && (
        <div className="flex items-center justify-center py-4">
          <p className="text-2xl font-semibold text-red-500">Time&apos;s up!</p>
        </div>
      )}

      {timerStatus !== 'notStarted' && timerStatus !== 'expired' && isTimerEnabled && (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl font-semibold text-gray-900">
            <span>{String(timerMinutes).padStart(2, '0')}</span>
            <span className="text-gray-400 mx-1">:</span>
            <span>{String(timerSeconds).padStart(2, '0')}</span>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleStopClick} 
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
            >
              Stop
            </button>
            {timerStatus === 'running' ? (
              <button 
                onClick={handlePauseClick} 
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
              >
                Pause
              </button>
            ) : (
              <button 
                onClick={handleResumeClick} 
                className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
              >
                Resume
              </button>
            )}
          </div>
        </div>
      )}

      {timerStatus !== 'notStarted' && 
        <div className="flex items-center justify-center w-full">
          <button 
            onClick={handleRestartClick} 
            className="w-full px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            Reset Quiz
          </button>
        </div>
      }
    </div>
  );
};

export default Timer;