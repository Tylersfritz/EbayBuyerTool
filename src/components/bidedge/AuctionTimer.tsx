
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

interface AuctionTimerProps {
  endTime: Date;
  notificationTime: number;
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({ endTime, notificationTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
    progress: number;
    isSoon: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    progress: 0,
    isSoon: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const notificationTimeMs = notificationTime * 1000;
      const diff = endTime.getTime() - now.getTime();
      const diffToNotification = diff - notificationTimeMs;
      
      if (diff <= 0) {
        // Auction has ended
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          progress: 100,
          isSoon: false
        };
      }
      
      // Calculate time components
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Calculate progress - higher as we get closer to end time
      const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days as max reference
      const elapsed = totalDuration - diff;
      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      
      // Determine if we're close to notification time
      const isSoon = diffToNotification <= 60 * 1000; // Within 1 minute of notification time
      
      return {
        days,
        hours,
        minutes,
        seconds,
        total: diff,
        progress,
        isSoon
      };
    };

    // Update immediately
    setTimeRemaining(calculateTimeLeft());
    
    // Then update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeRemaining(newTimeLeft);
      
      // Clear interval if auction has ended
      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, notificationTime]);

  // Format time components with leading zeros
  const formatTimeComponent = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  const getTimerColor = () => {
    if (timeRemaining.total <= 0) return 'text-gray-500'; // Ended
    if (timeRemaining.isSoon) return 'text-red-500'; // Very close to notification time
    if (timeRemaining.days === 0 && timeRemaining.hours < 1) return 'text-orange-500'; // Less than 1 hour
    if (timeRemaining.days === 0) return 'text-yellow-500'; // Less than 1 day
    return 'text-green-500'; // More than 1 day
  };

  const getProgressColor = () => {
    if (timeRemaining.total <= 0) return 'bg-gray-500';
    if (timeRemaining.isSoon) return 'bg-red-500';
    if (timeRemaining.days === 0 && timeRemaining.hours < 1) return 'bg-orange-500';
    if (timeRemaining.days === 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">Auction ends in:</span>
        <span className={`font-mono font-medium ${getTimerColor()}`}>
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {formatTimeComponent(timeRemaining.hours)}:
          {formatTimeComponent(timeRemaining.minutes)}:
          {formatTimeComponent(timeRemaining.seconds)}
        </span>
      </div>
      <Progress value={timeRemaining.progress} className="h-1.5" 
        style={{ 
          '--progress-color': getProgressColor()
        } as React.CSSProperties} 
      />
      <div className="text-xs text-right">
        {timeRemaining.total <= 0 ? (
          <span className="text-gray-500">Auction has ended</span>
        ) : timeRemaining.isSoon ? (
          <span className="text-red-500 font-medium">Notification imminent!</span>
        ) : (
          <span className="text-muted-foreground">Notification will be sent {notificationTime} seconds before end</span>
        )}
      </div>
    </div>
  );
};

export default AuctionTimer;
