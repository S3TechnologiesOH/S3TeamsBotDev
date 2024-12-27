#!/bin/bash

# Update package list and install Python3 and pip3
apt-get update
apt-get install -y python3 python3-pip

# Navigate to the app directory
cd /home/site/wwwroot

# Install Python dependencies
pip3 install schedule

# Start the Node.js bot in the background
node bot.js &

# Start the Python timer script
python3 timer.py
