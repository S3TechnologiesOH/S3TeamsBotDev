const { CompaniesApi } = require('connectwise-rest-api/release/api/api');
const { OpportunitiesApi } = require('connectwise-rest-api/release/api/api');
const { ContactsApi } = require('connectwise-rest-api/release/api/api');
const { ActivitiesApi } = require('connectwise-rest-api/release/api/api');
const { OpportunityNotesApi } = require('connectwise-rest-api/release/api/api');

const fs = require('fs');
const path = require('path');

const connectwiseUrl = "https://api-na.myconnectwise.net/v4_6_release/apis/3.0";
//const companyId = process.env.CW_COMPANY_ID;
//const publicKey = process.env.CW_PUBLIC_KEY;
//const privateKey = process.env.CW_PRIVATE_KEY;
const clientId = "4fc2a6d8-3188-4809-ac24-d32aeef18e6c";
const authKey = "TXlTM1RlY2grZUp6Q2h1TTFVOTAxZUhNWjpyVVl3em1YNm9MdjFiaVZ0";

let cwCompanies;
let cwContacts;
let cwActivities;
let cwOpportunities;
let cwOpportunityNotes;

cwCompanies = new CompaniesApi(`${connectwiseUrl}`);
cwOpportunities = new OpportunitiesApi(`${connectwiseUrl}`);
cwContacts = new ContactsApi(`${connectwiseUrl}`);
cwActivities = new ActivitiesApi(`${connectwiseUrl}`);
cwOpportunityNotes = new OpportunityNotesApi(`${connectwiseUrl}`);


cwCompanies.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
cwOpportunities.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
cwContacts.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
cwActivities.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };
cwOpportunityNotes.defaultHeaders = { 'Authorization': `Basic ${authKey}`, 'clientId': clientId };

async function createOpportunity(opportunityReference) {

  try {
    const response = await cwOpportunities.salesOpportunitiesPost({ opportunity: opportunityReference });
        //console.log("Opportunity created successfully:", response);
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

async function createActivity(activityReference) {

    try {
        const response = await cwActivities.salesActivitiesPost({ activity: activityReference});
        console.log("Activity created successfully:", response);
        return response;
    } catch (error) {
        // Log basic error information and stack trace if available
        console.error("Error creating activity:", error.message);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
    
        // If error response is available, log status and headers as well
        if (error.response) {
            console.error("Response Status:", error.response.status);
            console.error("Response Headers:", JSON.stringify(error.response.headers, null, 2));
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
          note: { text: noteJson }
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

        console.log(`Matched company ID: ${matchedCompany.identifier}`);
        return matchedCompany;

    } catch (error) {
        console.error('Error finding company by deal account:', error);
        return null;
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


  async function getCompanies() {
    console.log("Starting to fetch all companies...");
    const pageSize = 500;
    let allCompanies = [];
    let currentPage = 1;
    let fetchedCompanies;
    const filePath = path.join(__dirname, 'companies_dump.txt');

    try {
        // Clear the file at the start
        fs.writeFileSync(filePath, '[\n');

        do {
            console.log(`Fetching page ${currentPage}...`);
            fetchedCompanies = await cwCompanies.companyCompaniesGet({
                page: currentPage,
                pageSize: pageSize,
            });

            if (fetchedCompanies && fetchedCompanies.length > 0) {
                allCompanies.push(...fetchedCompanies);
                console.log(`Fetched ${fetchedCompanies.length} companies, total so far: ${allCompanies.length}`);
            } else {
                console.log("No more companies to fetch.");
                break;
            }

            // Write in batches to avoid memory overflow, keeping valid JSON format
            if (allCompanies.length >= pageSize) {
                console.log(`Writing ${allCompanies.length} companies to file...`);
                const data = allCompanies.map(company => JSON.stringify(company)).join(',\n');
                fs.appendFileSync(filePath, data + ',\n');
                allCompanies = [];
            }

            currentPage++;
        } while (fetchedCompanies.length === pageSize);

        // Write remaining companies, ensuring valid JSON format
        if (allCompanies.length > 0) {
            console.log(`Writing final batch of ${allCompanies.length} companies...`);
            const data = allCompanies.map(company => JSON.stringify(company)).join(',\n');
            fs.appendFileSync(filePath, data + '\n');
        }

        // Properly close the JSON array
        fs.appendFileSync(filePath, ']');
        
        console.log("All companies fetched and written successfully.");
        return readCompaniesFromFile();  // Return the companies read from the file

    } catch (error) {
        console.error("Error fetching companies:", error);
        fs.appendFileSync(filePath, ']');
        return [];  // Return empty array on error
    }
}

//Connectwise Utility ----------

// Reading companies from file
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




  module.exports = { extractParagraphText, createOpportunityNote, createActivity, createContact, createOpportunity, getCompanyById, getCompanyByIdentifier, getCompanies, findCompanyIdByDealAccount };