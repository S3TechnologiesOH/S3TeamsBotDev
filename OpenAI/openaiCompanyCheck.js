const { AzureOpenAI } = require("openai");
const { getCompanies } = require("../ConnectWise/connectwiseAPI");
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

async function checkCompanies(context, companyToCheck) {
  try {
    console.log("Starting summarizeJSON function");
    companyData = getCompanies();
    // Convert ticket data and task data to strings
    const companyString = JSON.stringify(companyData, null, 2);

    // Combine both strings into one prompt message
    const promptMessage = `The company inputted is ${companyToCheck}. \n\n The company list is: \n${companyString}`;
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
        assistant_id: "asst_gQ8mvmK6osq6t4UNHNfijoDk",
        max_completion_tokens: 200,
        temperature: 0.1,
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

module.exports = { checkCompanies };