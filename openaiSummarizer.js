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

    // Retrieve the assistant
    const assistant = await client.beta.assistants.retrieve("asst_2siYL2u8sZy9PhFDZQvlyKOi");
    // Create a new thread associated with the assistant
    const thread = await client.beta.threads.create();

    // Add user message to the thread
    await client.beta.threads.messages.create({
      thread_id: thread.id,
      role: "user",
      content: promptMessage,
    });

    // Start a run for the assistant on the created thread
    let run = await client.beta.threads.runs.create({
      thread_id: thread.id,
    });

    // Wait for the run to complete
    while (["queued", "in_progress", "cancelling"].includes(run.status)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await client.beta.threads.runs.retrieve({
        thread_id: thread.id,
        run_id: run.id,
      });
    }

    // Handle completed run
    if (run.status === "completed") {
      const messages = await client.beta.threads.messages.list({ thread_id: thread.id });
      console.log(messages);
      return messages;
    } else {
      console.error("Run status:", run.status);
      throw new Error(`Run did not complete successfully: ${run.status}`);
    }
  } catch (error) {
    console.error("Error summarizing JSON:", error);
    throw new Error("Failed to summarize JSON data.");
  }
}

module.exports = {
  summarizeJSON,
};
