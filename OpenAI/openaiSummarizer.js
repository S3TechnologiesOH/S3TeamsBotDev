const { AzureOpenAI } = require("openai");

// Load environment variables
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT_ID;
const openAIAPIKey = process.env.AZURE_OPENAI_API_KEY;

if (!openAIEndpoint || !openAIDeployment) {
  throw new Error(
    "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT must be set."
  );
}

const apiVersion = "2024-04-01-preview";
const client = new AzureOpenAI({
  endpoint: openAIEndpoint,
  openAIAPIKey,
  deployment: openAIDeployment,
  apiVersion,
});

let currentThread = null; // Store the thread for reuse

// Fetch ticket data directly from the API
async function getTicketData(ticketId) {
  try {
    console.log(`Fetching data for ticket ID: ${ticketId}`);

    const data = ticketId;

    console.log("Fetched data: ", data);
    return data;

  } catch (error) {
    console.error("Error fetching ticket data:", error);
    throw new Error("Failed to fetch ticket data.");
  }
}

async function summarizeJSON(context, ticketId, ticketData, taskData) {
  try {
    console.log("Starting summarizeJSON function");

    // Convert ticket data and task data to strings
    const ticketString = JSON.stringify(ticketData, null, 2);
    const tasksString = JSON.stringify(taskData, null, 2);

    // Combine both strings into one prompt message
    const promptMessage = `Summarize the following information:\n\nTicket Data:\n${ticketString}\n\nTask Data:\n${tasksString}`;
    console.log("Prompt message created: ", promptMessage);

    if (!currentThread) {
      currentThread = await retryWithBackoff(() =>
        client.beta.threads.create()
      );
      console.log("Thread created: ", currentThread);
    }

    const threadResponse = await retryWithBackoff(() =>
      client.beta.threads.messages.create(currentThread.id, {
        role: "user",
        content: promptMessage,
      })
    );
    console.log(
      "User message added to thread: ",
      JSON.stringify(threadResponse)
    );

    const runResponse = await retryWithBackoff(() =>
      client.beta.threads.runs.create(currentThread.id, {
        assistant_id: "asst_2siYL2u8sZy9PhFDZQvlyKOi",
        max_completion_tokens: 200,
        temperature: 0.3,
      })
    );
    console.log("Run started: ", runResponse);
    await context.sendActivity("Processing your request. Please wait...");

    let runStatus = runResponse.status;
    while (runStatus === "queued" || runStatus === "in_progress") {
      console.log(`Current run status: ${runStatus}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const runStatusResponse = await client.beta.threads.runs.retrieve(
        currentThread.id,
        runResponse.id
      );
      runStatus = runStatusResponse.status;
      console.log(`Updated run status: ${runStatus}`);
    }

    if (runStatus === "completed") {
      const messagesResponse = await client.beta.threads.messages.list(
        currentThread.id
      );
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
async function createResolution(context, ticketData) {
  try {
    if (!context || typeof context.sendActivity !== 'function') {
      throw new Error("Invalid context: sendActivity function not available.");
    }
    
    // Convert ticket data to string format for prompt
    const ticketString = JSON.stringify(ticketData, null, 2);
    const promptMessage = `Create a resolution for this:\n${ticketString}`;
    console.log("Prompt message created: ", promptMessage);

    if (!currentThread) {
      currentThread = await retryWithBackoff(() => client.beta.threads.create());
      console.log("Thread created: ", currentThread);
    }

    // Create user message in the thread
    const threadResponse = await retryWithBackoff(() =>
      client.beta.threads.messages.create(currentThread.id, { role: "user", content: promptMessage })
    );
    console.log("User message added to thread: ", JSON.stringify(threadResponse));

    const runResponse = await retryWithBackoff(() => client.beta.threads.runs.create(currentThread.id, {
      assistant_id: "asst_ICtoA5LgyafXUbfFx5cyQB4m",
      max_completion_tokens: 200,
      temperature: 0.1,
    }));
    console.log("Run started: ", runResponse);
    await context.sendActivity("Processing your resolution request. Please wait...");

    // Waiting for the run to complete
    let runStatus = runResponse.status;
    while (["queued", "in_progress"].includes(runStatus)) {
      console.log(`Current run status: ${runStatus}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      const runStatusResponse = await client.beta.threads.runs.retrieve(currentThread.id, runResponse.id);
      runStatus = runStatusResponse.status;
      console.log(`Updated run status: ${runStatus}`);
    }

    // Await completion and extract message content
    if (runStatus === "completed") {
      const messagesResponse = await client.beta.threads.messages.list(currentThread.id);
      const messageContent = extractMessageContent(messagesResponse); // This should be a synchronous function
      console.log("Message Content: ", messageContent);
      return messageContent; // Ensure this is the final returned content
    } else {
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }
  } catch (error) {
    console.error("Error creating resolution:", error);
    throw new Error("Failed to create resolution.");
  }
}

// Extract message content from the response
function extractMessageContent(messagesResponse) {
  if (messagesResponse && messagesResponse.data) {
    for (const message of messagesResponse.data) {
      for (const contentItem of message.content) {
        if (
          contentItem.type === "text" &&
          contentItem.text &&
          contentItem.text.value
        ) {
          return contentItem.text.value;
        }
      }
    }
  }
  return "No valid content found.";
}

// Retry with exponential backoff
async function retryWithBackoff(fn, retries = 10) {
  let delay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

module.exports = {
  summarizeJSON, createResolution,
};
