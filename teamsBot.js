const { TeamsActivityHandler, TurnContext, CardFactory } = require("botbuilder");
const { getOpenAIResponse } = require("./openaiService"); // OpenAI logic
const { fetch_ticket_by_id, fetch_time_entries_for_ticket } = require("./connectwiseAPI"); // ConnectWise API logic
const { summarizeJSON } = require('./openaiSummarizer');

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Handle incoming messages
    this.onMessage(async (context, next) => {
      await context.sendActivity("Debug Log: Received a message activity."); // Debug message

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
          const ticketIdString = userMessage.replace("/ticket", "").trim();
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
      
      // Combine the ticket and time entries data
      const combinedData = {
        ticket: ticketInfo,
        timeEntries: timeEntries
      };
      
      // Summarize the combined ticket and time entries data using OpenAI
      const combinedSummary = await summarizeJSON(combinedData);
  
      const formattedTicketDetails = 
      `**ID:** ${get_attr_or_key(ticketInfo, 'id')}\n` +
      `**Summary:** ${get_attr_or_key(ticketInfo, 'summary')}\n` +
      `**Record Type:** ${get_attr_or_key(ticketInfo, 'recordType')}\n` +
      `**Company:** ${get_attr_or_key(ticketInfo.company, 'name')}\n` +
      `**Board:** ${get_attr_or_key(ticketInfo.board, 'name')}\n` +
      `**Status:** ${get_attr_or_key(ticketInfo.status, 'name')}\n` +
      `**Priority:** ${get_attr_or_key(ticketInfo.priority, 'name')}\n` +
      `**Assigned to:** ${get_attr_or_key(ticketInfo, 'resources')}\n` +
      `**Actual Hours:** ${get_attr_or_key(ticketInfo, 'actualHours')}\n`;

    // Create a card with the ticket details and time entries summary
    const summaryCard = CardFactory.heroCard(
      "Ticket and Time Entries Summary",
      `${formattedTicketDetails}\n\n**Time Entries Summary:** ${combinedSummary}`,
      null,
      null
    );
  
      // Send the card as a response
      await context.sendActivity({ attachments: [summaryCard] });
      
    } catch (error) {
      await context.sendActivity(`Sorry, I encountered an error while processing the ticket ID: ${ticketId}`);
      console.error("Error fetching ticket or time entries:", error);
    }
  }

  // Send a welcome card with command list
  async sendWelcomeCard(context) {
    const card = CardFactory.heroCard(
      "Welcome to the Teams Bot",
      "Here are the available commands:",
      null,
      [
        { type: "Action.Submit", title: "/prompt [message]", value: "/prompt [message]" },
        { type: "Action.Submit", title: "/ticket [id]", value: "/ticket [id]" }
      ]
    );

    await context.sendActivity({ attachments: [card] });
  }
}

module.exports.TeamsBot = TeamsBot;
