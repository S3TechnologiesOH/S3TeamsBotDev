const { CardFactory } = require("botbuilder");

async function showResolutionCard(context) {
  const ticketInfoCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Retrieve Resolution",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Enter a ticket number below to retrieve a resolution.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "Input.Text",
        id: "resolutionNumber", // Input field for the ticket ID
        placeholder: "Enter Ticket Number",
        isRequired: false,
        spacing: "Small",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit",
        data: {
          action: "runResolutionCommand", // Identifies the submit action
        },
      },
      {
        type: "Action.Submit",
        title: "Back to Main Menu",
        data: {
          action: "showWelcomeCard", // Returns to the main menu
        },
      },
    ],
  };

  // Send the Ticket Information card
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(ticketInfoCard)],
  });
}

module.exports = { showResolutionCard };
