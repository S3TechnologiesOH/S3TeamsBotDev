// ApolloAPI.js

const fetch = require('node-fetch'); // Ensure you have node-fetch or a similar library if you're running in Node.js

const fetchDeals = async (api_key, sortByField = 'amount', perPage = 100) => {
  const baseUrl = 'https://api.apollo.io/api/v1/opportunities/search';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': api_key
    }
  };

  let allDeals = [];
  let currentPage = 1;

  try {
    // Keep iterating until pagination.has_next_page is false
    while (true) {
      const url = `${baseUrl}?sort_by_field=${sortByField}&page=${currentPage}&per_page=${perPage}`;
      console.log(`Fetching page ${currentPage} with up to ${perPage} results...`);

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const { opportunities = [], pagination = {} } = await response.json();
      console.log(`Page ${currentPage} retrieved. Total deals returned on this page: ${opportunities.length}`);

      // Filter deals by `stage_name`, excluding null values
      const filteredDeals = opportunities.filter(deal => deal.opportunity_stage_id && deal.opportunity_stage_id === "669141aa1bcf2c04935c3074");

      // Add filtered deals to the collection
      allDeals = [...allDeals, ...filteredDeals];
      console.log(`Filtered deals from page ${currentPage}: ${filteredDeals.length}`);
      console.log(`Total deals accumulated so far: ${allDeals.length}`);

      // Check pagination
      if (pagination && pagination.has_next_page) {
        currentPage++;
      } else {
        console.log('No more pages to fetch. Exiting loop.');
        break;
      }
    }

    console.log(`Total deals retrieved and filtered after all pages: ${allDeals.length}`);
    return allDeals;
  } catch (error) {
    console.error('Error fetching and filtering deals:', error);
    throw error;
  }
};

// Usage example (uncomment the following lines and replace 'your_api_key_here' with your actual API key):
// fetchDeals('your_api_key_here').then(deals => {
//   console.log('All filtered deals:', deals);
// }).catch(err => console.error(err));

module.exports = { fetchDeals };
