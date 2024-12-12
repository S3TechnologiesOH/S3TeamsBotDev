// ApolloAPI.js
const { checkAndInsertOpportunity, updateOpportunityAndCheck } = require('../Data/sqlManager');
const axios = require('axios'); // Using Axios for HTTP requests
const pLimit = require('p-limit'); // For concurrency control

/**
 * Fetches all deals from Apollo.io, filters them locally based on opportunity_stage_id,
 * and processes them by inserting or updating in the local database with controlled concurrency.
 *
 * @param {boolean} isUpdate - Determines whether to update existing records or insert new ones.
 * @param {number} perPage - Number of deals to fetch per API request (max 100 as per API limits).
 */
const fetchDeals = async (api_key, isUpdate = false, perPage = 100) => {
  const baseUrl = 'https://api.apollo.io/api/v1/opportunities/search';

  if (!api_key) {
    console.error('Error: Apollo API key is not defined in environment variables.');
    return;
  }

  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Api-Key': api_key
  };

  let currentPage = 1;
  const targetStageId = "657c6cc9ab96200302cbd0a3"; // The opportunity_stage_id to filter by

  // Initialize concurrency limiter
  const limit = pLimit(10); // Adjust concurrency level as needed

  try {
    while (true) {
      const requestBody = {
        // No filters applied here; fetching all deals
        search_filter_json: {
          filters: [] // Empty filters array to fetch all deals
        },
        page: currentPage,
        per_page: perPage
      };

      console.log(`\nFetching page ${currentPage} with up to ${perPage} results...`);
      console.log(`Request Body:`, JSON.stringify(requestBody, null, 2));

      // Make the API request using Axios
      const response = await axios.post(baseUrl, requestBody, { headers });

      const { opportunities = [], pagination = {} } = response.data;

      console.log(`Page ${currentPage} retrieved. Total deals returned on this page: ${opportunities.length}`);

      // Filter deals locally based on opportunity_stage_id
      const filteredOpportunities = opportunities.filter(deal => deal.opportunity_stage_id === targetStageId);

      console.log(`Filtered deals on this page: ${filteredOpportunities.length}`);

      if (filteredOpportunities.length > 0) {
        // Process deals with controlled concurrency
        const processingPromises = filteredOpportunities.map(deal => 
          limit(async () => {
            const { id, opportunity_stage_id } = deal;
            try {
              if (isUpdate) {
                await updateOpportunityAndCheck(id, opportunity_stage_id);
                console.log(`Updated deal with ID: ${id}, Opportunity Stage ID: ${opportunity_stage_id}`);
              } else {
                await checkAndInsertOpportunity(id, opportunity_stage_id);
                console.log(`Inserted deal with ID: ${id}, Opportunity Stage ID: ${opportunity_stage_id}`);
              }
            } catch (error) {
              console.error(`Error processing deal with ID: ${id}`, error.message);
              // Optionally, log error details to a monitoring service
            }
          })
        );

        // Await all processing promises
        await Promise.all(processingPromises);

        console.log(`Processed ${filteredOpportunities.length} filtered deals from page ${currentPage}.`);
      } else {
        console.log(`No deals to process on page ${currentPage}.`);
      }

      // Check pagination to determine if more pages exist
      if (pagination.has_next_page) {
        currentPage++;
      } else {
        console.log('No more pages to fetch. Exiting loop.');
        break;
      }
    }

    console.log('All pages processed successfully.');
  } catch (error) {
    if (error.response) {
      // API responded with a status code outside the 2xx range
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Error Details:', error.response.data);
    } else if (error.request) {
      // No response received from the API
      console.error('No response received from the API:', error.request);
    } else {
      // Error setting up the request
      console.error('Error in setting up the API request:', error.message);
    }
    throw error; // Rethrow the error after logging
  }
};

// Usage example (ensure the .env file has the APOLLO_API_KEY):
// fetchDeals(false).then(() => {
//   console.log('All deals processed successfully.');
// }).catch(err => console.error('Processing failed:', err));

module.exports = { fetchDeals };
