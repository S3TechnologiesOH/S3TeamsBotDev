const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
};
const settings = {
  'clientId': '0442a905-ae27-4988-8ade-18259ba352fa',
  'clientSecret': 'fOU8Q~fN6H5mXnI3.GwtzGySwNrOcEg6WwoONdr9',
  'tenantId': 'd0df057f-19eb-4ff2-8748-57e5a67e852a',
  'graphUserScopes': [
    'user.read',
    'mail.read',
    'mail.send'
  ]
};
module.exports = {config, settings};
