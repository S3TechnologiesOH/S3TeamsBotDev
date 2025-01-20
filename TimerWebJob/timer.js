const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

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

    // Spawn a Node.js process to run the auto_run.js file
    const childProcess = spawn('node', [scriptPath]);

    // Log stdout and stderr from the child process
    childProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // Handle process close events
    childProcess.on('close', (code) => {
        console.log(`auto_run.js process exited with code: ${code}`);
    });

    childProcess.on('error', (err) => {
        console.error(`Failed to start auto_run.js process: ${err}`);
    });
} else {
    console.error(`File not found at: ${scriptPath}`);
    process.exit(1); // Exit with error code
}
