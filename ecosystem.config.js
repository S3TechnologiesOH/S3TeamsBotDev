// ecosystem.config.js

module.exports = {
    apps: [
      {
        name: 'Bot',
        script: 'teamsBot.js',
        watch: false,
        env: {
          NODE_ENV: 'production',
          // Add other environment variables here
        },
      },
      {
        name: 'Timer',
        script: 'timer.js',
        watch: false,
        env: {
          NODE_ENV: 'production',
          // Add environment variables if needed
        },
      },
    ],
  };
  