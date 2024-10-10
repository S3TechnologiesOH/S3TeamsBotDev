require('dotenv/config');
const { TeamsActivityHandler, TurnContext } = require("botbuilder");
const { AzureOpenAI } = require("openai");
const { AzureKeyCredential } = require("@azure/core-auth");

// Get environment variables
const azureOpenAIKey = process.env.AZURE_OPENAI_KEY;
const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureOpenAIVersion = "2024-05-01-preview";

// Check env variables
if (!azureOpenAIKey || !azureOpenAIEndpoint) {
  throw new Error("Please set AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT in your environment variables.");
}

// Get Azure SDK client
const client = new AzureOpenAI({
  endpoint: azureOpenAIEndpoint,
  apiVersion: azureOpenAIVersion,
  apiKey: new AzureKeyCredential(azureOpenAIKey),
});

// Assistant setup
const assistantOptions = {
  model: "gpt-4o-mini", // replace with model deployment name
  name: "ConnectWiseConverter",
  instructions: "You will receive a list of important information from a work ticket. All of the important details are above the line made of =, this includes the ticket ID, summary, company, etc. Below the line made of = is the ticket entries, placed in a list.\n\nYour job is to summarize this information into a simple summarized organized text. The time entries shouldn't be in a list, they should all be outlined together.",
  tools: [{ "type": "code_interpreter" }],
  tool_resources: { "code_interpreter": { "file_ids": ["assistant-lLB2Cw77WyjaZG8w4HnppXhT", "assistant-iMi54kbSw7oV7TaV7P71CVdr", "assistant-CQj87BSB26AuxVhb9oJ989k0", "assistant-8CxktxY5DXUQzlOJ9pA9H4Ko"] } },
  temperature: 0.5,
  top_p: 0.1,
};

let assistant; // Declare assistant instance globally for reuse

const setupAssistant = async () => {
  if (!assistant) {
    try {
      const assistantResponse = await client.beta.assistants.create(assistantOptions);
      console.log(`Assistant created: ${JSON.stringify(assistantResponse)}`);
      assistant = assistantResponse;
    } catch (error) {
      console.error(`Error creating assistant: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error.response?.data || error)}`);
    }
  }
};

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
    if (!assistant) {
      await setupAssistant(); // Ensure the assistant is set up before proceeding
      if (!assistant) {
        await context.sendActivity(`Error: Unable to set up assistant. Please check the endpoint, API key, and deployment ID.`);
        return "Sorry, I couldn't connect to Azure OpenAI at this time.";
      }
    }

    try {
      const thread = await client.beta.threads.create({});
      await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: prompt,
      });

      const runResponse = await client.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      let runStatus = runResponse.status;
      while (runStatus === 'queued' || runStatus === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const runStatusResponse = await client.beta.threads.runs.retrieve(thread.id, runResponse.id);
        runStatus = runStatusResponse.status;
      }

      if (runStatus === 'completed') {
        const messagesResponse = await client.beta.threads.messages.list(thread.id);
        return messagesResponse[messagesResponse.length - 1].content;
      } else {
        return `Run status is ${runStatus}, unable to fetch messages.`;
      }
    } catch (error) {
      await context.sendActivity(`Error fetching OpenAI response: ${error.message}. Endpoint: ${azureOpenAIEndpoint}, Model: ${assistantOptions.model}`);
      return "Sorry, I couldn't connect to Azure OpenAI at this time.";
    }
  }
}

module.exports.TeamsBot = TeamsBot;

// Set up the assistant at startup
setupAssistant();
