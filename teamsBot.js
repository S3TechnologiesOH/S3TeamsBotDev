const { TeamsActivityHandler, TurnContext, CardFactory } = require("botbuilder");
const { AzureOpenAI } = require("openai");
const { DefaultAzureCredential, getBearerTokenProvider } = require("@azure/identity");
const { AzureKeyCredential } = require("@azure/openai");

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

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Handle incoming messages
    this.onMessage(async (context, next) => {
      await context.sendActivity("Debug Log: Received a message activity."); // Debug message

      // Remove bot mention
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const userMessage = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();

      // Check if the message starts with `/prompt`
      if (userMessage.startsWith("/prompt")) {
        const promptMessage = userMessage.replace("/prompt", "").trim();

        // Send the OpenAI response
        await this.handleOpenAIRequest(context, promptMessage);
      } else {
        await context.sendActivity("Unknown command. Use `/prompt [message]` to interact with OpenAI.");
      }

      await next();
    });

    // Handle MembersAdded event for welcoming new users and sending the command list
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await this.sendWelcomeCard(context);
          break; // Only send one welcome message
        }
      }
      await next();
    });
  }

  // Handle OpenAI request when the user sends a /prompt message
  async handleOpenAIRequest(context, promptMessage) {
    if (!promptMessage) {
      await context.sendActivity("Please provide a message after `/prompt`.");
      return;
    }

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: promptMessage },
    ];

    try {
      // Call Azure OpenAI to generate a response
      const response = await client.chat.completions.create({
        messages,
        model: "gpt-4o-mini",
        max_tokens: 150, // Adjust as needed
        temperature: 0.2, // Adjust creativity
        stream: false,
      });

      const botReply = response.choices[0].message.content.trim();
      await context.sendActivity(`**Assistant:** ${botReply}`);
    } catch (error) {
      await context.sendActivity("Sorry, I encountered an error while processing your request.");
      await context.sendActivity(JSON.stringify(error, null, 2)); // Send detailed error
    }
  }

  // Send a welcome card with command list
  async sendWelcomeCard(context) {
    const card = CardFactory.heroCard(
      "Welcome to the Teams Bot",
      "Here are the available commands:",
      null,
      [{ type: "Action.Submit", title: "/prompt [message]", value: "/prompt [message]" }]
    );

    await context.sendActivity({ attachments: [card] });
  }
}

module.exports.TeamsBot = TeamsBot;
