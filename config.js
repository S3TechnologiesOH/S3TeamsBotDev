// Base configuration file for the application

// Use environment variables with fallbacks
const config = {
  // ConnectWise configuration
  connectwise: {
    apiUrl: process.env.CW_URL || 'https://api-na.myconnectwise.net/v4_6_release/apis/3.0',
    companyId: process.env.CW_COMPANY_ID,
    publicKey: process.env.CW_PUBLIC_KEY,
    privateKey: process.env.CW_PRIVATE_KEY,
    clientId: process.env.CW_CLIENTID,
    authKey: process.env.CW_AUTHKEY
  },
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  
  // Application settings
  app: {
    port: process.env.PORT || 3978,
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  // Bot configuration
  bot: {
    appId: process.env.BOT_ID,
    appPassword: process.env.BOT_PASSWORD
  }
};

module.exports = config;
