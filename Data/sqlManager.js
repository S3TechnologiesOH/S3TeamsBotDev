const { DefaultAzureCredential } = require('@azure/identity');
const sql = require('mssql');

const credential = new DefaultAzureCredential();

class TeamsBot extends TeamsActivityHandler {

  async function getAccessToken() {
    // For Azure SQL, the resource you request a token for is always 'https://database.windows.net/'
    const tokenResponse = await credential.getToken('https://database.windows.net/');
    return tokenResponse.token;
  }


  async function queryDatabase() {
    try {
      const token = await getAccessToken();

      const pool = await sql.connect({
        server: 's3-powerbot-server.database.windows.net',
        database: 's3-powerbot-sqldb',
        // Note no username and password since we’re using token-based auth
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: token
          }
        },
        options: {
          encrypt: true
        }
      });

      const result = await pool.request().query('SELECT TOP 10 * FROM dbo.users');
      console.log(result.recordset);

      pool.close();
    } catch (err) {
      console.error('Error querying the database with AAD token:', err);
    }
  }

  // Function to retrieve tables from the database
  async function getTables() {
    let pool;
    try {
      const token = await getAccessToken();
      pool = await sql.connect({
        server: 's3-powerbot-server.database.windows.net',
        database: 's3-powerbot-sqldb',
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: token
          }
        },
        options: {
          encrypt: true
        }
      });

      const query = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo'
      `;

      const result = await pool.request().query(query);
      console.log('Tables:', result.recordset);

      // Return the list of tables if needed
      return result.recordset;

    } catch (error) {
      console.error('Error retrieving tables:', error);
      throw error; // re-throw so the caller knows something went wrong
    } finally {
      if (pool) {
        pool.close(); // close the connection pool
      }
    }
  }


  // Function to insert a single row with uniqueness check
  async function insertSingleRow(name, email) {
    try {
      //CONNECTION POOL
      const token = await getAccessToken();
      const pool = await sql.connect({
        server: 's3-powerbot-server.database.windows.net',
        database: 's3-powerbot-sqldb',
        // Note no username and password since we’re using token-based auth
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: token
          }
        },
        options: {
          encrypt: true
        }
      });


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
  async function logCommand(user, command) {
    try {

      const token = await getAccessToken();
      const pool = await sql.connect({
        server: 's3-powerbot-server.database.windows.net',
        database: 's3-powerbot-sqldb',
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: token
          }
        },
        options: {
          encrypt: true
        }
      });

      await pool
        .request()
        .input('user', sql.VarChar, user)
        .input('command', sql.VarChar, command)
        .input('date', sql.DateTime, new Date())
        .query('INSERT INTO dbo.command_logs (user, command, date) VALUES (@user, @command, @date)');

      console.log('Command logged:', { user, command });
    } catch (error) {
      console.error('Error logging command:', error);
    }
  }

  // Function to check and insert opportunity
  async function checkAndInsertOpportunity(id, opportunity_stage_id) {
    try {

      const token = await getAccessToken();
      const pool = await sql.connect({
        server: 's3-powerbot-server.database.windows.net',
        database: 's3-powerbot-sqldb',
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: token
          }
        },
        options: {
          encrypt: true
        }
      });

      // Check if the opportunity already exists
      const result = await pool
        .request()
        .input('id', sql.VarChar, id)
        .query('SELECT * FROM dbo.apollo_opportunities WHERE id = @id');

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
        .query('INSERT INTO dbo.apollo_opportunities (id, opportunity_stage_id, has_changed) VALUES (@id, @opportunity_stage_id, @has_changed)');

      console.log('Opportunity inserted:', { id, opportunity_stage_id, has_changed: false });
    } catch (error) {
      console.error('Error in checkAndInsertOpportunity:', error);
    }
  }

  // Function to update and check opportunity
  async function updateOpportunityAndCheck(id, opportunity_stage_id) {
    let pool;
    try {
      
      const token = await getAccessToken();
      pool = await sql.connect({
        server: 's3-powerbot-server.database.windows.net',
        database: 's3-powerbot-sqldb',
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: token
          }
        },
        options: {
          encrypt: true
        }
      });

      const result = await pool
        .request()
        .input('id', sql.VarChar, id)
        .query('SELECT * FROM dbo.apollo_opportunities WHERE id = @id');

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
          .query('UPDATE dbo.apollo_opportunities SET has_changed = 1 WHERE id = @id');
      }

      // Update the stage ID
      await pool
        .request()
        .input('id', sql.VarChar, id)
        .input('opportunity_stage_id', sql.VarChar, opportunity_stage_id)
        .query('UPDATE dbo.apollo_opportunities SET opportunity_stage_id = @opportunity_stage_id WHERE id = @id');

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
 
module.exports = { getTables, insertSingleRow, logCommand,
   checkAndInsertOpportunity, updateOpportunityAndCheck, queryDatabase};