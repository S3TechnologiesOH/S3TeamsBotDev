const { TicketsApi } = require('connectwise-rest-api/release/api/api');  // Ensure this is the correct import

// Set your ConnectWise configuration
const connectwiseUrl = process.env.CW_URL;  // Your ConnectWise URL
const companyId = process.env.CW_COMPANY_ID;
const publicKey = process.env.CW_PUBLIC_KEY;
const privateKey = process.env.CW_PRIVATE_KEY;

// Authenticate with ConnectWise using a basic auth header
const authKey = Buffer.from(`${companyId}+${publicKey}:${privateKey}`).toString('base64');

// Initialize the Tickets API
let cwService;
console.log(`Company ID: ${process.env.CW_COMPANY_ID}`);
console.log(`Public Key: ${process.env.CW_PUBLIC_KEY}`);
try {
  cwService = new TicketsApi(`${connectwiseUrl}`);  // Initialize API without version path in the base URL
  cwService.defaultHeaders = { 'Authorization': `Basic ${authKey}` };
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
    // You can use the appropriate ConnectWise API endpoint here for time entries
    // Assuming `serviceTicketsIdGetTimeEntries` is a valid endpoint in your API:
    const response = await cwService.serviceTicketsIdTimeEntriesGet(ticketId);
    return response; // The time entries will be returned as an array
  } catch (error) {
    console.error("Error fetching time entries:", error);
    throw new Error("Failed to fetch time entries.");
  }
}

module.exports = { fetch_ticket_by_id, fetch_time_entries_for_ticket };
