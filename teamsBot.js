// teamsBot.js

// --------------- Setup ---------------
const { TeamsActivityHandler } = require("botbuilder");
const entry = require("./index");
const config = require("./config");
const settings = require("./appSettings");
const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const mysql = require("mysql2/promise");

// --------------- Data ---------------
const { assignUserRole } = require("./Data/dataManager");
const { queryDatabase, getTables, connectToMySQL, processDeals, parseConnectionString } = require("./Data/sqlManager");
const { startWebhook } = require("./Webhooks/webhooks");

// --------------- ConnectWise ---------------
const { handleTicketRequest } = require("./ConnectWise/ticketManager");
const { extractTermsAndConditions, getQuotes, exportQuotesToJson } = require("./CPQ/cpqAPI");

// --------------- Apollo ---------------
const { fetchDeals, fetchOpportunityActivities } = require("./Apollo/ApolloAPI");

// --------------- MS Graph ---------------
const authenticationHelper = require("./MSGraph/authenticationHelper");

// --------------- Cards ---------------
const { sendWelcomeCard, onAdaptiveCardSubmit } = require("./Cards/cardManager");

// --------------- OpenAI ---------------
const { checkCompanies } = require("./OpenAI/openaiCompanyCheck");

class TeamsBot extends TeamsActivityHandler {
  constructor(userState) {
    super();

    // Use per-user state for authentication info.
    this.userState = userState;
    this.userAuthState = this.userState.createProperty("userAuthState");

    // Connect to MySQL once when the bot is created.
    connectToMySQL();

    this.onMessage(async (context, next) => {
      const userId = context.activity.from.id;
      // Get or initialize auth state for this user.
      let authState = await this.userAuthState.get(context, {
        isAuthenticated: false,
        lastLoginMessageId: null,
        lastUserMessageId: null,
      });

      // Store the current message id in the per-user auth state.
      authState.lastUserMessageId = context.activity.id;

      if (!authState.isAuthenticated) {
        // Initialize and greet user for authentication.
        await authenticationHelper.initializeGraph(settings, context, authState);
        await authenticationHelper.greetUserAsync(context, authState);
        await sendWelcomeCard(context, authState);
        console.log("Sent first welcome");
      } else {
        const userInput = context.activity.text?.trim().toLowerCase();
        console.log("User input: ", userInput);
        if (userInput) {
          const isCommandHandled = await this.handleUserCommand(context, userInput);
          console.log("Command handled: ", isCommandHandled);
          if (!isCommandHandled) {
            // If not a valid command, simply show the welcome card.
            await sendWelcomeCard(context, authState);
            console.log("Sent welcome card due to false handling");
          }
        } else if (context.activity.value) {
          // Handle adaptive card submission.
          await onAdaptiveCardSubmit(context, authState);
          console.log("Handled adaptive card submission");
        } else {
          // No text or card data? Show the welcome card.
          await sendWelcomeCard(context, authState);
          console.log("Sent welcome card due to no input");
        }
      }

      // Save per-user state changes.
      await this.userState.saveChanges(context, true);
      await next();
    });
  }

  async handleUserCommand(context, userInput) {
    const ticketRegex = /^\/ticket (\d+)$/;
    const roleAssignRegex = /^\/role assign (\w+) (\S+)$/;

    if (ticketRegex.test(userInput)) {
      const ticketId = userInput.match(ticketRegex)[1];
      await handleTicketRequest(context, parseInt(ticketId, 10));
      return true;
    }

    if (roleAssignRegex.test(userInput)) {
      const [, role, email] = userInput.match(roleAssignRegex);
      await assignUserRole(context, role, email.trim().toLowerCase());
      return true;
    }

    return false; // No valid command found
  }

  // Optional: separate start card function if needed.
  async startCard(context, authState) {
    await sendWelcomeCard(context, authState);
  }
}

module.exports = { TeamsBot };
