// --------------- Setup ---------------
const {TeamsActivityHandler} = require("botbuilder");
const entry = require("./index");
const config = require("./config");
const settings = require("./appSettings");
const axios = require("axios");
const qs = require("qs");
const { start } = require("repl");
const fs = require("fs");
const mysql = require('mysql2/promise');

// --------------- Data ---------------
const {assignUserRole} = require("./Data/dataManager");
const {queryDatabase, getTables, connectToMySQL, processDeals} = require("./Data/sqlManager");
const { startWebhook } = require("./Webhooks/webhooks");
// --------------- ConnectWise ---------------
const {handleTicketRequest} = require("./ConnectWise/ticketManager");
const {extractTermsAndConditions, getQuotes, exportQuotesToJson} = require("./CPQ/cpqAPI");
// --------------- Apollo ---------------

const { fetchDeals, fetchOpportunityActivities } = require("./Apollo/ApolloAPI");

// --------------- MS Graph ---------------
const authenticationHelper = require("./MSGraph/authenticationHelper");

// --------------- Cards ---------------
const { sendWelcomeCard, onAdaptiveCardSubmit } = require("./Cards/cardManager");

// --------------- OpenAI ---------------
const { checkCompanies } = require("./OpenAI/openaiCompanyCheck");

let authState = null;

class TeamsBot extends TeamsActivityHandler {
  
  constructor(userState) {
    super();

    this.userMessageId = null; // Track the last user message ID    
    this.userState = userState;
    this.userAuthState = this.userState.createProperty("userAuthState");
    connectToMySQL();
    //queryDatabase()
    

    this.onMessage(async (context, next) => {
      authState = await this.userAuthState.get(context, {
        isAuthenticated: false,
        lastLoginMessageId: null,
      });
      //checkCompanies(context, "Development LLC");

      // Store the user message ID to delete it later
      this.userMessageId = context.activity.id;
    
      if (!authState.isAuthenticated) {
        await authenticationHelper.initializeGraph(settings, context, authState);
        await authenticationHelper.greetUserAsync(context, authState);
        await sendWelcomeCard(context, authState);

        //const activities = await fetchOpportunityActivities();
        //console.log("Activities: ", activities);
        /*const deals = await fetchDeals(100);
        console.log("Deals: ", deals);
        await processDeals(deals, true);*/
        console.log("Sent first welcome");
      } else {
        const userInput = context.activity.text?.trim().toLowerCase();
        console.log("User input: ", userInput);
        if (userInput) {
          const isCommandHandled = await this.handleUserCommand(context, userInput);
          console.log("Command handled: ", isCommandHandled);
          if (!isCommandHandled) {
            await sendWelcomeCard(context, authState); // Show the welcome card if no valid command
            console.log("Sent welcome card due to false handling");
          }
        } else if (context.activity.value) {
          await onAdaptiveCardSubmit(context, authState); // Handle adaptive card submission
          console.log("Handled adaptive card submission");
        } else {
          await sendWelcomeCard(context, authState); // Show the welcome card
          console.log("Sent welcome card due to no input");
        }
      }
    
      //await this.deleteUserMessage(context); // Delete the user's message
      await this.userState.saveChanges(context);
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

  // Handle start card or welcome card
  async startCard(context, authState) {
    await sendWelcomeCard(context, authState);
  }

  async deleteUserMessage(context) {
    if (this.userMessageId) {
      try {
        await context.deleteActivity(this.userMessageId);
        this.userMessageId = null; // Clear the stored message ID after deleting
      } catch (error) {
        console.error(`Failed to delete user message: ${error}`);
      }
    }
  }

}

module.exports = {TeamsBot, authState};
