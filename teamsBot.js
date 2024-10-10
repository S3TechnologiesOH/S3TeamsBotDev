const { TeamsActivityHandler, TurnContext } = require("botbuilder");
const { DefaultAzureCredential } = require("@azure/identity");
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai"); // Import OpenAIClient and AzureKeyCredential

// Set your OpenAI endpoint here (from your Azure portal)
const endpoint = process.env.OPENAI_ENDPOINT; // Example: "https://<your-resource-name>.openai.azure.com/"

// Use API key credential (recommended for Azure OpenAI)
const apiKey = process.env.OPENAI_API_KEY;
const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");

      // Remove mentions and clean up message text
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();

      // Use OpenAI to generate a response
      const prompt = `You said: ${txt}`;
      const response = await this.getOpenAIResponse(prompt);

      // Send OpenAI response back to the user
      await context.sendActivity(`Azure OpenAI says: ${response}`);

      // Continue to the next handler
      await next();
    });

    // Listen to MembersAdded event
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          await context.sendActivity(
            `Hi there! I'm a Teams bot that can communicate with Azure OpenAI.`
          );
          break;
        }
      }
      await next();
    });
  }

  // Function to call the Azure OpenAI service
  async getOpenAIResponse(prompt) {
    try {
      const deploymentId = process.env.OPENAI_DEPLOYMENT_ID; // Replace with your Azure OpenAI deployment ID
      const response = await client.getCompletions(deploymentId, {
        prompt: prompt,
        max_tokens: 50 // Adjust as needed
      });
      return response.choices[0].text;
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      return "Sorry, I couldn't connect to Azure OpenAI at this time.";
    }
  }
}

module.exports.TeamsBot = TeamsBot;