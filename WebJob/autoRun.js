// test_script.js

const fs = require('fs');
const { fetchDeals } = require("../Apollo/ApolloAPI");
const { processDeals, connectToMySQL } = require("../Data/sqlManager");

async function run() {
    connectToMySQL("Database=localdb;Data Source=127.0.0.1:49838;User Id=azure;Password=6#vWHD_$");
    const timestamp = new Date().toISOString();
    const message = `-- fetching deals -- executed at ${timestamp}\n`;

    const deals = await fetchDeals(100);
    //console.log("Deals: ", deals);
    await processDeals(deals, false);

    console.log(message);

    fs.appendFile('log.txt', message, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
    
}

module.exports = { run };
