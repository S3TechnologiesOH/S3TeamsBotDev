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
        text: "This bot helps you interact with the system through commands and adaptive cards. It will provide you with categories that you personally have access to, and you can use the commands that are listed in these categories.",
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
