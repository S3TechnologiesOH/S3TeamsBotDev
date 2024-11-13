const { CardFactory } = require("botbuilder");

async function showQuoteInformationCard(context) {
  const ticketInfoCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Retrieve Quote Information",
        weight: "Bolder",
        size: "Large",
        wrap: true,
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
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit",
        data: {
          action: "runQuoteCommand", // Identifies the submit action
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

module.exports = { showQuoteInformationCard };
