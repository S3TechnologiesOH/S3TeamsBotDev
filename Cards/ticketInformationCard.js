
async function showTicketInformationCard(context) {
    const ticketInfoCard = {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.4",
      body: [
        {
          type: "TextBlock",
          text: "Ticket Information Commands",
          weight: "Bolder",
          size: "Large",
          wrap: true,
        },
        {
          type: "TextBlock",
          text: "Here are the available commands:",
          wrap: true,
          spacing: "Medium",
        },
        {
          type: "TextBlock",
          text: "/ticket {ticket_id}",
          wrap: true,
          fontType: "Monospace",
          spacing: "Small",
          weight: "Bolder",
        },
        {
          type: "TextBlock",
          text: "Use the command above to retrieve details about a specific ticket.",
          wrap: true,
          spacing: "Small",
        },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Back to Main Menu",
          data: {
            action: "showWelcomeCard",
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