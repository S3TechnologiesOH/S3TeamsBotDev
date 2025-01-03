// test_script.js

const fs = require('fs');
const { fetchDeals } = require("../Apollo/ApolloAPI");

function run() {
    const timestamp = new Date().toISOString();
    const message = `-- fetching deals -- executed at ${timestamp}\n`;
    fetchDeals(true, 100);

    console.log(message);

    fs.appendFile('log.txt', message, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

module.exports = { run };
