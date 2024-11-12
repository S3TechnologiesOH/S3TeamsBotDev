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
        isRequired: false,
        spacing: "Small",
      },
      {
        type: "TextBlock",
        text: "Enter the quote number below to retrieve scope details.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "Input.Text",
        id: "quoteNumber", // Input field for the ticket ID
        placeholder: "Enter Quote Number",
        isRequired: false,
        spacing: "Small",
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
