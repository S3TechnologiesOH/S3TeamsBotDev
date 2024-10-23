const { TicketsApi } = require('connectwise-rest-api/release/api/api');  // Ensure this is the correct import

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
  cwService.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
} catch (error) {
  console.error("Error initializing ConnectWise API:", error);
  throw new Error("Failed to initialize ConnectWise API.");
}

// Fetch a ticket by its ID
async function fetch_ticket_by_id(ticketId) {
  console.log(`Fetching ticket with ID: ${ticketId}`);
  try {
    const response = await cwService.serviceTicketsIdGet({ id: ticketId });  // Pass the id as part of an object
    return response;  // The full ticket data will be returned as an object
  } catch (error) {
    console.log(`Company ID: ${process.env.CW_COMPANY_ID}`);
    console.log(`Public Key: ${process.env.CW_PUBLIC_KEY}`);
    console.error("Error fetching ticket:", error);
    throw new Error("Failed to fetch ticket.");
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

module.exports = { fetch_ticket_by_id, fetch_time_entries_for_ticket };
