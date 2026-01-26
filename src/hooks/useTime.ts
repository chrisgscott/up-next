'use client';

import { useState, useEffect } from 'react';

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatTimeWithoutPeriod = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimePeriod = (date: Date) => {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    currentTime,
    formattedTime: formatTime(currentTime),
    formattedDate: formatDate(currentTime),
    timeDisplay: formatTimeWithoutPeriod(currentTime),
    timePeriod: getTimePeriod(currentTime)
  };
}

export function getTimeUntilEvent(eventStart: string): string {
  const now = new Date();
  const start = new Date(eventStart);
  const diff = start.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '< 1m';
  }
}
