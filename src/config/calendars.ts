// Add your calendar configuration here
export const CALENDAR_CONFIG = {
  // List of calendar IDs to fetch events from
  // Use email addresses for shared calendars or 'primary' for your main calendar
  calendarIds: [
    'primary',
    // 'family@example.com', // Example: Family calendar
    // 'work@example.com',   // Example: Work calendar
    // 'en.usa#holiday@group.v.calendar.google.com', // Example: US Holidays
  ] as const,
  
  // Optional: Display names for calendars (will show in the UI)
  calendarNames: {
    'primary': 'My Calendar',
    // 'family@example.com': 'Family',
    // 'work@example.com': 'Work',
    // 'en.usa#holiday@group.v.calendar.google.com': 'US Holidays',
  } as Record<string, string>,
};
