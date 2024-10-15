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
    console.log("Starting summarizeJSON function");

    // Simplify JSON data to make it easier for the assistant to process
    const simplifiedEntries = jsonData.map(entry => `*Time Entry ID: ${entry.id}\nNotes: ${entry._info.notes || 'No notes'}`).join('\n\n');
    
    // Create simplified prompt message
    const promptMessage = simplifiedEntries;
    console.log("Prompt message created: ", promptMessage);

    const assistant = await client.beta.assistants.retrieve("asst_2siYL2u8sZy9PhFDZQvlyKOi");
    console.log("Assistant retrieved: ", assistant);

    const thread = await client.beta.threads.create();
    console.log("Thread created: ", thread);

    // Add a user message to the thread
    const threadResponse = await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: promptMessage,
    });

    console.log("User message added to thread: ", JSON.stringify(threadResponse));

    const runResponse = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });
    console.log("Run started: ", runResponse);

    // Polling until the run completes or fails
    let runStatus = runResponse.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      console.log(`Current run status: ${runStatus}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const runStatusResponse = await client.beta.threads.runs.retrieve(thread.id, runResponse.id);
      runStatus = runStatusResponse.status;
      console.log(`Updated run status: ${runStatus}`);
    }

    // Handle failed status
    if (runStatus === 'failed') {
      console.log("Run failed. Error details: ", runResponse.last_error, runResponse.incomplete_details);
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }

    // Get the messages in the thread once the run has completed
    if (runStatus === 'completed') {
      console.log("Run completed successfully");
      const messagesResponse = await client.beta.threads.messages.list(thread.id);
      if (messagesResponse && messagesResponse.data) {
        messagesResponse.data.forEach((message) => {
          if (message.content && message.content.length > 0) {
            message.content.forEach((contentItem) => {
              if (contentItem.type === "text" && contentItem.text && contentItem.text.value && !contentItem.text.value.startsWith("*")){
                console.log("Message Content: ", contentItem.text.value);
                messageContent = contentItem.text.value;
              }
            });
          }
        });
      } else {
        console.log("No messages found");
      }
      return messageContent; // Return the message content as a string

    } else {
      console.error(`Run did not complete successfully. Status: ${runStatus}`);
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }
  } catch (error) {
    console.error("Error summarizing JSON:", error);
    throw new Error("Failed to summarize JSON data.");
  }
}


module.exports = {
  summarizeJSON,
};
