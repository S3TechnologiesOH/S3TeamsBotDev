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

// Function to send the JSON data to OpenAI for summarization
async function summarizeJSON(jsonData) {
  // Convert JSON data into a string for sending to the assistant
  const jsonString = JSON.stringify(jsonData, null, 2);
  const promptMessage = `Here is a JSON output of a ConnectWise ticket or time entries: \n${jsonString}\n Please provide a brief summary.`;

  try {
    const messages = [
      { role: "system", content: "You will receive a list of important information from a work ticket in raw json format. Also you might get a json of all of the time entries for that ticket. You need to get all of the important details from either of them. You need to figure out if its an info json or a time entries json. Your job is to summarize this information into a simple summarized organized text. The time entries shouldn't be in a list, they should all be outlined together." },
      { role: "user", content: promptMessage },
    ];

    // Call OpenAI to generate a summarized response
    const response = await client.chat.completions.create({
      messages,
      model: "gpt-4o-mini",  // Adjust this model if needed
      max_tokens: 150,        // Adjust token limit as necessary for summaries
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
