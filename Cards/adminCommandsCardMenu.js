const { CardFactory } = require("botbuilder");

async function showAdminCommandsCardMenu(context) {
  const adminCommandsCardMenu = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Admin Commands Menu",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Choose an option below:",
        wrap: true,
        spacing: "Medium",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Set User Permissions",
        data: {
          action: "showSetUserPermissions",
        },
      },
      {
        type: "Action.Submit",
        title: "Call Update Apollo Deals",
        data: {
          action: "callUpdateApolloDeals",
        },
      },
      {
        type: "Action.Submit",
        title: "Delete Service Ticket",
        data: {
          action: "showDeleteServiceTicket",
        },
      },
    ],
  };

  await context.sendActivity({
    attachments: [
      { contentType: "application/vnd.microsoft.card.adaptive", content: adminCommandsCardMenu },
    ],
  });
}

module.exports = { showAdminCommandsCardMenu };
