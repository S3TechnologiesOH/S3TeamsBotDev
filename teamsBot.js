const { TeamsActivityHandler, TurnContext } = require("botbuilder");
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const { DefaultAzureCredential, getBearerTokenProvider } = require("@azure/identity");
const { AzureOpenAI } = require("openai");

// Load environment variables
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIDeployment = "gpt-4o-mini";
const openAIAPIKey = process.env.AZURE_OPENAI_API_KEY;

// Validate environment variables
if (!openAIEndpoint || !openAIDeployment) {
  throw new Error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT must be set as environment variables.");
}

// Authenticate using Microsoft Entra ID (Recommended)
const credential = new DefaultAzureCredential();
const scope = "https://cognitiveservices.azure.com/.default";
const azureADTokenProvider = getBearerTokenProvider(credential, scope);

const apiVersion = "2024-04-01-preview";
const options = { openAIEndpoint, azureADTokenProvider, openAIDeployment, apiVersion }
const client = new AzureOpenAI(options);
// Construct the Azure OpenAI client with Microsoft Entra ID tokens

// *(Optional and Highly Discouraged)* Authenticate using API Key
// Uncomment the following lines if you choose to use an API key instead of Entra ID tokens

// if (!openAIAPIKey) {
//   throw new Error("AZURE_OPENAI_API_KEY must be set as an environment variable.");
// }
// const apiKeyCredential = new AzureKeyCredential(openAIAPIKey);
// const openaiClient = new OpenAIClient(openAIEndpoint, apiKeyCredential, {
//   deployment: openAIDeployment,
//   apiVersion: "2024-04-01-preview", // Specify the API version
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
        const response = await openaiClient.chat.completions.create({
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
