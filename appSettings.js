const settings = {
    'clientId': process.env.GRAPH_CLIENT_ID,
    'clientSecret': process.env.GRAPH_CLIENT_SECRET,
    'tenantId': 'd0df057f-19eb-4ff2-8748-57e5a67e852a',
    'graphUserScopes': [
      'user.read',
      'mail.read',
      'mail.send'
    ]
  };
  module.exports = settings;