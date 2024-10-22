const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
};
const graphSettings = {
  'clientId': '9ee35f94-3e6a-45f7-bc7a-701e02af3167',
  'tenantId': 'common',
  'graphUserScopes': [
    'user.read',
    'mail.read',
    'mail.send'
  ]
};


module.exports = {config, graphSettings};
