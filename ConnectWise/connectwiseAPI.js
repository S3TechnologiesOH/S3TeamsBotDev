const { TicketsApi, TicketTasksApi, ProductsItemApi, CompaniesApi, CompanyTeamsApi } = require('connectwise-rest-api/release/api/api');
const { ManageAPI } = require('connectwise-rest');
const { CommonParameters, CWMOptions } = require('connectwise-rest');
const { TeamsBot } = require('../teamsBot');

// Set your ConnectWise configuration
const connectwiseUrl = process.env.CW_URL;
const companyId = process.env.CW_COMPANY_ID;
const publicKey = process.env.CW_PUBLIC_KEY;
const privateKey = process.env.CW_PRIVATE_KEY;
const clientId = process.env.CW_CLIENTID;
const authKey = process.env.CW_AUTHKEY;

// Authenticate with ConnectWise using a basic auth header
let cwService, cwTasks, cwProductItems, cwCompanies, cwCompaniesTeams, cwManage;
//console.log(`Auth Key: ${authKey}`);
// Initialize the Tickets API
//console.log(`Company ID: ${process.env.CW_COMPANY_ID}`);
//console.log(`Public Key: ${process.env.CW_PUBLIC_KEY}`);

try {
  console.log("Initializing ConnectWise APIs...");
  console.log("Configuration: ", {
    connectwiseUrl,
    companyId,
    publicKey,
    privateKey,
    clientId,
    authKey: authKey ? "Provided" : "Not Provided"
  });

  const CWMOptions = {
    companyId: companyId,
    publicKey: publicKey,
    privateKey: privateKey,
    companyUrl : "api-na.myconnectwise.net",
    clientId: clientId
  }

  cwService = new TicketsApi(`${connectwiseUrl}`);
  cwTasks = new TicketTasksApi(`${connectwiseUrl}`);
  cwProductItems = new ProductsItemApi(`${connectwiseUrl}`);
  cwCompanies = new CompaniesApi(`${connectwiseUrl}`);
  cwCompaniesTeams = new CompanyTeamsApi(`${connectwiseUrl}`);
  cwManage = new ManageAPI(CWMOptions);

  cwCompanies.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  console.log("ConnectWise APIs initialized successfully.");
} catch (error) {
  console.error("Error initializing ConnectWise API:", error);
  throw new Error("Failed to initialize ConnectWise API.");
}

// Fetch a ticket by its ID
async function fetch_ticket_by_id(ticketId) {
  console.log(`Entering fetch_ticket_by_id with ticketId: ${ticketId}`);
  try {
    console.log("Calling cwService.serviceTicketsIdGet...");
    const response = await cwService.serviceTicketsIdGet({ id: ticketId });
    console.log("Fetch ticket response: ", response);
    return response;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw new Error("Failed to fetch ticket.");
  }
}

async function fetch_ticket_tasks_by_id(ticketId) {
  console.log(`Entering fetch_ticket_tasks_by_id with ticketId: ${ticketId}`);
  try {
    console.log("Calling cwTasks.serviceTicketsIdTasksGet...");
    const response = await cwTasks.serviceTicketsIdTasksGet({ id: ticketId });
    console.log("Fetch ticket tasks response: ", response);
    return response;
  } catch (error) {
    console.error("Error fetching ticket tasks:", error);
    throw new Error("Failed to fetch ticket tasks.");
  }
}

// Fetch time entries related to a specific ticket
async function fetch_time_entries_for_ticket(ticketId) {
  console.log(`Entering fetch_time_entries_for_ticket with ticketId: ${ticketId}`);
  try {
    console.log("Calling cwService.serviceTicketsIdTimeentriesGet...");
    const response = await cwService.serviceTicketsIdTimeentriesGet({ id: ticketId });
    console.log("Fetch time entries response: ", response);
    return response;
  } catch (error) {
    console.error("Error fetching time entries:", error);
    throw new Error("Failed to fetch time entries.");
  }
}

