const connectwiseAPI = require("./connectwiseAPI"); // ConnectWise API logic
const { logCommand } = require('../Data/sqlManager');
const { CardFactory } = require('botbuilder');
const salesTicketManager = require('./salesTicketManager');

/**
 * Handle company creation including ConnectWise API calls
 */
async function handleCreateCompany(context, companyName, companyAddress, companyContactInformation, rep, 
  siteName, siteAddress, siteCity, selectedState, companyId, marketChoice, appointmentDate, appointmentTime, authState) {
  
  try {
    // Log the company creation attempt
    await logCommand(authState?.userDisplayName || "Unknown User", `Create Company: ${companyName}`);
    
    // Validate required fields
    if (!companyName || !companyAddress || !companyContactInformation || !rep || 
        !siteName || !siteAddress || !siteCity || !selectedState) {
      await context.sendActivity("Missing required company information. Please fill in all required fields.");
      return;
    }

    // Prepare the company data for ConnectWise
    const companyData = {
      name: companyName,
      identifier: companyId || generateCompanyIdentifier(companyName),
      addressLine1: companyAddress,
      types: [{ id: 1 }], // Default company type
      status: { id: 1 }, // Default active status
      market: marketChoice || "Other"
    };

    // Create the company in ConnectWise
    const createdCompany = await connectwiseAPI.createCompany(companyData);
    
    if (!createdCompany || !createdCompany.id) {
      throw new Error("Failed to create company in ConnectWise");
    }
    
    // Parse contact information
    const contactDetails = parseContactInformation(companyContactInformation);
    
    // Create site
    const siteData = {
      name: siteName,
      addressLine1: siteAddress,
      city: siteCity,
      stateIdentifier: selectedState,
      companyId: createdCompany.id
    };
    
    const createdSite = await connectwiseAPI.createSite(siteData);

    // Create contact
    if (contactDetails && contactDetails.name) {
      const contactData = {
        firstName: contactDetails.name.split(' ')[0] || "Contact",
        lastName: contactDetails.name.split(' ').slice(1).join(' ') || "",
        companyId: createdCompany.id,
        communicationItems: []
      };
      
      if (contactDetails.phone) {
        contactData.communicationItems.push({
          type: { id: 1 }, // Phone
          value: contactDetails.phone
        });
      }
      
      if (contactDetails.email) {
        contactData.communicationItems.push({
          type: { id: 2 }, // Email
          value: contactDetails.email
        });
      }
      
      await connectwiseAPI.createContact(contactData);
    }

    // Create a service ticket if appointment info is provided
    if (appointmentDate) {
      const ticketData = {
        summary: `New Company Setup: ${companyName}`,
        companyId: createdCompany.id,
        siteId: createdSite.id,
        status: { id: 1 }, // New status
        impact: { id: 3 }, // Medium impact
        severity: { id: 3 }, // Medium severity
        owner: { identifier: rep },
        board: { id: 1 }, // Default board
        dateNeeded: appointmentDate,
        time: appointmentTime,
        notes: `New company setup appointment on ${appointmentDate} at ${appointmentTime || 'TBD'}.
                \nContact: ${companyContactInformation}`
      };
      
      await salesTicketManager.createServiceTicket(ticketData);
    }

    // Send success message
    const successCard = {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.4",
      body: [
        {
          type: "TextBlock",
          text: "✅ Company Created Successfully",
          size: "Large",
          weight: "Bolder",
          wrap: true
        },
        {
          type: "FactSet",
          facts: [
            { title: "Company Name:", value: companyName },
            { title: "Company ID:", value: createdCompany.id.toString() },
            { title: "Site:", value: siteName }
          ]
        }
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Return to Menu",
          data: { action: "showWelcomeCard" }
        }
      ]
    };
    
    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(successCard)]
    });
    
  } catch (error) {
    console.error("Error creating company:", error);
    
    // Send error message
    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard({
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.4",
        body: [
          {
            type: "TextBlock",
            text: "❌ Error Creating Company",
            size: "Large",
            weight: "Bolder",
            color: "Attention",
            wrap: true
          },
          {
            type: "TextBlock",
            text: `There was an error creating the company: ${error.message}`,
            wrap: true
          }
        ],
        actions: [
          {
            type: "Action.Submit",
            title: "Try Again",
            data: { action: "showCreateCompanyCard" }
          }
        ]
      })]
    });
  }
}

/**
 * Generate a company identifier from company name
 */
function generateCompanyIdentifier(companyName) {
  return companyName
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .substring(0, 10) // Take first 10 chars
    .toUpperCase();
}

/**
 * Parse contact information string into structured object
 */
function parseContactInformation(contactInfo) {
  // Basic parsing - can be enhanced based on expected format
  const result = { name: "", phone: "", email: "" };
  
  if (!contactInfo) return result;
  
  // Try to extract email
  const emailMatch = contactInfo.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    result.email = emailMatch[0];
    contactInfo = contactInfo.replace(result.email, '').trim();
  }
  
  // Try to extract phone
  const phoneMatch = contactInfo.match(/(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
    contactInfo = contactInfo.replace(result.phone, '').trim();
  }
  
  // Remaining is likely the name
  result.name = contactInfo.trim();
  
  return result;
}

module.exports = { handleCreateCompany };