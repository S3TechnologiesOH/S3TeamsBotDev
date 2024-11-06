# Use a Node.js base image
FROM node:18

# Create and set the working directory
WORKDIR /site/wwwroot/

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the bot's code into the container
COPY . .

# Expose the port the bot will run on
EXPOSE 3978

# Start the bot
CMD [ "npm", "start" ]
