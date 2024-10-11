const { TeamsActivityHandler, TurnContext, CardFactory } = require("botbuilder");
const { getOpenAIResponse } = require("./openaiService"); // OpenAI logic
const { fetch_ticket_by_id, fetch_time_entries_for_ticket } = require("./connectwiseAPI"); // ConnectWise API logic

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

  // Handle ConnectWise ticket request when the user sends a /ticket [id] message
  async handleTicketRequest(context, ticketId) {
    if (!ticketId) {
      await context.sendActivity("Please provide a valid ticket ID.");
      return;
    }

    try {
      // Fetch the ticket info
      const ticketInfo = await fetch_ticket_by_id(ticketId);
      await context.sendActivity(`Ticket Info:\n${JSON.stringify(ticketInfo, null, 2)}`);

      // Fetch related time entries
      const timeEntries = await fetch_time_entries_for_ticket(ticketId);
      await context.sendActivity(`Time Entries:\n${JSON.stringify(timeEntries, null, 2)}`);
      
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
