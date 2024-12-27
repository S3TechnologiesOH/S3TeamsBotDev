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

async function checkCompanies() {
    console.log("Entering getAllCompanies...");
    const pageSize = 100;
    let allCompanies = [];
    let currentPage = 1;
    let fetchedCompanies;
  
    try {
      do {
        console.log(`Fetching page ${currentPage} of companies...`);
        fetchedCompanies = await cwCompanies.companyCompaniesGet({
          page: currentPage,
          pageSize: pageSize,
        });
  
        if (fetchedCompanies && fetchedCompanies.length > 0) {
          allCompanies = allCompanies.concat(fetchedCompanies);
          console.log(`Page ${currentPage} fetched, total companies so far: ${allCompanies.length}`);
        } else {
          console.log("No more companies to fetch.");
          break;
        }
  
        // Process or store in chunks if total size exceeds limit
        if (JSON.stringify(allCompanies).length > 250000) {
          console.log(`Processing batch of ${allCompanies.length} companies...`);
          await processCompaniesBatch(allCompanies);
          allCompanies = [];  // Reset for next batch
        }
  
        currentPage++;
      } while (fetchedCompanies.length === pageSize);
  
      // Process any remaining companies
      if (allCompanies.length > 0) {
        console.log(`Processing final batch of ${allCompanies.length} companies...`);
        await processCompaniesBatch(allCompanies);
      }
  
      console.log("All companies fetched and processed successfully.");
    } catch (error) {
      console.error("Error fetching companies:", error);
      return null;
    }
  }
  
  // Example: Processing function (adjust as needed)
  async function processCompaniesBatch(companiesBatch) {
    // Simulate processing (e.g., write to DB, send to another API)
    console.log(`Processing ${companiesBatch.length} companies...`);
    // await db.save(companiesBatch);  // Example for DB save
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