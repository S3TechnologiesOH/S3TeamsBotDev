const { TeamsActivityHandler, TurnContext, CardFactory } = require("botbuilder");
const { getOpenAIResponse } = require("./OpenAI/openaiService"); // OpenAI logic
const { fetch_ticket_by_id, fetch_time_entries_for_ticket } = require("./ConnectWise/connectwiseAPI"); // ConnectWise API logic
const { summarizeJSON } = require('./OpenAI/openaiSummarizer');
const { get_attr_or_key } = require('./ConnectWise/connectwiseHelpers');
const graphHelper = require('./MSGraph/graphHelper');
const config = require('./config');
const settings = require('./appSettings');
const axios = require('axios');
const qs = require('qs');


class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();


    this.onMessage(async (context, next) => {

      await this.initializeGraph(settings, context);

      await this.greetUserAsync();

      // Check if this is an Adaptive Card submit action

      
      if (context.activity.value) {
          // Handle the Adaptive Card submission
          await this.onAdaptiveCardSubmit(context);
      } 
      else if (context.activity.text) {
          // Remove bot mention and handle the message
          const removedMentionText = TurnContext.removeRecipientMention(context.activity);
          const userMessage = (removedMentionText || "").toLowerCase().replace(/\n|\r/g, "").trim();
  
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
  
                  if (!isNaN(ticketId)) {
                      await this.handleTicketRequest(context, ticketId); // Pass the ticketId (number)
                  } else {
                      await context.sendActivity("Please provide a valid numeric ticket ID after `/ticket`.");
                  }
              } else {
                  await context.sendActivity("Unknown command. Use `/prompt [message]` or `/ticket [id]`.");
              }
          } else {
              // If it's not a command, send the welcome card
              await this.sendWelcomeCard(context);

          }
      } else {
          // If no valid text is present, log or send a default message
          await context.sendActivity("I didn't understand your message. Please use `/prompt` or `/ticket` commands.");
      }
  
      await next();
  });
  }

  async initializeGraph(settings, context) {
    console.log("Attempting to initialize graph for user auth...");
    await graphHelper.initializeGraphForUserAuth(settings, async (info) => {
      const { message } = info;
  
      // Extract the login link and code from the message (assuming consistent message format)
      const [_, url, code] = message.match(/(https:\/\/\S+) and enter the code (\S+)/);
  
      // Create an Adaptive Card with a button for login
      const card = CardFactory.adaptiveCard({
        type: "AdaptiveCard",
        body: [
          {
            type: "TextBlock",
            text: "To sign in, click the button below and enter the provided code:",
            wrap: true
          },
          {
            type: "TextBlock",
            text: `Code: **${code}**`,
            wrap: true,
            weight: "Bolder",
            size: "Medium"
          }
        ],
        actions: [
          {
            type: "Action.OpenUrl",
            title: "Sign in with Device Code",
            url: url
          }
        ],
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.2"
      });
  
      // Send the Adaptive Card to the user
      await context.sendActivity({ attachments: [card] });
    });
  }

  async greetUserAsync() {
    try {
      const user = await graphHelper.getUserAsync();
      console.log(`Hello, ${user?.displayName}!`);
      // For Work/school accounts, email is in mail property
      // Personal accounts, email is in userPrincipalName
      console.log(`Email: ${user?.mail ?? user?.userPrincipalName ?? ''}`);
    } catch (err) {
      console.log(`Error getting user: ${err}`);
    }
  }

  async greetUserAsync() {
    try {
      const user = await graphHelper.getUserAsync();
      console.log(`Hello, ${user?.displayName}!`);
      // For Work/school accounts, email is in mail property
      // Personal accounts, email is in userPrincipalName
      console.log(`Email: ${user?.mail ?? user?.userPrincipalName ?? ''}`);
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
      const combinedSummary = await summarizeJSON(context, timeEntries);
  
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
  
  
// Send a welcome card with an input field for the ticket number
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
              "text": "Enter a ticket number below to start:",
              "wrap": true,
              "spacing": "Medium"
          },
          {
              "type": "Input.Text",
              "id": "ticketNumber",  // The input field ID to reference the input value
              "placeholder": "Enter ticket number",
              "style": "text"
          }
      ],
      "actions": [
          {
              "type": "Action.Submit",
              "title": "Start",
              "data": {
                  "action": "runTicketCommand"
              }
          }
      ]
  };

  await context.sendActivity({ attachments: [CardFactory.adaptiveCard(adaptiveCard)] });
}

// Handle the user input and command action
async onAdaptiveCardSubmit(context) {
  const submittedData = context.activity.value;

  // Check if the action is to run the /ticket command
  if (submittedData && submittedData.action === 'runTicketCommand') {
      const ticketNumber = submittedData.ticketNumber;
      
      // Ensure the ticket number is defined and not empty
      if (ticketNumber && ticketNumber.trim() !== "") {
          // Directly call the handleTicketRequest method with the ticket number
          const ticket = ticketNumber.toString().replace("#", "");
          const ticketId = parseInt(ticket.trim(), 10); // Parse ticket number into an integer

          if (!isNaN(ticketId)) {
              // Call the handleTicketRequest to process the ticket ID
              await this.handleTicketRequest(context, ticketId);
          } else {
              await context.sendActivity("Please enter a valid numeric ticket number.");
          }
      } else {
          // If no valid ticket number is entered
          await context.sendActivity("Please enter a valid ticket number.");
      }
  } else {
      await context.sendActivity("Please enter a valid ticket number.");
  }
}
}

module.exports.TeamsBot = TeamsBot;
