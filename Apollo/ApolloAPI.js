// ApolloAPI.js
const fetchDeals = async (api_key) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': api_key
      }
    };
  
    try {
      const response = await fetch('https://api.apollo.io/api/v1/opportunities', options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const deals = await response.json();
      console.log(deals);
      return deals;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  };
  
  // Usage example
  // Replace 'your_api_key_here' with your actual API key
  //fetchDeals('rwYHYDXtbYkuXRImQKoDVA').then(deals => console.log(deals)).catch(err => console.error(err));
  
  module.exports = { fetchDeals };
  