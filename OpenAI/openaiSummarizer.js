const { AzureOpenAI } = require("openai");

const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT_ID;
const openAIAPIKey = process.env.AZURE_OPENAI_API_KEY;

if (!openAIEndpoint || !openAIDeployment) {
  throw new Error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT must be set as environment variables.");
}

const apiVersion = "2024-04-01-preview";
const client = new AzureOpenAI({
  endpoint: openAIEndpoint,
  openAIAPIKey,
  deployment: openAIDeployment,
  apiVersion,
});

let currentThread = null; // Store the thread for reuse

async function summarizeJSON(context, jsonData) {
  try {
    console.log("Starting summarizeJSON function");

    // Batch entries into a concise format
    const simplifiedEntries = jsonData.map(entry =>
      `ID: ${entry.id}\nNotes: ${entry._info.notes || 'No notes'}`
    ).join('\n\n');

    const promptMessage = `Summarize these entries:\n\n${simplifiedEntries}`;
    console.log("Prompt message created: ", promptMessage);

    // Reuse existing thread if available, or create a new one
    if (!currentThread) {
      currentThread = await retryWithBackoff(() => client.beta.threads.create());
      console.log("Thread created: ", currentThread);
    }

    const threadResponse = await retryWithBackoff(() =>
      client.beta.threads.messages.create(currentThread.id, {
        role: "user",
        content: promptMessage,
      })
    );
    console.log("User message added to thread: ", JSON.stringify(threadResponse));

    const runResponse = await retryWithBackoff(() =>
      client.beta.threads.runs.create(currentThread.id, {
        assistant_id: "asst_2siYL2u8sZy9PhFDZQvlyKOi",
        max_completion_tokens: 500, // Limit response length
        temperature: 0.3, // Control verbosity
      })
    );
    console.log("Run started: ", runResponse);
    await context.sendActivity("Processing your request. Please wait...");

    let runStatus = runResponse.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      console.log(`Current run status: ${runStatus}`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Poll less frequently
      const runStatusResponse = await client.beta.threads.runs.retrieve(currentThread.id, runResponse.id);
      runStatus = runStatusResponse.status;
      console.log(`Updated run status: ${runStatus}`);
    }

    if (runStatus === 'completed') {
      console.log("Run completed successfully");
      const messagesResponse = await client.beta.threads.messages.list(currentThread.id);
      const messageContent = extractMessageContent(messagesResponse);
      console.log("Message Content: ", messageContent);
      return messageContent;
    } else {
      console.error(`Run did not complete successfully. Status: ${runStatus}`);
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }

  } catch (error) {
    console.error("Error summarizing JSON:", error);
    throw new Error("Failed to summarize JSON data.");
  }
}

// Extract message content from the response
function extractMessageContent(messagesResponse) {
  if (messagesResponse && messagesResponse.data) {
    for (const message of messagesResponse.data) {
      for (const contentItem of message.content) {
        if (contentItem.type === "text" && contentItem.text && contentItem.text.value) {
          return contentItem.text.value;
        }
      }
    }
  }
  return "No valid content found.";
}

// Retry with exponential backoff
async function retryWithBackoff(fn, retries = 3) {
  let delay = 1000; // 1 second
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await context.sendActivity(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

module.exports = {
  summarizeJSON,
};