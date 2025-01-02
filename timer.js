// test_script.js

// This is a simple test script for the bot.
// It logs the current timestamp to the console.

const fs = require('fs');

function runTest() {
    const timestamp = new Date().toISOString();
    const message = `Test script executed at ${timestamp}\n`;
    console.log(message);

    // Optionally, write the log to a file for verification
    fs.appendFile('test_log.txt', message, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

// Execute the test
runTest();
