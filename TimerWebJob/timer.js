// timer.js

const cron = require('node-cron');
const path = require('path');

// Path to your test_script.js
const scriptPath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'home', 'site', 'wwwroot', 'WebJob', 'auto_run.js');

// Import the runTest function
const { runTest } = require(scriptPath);

// Schedule the task to run every 1 minute using cron syntax
cron.schedule('* * * * *', () => {
    console.log('Cron job triggered: Running auto_run.js');
    runTest();
});

console.log('Cron timer started. Running auto_run.js every 1 minute.');
