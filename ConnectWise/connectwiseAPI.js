const { TicketsApi, TicketTasksApi, ProductsItemApi, CompaniesApi } = require('connectwise-rest-api/release/api/api');
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
let cwService, cwTasks, cwProductItems, cwCompanies, cwManage;
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

async function createCompany(context, companyDetails, authState) {
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
      //return existingCompany;
    }
    else
    {
      console.log("Creating new company with payload:", payload);
      const response = await cwCompanies.companyCompaniesPost({ company: payload });
      console.log("Company created successfully:", response);  
    }

    context.sendActivity(`Creating Appointment Ticket for company: ${payload.name}`);
    const currentCompany = await getCompanyByIdentifier(payload.identifier);
    const newTicket = await createSalesTicket(
      "New Appointment",
      payload.address,
      payload.contactInfo,
      payload.rep,
      currentCompany.id,
      context,
      authState
    );
    console.log("Appointment ticket created successfully:", newTicket);

    return response;
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

  // Construct the payload
  payload = {
    summary, // Ticket summary
    company: { id: companyId }, // Company ID
    status: { id: 0, name: "New", sort: 0 }, // Ticket status
    priority: { name: "Normal" }, // Ticket priority
    board: { name: "Sales" }, // Board name
    owner: { identifier: authState.userDisplayName }, // Owner identifier (logged-in user)
    source: { name: "SDR - Jason Hone" }, // Source name
    initialDescription: `Company: ${companyId}\n\nAddress: ${address}\n\nContact Info: ${contactInfo}\n\nRep: ${rep}\n\nJason Hone|Business Development\n\nDirect-(234)252-1739 (O)330.648.5408 x129| jhone@mys3tech.com | www.mys3tech.com\n\n90 N. Prospect St. Akron, OH 44304| 752 N State St. Westerville, OH 43081`, // Description with relevant details
  };

  try {
    console.log("Calling cwService.postServiceTickets with payload:", payload);

    // Pass the payload directly
    const response = await cwManage.ServiceAPI.postServiceTickets(payload);

    console.log("Sales ticket created successfully:", response);
    context.sendActivity(`Sales ticket created with ID: ${response.id}`);
    return response;
  } catch (error) {
    console.error("Error creating sales ticket:", error);
    throw new Error("Failed to create sales ticket.");
  }
}


module.exports = {
  fetch_ticket_by_id,
  fetch_time_entries_for_ticket,
  fetch_ticket_tasks_by_id,
  createCompany,
  getCompanyByIdentifier,
  createSalesTicket
};
