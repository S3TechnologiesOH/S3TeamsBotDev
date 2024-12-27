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

async function checkCompanies(context, companyToCheck, currentThread = null) {
    try {
      console.log("Starting checkCompanies function");
      
      const companyData = await getCompanies();
      if (!companyData) {
        console.error("No company data retrieved.");
        await context.sendActivity("Failed to retrieve company data.");
        return;
      }
      
      const companyString = JSON.stringify(companyData, null, 2);
      const promptMessage = `The company inputted is ${companyToCheck}. \nThe company list is: \n${companyString}`;
      //console.log("Prompt message created: ", promptMessage);
  
      if (!currentThread) {
        currentThread = await retryWithBackoff(() =>
          client.beta.threads.create()
        );
        console.log("Thread created: ", currentThread);
      }
  
      await retryWithBackoff(() =>
        client.beta.threads.messages.create(currentThread.id, {
          role: "user",
          content: promptMessage,
        })
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
  
      const messageContent = await waitForRunCompletion(currentThread.id, runResponse.id);
      
      if (messageContent) {
        console.log("Message Content: ", messageContent);
        return messageContent;
      } else {
        console.error("No valid content returned from run.");
        throw new Error("Failed to retrieve message content.");
      }
    } catch (error) {
      console.error("Error in checkCompanies:", error);
      throw new Error("Failed to process company check.");
    }
  }
  
  // Helper function for waiting on completion
  async function waitForRunCompletion(threadId, runId) {
    let runStatus = "queued";
    const maxWaitTime = 60000;  // 60 seconds timeout
    const startTime = Date.now();
  
    while (runStatus === "queued" || runStatus === "in_progress") {
      if (Date.now() - startTime > maxWaitTime) {
        console.error("Run timed out.");
        throw new Error("Run process timed out.");
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
  
      const runStatusResponse = await client.beta.threads.runs.retrieve(
        threadId,
        runId
      );
      runStatus = runStatusResponse.status;
      console.log(`Run status: ${runStatus}`);
    }
  
    if (runStatus === "completed") {
      const messagesResponse = await client.beta.threads.messages.list(threadId);
      return extractMessageContent(messagesResponse);
    } else {
      console.error(`Run failed with status: ${runStatus}`);
      return null;
    }
  }

  
  // Exponential backoff logic
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
  
module.exports = { checkCompanies };