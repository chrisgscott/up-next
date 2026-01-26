export async function getAvailableCalendars(accessToken: string): Promise<Calendar[]> {
  try {
    const response = await fetch('/api/calendars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch calendar list');
    }

    const data = await response.json();
    return data.calendars || [];
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    return [];
  }
}

export type Calendar = {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole?: string;
};
