'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'selected_calendars';

export function useCalendarSelection() {
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(['primary']);

  // Load saved selection from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTimeout(() => setSelectedCalendars(JSON.parse(saved)), 0);
      } catch (e) {
        console.error('Failed to parse saved calendars:', e);
      }
    }
  }, []);

  // Save to localStorage whenever selection changes
  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendars(prev => {
      const newSelection = prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelection));
      return newSelection;
    });
  };

  return { selectedCalendars, toggleCalendar };
}
