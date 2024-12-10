// ApolloAPI.js
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
      while (true) {
        const url = `${baseUrl}?sort_by_field=${sortByField}&page=${currentPage}&per_page=${perPage}`;
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
  
        const { opportunities, pagination } = await response.json();
  
        // Filter deals by `stage_name`, excluding null values
        const filteredDeals = opportunities.filter(deal => deal.stage_name !== null);
  
        // Add filtered deals to the collection
        allDeals = [...allDeals, ...filteredDeals];
  
        // Check if we have more pages to fetch
        if (pagination && pagination.has_next_page) {
          currentPage++;
        } else {
          break;
        }
      }
  
      console.log(`Total deals retrieved and filtered: ${allDeals.length}`);
      return allDeals;
    } catch (error) {
      console.error('Error fetching and filtering deals:', error);
      throw error;
    }
  };
  
  // Usage example
  // Replace 'your_api_key_here' with your actual API key
  // fetchDeals('your_api_key_here').then(deals => console.log(deals)).catch(err => console.error(err));
  
  module.exports = { fetchDeals };
  