// ApolloAPI.js
const { checkAndInsertOpportunity, updateOpportunityAndCheck } = require('../Data/sqlManager');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

const fetchWithRetry = async (url, options, retries = 3, backoff = 3000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      if (response.status === 429) { // Too Many Requests
        console.warn(`Rate limited. Retrying in ${backoff}ms...`);
        await new Promise(res => setTimeout(res, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed. Retrying in ${backoff}ms...`, error);
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

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
              type: "is" // Adjusted filter type
            }
          ]
        },
        page: currentPage,
        per_page: perPage
      };

      console.log(`\nFetching page ${currentPage} with up to ${perPage} results...`);
      console.log(`Request Body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetchWithRetry(baseUrl, {
        ...options,
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('API Response:', JSON.stringify(responseData, null, 2));

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
