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

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Handle incoming messages
    this.onMessage(async (context, next) => {
      await context.sendActivity("Debug Log: Received a message activity."); // Debug message to chat

      // Remove the bot's mention from the message
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const userMessage = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();

      // Send the user's message to the bot chat for debugging
      await context.sendActivity(`Debug Log: User Message is '${userMessage}'`);

      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage },
      ];

      try {
        // Call Azure OpenAI to generate a response
        const response = await client.chat.completions.create({
          messages,
          model: "gpt-4o-mini",
          max_tokens: 150, // Adjust as needed
          temperature: 0.2, // Adjust creativity
          stream: false
        });

        // Extract the assistant's reply
        const botReply = response.choices[0].message.content.trim();

        // Send the AI-generated response back to the user
        await context.sendActivity(`**Assistant:** ${botReply}`);

        // Log the AI response to the bot chat
        await context.sendActivity(`Debug Log: AI Response is '${botReply}'`);
      } catch (error) {
        // Send the error message to the bot chat
        await context.sendActivity("Debug Log: Error communicating with Azure OpenAI:");
        await context.sendActivity(JSON.stringify(error, null, 2)); // Send detailed error information
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
