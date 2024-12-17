// ApolloAPI.js
const axios = require('axios');
const async = require('async');
const { checkAndInsertOpportunity, updateOpportunityAndCheck } = require('../Data/sqlManager');
const dotenv = require('dotenv');

dotenv.config();

const fetchDeals = async (isUpdate = false, perPage = 100) => {
  const baseUrl = 'https://api.apollo.io/api/v1/opportunities/search';
  const api_key = process.env.APOLLO_API_KEY;

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
  const targetStageId = "657c6cc9ab96200302cbd0a3";
  const CONCURRENCY_LIMIT = 10;

  try {
    while (true) {
      const requestBody = {
        search_query: "",
        search_filter_json: {
          filters: []
        },
        page: currentPage,
        per_page: 100
      };

      console.log(`\nFetching page ${currentPage}...`);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(baseUrl, requestBody, { headers });
      const { opportunities = [], pagination = {} } = response.data;

      console.log(`Page ${currentPage} retrieved. Total deals on this page: ${opportunities.length}`);

      const filteredOpportunities = opportunities.filter(deal => deal.opportunity_stage_id === targetStageId);
      console.log(`Filtered deals on this page: ${filteredOpportunities.length}`);

      if (filteredOpportunities.length > 0) {
        await new Promise((resolve, reject) => {
          async.eachLimit(filteredOpportunities, CONCURRENCY_LIMIT, async (deal) => {
            const { id, opportunity_stage_id } = deal;
            try {
              if (isUpdate) {
                //await updateOpportunityAndCheck(id, opportunity_stage_id);
                console.log(`Updated deal with ID: ${id}`);
              } else {
                //await checkAndInsertOpportunity(id, opportunity_stage_id);
                console.log(`Inserted deal with ID: ${id}`);
              }
            } catch (error) {
              console.error(`Error processing deal with ID: ${id}`, error.message);
            }
          }, (err) => {
            if (err) {
              console.error('Error processing deals:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
        console.log(`Processed ${filteredOpportunities.length} filtered deals from page ${currentPage}.`);
      } else {
        console.log(`No deals to process on page ${currentPage}.`);
      }

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

module.exports = { fetchDeals };
