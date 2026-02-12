# Up Next — Raspberry Pi Deployment Plan

## Hardware

- **Raspberry Pi 5 (4GB)** — ~$60, or Pi 4 (2GB) ~$35
- Micro SD card (32GB is plenty)
- USB-C power supply
- Micro HDMI to HDMI cable
- Vertical monitor (HDMI input)

## Pi Setup

1. Flash **Raspberry Pi OS Lite (64-bit)** to the SD card using Raspberry Pi Imager
2. On first boot, set up WiFi and enable SSH (Imager can pre-configure both)
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
   sudo apt install -y nodejs
   ```
4. Install Chromium and X11 (minimal desktop for kiosk):
   ```bash
   sudo apt install -y chromium-browser xserver-xorg xinit openbox
   ```

## App Setup

```bash
git clone https://github.com/chrisgscott/up-next.git
cd up-next
npm install
```

Create `.env.local` with your credentials:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3001
PORT=3001
```

## Start Script Changes for Pi

The `start.sh` needs a few tweaks for Linux/Pi:

- Replace `open -a "Google Chrome"` with `chromium-browser`
- Replace `caffeinate -d` with `xset` commands to disable screen blanking
- Start X11 if not already running

Pi version of the kiosk launch:
```bash
# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Launch Chromium in kiosk mode
chromium-browser --kiosk --noerrdialogs --disable-infobars \
  --disable-session-crashed-bubble --disable-restore-session-state \
  http://localhost:3001
```

## Auto-Start on Boot

Create a systemd service for the Next.js server at `/etc/systemd/system/upnext.service`:
```ini
[Unit]
Description=Up Next Calendar Display
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/up-next
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable it:
```bash
sudo systemctl enable upnext
sudo systemctl start upnext
```

For the kiosk browser, configure Openbox to auto-launch Chromium. Create `/home/pi/.config/openbox/autostart`:
```bash
xset s off
xset -dpms
xset s noblank

# Wait for the server
while ! curl -s http://localhost:3001 > /dev/null 2>&1; do sleep 1; done

chromium-browser --kiosk --noerrdialogs --disable-infobars \
  --disable-session-crashed-bubble --disable-restore-session-state \
  http://localhost:3001 &
```

Then set the Pi to auto-login and start X on boot by adding to `/home/pi/.bash_profile`:
```bash
[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx
```

## Display Orientation

For a vertical monitor, add to `/boot/config.txt`:
```
display_rotate=1
```
Or use `xrandr` after X starts:
```bash
xrandr --output HDMI-1 --rotate left
```

## First Run

After everything is set up, you'll need to do the Google OAuth sign-in once:
1. Temporarily connect a keyboard and mouse
2. Sign into Google when the app loads
3. Select your calendars in Settings
4. After that, the refresh token keeps you authenticated — no more interaction needed

## Maintenance

- **Pull updates:** `cd ~/up-next && git pull && npm install && npm run build && sudo systemctl restart upnext`
- **View logs:** `sudo journalctl -u upnext -f`
- **SSH in remotely:** `ssh pi@<pi-ip-address>` for maintenance without touching the display
