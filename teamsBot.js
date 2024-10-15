const { TeamsActivityHandler, TurnContext, CardFactory } = require("botbuilder");
const { getOpenAIResponse } = require("./openaiService"); // OpenAI logic
const { fetch_ticket_by_id, fetch_time_entries_for_ticket } = require("./connectwiseAPI"); // ConnectWise API logic
const { summarizeJSON } = require('./openaiSummarizer');
const { get_attr_or_key } = require('./connectwiseHelpers');

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Handle incoming messages
    this.onMessage(async (context, next) => {
      //await context.sendActivity("Debug Log: Received a message activity."); // Debug message

      // Remove bot mention
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const userMessage = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim(); // Define userMessage here

      // Check if the message starts with a slash ("/")
      if (userMessage.startsWith("/")) {
        if (userMessage.startsWith("/prompt")) {
          // Handle OpenAI prompt
          const promptMessage = userMessage.replace("/prompt", "").trim();
          await this.handleOpenAIRequest(context, promptMessage);
        } else if (userMessage.startsWith("/ticket")) {
          // Handle ConnectWise ticket request
          const ticketIdString = userMessage.replace("/ticket", "").trim().replace("#", "");
          const ticketId = parseInt(ticketIdString, 10);  // Convert the ticketId string to an integer

          // Check if the parsed ticketId is a valid number
          if (!isNaN(ticketId)) {
            await this.handleTicketRequest(context, ticketId); // Pass the ticketId (number)
          } else {
            await context.sendActivity("Please provide a valid numeric ticket ID after `/ticket`.");
          }
        } else {
          // If the command is unknown
          await context.sendActivity("Unknown command. Use `/prompt [message]` or `/ticket [id]`.");
        }
      }
      else
      {
        await this.sendWelcomeCard(context);
      }

      await next();
    });

    // Handle MembersAdded event for welcoming new users and sending the command list
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await this.sendWelcomeCard(context);
          break; // Only send one welcome message
        }
      }
      await next();
    });
  }

  // Handle OpenAI request when the user sends a /prompt message
  async handleOpenAIRequest(context, promptMessage) {
    if (!promptMessage) {
      await context.sendActivity("Please provide a message after `/prompt`.");
      return;
    }

    try {
      // Call the OpenAI service to get a response
      const botReply = await getOpenAIResponse(promptMessage);
      await context.sendActivity(`**Assistant:** ${botReply}`);
    } catch (error) {
      await context.sendActivity("Sorry, I encountered an error while processing your request.");
      console.error(error);
    }
  }

  async handleTicketRequest(context, ticketId) {
    try {
      // Fetch the ticket info
      const ticketInfo = await fetch_ticket_by_id(ticketId);
      
      // Fetch related time entries
      const timeEntries = await fetch_time_entries_for_ticket(ticketId);

      // Log the combined data to check if it's being passed correctly
      //console.log("Debug Log: Combined data being passed to OpenAI:", combinedData);
  
      // Summarize the combined data
      const combinedSummary = await summarizeJSON(timeEntries);
  
      // Send the formatted details back to the user
      const formattedTicketDetails = 
        `**ID:** ${get_attr_or_key(ticketInfo, 'id')}\n\n` +
        `**Summary:** ${get_attr_or_key(ticketInfo, 'summary')}\n\n` +
        `**Record Type:** ${get_attr_or_key(ticketInfo, 'recordType')}\n\n` +
        `**Company:** ${get_attr_or_key(ticketInfo.company, 'name')}\n\n` +
        `**Board:** ${get_attr_or_key(ticketInfo.board, 'name')}\n\n` +
        `**Status:** ${get_attr_or_key(ticketInfo.status, 'name')}\n\n` +
        `**Priority:** ${get_attr_or_key(ticketInfo.priority, 'name')}\n\n` +
        `**Assigned to:** ${get_attr_or_key(ticketInfo, 'resources')}\n\n` +
        `**Actual Hours:** ${get_attr_or_key(ticketInfo, 'actualHours')}\n\n`;
  
      const fullMessage = `${formattedTicketDetails}\n\n**Time Entries Summary:**\n${combinedSummary}`;
  
      // Split and send the message in chunks if too long
      const chunkSize = 2000;
      for (let i = 0; i < fullMessage.length; i += chunkSize) {
        const messageChunk = fullMessage.slice(i, i + chunkSize);
        await context.sendActivity(messageChunk);
      }
      
    } catch (error) {
      await context.sendActivity(`Sorry, I encountered an error while processing the ticket ID: ${ticketId}`);
      console.error("Error fetching ticket or time entries:", error);
    }
  }
  
  
// Send a welcome card with an improved command list
async sendWelcomeCard(context) {
  const adaptiveCard = {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.4",
      "body": [
          {
              "type": "TextBlock",
              "text": "Welcome to the Teams Bot!",
              "weight": "Bolder",
              "size": "Large",
              "wrap": true
          },
          {
              "type": "TextBlock",
              "text": "Here are the available commands:",
              "wrap": true,
              "spacing": "Medium"
          },
          {
              "type": "TextBlock",
              "text": "/prompt [message]",
              "spacing": "Small",
              "wrap": true,
              "fontType": "Monospace",
              "weight": "Bolder"
          },
          {
              "type": "TextBlock",
              "text": "/ticket [id]",
              "spacing": "Small",
              "wrap": true,
              "fontType": "Monospace",
              "weight": "Bolder"
          },
          {
              "type": "TextBlock",
              "text": "You can use these commands to interact with the bot.",
              "wrap": true,
              "spacing": "Medium"
          }
      ]
  };

  await context.sendActivity({ attachments: [CardFactory.adaptiveCard(adaptiveCard)] });
}

}

module.exports.TeamsBot = TeamsBot;
