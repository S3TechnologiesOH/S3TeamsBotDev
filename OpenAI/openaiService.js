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

// Define a function to handle OpenAI requests
async function getOpenAIResponse(promptMessage) {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: promptMessage },
  ];

  try {
    const response = await client.chat.completions.create({
      messages,
      model: "gpt-4o-mini",
      max_tokens: 150, // Adjust as needed
      temperature: 0.2, // Adjust creativity
      stream: false,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error communicating with Azure OpenAI:", error);
    throw new Error("OpenAI request failed");
  }
}
  // Handle OpenAI request when the user sends a /prompt message
  async function handleOpenAIRequest(context, promptMessage) {
    if (!promptMessage) {
      await context.sendActivity("Please provide a message after `/prompt`.");
      return;
    }

    try {
      // Call the OpenAI service to get a response
      const botReply = await getOpenAIResponse(promptMessage);
      await context.sendActivity(`**Assistant:** ${botReply}`);
    } catch (error) {
      await context.sendActivity(
        "Sorry, I encountered an error while processing your request."
      );
      console.error(error);
    }
  }
module.exports = {
  getOpenAIResponse, handleOpenAIRequest
};
