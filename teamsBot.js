const { TeamsActivityHandler, TurnContext } = require("botbuilder");
const { AzureOpenAI } = require("openai");
const { DefaultAzureCredential, getBearerTokenProvider } = require("@azure/identity");

// Load environment variables
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT_ID; // Replace with your actual deployment name
const openAIAPIKey = process.env.OPENAI_API_KEY;

// Validate environment variables
if (!openAIEndpoint || !openAIDeployment) {
  throw new Error("AZURE_OPENAI_ENDPOINT", openAIEndpoint , "and AZURE_OPENAI_DEPLOYMENT ", openAIDeployment , "must be set as environment variables.");
}

// Authenticate using Microsoft Entra ID (Recommended)
const credential = new DefaultAzureCredential();
const scope = "https://cognitiveservices.azure.com/.default";
const azureADTokenProvider = getBearerTokenProvider(credential, scope);

// Define API version
const apiVersion = "2024-04-01-preview";

// Construct the Azure OpenAI client with Microsoft Entra ID tokens
const client = new AzureOpenAI({
  endpoint: openAIEndpoint,            // Correct key: 'endpoint'
  azureADTokenProvider, // Correct key: 'tokenProvider'
  deployment: openAIDeployment,
  apiVersion,                          // Specify the API version
});

// *(Optional and Highly Discouraged)* Authenticate using API Key
// Uncomment the following lines if you choose to use an API key instead of Entra ID tokens

// if (!openAIAPIKey) {
//   throw new Error("AZURE_OPENAI_API_KEY must be set as an environment variable.");
// }
// const { AzureKeyCredential } = require("openai");
// const apiKeyCredential = new AzureKeyCredential(openAIAPIKey);
// const client = new AzureOpenAI({
//   endpoint: openAIEndpoint,              // Correct key: 'endpoint'
//   tokenProvider: apiKeyCredential,       // Correct key: 'tokenProvider'
//   deployment: openAIDeployment,
//   apiVersion,                            // Specify the API version
// });

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Handle incoming messages
    this.onMessage(async (context, next) => {
      console.log("Received a message activity.");

      // Remove the bot's mention from the message
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const userMessage = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();

      // Log the user's message
      console.log(`User Message: ${userMessage}`);

      try {
        // Call Azure OpenAI to generate a response
        const response = await client.chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: userMessage },
          ],
          max_tokens: 150, // Adjust as needed
          temperature: 0.2, // Adjust creativity
        });

        // Extract the assistant's reply
        const botReply = response.choices[0].message.content.trim();

        // Send the AI-generated response back to the user
        await context.sendActivity(`**Assistant:** ${botReply}`);
      } catch (error) {
        console.error("Error communicating with Azure OpenAI:", error);
        await context.sendActivity("Sorry, I encountered an error while processing your request.");
      }

      // Ensure the next BotHandler is run
      await next();
    });

    // Handle MembersAdded event
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let member of membersAdded) {
        // Avoid sending a welcome message to the bot itself
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            "Hi there! I'm a Teams bot powered by Azure OpenAI. Ask me anything!"
          );
          break; // Only send one welcome message
        }
      }
      await next();
    });
  }
}

module.exports.TeamsBot = TeamsBot;
