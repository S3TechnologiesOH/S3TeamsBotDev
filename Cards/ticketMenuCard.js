const { CardFactory } = require("botbuilder");

async function showInformationSelectionCard(context) {
  const infoSelectionCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Select Action",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Choose an option below to get specific information.",
        wrap: true,
        spacing: "Medium",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Ticket Information",
        data: {
          action: "showTicketInformationCard", // Trigger for ticket info
        },
      },
      {
        type: "Action.Submit",
        title: "Quote Information",
        data: {
          action: "showQuoteInformationCard", // Trigger for quote info
        },
      },
      {
        type: "Action.Submit",
        title: "Resolution Information",
        data: {
          action: "showResolutionCard", // Trigger for resolution info
        },
      },
    ],
  };

  // Send the Information Selection card
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(infoSelectionCard)],
  });
}

module.exports = { showInformationSelectionCard };