async function createCompany(context, companyDetails, appointmentDetails, authState) {
  console.log("Entering createCompany with details:", companyDetails);

  const payload = {
    name: companyDetails.name,
    identifier: companyDetails.identifier || companyDetails.name.replace(/\s+/g, '').toLowerCase(),
    address: companyDetails.address,
    contactInfo: companyDetails.contactInfo,
    rep: companyDetails.rep,
    site: companyDetails.site || {
      id: 0,
      name: "Main",
      _info: {
        additionalProp1: "Null",
        additionalProp2: "Null",
        additionalProp3: "Null"
      }
    }
  };

  try {
    console.log("Checking if company exists...");
    const existingCompany = await getCompanyByIdentifier(payload.identifier);
    if (existingCompany) {
      console.log("Company already exists:", existingCompany);
      context.sendActivity(`This company already exists: ${existingCompany.name}`);

      const companyTeam = {
        company: existingCompany,
        accountManagerFlag: true,
        teamRole: "Account Manager",
        member: {
          id: 1,
          name: companyDetails.rep
        },
        contact: {
          id: 1,
          name: companyDetails.rep
        }
      }

      const companyTeamResponse = await cwCompaniesTeams.companyCompaniesIdTeamsPost({ companyTeam, id: 1 });

      //return existingCompany;
    }
    else
    {
      console.log("Creating new company with payload:", payload);
      const response = await cwCompanies.companyCompaniesPost({ company: payload });
      const companyTeam = {
        company: {
          id: response.id,
          identifier: response.identifier,
          name: response.name
        },
        accountManagerFlag: true,
        teamRole: "Account Manager",
        member: {
          id: 1,
          name: companyDetails.rep
        },
        contact: {
          id: 1,
          name: companyDetails.rep
        }
      }
      console.log("Company created successfully:", response);  

      const companyTeamResponse = await cwCompaniesTeams.companyCompaniesIdTeamsPost({ companyTeam, id: 1 });
      console.log("Company Team created successfully:", companyTeamResponse);
    }

    context.sendActivity(`Creating Appointment Ticket for company: ${payload.name}`);
    //const currentCompany = await getCompanyByIdentifier(payload.identifier);

    const formattedAppointment = formatAppointmentDateTime(appointmentDetails.date, appointmentDetails.time);

    const newTicket = await createSalesTicket(
      `New Appointment ${formattedAppointment}`,
      payload.address,
      payload.contactInfo,
      payload.rep,
      payload.identifier,
      context,
      authState
    );
    console.log("Appointment ticket created successfully:", newTicket);

    //return response;
  } catch (error) {
    console.error("Failed to create company:", error);
    throw error;
  }
}

async function getCompanyByIdentifier(identifier) {
  console.log(`Entering getCompanyByIdentifier with identifier: ${identifier}`);
  try {
    console.log("Calling cwCompanies.companyCompaniesGet...");
    const response = await cwCompanies.companyCompaniesGet({
      conditions: `identifier='${identifier}'`
    });
    console.log("Get company response:", response);
    return response && response.length > 0 ? response[0] : null;
  } catch (error) {
    console.error("Error fetching company by identifier:", error);
    return null;
  }
}

async function createSalesTicket(summary, address, contactInfo, rep, companyId, context, authState) {
  console.log("Entering createSalesTicket with details:", { summary, address, contactInfo, rep, companyId });

  const imageUrl = '../s3LogoSignature.png';

  try {
    //console.log("Calling cwService.postServiceTickets with payload:", payload);

    // Pass the payload directly
    const response = await cwManage.ServiceAPI.postServiceTickets({
      summary, // Ticket summary
      board: { name: "Sales" }, // Board name
      status: { name: "Scheduled" }, // Status name
      company: { identifier: companyId }, // Company ID
      //owner: { identifier: authState.userDisplayName }, // Owner identifier (logged-in user)
      initialDescription: `Company: ${companyId}\n\nAddress: ${address}\n\nContact Info: ${contactInfo}\n\nRep: ${rep}\n\n`, // Initial description
      recordType: "ServiceTicket", // Record type
      source: { name: "SDR - Jason Hone" }, // Source name
    })
    .then((ticket) => {
      console.log("Ticket created successfully:", ticket);
      context.sendActivity(`Sales ticket created with ID: ${ticket.id}`);
    })
      .catch((error) => { console.log(error);});
    
    return response;
  } catch (error) {
    console.error("Error creating sales ticket:", error);
    throw new Error("Failed to create sales ticket.");
  }
}

async function deleteSalesTicket(id, context, authState) {
  try {
    console.log("Attempting to delete ticket with ID:", id);

    // Ensure `id` is a valid number
    if (isNaN(id)) {
      throw new Error("Invalid ticket ID. Please provide a valid numeric ID.");
    }

    const response = await cwManage.ServiceAPI.deleteServiceTicketsById(id); // Pass `id` directly
    console.log("Ticket deleted successfully:", response);
    await context.sendActivity(`Sales ticket deleted with ID: ${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting sales ticket:", error);

    // Extract detailed error information for better debugging
    if (error.response) {
      console.error("API Response:", error.response.data);
    }

    await context.sendActivity("Failed to delete the sales ticket. Please try again later.");
    throw new Error("Failed to delete sales ticket.");
  }
}
// Helper function to format date and time
function formatAppointmentDateTime(date, time) {
  const appointmentDate = new Date(`${date}T${time}`);
  
  // Get day suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format the date: "Wednesday, Dec. 4th"
  const options = { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/New_York' };
  const formattedDate = appointmentDate.toLocaleDateString('en-US', options);
  const day = appointmentDate.getDate();
  const dayWithSuffix = formattedDate.replace(/\d+/, `${day}${getOrdinalSuffix(day)}`);

  // Format the time: "10 AM EST"
  const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' };
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', optionsTime);

  // Combine formatted date and time
  return `${dayWithSuffix} @ ${formattedTime} EST`;
}
module.exports = {
  fetch_ticket_by_id,
  fetch_time_entries_for_ticket,
  fetch_ticket_tasks_by_id,
  createCompany,
  getCompanyByIdentifier,
  createSalesTicket,
  deleteSalesTicket
};
