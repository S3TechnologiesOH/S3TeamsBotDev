const fs = require('fs');
const path = require('path');

const { TicketsApi, TicketTasksApi, ProductsItemApi, CompaniesApi, CompanyTeamsApi, CompanySitesApi, OpportunitiesApi, ContactsApi, OpportunityNotesApi } = require('connectwise-rest-api/release/api/api');
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
let cwService, cwTasks, cwProductItems, cwCompanies, cwCompaniesTeams, cwManage, cwSites;
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
//
  cwService = new TicketsApi(`${connectwiseUrl}`);
  cwTasks = new TicketTasksApi(`${connectwiseUrl}`);
  cwProductItems = new ProductsItemApi(`${connectwiseUrl}`);
  cwCompanies = new CompaniesApi(`${connectwiseUrl}`);
  cwCompaniesTeams = new CompanyTeamsApi(`${connectwiseUrl}`);
  cwManage = new ManageAPI(CWMOptions);
  cwSites = new CompanySitesApi(`${connectwiseUrl}`);
  cwOpportunities = new OpportunitiesApi(`${connectwiseUrl}`);
  cwContacts = new ContactsApi(`${connectwiseUrl}`);
  cwOpportunityNotes = new OpportunityNotesApi(`${connectwiseUrl}`);
  
  cwService.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  cwTasks.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  cwCompaniesTeams.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  cwSites.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  cwCompanies.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  cwOpportunities.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  cwContacts.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
  cwOpportunityNotes.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };

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
async function createSite(siteName, siteAddress, siteCity, siteState, companyId) {
  console.log("Entering createSite with details:", { siteName, siteAddress, siteCity, siteState, companyId });
  const response = await cwSites.companyCompaniesIdSitesPost({
    id: companyId,
    site: {
      name: siteName,
      addressLine1: siteAddress,
      city: siteCity,
    }
  });
}
async function createTeam(companyId, companyIdentifier, _teamRole, contactName) {
  console.log("Entering createTeam with details:", { companyId, teamRole, contactName });
      const teamResponse = await cwCompaniesTeams.companyCompaniesIdTeamsPost({
        id: companyId,
        companyTeam: {
            teamRole: _teamRole
          }
      });
}
async function createCompany(context, companyDetails, appointmentDetails, authState) {
  console.log("Entering createCompany with details:", companyDetails);

  const payload = {
    name: companyDetails.name,
    identifier: companyDetails.identifier || companyDetails.name.replace(/\s+/g, '').toLowerCase(),
    address: companyDetails.address,
    contactInfo: companyDetails.contactInfo,
    rep: companyDetails.rep,
  };

  try {
    console.log("Checking if company exists...");
    const existingCompany = await getCompanyByIdentifier(payload.identifier);
    if (existingCompany) {

      console.log("Company already exists:", existingCompany.id);
      context.sendActivity(`This company already exists: ${existingCompany.name}`);

      createSite(companyDetails.site._siteName, companyDetails.site._siteAddress,
         companyDetails.site._siteCity, companyDetails.site._siteState, existingCompany.id);

      createTeam(existingCompany.id, existingCompany.identifier, "Account Manager", companyDetails.rep);

      const companyTeam = {
        "company":{
          "id": existingCompany.id,
          "identifier": existingCompany.identifier,
          "name": existingCompany.name
        },
        "teamRole": {
          "name": "Account Manager"
        },
        "contact": {
          "name:": companyDetails.rep
        },
        "accountManagerFlag": true,
      };
      
      

      /*const teamResponse = await cwCompaniesTeams.companyCompaniesIdTeamsPost({
        companyTeam: companyTeam,
        id: existingCompany.id
      });
      console.log(teamResponse);
      */
      return existingCompany;
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
        contact: {
          name: companyDetails.rep
        }
      }
      console.log("Company created successfully:", response);  


      createSite(companyDetails.site._siteName, companyDetails.site._siteAddress,
         companyDetails.site._siteCity, companyDetails.site._siteState, response.id);

      createTeam(response.id, response.identifier, "Account Manager", companyDetails.rep);

      console.log("Company Team created successfully:", teamResponse);
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
async function getCompanies(){
  console.log("Entering getAllCompanies...");
  const pageSize = 100;
  let allCompanies = [];
  let currentPage = 1;
  let fetchedCompanies;

  try {
    do {
      console.log(`Fetching page ${currentPage} of companies...`);
      fetchedCompanies = await cwCompanies.companyCompaniesGet({
        page: currentPage,
        pageSize: pageSize,
      });

      if (fetchedCompanies && fetchedCompanies.length > 0) {
        allCompanies = allCompanies.concat(fetchedCompanies);
        console.log(`Page ${currentPage} fetched, total companies so far: ${allCompanies.length}`);
      } else {
        console.log("No more companies to fetch.");
        break;
      }

      // Process or store in chunks if total size exceeds limit
      if (JSON.stringify(allCompanies).length > 250000) {
        console.log(`Processing batch of ${allCompanies.length} companies...`);
        //await processCompaniesBatch(allCompanies);
        allCompanies = [];  // Reset for next batch
      }

      currentPage++;
    } while (fetchedCompanies.length === pageSize);

    // Process any remaining companies
    if (allCompanies.length > 0) {
      console.log(`Processing final batch of ${allCompanies.length} companies...`);
      //await processCompaniesBatch(allCompanies);
    }

    console.log("All companies fetched and processed successfully.");
  } catch (error) {
    console.error("Error fetching companies:", error);
    return null;
  }
}
async function processCompaniesBatch(companiesBatch) {
  try {
    console.log(`Processing ${companiesBatch.length} companies...`);

    // Example 1: Saving to a Database
    // Assuming db.save is a method to save a batch of companies
    // await db.save(companiesBatch);

    // Example 2: Sending to an External API in Smaller Chunks
    const chunkSize = 50;  // Adjust based on API limits
    for (let i = 0; i < companiesBatch.length; i += chunkSize) {
      const chunk = companiesBatch.slice(i, i + chunkSize);
      console.log(`Sending chunk of ${chunk.length} companies...`);
      
      // Example API call (replace with your actual API method)
      //const response = await someApiEndpoint.sendCompanies(chunk);
      //console.log(`Chunk processed. API response: ${response.status}`);
    }

    console.log(`Batch of ${companiesBatch.length} companies processed successfully.`);
  } catch (error) {
    console.error(`Error processing companies batch:`, error);
    // Handle retries or logging errors for further investigation
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
async function createOpportunity(opportunityReference) {

  try {
    const response = await cwOpportunities.salesOpportunitiesPost({ opportunity: opportunityReference });
    console.log("Opportunity created successfully:", response);
    return response;
} catch (error) {
    console.error("Error creating opportunity:", error);

    if (error.response) {
        const errorBody = await error.response.text();
        console.error("API Error Response Body:", errorBody);
    }

    return null;
}
}
async function createContact(contactReference) {
  try {
      const response = await cwContacts.companyContactsPost({ contact: contactReference });
      console.log("Contact created successfully:", response);
      return response;
  } catch (error) {
      console.error("Error creating contact:", error);

      if (error.response) {
          const errorBody = await error.response.text();
          console.error("API Error Response Body:", errorBody);
      }

      return null;
  }
}
async function createOpportunityNote(opportunityId, noteJson) {

  if (!noteJson) {
      console.error("No note text to create an opportunity note.");
      return null;
  }

  try {
      const response = await cwOpportunityNotes.salesOpportunitiesIdNotesPost({
          id: opportunityId,
          note: { text: noteJson.content }
      });
      console.log("Opportunity note created successfully:", response);
      return response;
  } catch (error) {
      console.error("Error creating opportunity note:", error);

      if (error.response) {
          const errorBody = await error.response.text();
          console.error("API Error Response Body:", errorBody);
      }
      return null;
  }
}
async function findCompanyIdByDealAccount(accountName) {
  try {
      // Read and parse deals.json
      const dealsPath = path.resolve(__dirname, 'deals.json');
      const dealsData = JSON.parse(fs.readFileSync(dealsPath, 'utf8'));

      // Find the deal with the matching account name
      const deal = dealsData.find(d => d.account && d.account.name === accountName);

      if (!deal) {
          console.log(`No deal found for account: ${accountName}`);
          return null;
      }

      console.log(`Deal found for account: ${deal.account.name}`);

      // Fetch all companies from ConnectWise
      const companies = await getCompanies();
      const companyString = JSON.stringify(companies, null, 2);
      //console.log(companyString);
      if (!companyString || companyString.length === 0) {
          console.log('No companies found from ConnectWise.');
          return null;
      }

      // Dump all company names into a txt file
      const companyDumpPath = path.resolve(__dirname, 'company_names.txt');
      const companyList = companies.map(c => `${c.name}`).join('\n');
      fs.writeFileSync(companyDumpPath, companyList);
      console.log('All company names dumped to company_names.txt');

      // Match the deal account name with the company name
      const matchedCompany = companies.find(c => c.name.toLowerCase() === deal.account.name.toLowerCase());

      if (!matchedCompany) {
          console.log(`No matching company found for account: ${deal.account.name}`);
          return null;
      }

      console.log(`Matched company ID: ${matchedCompany.id}`);
      return matchedCompany.id;

  } catch (error) {
      console.error('Error finding company by deal account:', error);
      return null;
  }
}
async function getCompanyById(id) {
  console.log(`Entering getCompanyByIdentifier with identifier: ${identifier}`);
  try {
    console.log("Calling cwCompanies.companyCompaniesGet...");
    const response = await cwCompanies.companyCompaniesGet({
      conditions: `id='${id}'`
    });
    console.log("Get company response:", response);
    return response && response.length > 0 ? response[0] : null;
  } catch (error) {
    console.error("Error fetching company by identifier:", error);
    return null;
  }
}
function readCompaniesFromFile() {
  const filePath = path.join(__dirname, 'companies_dump.txt');
  const data = fs.readFileSync(filePath, 'utf-8');
  const companies = JSON.parse(data);
  console.log("Total companies read:", companies.length);
  return companies;
} 
function extractParagraphText(rawNote) {
  try {
      // Check if the note has a content field
      if (!rawNote || !rawNote.content) {
          throw new Error("Content field is missing.");
      }
      
      // Parse the content field
      const parsedContent = JSON.parse(rawNote.content);

      // Check if parsed content has the expected structure
      if (!parsedContent || !Array.isArray(parsedContent.content)) {
          throw new Error("Invalid or missing content structure.");
      }
    
      // Extract text from paragraph nodes
      const paragraphText = parsedContent.content
          .filter(item => item.type === "paragraph") // Filter for paragraph nodes
          .flatMap(item =>
              (item.content || []) // Handle potential missing content arrays
                  .filter(subItem => subItem.type === "text") // Extract text nodes
                  .map(subItem => subItem.text) // Get the text value
          )
          .join("\n"); // Join paragraphs with newlines

      return paragraphText || "No paragraph content found.";
  } catch (error) {
      console.error("Error extracting paragraph text:", error.message);
      return "Error extracting content.";
  }
}

module.exports = {
  fetch_ticket_by_id,
  fetch_time_entries_for_ticket,
  fetch_ticket_tasks_by_id,
  createCompany,
  getCompanyByIdentifier,
  createSalesTicket,
  deleteSalesTicket,
  createSite,
  getCompanies,
  extractParagraphText,
  createOpportunityNote,
  createContact,
  createOpportunity, 
  getCompanyById, 
  findCompanyIdByDealAccount
};
