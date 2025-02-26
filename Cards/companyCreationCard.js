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
          { "title": "AL", "value": "Alabama" },
          { "title": "AK", "value": "Alaska" },
          { "title": "AZ", "value": "Arizona" },
          { "title": "AR", "value": "Arkansas" },
          { "title": "CA", "value": "California" },
          { "title": "CO", "value": "Colorado" },
          { "title": "CT", "value": "Connecticut" },
          { "title": "DE", "value": "Delaware" },
          { "title": "DC", "value": "District of Columbia" },
          { "title": "FL", "value": "Florida" },
          { "title": "GA", "value": "Georgia" },
          { "title": "HI", "value": "Hawaii" },
          { "title": "ID", "value": "Idaho" },
          { "title": "IL", "value": "Illinois" },
          { "title": "IN", "value": "Indiana" },
          { "title": "IA", "value": "Iowa" },
          { "title": "KS", "value": "Kansas" },
          { "title": "KY", "value": "Kentucky" },
          { "title": "LA", "value": "Louisiana" },
          { "title": "ME", "value": "Maine" },
          { "title": "MD", "value": "Maryland" },
          { "title": "MA", "value": "Massachusetts" },
          { "title": "MI", "value": "Michigan" },
          { "title": "MN", "value": "Minnesota" },
          { "title": "MS", "value": "Mississippi" },
          { "title": "MO", "value": "Missouri" },
          { "title": "MT", "value": "Montana" },
          { "title": "NE", "value": "Nebraska" },
          { "title": "NV", "value": "Nevada" },
          { "title": "NH", "value": "New Hampshire" },
          { "title": "NJ", "value": "New Jersey" },
          { "title": "NM", "value": "New Mexico" },
          { "title": "NY", "value": "New York" },
          { "title": "NC", "value": "North Carolina" },
          { "title": "ND", "value": "North Dakota" },
          { "title": "OH", "value": "Ohio" },
          { "title": "OK", "value": "Oklahoma" },
          { "title": "OR", "value": "Oregon" },
          { "title": "PA", "value": "Pennsylvania" },
          { "title": "RI", "value": "Rhode Island" },
          { "title": "SC", "value": "South Carolina" },
          { "title": "SD", "value": "South Dakota" },
          { "title": "TN", "value": "Tennessee" },
          { "title": "TX", "value": "Texas" },
          { "title": "UT", "value": "Utah" },
          { "title": "VT", "value": "Vermont" },
          { "title": "VA", "value": "Virginia" },
          { "title": "WA", "value": "Washington" },
          { "title": "WV", "value": "West Virginia" },
          { "title": "WI", "value": "Wisconsin" },
          { "title": "WY", "value": "Wyoming" }
        ]
      },
      {
        type: "Input.ChoiceSet",
        id: "marketChoice",
        style: "compact",
        placeholder: "Select a Market",
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

  // Send the Ticket Information cards
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(companyCreationCard)],
  });
}

module.exports = { showCompanyCreationCard };
