const { dataManager, hasCommandPermission, assignUserRole, permissionsPath } = require("../Data/dataManager");
const { logCommand } = require("../Data/sqlManager");
const ticketManager = require("../ConnectWise/ticketManager");
const { connectwiseAPI } = require("../ConnectWise/connectwiseAPI");
const cpq = require("../CPQ/cpqAPI");

const ticketMenu = require("./ticketMenuCard");
const ticketInfoCard = require("./ticketInformationCard");
const quoteCard = require("./quoteInformationCard");
const resolutionCard = require("./resolutionGeneratorCard");

const companyCreationCard = require("./companyCreationCard");
const companyManager = require("../ConnectWise/companyManager");
const salesTicketManager = require("../ConnectWise/salesTicketManager");
const sqlManager = require("../Data/sqlManager");

const adminCommandsCard = require("./adminCommandsCardMenu");
const deleteServiceTicketCard = require("./deleteServiceTicketCard");
const setUserPermissionsCard = require("./setUserPermissionsCard");

const helpCard = require("./showHelpCard");
const bugReportCard = require("./bugReportCard");
const { CardFactory } = require("botbuilder");
const { TeamsBot } = require("../teamsBot");
const { sendBugReportEmail } = require("../MSGraph/graphHelper");
let welcomeCardMessageId = null; // Track the last welcome card message ID

// Send a welcome card with buttons for commands
async function sendWelcomeCard(context, authState) {
  console.log("sendWelcomeCard invoked with authState:", authState);

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

  try {
    // Check permissions and dynamically add buttons
    if (await hasCommandPermission(authState.userEmail, "admin")) {
      console.log("User has admin permissions");
      adaptiveCard.actions.push({
        type: "Action.Submit",
        title: "Admin Commands",
        data: {
          action: "showAdminCommandsCardMenu",
        },
      });
    }

    if (await hasCommandPermission(authState.userEmail, "ticket_commands")) {
      console.log("User has ticket_commands permissions");
      adaptiveCard.actions.push({
        type: "Action.Submit",
        title: "Ticket Information",
        data: {
          action: "showTicketMenuCard",
        },
      });
    }

    if (await hasCommandPermission(authState.userEmail, "company_commands")) {
      console.log("User has company_commands permissions");
      adaptiveCard.actions.push({
        type: "Action.Submit",
        title: "Company Creation",
        data: {
          action: "showCreateCompanyCard",
        },
      });
    }

    if (await hasCommandPermission(authState.userEmail, "help_commands")) {
      console.log("User has help_commands permissions");
      adaptiveCard.actions.push({
        type: "Action.Submit",
        title: "Help",
        data: {
          action: "showHelpCard",
        },
      });
    }

    console.log("Sending welcome card with actions:", adaptiveCard.actions);
    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(adaptiveCard)],
    });
  } catch (error) {
    console.error("Error in sendWelcomeCard:", error);
  }
}

async function deletePreviousWelcomeCard(context) {
  console.log("deletePreviousWelcomeCard invoked");
  if (welcomeCardMessageId) {
    try {
      console.log("Deleting previous welcome card with ID:", welcomeCardMessageId);
      await context.deleteActivity(welcomeCardMessageId);
      welcomeCardMessageId = null; // Clear the stored message ID after deleting
    } catch (error) {
      console.error("Failed to delete previous welcome card:", error);
    }
  }
}

