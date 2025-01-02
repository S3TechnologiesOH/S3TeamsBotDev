#!/bin/bash

# Navigate to the application directory
cd /home/site/wwwroot

# Install PM2 locally
npm install

# Start PM2 with the ecosystem file
npx pm2 start ecosystem.config.js

# Ensure PM2 restarts on reboot
npx pm2 startup systemd -u $USER --hp /home/site/wwwroot

# Save the PM2 process list
npx pm2 save

# Keep the script running
tail -f /dev/null
