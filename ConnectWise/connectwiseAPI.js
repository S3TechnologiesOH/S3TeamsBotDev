const { TicketsApi, TicketTasksApi, ProductsItemApi, CompaniesApi } = require('connectwise-rest-api/release/api/api');  // Ensure this is the correct import

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
          name: "Main"
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

      console.log("Company created successfully: ", response);
      return response;
  } catch (error) {
      console.error("Failed to create company: ", error);
      throw error;
  }
}

async function getCompanyByIdentifier(identifier) {
  try {
      const conditions = `identifier=${encodeURIComponent(identifier)}`;
      console.log(`Fetching company with identifier: identifier=${encodeURIComponent(identifier)}`);
      const response = await cwService.companyCompaniesGet({ conditions });
      if (response && response.length > 0) {
          return response[0];
      }
      return null;
  } catch (error) {
      console.error("Failed to retrieve company: ", error);
      return null;
  }
}

async function deleteCompany(companyId) {
  try {
      await cwCompanies.companyCompaniesIdDelete({ id: companyId });
      console.log(`Company with ID ${companyId} deleted successfully.`);
  } catch (error) {
      if (error.response?.status === 409) {
          console.error(`Failed to delete company with ID ${companyId}: The company has dependencies.`);
      } else {
          console.error("Failed to delete company:", error);
          throw error;
      }
  }
}

async function createSalesTicket(summary, companyId) {
  console.log("Creating sales ticket: ", summary, " for company: ", companyId);
}
module.exports = {testProducts, fetch_ticket_by_id, fetch_time_entries_for_ticket,
   fetch_ticket_tasks_by_id, createCompany, getCompanyByIdentifier, deleteCompany, createSalesTicket};
