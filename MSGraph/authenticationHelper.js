// authenticationHelper.js

const { assignUserRole } = require("../Data/dataManager");
const { insertSingleRow, ensureGuestRole } = require("../Data/sqlManager");
const { initializeGraphForUserAuth, getUserAsync } = require("./graphHelper");
const { CardFactory } = require("botbuilder");

async function initializeGraph(settings, context, authState) {
  console.log("Attempting to initialize graph for user auth...");

  await initializeGraphForUserAuth(settings, async (info) => {
    const { message } = info;
    const [_, url, code] = message.match(
      /(https:\/\/\S+) and enter the code (\S+)/
    );

    // Create an Adaptive Card with the login link and code
    const card = CardFactory.adaptiveCard({
      type: "AdaptiveCard",
      body: [
        {
          type: "TextBlock",
          text: "To sign in, click the button below and enter the provided code:",
          wrap: true,
        },
        {
          type: "TextBlock",
          text: `Code: **${code}**`,
          wrap: true,
          weight: "Bolder",
          size: "Medium",
        },
      ],
      actions: [
        {
          type: "Action.OpenUrl",
          title: "Sign in with Device Code",
          url: url,
        },
      ],
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.2",
    });

    await context.sendActivity({ attachments: [card] });
    console.log("Sent login card");
  });
}

async function greetUserAsync(context, authState) {
  try {
    const user = await getUserAsync();
    authState.userDisplayName = user.displayName;
    authState.userEmail = user.mail ?? user.userPrincipalName;
    console.log(`User: ${authState.userDisplayName} (${authState.userEmail})`);

    // Ensure the user has the guest role in the database.
    await ensureGuestRole(authState.userEmail);

    authState.isAuthenticated = true; // Set user as authenticated
    console.log("User authenticated");
    console.log(`Email: ${authState.userEmail}`);
  } catch (err) {
    console.error(`Error getting user or assigning guest role: ${err}`);
  }
}

module.exports = { initializeGraph, greetUserAsync };
