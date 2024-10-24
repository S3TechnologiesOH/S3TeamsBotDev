const { CardFactory } = require("botbuilder");

async function showHelpCard(context) {
  const helpCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "How the Bot Works",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "This bot helps you interact with the system through commands and adaptive cards. It provides access to ticket information, role management, reporting, and more.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "TextBlock",
        text: "You can:",
        weight: "Bolder",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "TextBlock",
        text: "- Retrieve ticket details using the Ticket Information feature.",
        wrap: true,
        spacing: "Small",
      },
      {
        type: "TextBlock",
        text: "- Assign users to specific roles for access control.",
        wrap: true,
        spacing: "Small",
      },
      {
        type: "TextBlock",
        text: "- Generate reports and manage user activities.",
        wrap: true,
        spacing: "Small",
      },
      {
        type: "TextBlock",
        text: "Use the buttons and cards provided by the bot for seamless interaction. For detailed operations, try using specific features like Ticket Information and Admin Commands.",
        wrap: true,
        spacing: "Medium",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit Bug Report",
        data: {
          action: "showBugReportCard",
        },
      },
      {
        type: "Action.Submit",
        title: "Back to Main Menu",
        data: {
          action: "showWelcomeCard",
        },
      },
    ],
  };

  // Send the Help Card
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(helpCard)],
  });
}

module.exports = { showHelpCard };
