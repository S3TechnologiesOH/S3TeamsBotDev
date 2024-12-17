const sql = require('mssql');
const retry = require('async-retry');

const { DefaultAzureCredential } = require('@azure/identity');

// Azure SQL Database connection details
const sqlConfig = {
  server: 's3-powerbot-server.database.windows.net', // Your Azure SQL server name
  database: 's3-powerbot-sqldb', // Your database name
  options: {
    encrypt: true, // This is required for Azure SQL
    trustServerCertificate: false, // Recommended for production
  },
};

// Function to get an access token for Azure SQL using DefaultAzureCredential
async function getAccessToken() {
  const credential = new DefaultAzureCredential();
  const tokenResponse = await credential.getToken('https://database.windows.net/.default');
  console.log('Access Token:', tokenResponse.token); // Add this line
  return tokenResponse.token;
}
async function createConnectionPool() {
  const pool = await retry(async () => {
    const accessToken = await getAccessToken();
    const poolConfig = {
      ...sqlConfig,
      authentication: {
        type: 'azure-active-directory-access-token',
        options: {
          token: accessToken,
        },
      },
    };

    const pool = new sql.ConnectionPool(poolConfig);
    await pool.connect();
    console.log('Connected to Azure SQL Database using passwordless authentication.');
    return pool;
  }, {
    retries: 3, // Retry up to 3 times
    minTimeout: 1000, // Wait 1 second between retries
  });

  return pool;
}

// Function to retrieve tables from the database
async function getTables(pool) {
  try {
    const result = await pool.request().query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES');
    console.log('Tables:', result.recordset);
  } catch (error) {
    console.error('Error retrieving tables:', error);
  }
}

// Function to insert a single row with uniqueness check
async function insertSingleRow(pool, name, email) {
  try {
    // Check if the user already exists
    const result = await pool
      .request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM users WHERE name = @name OR email = @email');

    if (result.recordset.length > 0) {
      console.log(`User with name "${name}" or email "${email}" already exists. Skipping insertion.`);
      return;
    }

    // Insert the new user
    await pool
      .request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .query('INSERT INTO users (name, email) VALUES (@name, @email)');

    console.log('Single row inserted:', { name, email });
  } catch (error) {
    console.error('Error inserting single row:', error);
  }
}

// Function to log a command
async function logCommand(pool, user, command) {
  try {
    await pool
      .request()
      .input('user', sql.VarChar, user)
      .input('command', sql.VarChar, command)
      .input('date', sql.DateTime, new Date())
      .query('INSERT INTO command_logs (user, command, date) VALUES (@user, @command, @date)');

    console.log('Command logged:', { user, command });
  } catch (error) {
    console.error('Error logging command:', error);
  }
}

// Function to check and insert opportunity
async function checkAndInsertOpportunity(pool, id, opportunity_stage_id) {
  try {
    // Check if the opportunity already exists
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM apollo_opportunities WHERE id = @id');

    if (result.recordset.length > 0) {
      console.log(`Opportunity with ID ${id} already exists. Skipping insertion.`);
      return;
    }

    // Insert the new opportunity
    await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('opportunity_stage_id', sql.VarChar, opportunity_stage_id)
      .input('has_changed', sql.Bit, false)
      .query('INSERT INTO apollo_opportunities (id, opportunity_stage_id, has_changed) VALUES (@id, @opportunity_stage_id, @has_changed)');

    console.log('Opportunity inserted:', { id, opportunity_stage_id, has_changed: false });
  } catch (error) {
    console.error('Error in checkAndInsertOpportunity:', error);
  }
}

// Function to update and check opportunity
async function updateOpportunityAndCheck(pool, id, opportunity_stage_id) {
  try {
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM apollo_opportunities WHERE id = @id');

    if (result.recordset.length === 0) {
      console.log(`No record found with ID ${id}.`);
      return;
    }

    const currentStageId = result.recordset[0].opportunity_stage_id;

    // Check the specific condition
    if (
      currentStageId === '657c6cc9ab96200302cbd0a3' &&
      opportunity_stage_id === '669141aa1bcf2c04935c3074'
    ) {
      console.log('Condition met, setting has_changed to true...');
      await pool
        .request()
        .input('id', sql.VarChar, id)
        .query('UPDATE apollo_opportunities SET has_changed = 1 WHERE id = @id');
    }

    // Update the stage ID
    await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('opportunity_stage_id', sql.VarChar, opportunity_stage_id)
      .query('UPDATE apollo_opportunities SET opportunity_stage_id = @opportunity_stage_id WHERE id = @id');

    console.log('Opportunity updated:', { id, opportunity_stage_id });
  } catch (error) {
    console.error('Error in updateOpportunityAndCheck:', error);
  }
}

/*(async () => {
  const pool = await createConnectionPool();

  try {
    await getTables(pool); // Example: List tables

    // Example usage of functions
    await insertSingleRow(pool, 'John Doe', 'john.doe@example.com');
    await logCommand(pool, 'John Doe', 'INSERT');
    await checkAndInsertOpportunity(pool, '12345', '657c6cc9ab96200302cbd0a3');
    await updateOpportunityAndCheck(pool, '12345', '669141aa1bcf2c04935c3074');
  } catch (error) {
    console.error('Error during execution:', error);
  } finally {
    await pool.close();
    console.log('Connection pool closed.');
  }
})();
*/
module.exports = { createConnectionPool, getTables, insertSingleRow, logCommand, checkAndInsertOpportunity, updateOpportunityAndCheck };