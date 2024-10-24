const {
  TeamsActivityHandler,
  TurnContext,
  CardFactory,
  UserState,
  MemoryStorage,
} = require("botbuilder");
const { getOpenAIResponse } = require("./OpenAI/openaiService"); // OpenAI logic
const {
  fetch_ticket_by_id,
  fetch_time_entries_for_ticket,
} = require("./ConnectWise/connectwiseAPI"); // ConnectWise API logic
const entry = require("./index");
const { summarizeJSON } = require("./OpenAI/openaiSummarizer");
const { get_attr_or_key } = require("./ConnectWise/connectwiseHelpers");
const graphHelper = require("./MSGraph/graphHelper");
const config = require("./config");
const settings = require("./appSettings");
const axios = require("axios");
const qs = require("qs");
const { start } = require("repl");
const {dataManager, hasCommandPermission, assignUserRole} = require("./Data/dataManager");

// --------------- Cards ---------------
const ticketInfoCard = require("./Cards/ticketInformationCard");
const adminCommandsCard = require("./Cards/adminCommandsCard");

class TeamsBot extends TeamsActivityHandler {
  
  constructor(userState) {
    super();

    this.lastLoginMessageId = null; // Store the last login message ID
    this.userIsAuthenticated = false; // Track whether the user is authenticated

    this.userState = userState;
    this.userAuthState = this.userState.createProperty("userAuthState");

    this.onMessage(async (context, next) => {

      const authState = await this.userAuthState.get(context, {
        isAuthenticated: false,
        lastLoginMessageId: null,
      });

      if (!authState.isAuthenticated) {
        await this.initializeGraph(settings, context, authState);
        await this.greetUserAsync(context, authState);
        await this.startCard(context, authState);

      } else {
        const userInput = context.activity.text?.trim().toLowerCase(); // Get the user input

        if (userInput) {
          const isCommandHandled = await this.handleUserCommand(context, userInput, authState);
    
          if (!isCommandHandled) {
            // If no valid command, show the start card again
            await this.startCard(context, authState);
          }
        } else if (context.activity.value) {
          // Handle adaptive card submissions
          await this.onAdaptiveCardSubmit(context, authState);
        } else {
          await this.startCard(context, authState);
        }
      }
      await this.userState.saveChanges(context);
      await next();
    });
  }

  async handleUserCommand(context, userInput, authState) {
    const ticketRegex = /^\/ticket (\d+)$/;
    const roleAssignRegex = /^\/role assign (\w+) (\S+)$/;
  
    if (ticketRegex.test(userInput)) {
      const ticketId = userInput.match(ticketRegex)[1];
      await this.handleTicketRequest(context, parseInt(ticketId, 10));
      return true;
    }
  
    if (roleAssignRegex.test(userInput)) {
      const [, role, email] = userInput.match(roleAssignRegex);
      await assignUserRole(context, role, email.trim().toLowerCase());
      return true;
    }
  
    return false; // No valid command found
  }

  // Handle start card or welcome card
  async startCard(context, authState) {
    await this.sendWelcomeCard(context, authState);
  }


  async initializeGraph(settings, context, authState) {
    console.log("Attempting to initialize graph for user auth...");

    await graphHelper.initializeGraphForUserAuth(settings, async (info) => {
      const { message } = info;
      const [_, url, code] = message.match(
        /(https:\/\/\S+) and enter the code (\S+)/
      );

      // Delete the previous login message if it exists
      if (this.lastLoginMessageId) {
        try {
          await context.deleteActivity(authState.lastLoginMessageId);
        } catch (err) {
          console.log(`Failed to delete previous login message: ${err}`);
        }
      }

      // Create an Adaptive Card with the login link and code
      const card = CardFactory.adaptiveCard({
        type: "AdaptiveCard",
        body: [
          {
            type: "TextBlock",
            text: "To sign in, click the button below and enter the provided code:",
            wrap: true,
          },
          {
            type: "TextBlock",
            text: `Code: **${code}**`,
            wrap: true,
            weight: "Bolder",
            size: "Medium",
          },
        ],
        actions: [
          {
            type: "Action.OpenUrl",
            title: "Sign in with Device Code",
            url: url,
          },
        ],
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.2",
      });

      const response = await context.sendActivity({ attachments: [card] });
      try{
        authState.lastLoginMessageId = response.id; // Store message ID in user state
      } catch (err) {
        console.log(`Failed to store last login message ID: ${err}`)
      };
    });
  }

