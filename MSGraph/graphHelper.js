// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

require('isomorphic-fetch');
const axios = require('axios');
const qs = require('qs');
const graph = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

let _graphClient = undefined;

// <GraphClientConfigSnippet>
/**
 * Initializes the Microsoft Graph client using client credentials flow.
 */
function initializeGraphForUserAuth(settings, deviceCodePrompt) {
  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing environment variables for Graph authentication');
  }

  // Initialize ClientSecretCredential for app-only access
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  // Set up Microsoft Graph client with middleware
  _graphClient = graph.Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        console.log('Graph Token Acquired:', token.token);
        return token.token;
      },
    },
  });

  console.log('Microsoft Graph Client initialized successfully.');
}
module.exports.initializeGraphClient = initializeGraphClient;
// </GraphClientConfigSnippet>

// <GetUserSnippet>
/**
 * Retrieves the user's profile using Microsoft Graph.
 */
async function getUserAsync() {
  if (!_graphClient) {
    throw new Error('Graph client is not initialized');
  }

  try {
    const user = await _graphClient
      .api('/me')
      .select(['displayName', 'mail', 'userPrincipalName'])
      .get();

    console.log('User Profile:', user);
    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to retrieve user profile.');
  }
}
module.exports.getUserAsync = getUserAsync;
// </GetUserSnippet>

// <GetInboxSnippet>
/**
 * Retrieves the top 25 emails from the user's inbox.
 */
async function getInboxAsync() {
  if (!_graphClient) {
    throw new Error('Graph client is not initialized');
  }

  try {
    const inbox = await _graphClient
      .api('/me/mailFolders/inbox/messages')
      .select(['from', 'isRead', 'receivedDateTime', 'subject'])
      .top(25)
      .orderby('receivedDateTime DESC')
      .get();

    console.log('Inbox Messages:', inbox);
    return inbox;
  } catch (error) {
    console.error('Error fetching inbox:', error);
    throw new Error('Failed to retrieve inbox messages.');
  }
}
module.exports.getInboxAsync = getInboxAsync;
// </GetInboxSnippet>

// <SendMailSnippet>
/**
 * Sends an email using Microsoft Graph.
 */
async function sendMailAsync(subject, body, recipient) {
  if (!_graphClient) {
    throw new Error('Graph client is not initialized');
  }

  const message = {
    subject: subject,
    body: {
      content: body,
      contentType: 'text',
    },
    toRecipients: [
      {
        emailAddress: {
          address: recipient,
        },
      },
    ],
  };

  try {
    await _graphClient.api('/me/sendMail').post({ message });
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
}
module.exports.sendMailAsync = sendMailAsync;
// </SendMailSnippet>

// <MakeGraphCallSnippet>
/**
 * A placeholder function for testing custom Graph API calls.
 */
async function makeGraphCallAsync() {
  if (!_graphClient) {
    throw new Error('Graph client is not initialized');
  }

  try {
    const response = await _graphClient.api('/me').get();
    console.log('Graph API Response:', response);
  } catch (error) {
    console.error('Error making Graph API call:', error);
    throw new Error('Failed to make Graph API call.');
  }
}
module.exports.makeGraphCallAsync = makeGraphCallAsync;
// </MakeGraphCallSnippet>
