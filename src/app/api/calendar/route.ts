import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export interface CalendarEvent {
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
}

export async function POST(request: Request) {
  try {
    const { accessToken, calendarIds = ['primary'] } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Fetch events from all specified calendars
    const allEvents: CalendarEvent[] = [];
    
    for (const calendarId of calendarIds) {
      try {
        const response = await calendar.events.list({
          calendarId,
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });
        
        const events = response.data.items || [];
        // Add calendar ID to each event for tracking
        events.forEach(event => {
          if (event.id) {
            (event as CalendarEvent & { calendarId: string }).calendarId = calendarId;
          }
        });
        allEvents.push(...events.filter(e => e.id) as CalendarEvent[]);
      } catch (error) {
        console.error(`Error fetching calendar ${calendarId}:`, error);
        // Continue with other calendars even if one fails
      }
    }

    // Sort all events by start time and remove duplicates
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex((e) => e.id === event.id)
    );
    
    uniqueEvents.sort((a, b) => {
      const timeA = a.start.dateTime || a.start.date || '';
      const timeB = b.start.dateTime || b.start.date || '';
      return timeA.localeCompare(timeB);
    });

    return NextResponse.json({ events: uniqueEvents });
  } catch (error: unknown) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
