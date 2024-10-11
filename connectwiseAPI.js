const { Connectwise} = require('connectwise-rest-api');
const { TicketsApi, Ticket } = require('connectwise-rest-api/release/api/api');

// Set your ConnectWise configuration
const connectwiseUrl = process.env.CW_URL;  // Your ConnectWise URL
const companyId = process.env.CW_COMPANY_ID;
const publicKey = process.env.CW_PUBLIC_KEY;
const privateKey = process.env.CW_PRIVATE_KEY;

// Authenticate with ConnectWise using a basic auth header
const authKey = Buffer.from(`${companyId}+${publicKey}:${privateKey}`).toString('base64');
const cwService = new TicketsApi(`${connectwiseUrl}/v4_6_release/apis/3.0`);
cwService.defaultHeaders = { 'Authorization': `Basic ${authKey}` };

// Fetch a ticket by its ID
async function fetch_ticket_by_id(ticketId) {
  console.log(`Fetching ticket with ID: ${ticketId}`);
  try {
    const response = await cwService.serviceTicketsIdGet({ id: ticketId });  // Pass the id as part of an object
    return response;  // The full ticket data will be returned as an object
  } catch (error) {
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
