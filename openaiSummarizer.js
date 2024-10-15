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

async function summarizeJSON(jsonData) {
  try {
    // Convert the JSON data to a formatted string
    const jsonString = JSON.stringify(jsonData, null, 2);

    // Create prompt message
    const promptMessage = `\n${jsonString}\n`;

    const assistant = await client.beta.assistants.retrieve("asst_2siYL2u8sZy9PhFDZQvlyKOi");
    console.log("Assistant retrieved:", assistant);
    const thread = await client.beta.threads.create();
    console.log("Thread created:", thread);

    
    // Add a user message to the thread
    const threadResponse = await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: promptMessage,
    });
    console.log(`Message created: ${JSON.stringify(threadResponse)}`);

    const runResponse = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });
    console.log(`Run started: ${JSON.stringify(runResponse)}`);
    

    // Polling until the run completes or fails
    let runStatus = runResponse.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const runStatusResponse = await assistantsClient.beta.threads.runs.retrieve(
        assistantThread.id,
        runResponse.id
      );
      runStatus = runStatusResponse.status;
      console.log(`Current run status: ${runStatus}`);
    }

    // Get the messages in the thread once the run has completed
    if (runStatus === 'completed') {
      const messagesResponse = await assistantsClient.beta.threads.messages.list(
        assistantThread.id
      );
      console.log(`Messages in the thread: ${JSON.stringify(messagesResponse)}`);
    } else {
      console.log(`Run status is ${runStatus}, unable to fetch messages.`);
    }
  } catch (error) {
    console.error("Error summarizing JSON:", error);
    throw new Error("Failed to summarize JSON data.");
  }
}

module.exports = {
  summarizeJSON,
};
