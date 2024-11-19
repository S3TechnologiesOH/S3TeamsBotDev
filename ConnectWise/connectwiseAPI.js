const { TicketsApi, TicketTasksApi, ProductsItemApi, CompaniesApi } = require('connectwise-rest-api/release/api/api');  // Ensure this is the correct import
const { ManageAPI } = require('connectwise-rest');
const { CommonParameters, CWMOptions } = require('connectwise-rest');
const { TeamsBot, authState} = require('../teamsBot');

// Set your ConnectWise configuration
const connectwiseUrl = process.env.CW_URL;  // Your ConnectWise URL
const companyId = process.env.CW_COMPANY_ID;
const publicKey = process.env.CW_PUBLIC_KEY;
const privateKey = process.env.CW_PRIVATE_KEY;
const clientId = process.env.CW_CLIENTID;
const authKey = process.env.CW_AUTHKEY;

// Authenticate with ConnectWise using a basic auth header
//console.log(`Auth Key: ${authKey}`);
// Initialize the Tickets API
let cwService;
//console.log(`Company ID: ${process.env.CW_COMPANY_ID}`);
//console.log(`Public Key: ${process.env.CW_PUBLIC_KEY}`);

try {
  cwService = new TicketsApi(`${connectwiseUrl}`);  // Initialize API without version path in the base URL
  cwTasks = new TicketTasksApi(`${connectwiseUrl}`);
  cwProductItems = new ProductsItemApi(`${connectwiseUrl}`);
  cwCompanies = new CompaniesApi(`${connectwiseUrl}`);

  console.log("company id: ", companyId);
  console.log("public key: ", publicKey);
  console.log("private key: ", privateKey);
  console.log("base url: ", connectwiseUrl);
  console.log("client id: ", clientId);
  options = {companyId, publicKey, privateKey, connectwiseUrl, clientId};
  cwManage = new ManageAPI(options);
  cwCompanies.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };

} catch (error) {
  console.error("Error initializing ConnectWise API:", error);
  throw new Error("Failed to initialize ConnectWise API.");
}

async function testProducts(){
  try{
    var response = await cwProductItems.procurementProductsGet({conditions: "ticket/id=52843"});
    console.log("Got procurement products: ", response);
  }
  catch{
    console.log("Error getting procurement products");
  }
}
// Fetch a ticket by its ID
async function fetch_ticket_by_id(ticketId) {
  console.log(`Fetching ticket with ID: ${ticketId}`);
  try {
    var response = await cwService.serviceTicketsIdGet({ id: ticketId });  // Pass the id as part of an object
    console.log("Ticket Response: ", response);
    return response;  // The full ticket data will be returned as an object
  } catch (error) {

    console.error("Error fetching ticket:", error);
    throw new Error("Failed to fetch ticket.");
  }
}

async function fetch_ticket_tasks_by_id(ticketId) {
  try {
    const response = await cwTasks.serviceTicketsIdTasksGet({ id: ticketId });
    console.log("Task Response: ", response);
    return response;
  } catch (error) {
    console.error("Error fetching ticket tasks:", error);
    throw new Error("Failed to fetch ticket tasks.");
  }
}

// Fetch time entries related to a specific ticket
async function fetch_time_entries_for_ticket(ticketId) {
  try {
    // Assuming `serviceTicketsIdGetTimeEntries` is a valid endpoint in your API:
    const response = await cwService.serviceTicketsIdTimeentriesGet( { id : ticketId });
    return response; // The time entries will be returned as an array
  } catch (error) {
    console.error("Error fetching time entries:", error);
    throw new Error("Failed to fetch time entries.");
  }
}

async function createCompany(context, companyDetails) {
  
  const payload = {
    name: companyDetails.name,
    identifier: companyDetails.identifier || companyDetails.name.replace(/\s+/g, '').toLowerCase(),
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
      // Check if the company already exists
      const existingCompany = await getCompanyByIdentifier(payload.identifier);
      if (existingCompany) {
          console.log(`This company already exists:`, existingCompany);
          context.sendActivity(`This company already exists: ${existingCompany.name}`);
          return existingCompany; // Return the existing company instead of proceeding
      }

      // Create a new company
      context.sendActivity(`Creating Company...: ${payload.name}`);
      const response = await cwCompanies.companyCompaniesPost({ company: payload });
      context.sendActivity(`Company Created: ${payload.name}`);

      context.sendActivity(`Creating Appointment Ticket...: ${payload.name}`);
      const newTicket = await createSalesTicket("New Appointment", payload.address, payload.contactInfo, payload.rep, response.id, context);
      context.sendActivity(`Created Appointment For Company: ${payload.name}`);

      console.log("Company created successfully: ", response);
      return response;
  } catch (error) {
      console.error("Failed to create company: ", error);
      throw error;
  }
}

  async function getCompanyByIdentifier(identifier) {
        try {
            const response = await this.cwCompanies.companyCompaniesGet({
                conditions: `identifier='${identifier}'` // Ensure correct field name is used
            });
            if (response && response.length > 0) {
                return response[0];
            }
            return null;
        } catch (error) {
            console.error("Failed to retrieve company: ", error);
            return null;
        }
  }

  async function createSalesTicket(summary, address, contactInfo, rep, companyId, context) {
    console.log(`Creating sales ticket: ${summary} for company ID: ${companyId}`);
  
    const imageUrl = '../s3LogoSignature.png';

    const payload = {
      summary: summary,
      company: {
        id: companyId, // ConnectWise company ID
      },
      status: {
        name: "New", // Replace with your desired ticket status
      },
      priority: {
        name: "Normal", // Replace with your desired priority
      },
      board: {
        name: "Sales", // Replace with the relevant board name
      },
      owner: {
        identifier: authState.userDisplayName, // Replace with a valid user ID
      },
      source: {
        name: "SDR - Jason Hone"
      },
      initialDescription: `Company:   ${companyId} \n\n 
                          Address:   ${address} \n\n
                          Contact Info: ${contactInfo}  \n\n 
                          Rep: ${rep} \n\n
                          Jason Hone|Business Development \n\n
                          Direct-(234)252-1739 (O)330.648.5408 x129| jhone@mys3tech.com | www.mys3tech.com \n\n
                          90 N. Prospect St. Akron, OH 44304| 752 N State St. Westerville, OH 43081 // Replace with your desired description
                          ${imageUrl}`, 
    };                            
  
    try {
      const response = await cwService.serviceTicketsPost({ serviceTicket: payload });
      console.log("Sales ticket created successfully:", response);
      context.sendActivity(`Sales ticket created with ID: ${response.id}`);
      return response;
    } catch (error) {
      console.error("Error creating sales ticket:", error);
      throw new Error("Failed to create sales ticket.");
    }
  }
  
module.exports = {testProducts, fetch_ticket_by_id, fetch_time_entries_for_ticket,
   fetch_ticket_tasks_by_id, createCompany, getCompanyByIdentifier, createSalesTicket};
