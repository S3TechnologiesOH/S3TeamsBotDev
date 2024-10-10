const { TeamsActivityHandler, TurnContext } = require("botbuilder");
const { DefaultAzureCredential, getBearerTokenProvider } = require("@azure/identity");
const { AzureOpenAI } = require("openai");

const endpoint = process.env.OPENAI_ENDPOINT;
const credential = new DefaultAzureCredential();
const scope = "https://cognitiveservices.azure.com/.default";
const azureADTokenProvider = getBearerTokenProvider(credential, scope);
const deploymentId = process.env.OPENAI_DEPLOYMENT_ID;
const client = new AzureOpenAI({ azureADTokenProvider, endpoint, apiVersion: "2024-04-01-preview" });

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");

      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();

      const prompt = `You said: ${txt}`;
      const response = await this.getOpenAIResponse(context, prompt);

      await context.sendActivity(`Azure OpenAI says: ${response}`);

      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          await context.sendActivity(`Hi there! I'm a Teams bot that can communicate with Azure OpenAI.`);
          break;
        }
      }
      await next();
    });
  }

  async getOpenAIResponse(context, prompt) {
    if (!endpoint) {
      await context.sendActivity(`Error: Missing endpoint. Endpoint: ${endpoint}`);
      return;
    }
    if (!deploymentId) {
      await context.sendActivity(`Error: Missing deployment ID. Deployment ID: ${deploymentId}`);
      return;
    }

    try {
      const result = await client.chat.completions.create({ messages: [{ role: 'user', content: prompt }], model: deploymentId, max_tokens: 100 });
      return result.choices[0].message.content;
    } catch (error) {
      await context.sendActivity(`Error fetching OpenAI response: ${error.message}. Endpoint: ${endpoint}, Deployment ID: ${deploymentId}`);
      return "Sorry, I couldn't connect to Azure OpenAI at this time.";
    }
  }
}

module.exports.TeamsBot = TeamsBot;