const { CardFactory } = require("botbuilder");

async function showCompanyCreationCard(context) {
  const companyCreationCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Create a Company",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Enter the company details.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "Input.Text",
        id: "companyName", // Input field for the ticket ID
        placeholder: "Enter a Company Name",
        isRequired: false,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "companyAddress", // Input field for the ticket ID
        placeholder: "Enter the Company Address",
        isRequired: false,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "companyContactInformation", // Input field for the ticket ID
        placeholder: "Enter the Company Contact Information",
        isRequired: false,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "rep", // Input field for the ticket ID
        placeholder: "Enter the rep",
        isRequired: false,
        spacing: "Small",
      },
      {
        type: "Input.Integer",
        id: "companyId", // Input field for the ticket ID
        placeholder: "Enter a Company ID",
        isRequired: false,
        spacing: "Small",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit",
        data: {
          action: "handleCreateCompany", // Identifies the submit action
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
    attachments: [CardFactory.adaptiveCard(companyCreationCard)],
  });
}

module.exports = { showCompanyCreationCard };
