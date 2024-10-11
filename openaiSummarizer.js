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
    try {
      // Convert the JSON data to a formatted string
      const jsonString = JSON.stringify(jsonData, null, 2);
      console.log("Debug Log: JSON being passed to OpenAI:", jsonString); // Debug log to verify JSON
  
      // Call OpenAI with the JSON string as part of the prompt
      const promptMessage = `Here is the detailed time entries information in JSON format: \n${jsonString}\n Please summarize the time entries. Only summarize using Bullets or Numbered titles. Do not give paragraphs.`;
  
      const messages = [
        { role: "system", content: "You are a helpful assistant that summarizes JSON data." },
        { role: "user", content: promptMessage },
      ];
  
      // OpenAI API call
      const response = await client.chat.completions.create({
        messages,
        model: "gpt-4o-mini",
        max_tokens: 300,
        temperature: 0.2,
        stream: false,
      });
  
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error summarizing JSON:", error);
      throw new Error("Failed to summarize JSON data.");
    }
  }
  

module.exports = {
  summarizeJSON,
};
