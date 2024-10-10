const { TeamsActivityHandler, TurnContext } = require("botbuilder");
const { DefaultAzureCredential } = require("@azure/identity");
const { AzureOpenAI } = require("openai");
const { AzureKeyCredential } = require("@azure/core-auth");

const endpoint = process.env.OPENAI_ENDPOINT;
const apiKey = process.env.OPENAI_API_KEY;
const client = new AzureOpenAI({ apiKey: new AzureKeyCredential(apiKey), endpoint, apiVersion: "2024-04-01-preview" });

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
    const deploymentId = process.env.OPENAI_DEPLOYMENT_ID;
    if (!apiKey) {
      await context.sendActivity(`Error: Missing API key. API Key: ${apiKey}`);
      return;
    }
    if (!endpoint) {
      await context.sendActivity(`Error: Missing endpoint. Endpoint: ${endpoint}`);
      return;
    }
    if (!deploymentId) {
      await context.sendActivity(`Error: Missing deployment ID. Deployment ID: ${deploymentId}`);
      return;
    }

    // Test API Key validity
    try {
      const keyTestResponse = await client.chat.completions.create({ messages: [{ role: 'user', content: 'Test' }], model: deploymentId, max_tokens: 1 });
      if (!keyTestResponse) {
        await context.sendActivity(`Error: Invalid API key. API Key: ${apiKey}`);
        return;
      }
    } catch (error) {
      await context.sendActivity(`Error: Invalid API key. API Key: ${apiKey}, Error: ${error.message}`);
      return;
    }

    // Test endpoint validity
    try {
      const response = await client.chat.completions.create({ messages: [{ role: 'user', content: 'Test' }], model: deploymentId, max_tokens: 1 });
      if (response.status !== 200) {
        await context.sendActivity(`Error: Invalid endpoint. Endpoint: ${endpoint}`);
        return;
      }
    } catch (error) {
      await context.sendActivity(`Error: Unable to reach endpoint. Endpoint: ${endpoint}, Error: ${error.message}`);
      return;
    }

    // Test deployment ID validity
    try {
      const response = await client.chat.completions.create({ messages: [{ role: 'user', content: 'Test' }], model: deploymentId, max_tokens: 1 });
      if (!response) {
        await context.sendActivity(`Error: Invalid deployment ID. Deployment ID: ${deploymentId}`);
        return;
      }
    } catch (error) {
      await context.sendActivity(`Error: Unable to validate deployment ID. Deployment ID: ${deploymentId}, Error: ${error.message}`);
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