// Import necessary modules
const fs = require('fs');


// Replace these values with your actual ConnectWise API credentials
const accessKey = process.env.CPQ_ACCESS_KEY;
const publicKey = process.env.CPQ_PUBLIC_KEY;
const privateKey = process.env.CPQ_PRIVATE_KEY;

// Base64 encode the public and private keys
const authToken = Buffer.from(`${accessKey}+${publicKey}:${privateKey}`).toString('base64');

// Set the API endpoint
const baseUrl = 'https://sellapi.quosalsell.com/api/quotes'; // Adjust the base URL according to your region or specific API path

// Define headers with authentication information
const headers = {
  'Authorization': `Basic ${authToken}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const handleQuoteRequest = async (context, quoteNumber) => {
  await fetchQuotes(baseUrl, headers);
  const value = extractTermsAndConditions(getQuotes(), quoteNumber);
  console.log("Quote: ", value);
  await context.sendActivity(`\n\n` + 
    `**Parts:** ` +
    `**Quote:** ${value}\n\n`);
}

// Example function to get a list of quotes
const getQuotes = async () => {
  return await fetchQuotes(baseUrl, headers);
};

  // Function to extract and format termsAndConditions field from quotes.json by quote number
const extractTermsAndConditions = (filename, quoteNumber) => {
    try {
      const data = fs.readFileSync(filename, 'utf8');
      const quotes = JSON.parse(data);
      const quote = quotes.find((quote) => quote.quoteNumber === quoteNumber);
      if (quote && quote.termsAndConditions) {
        return quote.termsAndConditions
          .replace(/\r\n/g, '\n')
          .replace(/\t/g, '  ')
          .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
          .trim();
      } else {
        return `Quote not found or Terms and Conditions not available for Quote Number ${quoteNumber}`;
      }
    } catch (error) {
      return `Error reading or parsing file: ${error.message}`;
    }
};

// Function to export quotes to a formatted JSON file
const exportQuotesToJson = (quotes, filename = 'quotes.json') => {
  try {
    fs.writeFileSync(filename, JSON.stringify(quotes, null, 4));
    console.log(`Quotes successfully saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving quotes to file: ${error.message}`);
  }
};

// Dynamically import fetch
const fetchQuotes = async (baseUrl, headers) => {
  const { default: fetch } = await import('node-fetch');

  try {
    const response = await fetch(baseUrl, { headers });
    if (!response.ok) {
      throw new Error(`Error fetching quotes: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching quotes: ${error.message}`);
    return null;
  }
};

module.exports = { extractTermsAndConditions, getQuotes, exportQuotesToJson, handleQuoteRequest };
