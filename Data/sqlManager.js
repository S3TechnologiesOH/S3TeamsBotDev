const { TeamsActivityHandler } = require('botbuilder'); // Ensure this is installed and imported
const { DefaultAzureCredential } = require('@azure/identity');
const sql = require('mssql');

class SQLManager extends TeamsActivityHandler {
  constructor() {
    super();
    this.credential = new DefaultAzureCredential();
  }

  async getAccessToken() {
    // For Azure SQL, the resource is always 'https://database.windows.net/'
    const tokenResponse = await this.credential.getToken('https://database.windows.net/.default');
    return tokenResponse.token;
  }

  async queryDatabase() {
    let pool;
    try {
      const token = await this.getAccessToken();
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

      const result = await pool.request().query('SELECT TOP 10 * FROM dbo.users');
      console.log(result.recordset);
      return result.recordset;
    } catch (err) {
      console.error('Error querying the database with AAD token:', err);
      throw err;
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }

  // Function to retrieve tables from the database
  async getTables() {
    let pool;
    try {
      const token = await this.getAccessToken();
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
      return result.recordset;
    } catch (error) {
      console.error('Error retrieving tables:', error);
      throw error;
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }

  // Function to insert a single row with uniqueness check
  async insertSingleRow(name, email) {
    let pool;
    try {
      const token = await this.getAccessToken();
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

      // Check if the user already exists
      const result = await pool
        .request()
        .input('name', sql.VarChar, name)
        .input('email', sql.VarChar, email)
        .query('SELECT * FROM dbo.users WHERE name = @name OR email = @email');

      if (result.recordset.length > 0) {
        console.log(`User with name "${name}" or email "${email}" already exists. Skipping insertion.`);
        return;
      }

      // Insert the new user
      await pool
        .request()
        .input('name', sql.VarChar, name)
        .input('email', sql.VarChar, email)
        .query('INSERT INTO dbo.users (name, email) VALUES (@name, @email)');

      console.log('Single row inserted:', { name, email });
    } catch (error) {
      console.error('Error inserting single row:', error);
      throw error;
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }

  // Function to log a command
  async logCommand(user, command) {
    let pool;
    try {
      const token = await this.getAccessToken();
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

      await pool
        .request()
        .input('user', sql.VarChar, user)
        .input('command', sql.VarChar, command)
        .input('date', sql.DateTime, new Date())
        .query('INSERT INTO dbo.command_logs (user, command, date) VALUES (@user, @command, @date)');

      console.log('Command logged:', { user, command });
    } catch (error) {
      console.error('Error logging command:', error);
      throw error;
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }

  // Function to check and insert opportunity
  async checkAndInsertOpportunity(id, opportunity_stage_id) {
    let pool;
    try {
      const token = await this.getAccessToken();
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
      throw error;
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }

  // Function to update and check opportunity
  async updateOpportunityAndCheck(id, opportunity_stage_id) {
    let pool;
    try {
      const token = await this.getAccessToken();
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
      throw error;
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }
}

module.exports = {SQLManager};
