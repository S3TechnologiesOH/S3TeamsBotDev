const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
};
const settings = {
  'clientId': process.env.BOT_ID,
  'tenantId': 'common',
  'graphUserScopes': [
    'user.read',
    'mail.read',
    'mail.send'
  ]
};
module.exports = {config, settings};
