const {dataManager, hasCommandPermission, assignUserRole, permissionsPath} = require("../Data/dataManager");
const {logCommand} = require("../Data/sqlManager");
const ticketManager = require("../ConnectWise/ticketManager");
const ticketInfoCard = require("./ticketInformationCard");
const adminCommandsCard = require("./adminCommandsCard");
const helpCard = require("./showHelpCard");
const bugReportCard = require("./bugReportCard");
const { CardFactory } = require("botbuilder");
const { TeamsBot } = require("../teamsBot");
const { sendBugReportEmail } = require("../MSGraph/graphHelper");
var welcomeCardMessageId = null; // Track the last welcome card message ID

// Send a welcome card with buttons for commands
async function sendWelcomeCard(context, authState) {
    await deletePreviousWelcomeCard(context);
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
  
    if (await hasCommandPermission(authState.userEmail, "help_commands")) {
      adaptiveCard.actions.push({
        type: "Action.Submit",
        title: "Help",
        data: {
          action: "showHelpCard",
        },
      });
    }

    // Send the Adaptive Card
    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(adaptiveCard)],
    });
  }
  
async function deletePreviousWelcomeCard(context) {
    if (welcomeCardMessageId) {
      try {
        await context.deleteActivity(welcomeCardMessageId);
        welcomeCardMessageId = null; // Clear the stored message ID after deleting
      } catch (error) {
        console.error(`Failed to delete previous welcome card: ${error}`);
      }
    }
  }

// Handle the user input and command actions
async function onAdaptiveCardSubmit(context, authState) {
    const submittedData = context.activity.value;
  
    if (!submittedData || !submittedData.action) {
      await context.sendActivity("Invalid action. Please try again.");
      return;
    }

    await logCommand(authState.userDisplayName, submittedData.action);

    switch (submittedData.action) {
  
      case "showTicketInformationCard":
        // Show the card listing ticket-related commands
        console.log("showTicketInformationCard");
        await ticketInfoCard.showTicketInformationCard(context);
        break;
      case "showAdminCommandsCard":
        // Show the card listing admin commands
        console.log("showAdminCommandsCard");
        await adminCommandsCard.showAdminCommandsCard(context);
        break;
      case "showHelpCard":
        // Show the card listing admin commands
        await helpCard.showHelpCard(context);
        break;

      case "showBugReportCard":
        // Show the card for submitting a bug report
        await bugReportCard.showBugReportCard(context);
        break;
      case "runTicketCommand":
        // Handle the /ticket {ticket_id} command
        const ticketNumber = submittedData.ticketId;
        console.log("runTicketCommand", ticketNumber);
        if (ticketNumber && ticketNumber.trim() !== "") {
          const ticket = ticketNumber.toString().replace("#", "");
          const ticketId = parseInt(ticket.trim(), 10); // Convert ticket number to integer
          console.log("Ticket ID:", ticketId);
          if (!isNaN(ticketId)) {
            await ticketManager.handleTicketRequest(context, ticketId); // Process the ticket
            console.log("Ticket request handled");
          } else {
            await context.sendActivity("Please enter a valid numeric ticket number.");
          }
        } else {
          await context.sendActivity("Please enter a valid ticket number.");
        }
        break;
  
        case "assignRoleCommand":
          const { roleName, userEmail } = submittedData;
    
          if (!roleName || !userEmail) {
            await context.sendActivity("Please provide both a role and a user email.");
            return;
          }
    
          await assignUserRole(context, roleName.trim(), userEmail.trim().toLowerCase(), true);
          break;
  
      case "submitBugReport":
        const { bugTitle, bugSummary } = submittedData;
  
        if (!bugTitle || !bugSummary) {
         await context.sendActivity("Please provide both a title and a summary for the bug report.");
         return;
        }
        try {
          await sendBugReportEmail(bugTitle, bugSummary);
          await context.sendActivity("Bug report submitted successfully!");
        } catch (error) {
          console.error("Error submitting bug report:", error);
          await context.sendActivity("Failed to submit the bug report. Please try again later.");
        }
        break;
  
      case "showWelcomeCard":
        await sendWelcomeCard(context, authState); // Back to the main menu
        break;
  
      default:
        await context.sendActivity("Unknown action. Please try again.");
        break;
    }
  }
  module.exports = { sendWelcomeCard, deletePreviousWelcomeCard, onAdaptiveCardSubmit };