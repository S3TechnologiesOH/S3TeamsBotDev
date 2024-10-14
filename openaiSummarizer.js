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
      //console.log("Debug Log: JSON being passed to OpenAI:", jsonString); // Debug log to verify JSON
  
      // Call OpenAI with the JSON string as part of the prompt
      const promptMessage = `\n${jsonString}\n`;
  
      assistant = client.beta.assistants.retrieve("asst_2siYL2u8sZy9PhFDZQvlyKOi")
      
      thread = client.beta.threads.create()
      message = client.beta.threads.messages.create(
        thread_id = thread.id,
        role = "user",
        content = promptMessage
      )
      
      run = client.beta.threads.runs.create(
        thread_id = thread.id,
        assistant_id = assistant.id
      )

      while (run.status in ['queued', 'in_progress', 'cancelling']){
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(
          thread_id=thread.id,
          run_id=run.id
        )
      }
      if (run.status == 'completed'){
        messages = client.beta.threads.messages.list(
          thread_id=thread.id
        )
        print(messages)
        return messages;
      }
      else
      {
        print(run.status)
      }

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error summarizing JSON:", error);
      throw new Error("Failed to summarize JSON data.");
    }
  }
  

module.exports = {
  summarizeJSON,
};
