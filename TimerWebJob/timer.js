// timer.js

const cron = require('node-cron');
const path = require('path');

// Path to your test_script.js
const scriptPath = path.join(__dirname, 'test_script.js');

// Import the runTest function
const { runTest } = require(scriptPath);

// Schedule the task to run every 1 minute using cron syntax
cron.schedule('* * * * *', () => {
    console.log('Cron job triggered: Running test_script.js');
    runTest();
});

console.log('Cron timer started. Running test_script.js every 1 minute.');
