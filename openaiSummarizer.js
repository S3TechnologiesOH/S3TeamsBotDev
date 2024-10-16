const { AzureOpenAI } = require("openai");

// Load environment variables
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT_ID;
const openAIAPIKey = process.env.AZURE_OPENAI_API_KEY;

// Validate environment variables
if (!openAIEndpoint || !openAIDeployment) {
  throw new Error(
    "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT must be set as environment variables."
  );
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

// Helper: Split data into chunks for API calls
function splitDataIntoChunks(data, chunkSize = 3000) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper: Rate limit function with delay
async function rateLimitedCall(fn, delay = 1000) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return await fn();
}

// Helper: Retry logic with exponential backoff
async function retryWithBackoff(fn, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

async function summarizeJSON(jsonData) {
  try {
    console.log("Starting summarizeJSON function");

    // Validate jsonData and ensure it's an array
    if (!Array.isArray(jsonData)) {
      console.warn("jsonData is not an array. Attempting to parse...");
      jsonData = tryParseArray(jsonData);
      if (!Array.isArray(jsonData)) {
        throw new Error("Invalid input: Expected an array of time entries.");
      }
    }

    // Simplify and split large data into smaller chunks
    const simplifiedEntries = jsonData
      .map((entry) => {
        const notes = entry._info?.notes || "No notes";
        return `* Time Entry ID: ${entry.id}\nNotes: ${notes}`;
      })
      .join("\n\n");

    const chunks = splitDataIntoChunks(simplifiedEntries, 3000);
    let combinedSummary = "";

    // Process each chunk separately
    for (const chunk of chunks) {
      const summary = await processChunk(chunk);
      combinedSummary += summary + "\n\n";
    }

    console.log("Final Summary: ", combinedSummary.trim());
    return combinedSummary.trim();
  } catch (error) {
    console.error("Error summarizing JSON:", error);
    throw new Error("Failed to summarize JSON data.");
  }
}

// Helper function to parse potential JSON strings or single objects into an array
function tryParseArray(data) {
  try {
    if (typeof data === "string") {
      return JSON.parse(data);
    } else if (typeof data === "object" && data !== null) {
      return Array.isArray(data) ? data : [data]; // Wrap in array if it's a single object
    }
  } catch (error) {
    console.error("Error parsing data:", error);
  }
  return [];
}


// Function: Process each chunk with API calls
async function processChunk(chunk) {
  try {
    console.log("Processing chunk: ", chunk);

    const assistant = await retryWithBackoff(() =>
      client.beta.assistants.retrieve("asst_2siYL2u8sZy9PhFDZQvlyKOi")
    );
    console.log("Assistant retrieved: ", assistant);

    const thread = await rateLimitedCall(() =>
      client.beta.threads.create()
    );
    console.log("Thread created: ", thread);

    const threadResponse = await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: chunk,
    });
    console.log("User message added to thread: ", threadResponse);

    const runResponse = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      parallel_tool_calls: false, // Disable parallel calls to reduce token overload
      temperature: 0.3,
      max_completion_tokens: 400,
    });
    console.log("Run started: ", runResponse);

    // Polling until the run completes or fails
    let runStatus = runResponse.status;
    while (runStatus === "queued" || runStatus === "in_progress") {
      console.log(`Current run status: ${runStatus}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const runStatusResponse = await client.beta.threads.runs.retrieve(
        thread.id,
        runResponse.id
      );
      runStatus = runStatusResponse.status;
      console.log(`Updated run status: ${runStatus}`);
    }

    if (runStatus === "completed") {
      const messagesResponse = await client.beta.threads.messages.list({
        thread_id: thread.id,
      });
      console.log("Messages retrieved: ", messagesResponse);

      // Extract and return the message content
      let messageContent = "";
      messagesResponse.data.forEach((message) => {
        message.content.forEach((contentItem) => {
          if (contentItem.type === "text" && contentItem.text.value) {
            messageContent += contentItem.text.value + "\n";
          }
        });
      });

      return messageContent.trim();
    } else {
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }
  } catch (error) {
    console.error("Error processing chunk:", error);
    throw new Error("Failed to process chunk.");
  }
}

module.exports = {
  summarizeJSON,
};
