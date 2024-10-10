const { TeamsActivityHandler, TurnContext } = require("botbuilder");
const { AzureOpenAI } = require("openai");
const { AzureKeyCredential } = require("@azure/core-auth");

const endpoint = process.env.OPENAI_ENDPOINT;
const apiKey = process.env.OPENAI_API_KEY;
const deploymentId = process.env.OPENAI_DEPLOYMENT_ID;

if (!endpoint || !apiKey || !deploymentId) {
  console.error('Missing environment variables: ensure OPENAI_ENDPOINT, OPENAI_API_KEY, and OPENAI_DEPLOYMENT_ID are set');
  process.exit(1);
}

const client = new AzureOpenAI({
  apiKey: new AzureKeyCredential(apiKey),
  endpoint,
  apiVersion: "2024-04-01-preview",
});

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
    try {
      const result = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: deploymentId,
        max_tokens: 100,
      });
      return result.choices[0].message.content;
    } catch (error) {
      await context.sendActivity(`Error fetching OpenAI response: ${error.message}. API KEY ${apiKey}, Endpoint: ${endpoint}, Deployment ID: ${deploymentId}`);
      return "Sorry, I couldn't connect to Azure OpenAI at this time.";
    }
  }
}

module.exports.TeamsBot = TeamsBot;
