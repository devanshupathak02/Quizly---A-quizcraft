import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  seconds: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export default function Timer({ seconds, onTimeUp, isPaused = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  // Reset timer when seconds prop changes
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  const formatTime = useCallback((time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let timerId: number | undefined;

    if (!isPaused && timeLeft > 0) {
      timerId = window.setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isPaused) {
      onTimeUp();
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timeLeft, onTimeUp, isPaused]);

  // Calculate background color based on time remaining
  const getTimerColor = () => {
    const percentage = (timeLeft / seconds) * 100;
    if (percentage > 50) return "bg-indigo-50 text-indigo-700";
    if (percentage > 20) return "bg-amber-50 text-amber-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTimerColor()}`}>
      <Clock className="h-4 w-4 mr-1" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}
