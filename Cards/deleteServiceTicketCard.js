const { CardFactory } = require("botbuilder");

async function showDeleteServiceTicketCard(context) {
  const deleteServiceTicketCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Delete Service Ticket",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Enter the service ticket ID to delete.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "Input.Text",
        id: "ticketId",
        placeholder: "Enter the ticket ID",
        isRequired: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Delete Ticket",
        data: {
          action: "deleteServiceTicketCommand",
        },
      },
      {
        type: "Action.Submit",
        title: "Back to Main Menu",
        data: {
          action: "showAdminCommandsCardMenu",
        },
      },
    ],
  };

  await context.sendActivity({
    attachments: [
      { contentType: "application/vnd.microsoft.card.adaptive", content: deleteServiceTicketCard },
    ],
  });
}

module.exports = { showDeleteServiceTicketCard };
