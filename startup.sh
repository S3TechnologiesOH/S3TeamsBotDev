#!/bin/bash

# Start PM2 and run the apps
pm2 start ecosystem.config.js

# Optionally, save the PM2 process list
pm2 save

# Keep the container running
pm2 logs
