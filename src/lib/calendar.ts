export type CalendarEvent = {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  calendarId?: string; // Added to track which calendar the event is from
};

export async function getCalendarEvents(accessToken: string, calendarIds: string[] = ['primary']): Promise<CalendarEvent[]> {
  try {
    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, calendarIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch calendar events');
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}
