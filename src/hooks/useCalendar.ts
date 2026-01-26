'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, getCalendarEvents } from '@/lib/calendar';

export function useCalendar(accessToken: string | null, selectedCalendars: string[] = ['primary']) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!accessToken) return;
    
    setError(null);
    
    try {
      const calendarEvents = await getCalendarEvents(accessToken, selectedCalendars);
      setEvents(calendarEvents);
    } catch (err) {
      setError('Failed to fetch calendar events');
      console.error(err);
    }
  }, [accessToken, selectedCalendars]);

  useEffect(() => {
    if (accessToken) {
      setTimeout(fetchEvents, 0);
      const interval = setInterval(fetchEvents, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [accessToken, fetchEvents]);

  const nextEvent = events.find(event => {
    if (!event.start.dateTime) return false;
    const eventStart = new Date(event.start.dateTime);
    return eventStart > new Date();
  });

  return { events, nextEvent, error, refetch: fetchEvents };
}
