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
    const thread = await client.beta.threads.create();

    // Add a user message to the thread
    const threadResponse = await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: promptMessage,
    });

    const runResponse = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Polling until the run completes or fails
    let runStatus = runResponse.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const runStatusResponse = await client.beta.threads.runs.retrieve(thread.id, runResponse.id);
      runStatus = runStatusResponse.status;
    }

    // Get the messages in the thread once the run has completed
    if (runStatus === 'completed') {
      const messagesResponse = await client.beta.threads.messages.list(thread.id);
      
      // Assuming the latest message contains the JSON string
      const latestMessage = messagesResponse.data[messagesResponse.data.length - 1];

      // Parse the JSON content from the message
      let messageContent = latestMessage.content;
      let parsedContent;

      try {
        parsedContent = JSON.parse(messageContent); // Parse the JSON content
      } catch (error) {
        console.error("Failed to parse message content:", error);
        return messageContent; // If parsing fails, return the raw message content
      }

      // Extract useful information from the parsed content
      let ticketInfo = parsedContent.ticket;
      let summaryText = `
        ID: ${ticketInfo.id}
        Summary: ${ticketInfo.summary}
        Record Type: ${ticketInfo.recordType}
        Company: ${ticketInfo.company.name}
        Board: ${ticketInfo.board.name}
        Status: ${ticketInfo.status.name}
        Priority: ${ticketInfo.priority.name}
        Assigned to: ${ticketInfo.resources}
        Actual Hours: ${ticketInfo.actualHours}
        Time Entries Summary:
      `;

      // If time entries exist, format them
      if (ticketInfo.timeEntries && ticketInfo.timeEntries.length > 0) {
        ticketInfo.timeEntries.forEach((entry, index) => {
          summaryText += `\nTime Entry ${index + 1}:\n- ID: ${entry.id}\n- Notes: ${entry._info.notes || 'No notes'}`;
        });
      } else {
        summaryText += "\nNo time entries available.";
      }

      return summaryText.trim();
    } else {
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
