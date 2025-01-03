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

class ActivitiesAPI {
  constructor(opportunity_id) {
    this.api_key = process.env.APOLLO_API_KEY;
    if (!this.api_key) {
      throw new Error('Apollo API key is not defined in environment variables.');
    }

    this.headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Api-Key': this.api_key,
    };
    this.url = new URL('https://api.apollo.io/v1/activities').href; // Ensure valid URL
    this.opportunity_id = opportunity_id;
    this.perPage = 100;
  }

  async fetchActivities() {
    let currentPage = 1;
    const allActivities = [];

    try {
      while (true) {
        const requestBody = {
          opportunity_id: this.opportunity_id,
          page: currentPage,
          per_page: this.perPage,
        };

        console.log(`\nFetching page ${currentPage} for opportunity ${this.opportunity_id}...`);
        console.log('Request URL:', this.url);

        const response = await axios.get(this.url, requestBody, { headers: this.headers });
        const { activities = [], pagination = {} } = response.data;

        console.log(`Page ${currentPage} retrieved. Total activities on this page: ${activities.length}`);
        allActivities.push(...activities);

        if (!pagination.has_next_page) break;
        currentPage++;
      }

      return allActivities;
    } catch (error) {
      console.error('Error during API request:', error.message);
      throw error;
    }
  }
}

const fetchOpportunityActivities = async () => {
  const opportunityId = '6759c175edd68f02ce89377c';  // Replace with actual ID

  const api = new ActivitiesAPI(opportunityId);

  try {
    const activities = await api.fetchActivities();
    console.log('Fetched activities:', activities);
  } catch (error) {
    console.error('Failed to fetch activities:', error.message);
  }
};


module.exports = { fetchDeals, fetchOpportunityActivities };
