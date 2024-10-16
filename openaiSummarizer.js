const { AzureOpenAI } = require("openai");

// Load environment variables
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT_ID;
const openAIAPIKey = process.env.AZURE_OPENAI_API_KEY;

// Validate environment variables
if (!openAIEndpoint || !openAIDeployment) {
  throw new Error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT must be set.");
}

// Define API version
const apiVersion = "2024-04-01-preview";

// Construct Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: openAIEndpoint,
  openAIAPIKey,
  deployment: openAIDeployment,
  apiVersion,
});

// Helper function: Split large data into smaller chunks
function splitDataIntoChunks(data, maxTokens = 1500) {
  const chunks = [];
  let currentChunk = "";

  for (const line of data.split("\n")) {
    if ((currentChunk + line).length > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += line + "\n";
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Helper function: Extract message content from API response
function extractMessageContent(messages) {
  for (const message of messages.data) {
    for (const contentItem of message.content) {
      if (contentItem.type === "text" && contentItem.text.value) {
        return contentItem.text.value;
      }
    }
  }
  throw new Error("No valid content found in messages.");
}

// Helper function: Process a single chunk with retries
async function processChunk(chunk, retries = 3) {
  try {
    const thread = await client.beta.threads.create();
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: chunk,
    });

    const runResponse = await client.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_2siYL2u8sZy9PhFDZQvlyKOi",
    });

    let runStatus = runResponse.status;
    while (runStatus === "queued" || runStatus === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusResponse = await client.beta.threads.runs.retrieve(
        thread.id,
        runResponse.id
      );
      runStatus = statusResponse.status;
    }

    if (runStatus !== "completed") {
      console.warn(`Run failed with status: ${runStatus}`);
      throw new Error(`Run failed: ${runStatus}`);
    }

    const messages = await client.beta.threads.messages.list(thread.id);
    return extractMessageContent(messages);
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying... (${3 - retries} attempts left)`);
      return await processChunk(chunk, retries - 1);
    }
    console.error("Error processing chunk:", error);
    throw new Error("Failed to process chunk.");
  }
}

// Main function: Summarize JSON data
async function summarizeJSON(jsonData) {
  try {
    console.log("Starting summarizeJSON function");

    // Ensure jsonData is an array
    if (!Array.isArray(jsonData)) {
      throw new Error("Expected an array of time entries.");
    }

    // Simplify the entries to reduce token usage
    const simplifiedEntries = jsonData
      .map((entry) => `* Time Entry ID: ${entry.id}\nNotes: ${entry._info.notes || "No notes"}`)
      .join("\n\n");

    const chunks = splitDataIntoChunks(simplifiedEntries);
    let combinedSummary = "";

    // Process each chunk and combine the summaries
    for (const chunk of chunks) {
      const summary = await processChunk(chunk);
      combinedSummary += summary + "\n\n";
    }

    console.log("Final Summary:", combinedSummary.trim());
    return combinedSummary.trim();
  } catch (error) {
    console.error("Error summarizing JSON:", error);
    throw new Error("Failed to summarize JSON data.");
  }
}

module.exports = {
  summarizeJSON,
};
