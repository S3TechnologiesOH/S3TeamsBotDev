const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
};
const settings = {
  'clientId': '0442a905-ae27-4988-8ade-18259ba352fa',
  'tenantId': 'common',
  'graphUserScopes': [
    'user.read',
    'mail.read',
    'mail.send'
  ]
};


module.exports = config, settings;
