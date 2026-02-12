#!/bin/bash
# Up Next — kiosk startup script
# Starts the server, prevents sleep, hides cursor, launches fullscreen Chrome

DIR="$(cd "$(dirname "$0")" && pwd)"
URL="http://localhost:3001"
PIDS=()

cleanup() {
  echo ""
  echo "Shutting down..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  exit 0
}
trap cleanup INT TERM

# 1. Start the Next.js production server
echo "Building..."
cd "$DIR" && npm run build --silent
echo "Starting server..."
npm run start --silent &
PIDS+=($!)

# 2. Wait for the server to be ready
echo "Waiting for server..."
until curl -s "$URL" > /dev/null 2>&1; do
  sleep 1
done
echo "Server ready."

# 3. Prevent display sleep
caffeinate -d &
PIDS+=($!)

# 4. Launch Chrome in kiosk mode
open -a "Google Chrome" --args --kiosk --noerrdialogs --disable-infobars "$URL"

echo "Up Next is running. Press Ctrl+C to stop."
wait
