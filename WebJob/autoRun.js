// autoRun.js

const fs = require('fs');
const { fetchDeals } = require("../ApolloAutomation/ApolloAPI");
const { processDeals, connectToMySQL } = require("../Data/sqlManager");
require("dotenv").config();

async function run() {
    //connectToMySQL(process.env.MYSQLCONNSTR_localdb);
    const timestamp = new Date().toISOString();
    const message = `-- fetching deals -- executed at ${timestamp}\n`;

    const deals = await fetchDeals(100);
    await processDeals(deals, true);

    console.log(message);

    fs.appendFile('log.txt', message, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
    
}

module.exports = { run };
