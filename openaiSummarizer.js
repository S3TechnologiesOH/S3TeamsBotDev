const { AzureOpenAI } = require("openai");

// Load environment variables
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT_ID;
const openAIAPIKey = process.env.AZURE_OPENAI_API_KEY;

// Validate environment variables
if (!openAIEndpoint || !openAIDeployment) {
  throw new Error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT must be set as environment variables.");
}

// Define API version
const apiVersion = "2024-04-01-preview";

// Construct the Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: openAIEndpoint,
  openAIAPIKey,
  deployment: openAIDeployment,
  apiVersion,
});

async function summarizeJSON(jsonData) {
    // Convert JSON data into a string for sending to the assistant
    const jsonString = JSON.stringify(jsonData, null, 2);
    const promptMessage = "You are a helpful assistant for summarizing ConnectWise tickets and their related time entries in a structured and consistent format. Always follow this format: \n\n" +
    "\n\n" +
     "1. **Ticket Information**: Always display the following ticket details at the top: \n\n" +
       "- **ID:** The ticket's ID  \n\n" +
       "- **Summary:** A brief description of the ticket  \n\n" +
       "- **Record Type:** The type of record \n\n" +
       "- **Company:** The name of the associated company \n\n" +
       "- **Board:** The name of the board handling the ticket \n\n" +
       "- **Status:** The current status of the ticket \n\n" +
       "- **Priority:** The priority level of the ticket \n\n" +
       "- **Assigned to:** The names of the people assigned to the ticket \n\n" +
       "- **Actual Hours:** The number of hours worked on the ticket \n\n" +
       "\n\n" +
    "2. **Time Entry Summaries**: Summarize each time entry individually, one after the other, without any additional 'Overview' or introductory text. Each entry should include:  \n\n" +
       "- **Notes:** A brief description or notes about the work done during the time entry. \n\n" +
       "- **Time Entry Link:** A direct link to view the time entry in ConnectWise. \n\n" +
    
       "For each time entry, format the link like this: \n\n" +
       "`https://na.myconnectwise.net/v4_6_release/services/system_io/router/openrecord.rails?locale=en_US&companyName=mys3tech&recordType=ServiceFV&recid={entry.ticket['id']}`  \n\n" +
    
       "Replace `{entry.ticket['id']}` with the actual ticket ID. \n\n" +
     "\n\n" +
    "3. **Avoid Repetitions**: Do not repeat the ticket information after it has been presented at the top. Only list the time entries with their summaries and links.  \n\n" +
    
    "Always adhere to this format and ensure clarity and readability.";
   
  
    try {
      const messages = [
        { role: "system", content: "You are a helpful assistant that summarizes JSON data." },
        { role: "user", content: promptMessage },
      ];
  
      // Call OpenAI to generate a summarized response
      const response = await client.chat.completions.create({
        messages,
        model: "gpt-4o-mini",  // Adjust this model if needed
        max_tokens: 300,        // Increase token limit for a longer summary
        temperature: 0.2,       // Adjust creativity
        stream: false,
      });
  
      // Return the summarized content
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error communicating with Azure OpenAI:", error);
      throw new Error("Failed to summarize JSON data.");
    }
  }

module.exports = {
  summarizeJSON,
};