// Handle the user input and command actions
async function onAdaptiveCardSubmit(context, authState) {
  console.log("onAdaptiveCardSubmit invoked with authState:", authState);

  const submittedData = context.activity.value;
  console.log("Received submitted data:", submittedData);

  if (!submittedData || !submittedData.action) {
    console.error("Invalid action in submitted data");
    await context.sendActivity("Invalid actions. Please try again.");
    return;
  }

  try {
    await logCommand(authState.userDisplayName, submittedData.action);
    console.log("Logged command:", submittedData.action);

    switch (submittedData.action) {
      case "showTicketMenuCard":
        console.log("Action: showTicketMenuCard");
        await ticketMenu.showInformationSelectionCard(context);
        break;

      case "showTicketInformationCard":
        console.log("Action: showTicketInformationCard");
        await ticketInfoCard.showTicketInformationCard(context);
        break;

      case "showQuoteInformationCard":
        console.log("Action: showQuoteInformationCard");
        await quoteCard.showQuoteInformationCard(context);
        break;

      case "showResolutionCard":
        console.log("Action: showResolutionCard");
        await resolutionCard.showResolutionCard(context);
        break;

      case "showHelpCard":
        console.log("Action: showHelpCard");
        await helpCard.showHelpCard(context);
        break;

      case "showCreateCompanyCard":
        console.log("Action: showCreateCompanyCard");
        await companyCreationCard.showCompanyCreationCard(context);
        break;

      case "showBugReportCard":
        console.log("Action: showBugReportCard");
        await bugReportCard.showBugReportCard(context);
        break;

      case "showAdminCommandsCardMenu":
        console.log("Action: showAdminCommandsCardMenu");
        await adminCommandsCard.showAdminCommandsCardMenu(context);
        break;
  
      case "showSetUserPermissions":
        console.log("Action: showSetUserPermissions");
        await setUserPermissionsCard.showSetUserPermissionsCard(context);
        break;
  
      case "showDeleteServiceTicket":
        console.log("Action: showDeleteServiceTicket");
        await deleteServiceTicketCard.showDeleteServiceTicketCard(context);
        break;
      case "callUpdateApolloDeals":
        console.log("Updating Apollo Deals in SQL...");
        await sqlManager.updateApolloDeals();
        break;
        
      case "runTicketCommand":
        console.log("Action: runTicketCommand");
        const ticketNumber = submittedData.ticketId;
        console.log("Submitted ticketNumber:", ticketNumber);
        if (ticketNumber && ticketNumber.trim() !== "") {
          const ticketId = parseInt(ticketNumber.trim(), 10);
          console.log("Parsed ticket ID:", ticketId);
          if (!isNaN(ticketId)) {
            await ticketManager.handleTicketRequest(context, ticketId);
            console.log("Ticket request handled successfully");
          } else {
            await context.sendActivity("Please enter a valid numeric ticket number.");
          }
        } else {
          await context.sendActivity("Please enter either a ticket ID or a quote number.");
        }
        break;

      case "runQuoteCommand":
        console.log("Action: runQuoteCommand");
        const quoteNumber = submittedData.quoteNumber;
        console.log("Submitted quoteNumber:", quoteNumber);
        if (quoteNumber && quoteNumber.trim() !== "") {
          const quoteId = parseInt(quoteNumber.trim(), 10);
          console.log("Parsed quote ID:", quoteId);
          if (!isNaN(quoteId)) {
            await cpq.handleQuoteRequest(context, quoteId);
            console.log("Quote request handled successfully");
          } else {
            await context.sendActivity("Please enter a valid numeric quote number.");
          }
        } else {
          await context.sendActivity("Please enter either a ticket ID or a quote number.");
        }
        break;

      case "runResolutionCommand":
        console.log("Action: runResolutionCommand");
        const resolutionNumber = submittedData.resolutionNumber;
        console.log("Submitted resolutionNumber:", resolutionNumber);
        if (resolutionNumber && resolutionNumber.trim() !== "") {
          const ticketId = parseInt(resolutionNumber.trim(), 10);
          console.log("Parsed ticket ID for resolution:", ticketId);
          if (!isNaN(ticketId)) {
            await ticketManager.handleResolutionRequest(context, ticketId);
            console.log("Resolution request handled successfully");
          } else {
            await context.sendActivity("Please enter a valid numeric resolution number.");
          }
        } else {
          await context.sendActivity("Please enter a resolution number.");
        }
        break;
      
      case "assignRoleCommand":
        console.log("Action: assignRoleCommand");
        const { roleName, userEmail } = submittedData;
        console.log("Role assignment data:", { roleName, userEmail });

        if (!roleName || !userEmail) {
          await context.sendActivity("Please provide both a role and a user email.");
          return;
        }

        await assignUserRole(context, roleName.trim(), userEmail.trim().toLowerCase(), true);
        console.log("User role assigned successfully");
        break;

      case "submitBugReport":
        console.log("Action: submitBugReport");
        const { bugTitle, bugSummary } = submittedData;
        console.log("Bug report data:", { bugTitle, bugSummary });

        if (!bugTitle || !bugSummary) {
          await context.sendActivity("Please provide both a title and a summary for the bug report.");
          return;
        }

        try {
          await sendBugReportEmail(bugTitle, bugSummary);
          await context.sendActivity("Bug report submitted successfully!");
          console.log("Bug report email sent successfully");
        } catch (error) {
          console.error("Error submitting bug report:", error);
          await context.sendActivity("Failed to submit the bug report. Please try again later.");
        }
        break;

      case "showWelcomeCard":
        console.log("Action: showWelcomeCard");
        await sendWelcomeCard(context, authState);
        break;

      case "handleCreateCompany":
        console.log("Action: handleCreateCompany");

        const { companyName, companyAddress, companyId, companyContactInformation, rep,
           siteName, siteAddress, siteCity, selectedState,
            marketChoice, appointmentDate, appointmentTime } = submittedData;

        await companyManager.handleCreateCompany(context, companyName, companyAddress, companyContactInformation, rep, 
          siteName, siteAddress, siteCity, selectedState,
           companyId, marketChoice, appointmentDate, appointmentTime, authState);
        break;

      case "deleteServiceTicketCommand":
        console.log("Action: deleteServiceTicketCommand");
        await salesTicketManager.handleDeleteCompany(submittedData.ticketId, context, authState);
        break;
        
      default:
        console.error("Unknown actions:", submittedData.action);
        await context.sendActivity("Unknown action. Please try again.");
        break;
    }
  } catch (error) {
    console.error("Error processing adaptive card submit action:", error);
    await context.sendActivity("An error occurred while processing your request. Please try again later.");
  }
}

module.exports = { sendWelcomeCard, deletePreviousWelcomeCard, onAdaptiveCardSubmit };
