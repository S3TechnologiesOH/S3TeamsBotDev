// ApolloAPI.js
const { checkAndInsertOpportunity, updateOpportunityAndCheck } = require('../Data/sqlManager');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

const fetchDeals = async (api_key, isUpdate = false, perPage = 100) => {
  const baseUrl = 'https://api.apollo.io/api/v1/opportunities/search';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Api-Key': api_key
    }
  };

  let currentPage = 1;

  try {
    while (true) {
      const requestBody = {
        search_filter_json: {
          filters: [
            {
              field: "opportunity_stage_id",
              values: ["657c6cc9ab96200302cbd0a3"],
              type: "equals" // Changed to "equals" for compatibility
            }
          ]
        },
        page: currentPage,
        per_page: perPage
      };

      console.log(`Fetching page ${currentPage} with up to ${perPage} results...`);
      console.log(`Request Body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch(baseUrl, {
        ...options,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error(`API Error Response:`, errorResponse);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      const { opportunities = [], pagination = {} } = responseData;

      console.log(`Page ${currentPage} retrieved. Total deals returned on this page: ${opportunities.length}`);

      for (const deal of opportunities) {
        const { id, opportunity_stage_id } = deal;
        try {
          if (isUpdate) {
            // Update existing opportunity
            await updateOpportunityAndCheck(id, opportunity_stage_id);
            console.log(`Updated deal with ID: ${id}, Opportunity Stage ID: ${opportunity_stage_id}`);
          } else {
            // Insert new opportunity
            await checkAndInsertOpportunity(id, opportunity_stage_id);
            console.log(`Inserted deal with ID: ${id}, Opportunity Stage ID: ${opportunity_stage_id}`);
          }
        } catch (error) {
          console.error(`Error processing deal with ID: ${id}`, error);
        }
      }

      console.log(`Filtered deals processed from page ${currentPage}: ${opportunities.length}`);

      // Check pagination
      if (pagination && pagination.has_next_page) {
        currentPage++;
      } else {
        console.log('No more pages to fetch. Exiting loop.');
        break;
      }
    }

    console.log('All pages processed successfully.');
  } catch (error) {
    console.error('Error fetching and processing deals:', error);
    throw error;
  }
};

// Usage example (uncomment the following lines and replace 'your_api_key_here' with your actual API key):
// fetchDeals('your_api_key_here').then(() => {
//   console.log('All deals processed successfully.');
// }).catch(err => console.error(err));

module.exports = { fetchDeals };
