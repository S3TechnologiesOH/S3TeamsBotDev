// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

require('isomorphic-fetch');
const axios = require('axios');
const qs = require('qs');
const graph = require('@microsoft/microsoft-graph-client');
const azure = require('@azure/identity');
const authProviders = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const emailRecipients = require("../Data/bugReportRecipients");

let _settings = undefined;
let _deviceCodeCredential = undefined;
let _userClient = undefined;

// <GraphClientConfigSnippet>
/**
 * Initializes the Microsoft Graph client using client credentials flow.
 */
async function getAuthenticatedClient() {
  const tokenResponse = await _deviceCodeCredential.getToken('https://graph.microsoft.com/.default');
  return graph.Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.token); // Pass the valid token to MS Graph
    },
  });
}

function initializeGraphForUserAuth(settings, deviceCodePrompt) {
  // Ensure settings isn't null
  if (!settings) {
    throw new Error('Settings cannot be undefined');
  }

  _settings = settings;

  _deviceCodeCredential = new azure.DeviceCodeCredential({
    clientId: settings.clientId,
    tenantId: settings.tenantId,
    userPromptCallback: deviceCodePrompt
  });

  const authProvider = new authProviders.TokenCredentialAuthenticationProvider(
    _deviceCodeCredential, {
      scopes: settings.graphUserScopes
    });

  _userClient = graph.Client.initWithMiddleware({
    authProvider: authProvider
  });
}
// </GraphClientConfigSnippet>

// <GetUserSnippet>
/**
 * Retrieves the user's profile using Microsoft Graph.
 */
async function getUserAsync() {
  if (!_userClient) {
    throw new Error('Graph client is not initialized');
  }

  try {
    const user = await _userClient
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
// </GetInboxSnippet>

// <SendMailSnippet>
/**
 * Sends an email using Microsoft Graph.
 */
async function sendBugReportEmail(title, summary) {
  const email = {
    message: {
      subject: `Bug Report ~ ${title}`,
      body: {
        contentType: "Text",
        content: summary,
      },
      toRecipients: emailRecipients.BUG_REPORT_RECIPIENTS.map((email) => ({
        emailAddress: { address: email },
      })),
    },
    saveToSentItems: "false", // Optional: Don't save email to Sent Items
  };

  try {
    await sendMail(email);
    console.log("Bug report email sent successfully.");
  } catch (error) {
    console.error("Error sending bug report email:", error);
    throw error;
  }
}

async function sendMail(email) {
  try {
    const client = await getAuthenticatedClient(); // Await the client
    await client.api("/me/sendMail").post(email);
    console.log("Bug report email sent successfully.");
  } catch (error) {
    console.error("Error sending bug report email:", error);
    throw new Error("Failed to send bug report email.");
  }
}

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
module.exports = {
  initializeGraphForUserAuth,
  getUserAsync,
  getInboxAsync,
  sendBugReportEmail,
  sendMail,
  sendMailAsync,
  makeGraphCallAsync
};
// </MakeGraphCallSnippet>
