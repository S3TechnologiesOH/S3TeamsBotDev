const { CardFactory } = require("botbuilder");

async function showCompanyCreationCard(context) {
  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const markets = [
    "Healthcare", "Education", "Government", "Financial Services", 
    "Manufacturing", "Retail", "Technology", "Non-profit", "Other"
  ];

  const adaptiveCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Create New Company",
        weight: "Bolder",
        size: "Large",
        wrap: true
      },
      {
        type: "TextBlock",
        text: "Company Information",
        weight: "Bolder",
        size: "Medium",
        wrap: true,
        spacing: "Medium"
      },
      {
        type: "Input.Text",
        id: "companyName",
        label: "Company Name*",
        isRequired: true,
        errorMessage: "Company name is required"
      },
      {
        type: "Input.Text",
        id: "companyId",
        label: "Company ID (Optional)",
        placeholder: "ID or reference code if applicable"
      },
      {
        type: "Input.Text",
        id: "companyAddress",
        label: "Company Address*",
        isRequired: true,
        placeholder: "Street address",
        errorMessage: "Company address is required"
      },
      {
        type: "Input.Text",
        id: "companyContactInformation",
        label: "Contact Information*",
        isRequired: true,
        placeholder: "Name, Phone, Email",
        errorMessage: "Contact information is required"
      },
      {
        type: "Input.Text",
        id: "rep",
        label: "Sales Rep*",
        isRequired: true,
        placeholder: "Sales representative name",
        errorMessage: "Sales representative is required"
      },
      {
        type: "TextBlock",
        text: "Site Information",
        weight: "Bolder",
        size: "Medium",
        wrap: true,
        spacing: "Medium"
      },
      {
        type: "Input.Text",
        id: "siteName",
        label: "Site Name*",
        isRequired: true,
        errorMessage: "Site name is required"
      },
      {
        type: "Input.Text",
        id: "siteAddress",
        label: "Site Address*",
        isRequired: true,
        errorMessage: "Site address is required"
      },
      {
        type: "Input.Text",
        id: "siteCity",
        label: "City*",
        isRequired: true,
        errorMessage: "City is required"
      },
      {
        type: "Input.ChoiceSet",
        id: "selectedState",
        label: "State*",
        isRequired: true,
        choices: states.map(state => ({
          title: state,
          value: state
        })),
        style: "compact"
      },
      {
        type: "Input.ChoiceSet",
        id: "marketChoice",
        label: "Market*",
        isRequired: true,
        choices: markets.map(market => ({
          title: market,
          value: market
        })),
        style: "compact"
      },
      {
        type: "TextBlock",
        text: "Appointment Information (Optional)",
        weight: "Bolder",
        size: "Medium",
        wrap: true,
        spacing: "Medium"
      },
      {
        type: "Input.Date",
        id: "appointmentDate",
        label: "Appointment Date",
      },
      {
        type: "Input.Time",
        id: "appointmentTime",
        label: "Appointment Time",
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Create Company",
        data: {
          action: "handleCreateCompany"
        }
      },
      {
        type: "Action.Submit",
        title: "Cancel",
        data: {
          action: "showWelcomeCard"
        }
      }
    ]
  };

  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(adaptiveCard)]
  });
}

module.exports = { showCompanyCreationCard };
