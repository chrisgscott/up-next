# Calendar Dashboard Setup

A simple NextJS dashboard for displaying your Google Calendar on a wall-mounted display.

## Features

- Large, readable display perfect for wall mounting
- Shows current time with seconds
- Displays time until next event
- Lists all events for the day
- Auto-refreshes every minute
- Clean dark theme for visibility

## Setup Instructions

### 1. Get Google Calendar API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API Key
   - **Important**: Restrict the API key to only be used for the Calendar API

### 2. Share Your Calendar

Since we're using an API key (not OAuth), you need to make your calendar accessible:

**Option A - Public Calendar (Easiest):**
1. Go to [Google Calendar Settings](https://calendar.google.com/calendar/settings)
2. Find your calendar in the left sidebar
3. Click on it and scroll to "Access permissions"
4. Check "Make available to public"
5. Set permission to "See only free/busy (hide details)" or "See all event details"

**Option B - Share with Specific Email:**
1. Create a Google Service Account if you want more security
2. Share your calendar with the service account email

### 3. Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder with your API key:

```env
GOOGLE_API_KEY=your_actual_google_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Application

```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`
6. The dashboard will automatically load your calendar - no login required!

## Running on a Mac Mini

For continuous display on a wall-mounted Mac Mini:

1. Install Node.js if not already installed
2. Clone or copy this project to the Mac Mini
3. Set up environment variables as above
4. Start the application:
   ```bash
   npm run dev
   ```
5. Open the dashboard in full screen:
   - Open Safari/Chrome to `http://localhost:3000`
   - Press F11 or use View > Enter Full Screen
6. Optional: Create a simple script to auto-start on boot

## Customization

- Edit `src/app/page.tsx` to adjust colors, fonts, or layout
- Modify refresh rate in `src/hooks/useCalendar.ts` (currently 60 seconds)
- Add more calendar features by extending the Google Calendar API calls

## Troubleshooting

- **"API key not configured" error**: Make sure you've added your API key to `.env.local`
- **"Calendar access denied" error**: Your calendar needs to be publicly accessible or shared with a service account
- **No events showing**: Check that your calendar sharing permissions allow event details to be visible
- **"Calendar not found" error**: The calendar ID might need to be changed from 'primary' to your email address
