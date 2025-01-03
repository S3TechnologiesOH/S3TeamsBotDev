// ApolloAPI.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Fetches deals from Apollo API.
 * @param {boolean} isUpdate - Indicates whether to fetch for update operations.
 * @param {number} perPage - Number of deals per page.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of filtered deals.
 */
const fetchDeals = async (perPage = 100) => {
  const baseUrl = 'https://api.apollo.io/api/v1/opportunities/search';
  const api_key = process.env.APOLLO_API_KEY;

  if (!api_key) {
    throw new Error('Apollo API key is not defined in environment variables.');
  }

  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Api-Key': api_key,
  };

  let currentPage = 1;
  const targetStageIds = ['657c6cc9ab96200302cbd0a3', '669141aa1bcf2c04935c3074'];
  const allFilteredDeals = [];

  try {
    while (true) {
      const requestBody = {
        search_query: '',
        search_filter_json: {
          filters: [],
        },
        page: currentPage,
        per_page: perPage,
      };

      console.log(`\nFetching page ${currentPage}...`);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(baseUrl, requestBody, { headers });
      const { opportunities = [], pagination = {} } = response.data;

      console.log(`Page ${currentPage} retrieved. Total deals on this page: ${opportunities.length}`);

      const filteredOpportunities = opportunities.filter(
        (deal) => targetStageIds.includes(deal.opportunity_stage_id)
      );
      console.log(`Filtered deals on this page: ${filteredOpportunities.length}`);

      if (filteredOpportunities.length > 0) {
        allFilteredDeals.push(...filteredOpportunities);
        console.log(`Accumulated ${allFilteredDeals.length} filtered deals so far.`);
      } else {
        console.log(`No deals to accumulate on page ${currentPage}.`);
      }

      if (pagination.has_next_page) {
        currentPage++;
      } else {
        console.log('No more pages to fetch. Exiting loop.');
        break;
      }
    }

    console.log(`All pages processed successfully. Total filtered deals: ${allFilteredDeals.length}`);
    return allFilteredDeals;
  } catch (error) {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Error Details:', error.response.data);
    } else if (error.request) {
      console.error('No response received from the API:', error.request);
    } else {
      console.error('Error in setting up the API request:', error.message);
    }
    throw error;
  }
};

const fetchActivities = async (perPage = 100) => {
  const baseUrl = 'https://api.apollo.io/v1/activities/';
  const api_key = process.env.APOLLO_API_KEY;

  if (!api_key) {
    throw new Error('Apollo API key is not defined in environment variables.');
  }

  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Api-Key': api_key,
  };

  let currentPage = 1;
  const allActivities = [];

  try {
    while (true) {
      const requestBody = {
        search_query: '',
        search_filter_json: {
          filters: [],
        },
        opportunity_id: "66d08f6787c41902d00c6638",
        page: currentPage,
        per_page: perPage,
      };

      console.log(`\nFetching page ${currentPage} for opportunity ${this.opportunity_id}...`);

      const response = await axios.post(this.url, requestBody, { headers: this.headers });
      const { activities = [], pagination = {} } = response.data;

      console.log(`Page ${currentPage} retrieved. Total activities on this page: ${activities.length}`);

      if (activities.length > 0) {
        allActivities.push(...activities);
        console.log(`Accumulated ${allActivities.length} activities so far.`);
      }

      if (pagination.has_next_page) {
        currentPage++;
      } else {
        console.log('No more pages to fetch. Exiting loop.');
        break;
      }
    }

    console.log(`Total activities for opportunity ${this.opportunity_id}: ${allActivities.length}`);
    return allActivities;
  } catch (error) {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Error Details:', error.response.data);
    } else if (error.request) {
      console.error('No response received from the API:', error.request);
    } else {
      console.error('Error in setting up the API request:', error.message);
    }
    throw error;
  }
}





module.exports = { fetchDeals, fetchActivities };
