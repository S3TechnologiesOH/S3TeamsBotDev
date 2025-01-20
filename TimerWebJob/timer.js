const path = require('path');
const fs = require('fs');

// Dynamically construct the path to auto_run.js
const scriptPath = path.join(
    process.env.HOME || '/home',
    'site',
    'wwwroot',
    'WebJob',
    'auto_run.js'
);

console.log(`Resolved script path: ${scriptPath}`);

// Check if the file exists
if (fs.existsSync(scriptPath)) {
    console.log(`File found: ${scriptPath}`);

    try {
        // Dynamically load the auto_run.js module
        const autoRunModule = require(scriptPath);

        // Check if the run() function is exported
        if (typeof autoRunModule.run === 'function') {
            console.log('Running the function: run()');
            autoRunModule.run(); // Call the run function directly
        } else {
            console.error('The "run" function is not exported in auto_run.js.');
            process.exit(1);
        }
    } catch (err) {
        console.error(`Error while loading or executing auto_run.js: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    }
} else {
    console.error(`File not found at: ${scriptPath}`);
    process.exit(1); // Exit with error code
}
