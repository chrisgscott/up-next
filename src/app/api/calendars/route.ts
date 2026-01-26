import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get list of all calendars the user has access to
    const response = await calendar.calendarList.list({
      minAccessRole: 'reader', // Show calendars user can at least read
    });

    const calendars = response.data.items?.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description,
      primary: cal.primary,
      accessRole: cal.accessRole,
    })) || [];

    return NextResponse.json({ calendars });
  } catch (error: unknown) {
    console.error('Error fetching calendar list:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar list' }, { status: 500 });
  }
}
