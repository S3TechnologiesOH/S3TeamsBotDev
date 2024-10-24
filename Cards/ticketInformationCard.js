const { CardFactory } = require("botbuilder");

async function showTicketInformationCard(context) {
  const ticketInfoCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Retrieve Ticket Information",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Enter the ticket ID below to retrieve its details.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "Input.Text",
        id: "ticketId", // Input field for the ticket ID
        placeholder: "Enter Ticket ID",
        isRequired: true,
        spacing: "Small",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit",
        data: {
          action: "runTicketCommand", // Identifies the submit action
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

module.exports = { showTicketInformationCard };
