const { connectwiseAPI } = require('./connectwiseAPI');
const { CardFactory } = require('botbuilder');
const { logCommand } = require('../Data/sqlManager');

/**
 * Create a service ticket in ConnectWise
 */
async function createServiceTicket(ticketData) {
  try {
    return await connectwiseAPI.createTicket(ticketData);
  } catch (error) {
    console.error('Error creating service ticket:', error);
    throw error;
  }
}

/**
 * Handle deletion of a service ticket
 */
async function handleDeleteCompany(ticketId, context, authState) {
  try {
    if (!ticketId) {
      await context.sendActivity("Please provide a valid ticket ID.");
      return;
    }

    await logCommand(authState?.userDisplayName || "Unknown User", `Delete Ticket: ${ticketId}`);

    // Validate the ticket exists and user has permission
    // This would need to be implemented based on actual requirements
    
    // For now, just send a confirmation card
    const confirmationCard = {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.4",
      body: [
        {
          type: "TextBlock",
          text: "Confirm Ticket Deletion",
          size: "Large",
          weight: "Bolder",
          wrap: true
        },
        {
          type: "TextBlock",
          text: `Are you sure you want to delete ticket #${ticketId}?`,
          wrap: true
        },
        {
          type: "TextBlock",
          text: "This action cannot be undone.",
          color: "Attention",
          wrap: true
        }
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Delete",
          style: "destructive",
          data: {
            action: "confirmDeleteTicket",
            ticketId: ticketId
          }
        },
        {
          type: "Action.Submit",
          title: "Cancel",
          data: {
            action: "showWelcomeCard"
          }
        }
      ]
    };
    
    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(confirmationCard)]
    });
    
  } catch (error) {
    console.error("Error in handleDeleteCompany:", error);
    await context.sendActivity(`Error processing delete request: ${error.message}`);
  }
}

module.exports = {
  createServiceTicket,
  handleDeleteCompany
};