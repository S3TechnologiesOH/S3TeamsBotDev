const { CardFactory } = require("botbuilder");

async function showCompanyCreationCard(context) {
  const companyCreationCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Create a Company",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Company Details.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "Input.Text",
        id: "companyName", // Input field for the ticket ID
        placeholder: "Enter a Company Name",
        isRequired: true,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "rep", // Input field for the ticket ID
        placeholder: "Enter an Account Manager",
        isRequired: true,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "companyAddress", // Input field for the ticket ID
        placeholder: "Enter the Company Address",
        isRequired: true,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "companyContactInformation", // Input field for the ticket ID
        placeholder: "Enter the Company Contact Information",
        isRequired: true,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "siteName", // Input field for the ticket ID
        placeholder: "Enter a Site Name",
        label: "Site Information",
        isRequired: true,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "siteAddress", // Input field for the ticket ID
        placeholder: "Enter a Site Address",
        isRequired: true,
        spacing: "Small",
      },
      {
        type: "Input.Text",
        id: "siteCity", // Input field for the ticket ID
        placeholder: "Enter a Site City",
        isRequired: true,
        spacing: "Small",
      },
      {
        type: "Input.ChoiceSet",
        id: "selectedState",
        placeholder: "Select a State",
        style: "compact",
        choices: [
              { "title": "AL", "value": "AL" },
              { "title": "AK", "value": "AK" },
              { "title": "AZ", "value": "AZ" },
              { "title": "AR", "value": "AR" },
              { "title": "CA", "value": "CA" },
              { "title": "CO", "value": "CO" },
              { "title": "CT", "value": "CT" },
              { "title": "DE", "value": "DE" },
              { "title": "DC", "value": "DC" },
              { "title": "FL", "value": "FL" },
              { "title": "GA", "value": "GA" },
              { "title": "HI", "value": "HI" },
              { "title": "ID", "value": "ID" },
              { "title": "IL", "value": "IL" },
              { "title": "IN", "value": "IN" },
              { "title": "IA", "value": "IA" },
              { "title": "KS", "value": "KS" },
              { "title": "KY", "value": "KY" },
              { "title": "LA", "value": "LA" },
              { "title": "ME", "value": "ME" },
              { "title": "MD", "value": "MD" },
              { "title": "MA", "value": "MA" },
              { "title": "MI", "value": "MI" },
              { "title": "MN", "value": "MN" },
              { "title": "MS", "value": "MS" },
              { "title": "MO", "value": "MO" },
              { "title": "MT", "value": "MT" },
              { "title": "NE", "value": "NE" },
              { "title": "NV", "value": "NV" },
              { "title": "NH", "value": "NH" },
              { "title": "NJ", "value": "NJ" },
              { "title": "NM", "value": "NM" },
              { "title": "NY", "value": "NY" },
              { "title": "NC", "value": "NC" },
              { "title": "ND", "value": "ND" },
              { "title": "OH", "value": "OH" },
              { "title": "OK", "value": "OK" },
              { "title": "OR", "value": "OR" },
              { "title": "PA", "value": "PA" },
              { "title": "RI", "value": "RI" },
              { "title": "SC", "value": "SC" },
              { "title": "SD", "value": "SD" },
              { "title": "TN", "value": "TN" },
              { "title": "TX", "value": "TX" },
              { "title": "UT", "value": "UT" },
              { "title": "VT", "value": "VT" },
              { "title": "VA", "value": "VA" },
              { "title": "WA", "value": "WA" },
              { "title": "WV", "value": "WV" },
              { "title": "WI", "value": "WI" },
              { "title": "WY", "value": "WY" }
        ]
      },
      {
        type: "Input.ChoiceSet",
        id: "marketChoice",
        style: "compact",
        label: "Select a Market",
        isMultiSelect: false,
        value: "1",
        choices: [
          { "title": "Agriculture", "value": "1" },
          { "title": "Architect / Engineer", "value": "2" },
          { "title": "Automotive", "value": "3" },
          { "title": "Communications", "value": "4" },
          { "title": "Construction / Development", "value": "5" },
          { "title": "CPA", "value": "6" },
          { "title": "Education", "value": "7" },
          { "title": "Financial", "value": "8" },
          { "title": "Government", "value": "9" },
          { "title": "Healthcare", "value": "10" },
          { "title": "Hospitality", "value": "11" },
          { "title": "Human Resources", "value": "12" },
          { "title": "Insurance", "value": "13" },
          { "title": "Internet", "value": "14" },
          { "title": "Legal", "value": "15" },
          { "title": "Manufacturing", "value": "16" },
          { "title": "Media/Advertising", "value": "17" },
          { "title": "NonProfit", "value": "18" },
          { "title": "Real Estate", "value": "19" },
          { "title": "Religious Institution", "value": "20" },
          { "title": "Residential", "value": "21" },
          { "title": "Restaurant / Bar", "value": "22" },
          { "title": "Retail", "value": "23" },
          { "title": "Sanitation", "value": "24" },
          { "title": "Senior Living", "value": "25" },
          { "title": "Services", "value": "26" },
          { "title": "Transportation", "value": "27" },
          { "title": "Utilities", "value": "28" },
          { "title": "Wholesale / Distribution", "value": "29" }
        ]
      },
      {
        type: "Input.Date",
        id: "appointmentDate", // Input field for the ticket ID
        placeholder: "Enter the Appointment Date",
        label: "Appointment Ticket Information",
        isRequired: false,
        spacing: "Small",
      },
      {
        type: "Input.Time",
        id: "appointmentTime", // Input field for the ticket ID
        placeholder: "Enter the Appointment Time",
        isRequired: false,
        spacing: "Small",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit",
        data: {
          action: "handleCreateCompany", // Identifies the submit action
        },
      },
      {
        type: "Action.Submit",
        title: "Back to Main Menu",
        data: {
          action: "showWelcomeCard", // Returns to the main menu
        },
      },
    ],
  };

  // Send the Ticket Information card
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(companyCreationCard)],
  });
}

module.exports = { showCompanyCreationCard };
