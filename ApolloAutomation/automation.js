// Main Script File
const { ActivitiesAPI } = require('./ActivitiesAPI.js');
const { NotesAPI } = require('./NotesAPI.js');
const { ContactsAPI } = require('./ContactsAPI.js');
const { DealsAPI } = require('./DealsAPI.js');
const dealsJson = require('./deals.json');
const { getQuotes, exportQuotesToJson, handleQuoteRequest, extractTermsAndConditions } = require('./cpqAPI.js');
const { createOpportunityNote, createContact, getCompanyById, getCompanyByIdentifier, getCompanies, findCompanyIdByDealAccount, createOpportunity, createActivity } = require('./ConnectWiseAPI.js');


// Example Usage

let foundCompanyID;
let companyIdentifier;
let companyReference = {};
let opportunityReference;
let contactReference;
let memberReference;
let siteReference;

let contactData;
let memberData;
let siteData;

let contactId;

const activites = new ActivitiesAPI();
//const notes = new NotesAPI();
const contacts = new ContactsAPI();
const deals = new DealsAPI();

async function createOpportunityEntry(foundCompanyID, contactId, foundCompanyIdentifier, siteReference, memberReference) {
    const opportunityReference = {
        company: { id: foundCompanyID },
        contact: { id: contactId },
        name: `${foundCompanyIdentifier}`,
        primarySalesRep: memberReference,
        site: siteReference
    };
    console.log("OPPORTUNITY REFERENCE:", opportunityReference.company, opportunityReference.contact, opportunityReference.name, opportunityReference.primarySalesRep, opportunityReference.site);
    const opportunityResponse = await createOpportunity(opportunityReference);
    console.log("Opportunity creation response:", opportunityResponse);
    return { opportunityResponse, opportunityReference };
}

async function createActivityEntry(opportunityResponse, opportunityReference, opportunityId) {
    const { raw: activityRaw } = await activites.dumpResultsToFile(opportunityId);
    if (Array.isArray(activityRaw) && activityRaw.length > 0) {
        for (const activity of activityRaw) {
            // Process only phone_call and emailer_message types
            if (activity.type === "phone_call") {
                if (!activity.phone_call) {
                    console.log("No phone_call details found in activity:", activity);
                    continue;
                }
                const callDate = activity.phone_call.start_time;
                let statusName = "Open";
                if (activity.phone_call.status && activity.phone_call.status.toLowerCase() === "completed") {
                    statusName = "Closed";
                }
                const activityReference = {
                    assignTo: { id: 0, identifier: "CAtwell" },
                    name: "Call",
                    opportunity: { id: opportunityResponse.id, name: opportunityReference.name },
                    status: { name: statusName },
                };
                console.log("Creating phone call activity with reference:", JSON.stringify(activityReference, null, 2));
                const activityResponse = await createActivity(activityReference, opportunityId);
                if (activityResponse && activityResponse.id) {
                    console.log("Activity created successfully for phone_call.");
                } else {
                    console.error("Activity creation failed for phone_call.");
                }
            } else if (activity.type === "emailer_message") {
                if (!activity.emailer_message) {
                    console.log("No emailer_message details found in activity:", activity);
                    continue;
                }
                const emailBody = activity.emailer_message.body_text;
                let statusName = "Open";
                if (activity.emailer_message.status && activity.emailer_message.status.toLowerCase() === "completed") {
                    statusName = "Closed";
                }
                const activityReference = {
                    assignTo: { id: 0, identifier: "CAtwell" },
                    name: "Email",
                    opportunity: { id: opportunityResponse.id, name: opportunityReference.name },
                    status: { name: statusName },
                    notes: emailBody  // add the email body as notes
                };
                console.log("Creating email activity with reference:", JSON.stringify(activityReference, null, 2));
                const activityResponse = await createActivity(activityReference, opportunityId);
                if (activityResponse && activityResponse.id) {
                    console.log("Activity created successfully for emailer_message.");
                } else {
                    console.error("Activity creation failed for emailer_message.");
                }
            } else {
                console.log("Ignoring activity type:", activity.type);
            }
        }
    } else {
        console.error("Activity data is empty or invalid.");
    }
}

async function SetReferences(opportunityId) {
    try {
        let foundCompany;
        let foundCompanyIdentifier;
        let foundCompanyID;
        // COMPANY ID --------------------------------------------------------------
        try {
            const foundCompany = await findCompanyIdByDealAccount("Country Meats");
            console.log("Found Company ID:", foundCompany.identifier, " with ID: ", foundCompany.id);
            companyReference = { id: foundCompany.id };
            foundCompanyID = foundCompany.id;
            foundCompanyIdentifier = foundCompany.identifier;
        } catch (err) {
            console.error("Error finding company ID:", err);
            companyReference = { id: null };
        }

        // CONTACT --------------------------------------------------------------
        const { raw, processed } = await contacts.dumpContactsResultsToFile(opportunityId);
        let contactReference = null;
        if (Array.isArray(raw) && raw.length > 0) {
            contactReference = {
                firstName: raw[0].first_name != null ? raw[0].first_name : "Unknown",
                lastName: raw[0].last_name != null ? raw[0].last_name : "Unknown",
                addressLine1: raw[0].present_raw_address != null ? raw[0].present_raw_address : "N/A"
            };

            const response = await createContact(contactReference);
            if (response && response.id) {
                contactId = response.id;
            } else {
                console.error("Contact creation failed.");
            }
        } else {
            console.error("Contact data is empty or invalid.");
        }

        // PRIMARY SALES REP --------------------------------------------------------------
        // Read deals.json (already imported as dealsJson) and find the deal that matches the opportunity id.
        let memberIdentifier = "CAtwell"; // default identifier
        const matchingDeal = dealsJson.find(deal => deal.id === opportunityId);
        if (matchingDeal && matchingDeal.owner_id) {
            let owners = [
                ["CLarker", "63c967a24e46a8010fec18ab"],
                ["JHone", "6491a1459dd9be00c36706ba"],
                ["KPotenza", "623de04527f2f4013309ea08"],
                ["KWolff", "63d29203650c6f00f94542a8"],
                ["TDirker", "63fcb9d742361c0105a3f64f"]
            ];
            const matchedOwner = owners.find(([name, id]) => id === matchingDeal.owner_id);
            if (matchedOwner) {
                memberIdentifier = matchedOwner[0];
            }
        }

        memberReference = { id: 0, identifier: memberIdentifier };
        siteReference = { name: "Baltimore" };

        // Create the opportunity using the new function.
        const { opportunityResponse, opportunityReference } = await createOpportunityEntry(
            foundCompanyID,
            contactId,
            foundCompanyIdentifier,
            siteReference,
            memberReference
        );

    // Create the activity using the new function.
    await createActivityEntry(opportunityResponse, opportunityReference, opportunityId);

    } catch (error) {
        console.error("Error:", error);
    }
}


async function getDeal() {
    try {
        const deal = await deals.getDealById(opportunityId);
        console.log("Deal: ", deal);
    } catch (error) {
        console.error('Error fetching deal:', error);
    }
}

(async () => {
    const quotes = await getQuotes();
    exportQuotesToJson(quotes);
})();

module.exports = { getDeal, SetReferences };