  async greetUserAsync(context, authState) {
    try {

      const user = await graphHelper.getUserAsync();
      authState.userDisplayName = user.displayName;
      authState.userEmail = user.mail ?? user.userPrincipalName;
      authState.isAuthenticated = true; // Set user as authenticated
      console.log(`Email: ${user.mail ?? user.userPrincipalName}`);

    } catch (err) {

      console.log(`Error getting user: ${err}`);

    }
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
      await context.sendActivity(
        "Sorry, I encountered an error while processing your request."
      );
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
      const combinedSummary = await summarizeJSON(context, timeEntries);

      // Send the formatted details back to the user
      const formattedTicketDetails =
        `**ID:** ${get_attr_or_key(ticketInfo, "id")}\n\n` +
        `**Summary:** ${get_attr_or_key(ticketInfo, "summary")}\n\n` +
        `**Record Type:** ${get_attr_or_key(ticketInfo, "recordType")}\n\n` +
        `**Company:** ${get_attr_or_key(ticketInfo.company, "name")}\n\n` +
        `**Board:** ${get_attr_or_key(ticketInfo.board, "name")}\n\n` +
        `**Status:** ${get_attr_or_key(ticketInfo.status, "name")}\n\n` +
        `**Priority:** ${get_attr_or_key(ticketInfo.priority, "name")}\n\n` +
        `**Assigned to:** ${get_attr_or_key(ticketInfo, "resources")}\n\n` +
        `**Actual Hours:** ${get_attr_or_key(ticketInfo, "actualHours")}\n\n`;

      const fullMessage = `${formattedTicketDetails}\n\n**Time Entries Summary:**\n${combinedSummary}`;

      // Split and send the message in chunks if too long
      const chunkSize = 2000;
      for (let i = 0; i < fullMessage.length; i += chunkSize) {
        const messageChunk = fullMessage.slice(i, i + chunkSize);
        await context.sendActivity(messageChunk);
      }
    } catch (error) {
      await context.sendActivity(
        `Sorry, I encountered an error while processing the ticket ID: ${ticketId}`
      );
      console.error("Error fetching ticket or time entries:", error);
    }
  }

// Send a welcome card with buttons for commands
async sendWelcomeCard(context, authState) {
  const adaptiveCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `Welcome to the Teams Bot ${authState.userDisplayName}!`,
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Choose a command category to continue:",
        wrap: true,
        spacing: "Medium",
      },
    ],
    actions: [],
  };

  // ADMIN COMMANDS
  if (await hasCommandPermission(authState.userEmail, "admin")) {
    adaptiveCard.actions.push({
      type: "Action.Submit",
      title: "Admin Commands",
      data: {
        action: "showAdminCommandsCard",
      },
    });
  }

  // Add the "Ticket Information" button if the user has permission
  if (await hasCommandPermission(authState.userEmail, "ticket_commands")) {
    adaptiveCard.actions.push({
      type: "Action.Submit",
      title: "Ticket Information",
      data: {
        action: "showTicketInformationCard",
      },
    });
  }

  if (await hasCommandPermission(authState.userEmail, "reporting_commands")) {
    adaptiveCard.actions.push({
      type: "Action.Submit",
      title: "WIP Command 2",
      data: {
        action: "wipCommand2",
      },
    });
  }

  // Send the Adaptive Card
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(adaptiveCard)],
  });
}

// Handle the user input and command actions
async onAdaptiveCardSubmit(context, authState) {
  const submittedData = context.activity.value;

  if (!submittedData || !submittedData.action) {
    await context.sendActivity("Invalid action. Please try again.");
    return;
  }

  switch (submittedData.action) {

    case "showTicketInformationCard":
      // Show the card listing ticket-related commands
      await ticketInfoCard.showTicketInformationCard(context);
      break;
    case "showAdminCommandsCard":
      // Show the card listing admin commands
      await adminCommandsCard.showAdminCommandsCard(context);
      break;

    case "runTicketCommand":
      // Handle the /ticket {ticket_id} command
      const ticketNumber = submittedData.ticketNumber;

      if (ticketNumber && ticketNumber.trim() !== "") {
        const ticket = ticketNumber.toString().replace("#", "");
        const ticketId = parseInt(ticket.trim(), 10); // Convert ticket number to integer

        if (!isNaN(ticketId)) {
          await this.handleTicketRequest(context, ticketId); // Process the ticket
        } else {
          await context.sendActivity("Please enter a valid numeric ticket number.");
        }
      } else {
        await context.sendActivity("Please enter a valid ticket number.");
      }
      break;

    case "assignRoleCommand":
      await context.sendActivity("assignRoleCommand is not implemented yet.");
      break;

    case "wipCommand2":
      await context.sendActivity("WIP Command 2 is not implemented yet.");
      break;

    case "showWelcomeCard":
      await this.sendWelcomeCard(context, authState); // Back to the main menu
      break;

    default:
      await context.sendActivity("Unknown action. Please try again.");
      break;
  }
}

}

module.exports.TeamsBot = TeamsBot;
