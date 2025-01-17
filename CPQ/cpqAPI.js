// Dynamically import fetch when needed
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

// Replace these values with your actual ConnectWise API credentials
const accessKey = process.env.CPQ_ACCESS_KEY;
const publicKey = process.env.CPQ_PUBLIC_KEY;
const privateKey = process.env.CPQ_PRIVATE_KEY;

// Base64 encode the public and private keys for authentication
const authToken = Buffer.from(`${accessKey}+${publicKey}:${privateKey}`).toString('base64');

// Set the API endpoint and headers
const baseUrl = 'https://sellapi.quosalsell.com/api/quotes'; // Adjust the base URL according to your region or specific API path
const headers = {
  'Authorization': `Basic ${authToken}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * Extracts and formats the termsAndConditions field from the quotes array by quote number.
 * @param {Array} quotes - Array of quote objects fetched from the API.
 * @param {string|number} quoteNumber - The specific quote number to look up.
 * @returns {string} - The formatted terms and conditions or an error message.
 */
const extractTermsAndConditions = (quotes, quoteNumber) => {
  if (!quotes) {
    return `No quotes data available.`;
  }
  const quote = quotes.find((quote) => quote.quoteNumber === quoteNumber);
  if (quote && quote.termsAndConditions) {
    return quote.termsAndConditions
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    return `Quote not found or Terms and Conditions not available for Quote Number ${quoteNumber}`;
  }
};

/**
 * Handles a quote request by fetching quotes, extracting terms and conditions for a specific quote number,
 * and sending the information via the given context.
 * @param {Object} context - The context object used to send activity (e.g., bot context).
 * @param {string|number} quoteNumber - The specific quote number to process.
 */
const handleQuoteRequest = async (context, quoteNumber) => {
  const quotes = await fetchQuotes(baseUrl, headers);
  const value = extractTermsAndConditions(quotes, quoteNumber);
  console.log("Quote:", value);
  await context.sendActivity(`\n\n**Quote:** ${value}\n\n`);
};

/**
 * Example function to get a list of quotes.
 * @returns {Promise<Array|null>} - Returns the array of quotes or null if an error occurred.
 */
const getQuotes = async () => {
  return await fetchQuotes(baseUrl, headers);
};

module.exports = { extractTermsAndConditions, getQuotes, handleQuoteRequest };
