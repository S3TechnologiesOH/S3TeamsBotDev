const { DefaultAzureCredential, ClientSecretCredential } = require('@azure/identity');
const mysql = require('mysql2/promise');

const parseConnectionString = (connectionString) => {
  const config = {};
  const parts = connectionString.split(';');

  parts.forEach((part) => {
    if (part.includes('=')) {  // Ensure it's a valid key-value pair
      const [key, value] = part.split('=');
      if (key && value) {  // Check that both key and value exist
        config[key.trim().toLowerCase()] = value.trim();
      }
    }
  });

  return {
    host: config['data source'].split(':')[0],
    port: parseInt(config['data source'].split(':')[1], 10) || 3306,
    user: config['user id'],
    password: config['password'],
    database: config['database'],
  };
};

const sqlconfig = parseConnectionString(process.env.MYSQLCONNSTR_localdb);
const pool = mysql.createPool(sqlconfig);

async function connectToMySQL() {
  try {
    // Establish connection
    connection = await pool.getConnection(sqlconfig);

    console.log('Connected to MySQL In-App');

    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:', tables);
  
  }
  catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
}
async function queryDatabase() {
  const config = getMySQLConfig();
  let connection;
  try {

    connection = await mysql.createConnection(config);

    console.log('Connected to the database with AAD token.');

    // Execute a query
    const [rows, fields] = await connection.execute('SELECT * FROM users LIMIT 10');
    console.log('Query Results:', rows);
    return result.recordset;
  } catch (err) {
    console.error('Error querying the database with AAD token:', err);
    throw err;
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

async function logCommand(user, command) {
  let connection; // Define the connection variable
  try {
      // Establish connection using MySQL pool
      connection = await pool.getConnection(sqlconfig);

      // Execute the query to log the command
      const query = `
          INSERT INTO command_logs (user, command, date)
          VALUES (?, ?, ?)
      `;
      const values = [user, command, new Date()];

      await connection.query(query, values);

      console.log('Command logged:', { user, command });
  } catch (error) {
      console.error('Error logging command:', error);
      throw error; // Re-throw to notify the caller
  } finally {
      if (connection) {
          connection.release(); // Release the connection back to the pool
      }
  }
}

async function checkPermission(email, group, value) {
  let connection; // Define the connection variable
  try {
      // Establish connection using MySQL pool
      connection = await pool.getConnection(sqlconfig);

      // Dynamically build the query to check the specified group column
      const query = `
          SELECT ${group} 
          FROM permissions
          WHERE emails = ? AND ${group} = ?
      `;
      const values = [email, value];

      // Execute the query
      const [rows] = await connection.query(query, values);

      // Check if the row exists
      if (rows.length > 0) {
          console.log('Permission found:', { email, group, value });
          return true;
      } else {
          console.log('Permission not found:', { email, group, value });
          return false;
      }
  } catch (error) {
      console.error('Error checking permission:', error);
      throw error; // Re-throw to notify the caller
  } finally {
      if (connection) {
          connection.release(); // Release the connection back to the pool
      }
  }
}


/**
 * Processes an array of deals by inserting or updating them in the MySQL database.
 * @param {Array} deals - Array of deal objects to process.
 * @param {boolean} isUpdate - Indicates whether to perform update operations.
 */
const processDeals = async (deals, isUpdate) => {
  const CONCURRENCY_LIMIT = 10;
  const asyncLib = require('async');

  return new Promise((resolve, reject) => {
    asyncLib.eachLimit(
      deals,
      CONCURRENCY_LIMIT,
      async (deal) => {
        const { id, opportunity_stage_id } = deal;
        try {
          if (isUpdate) {
            await updateOpportunityAndCheck(id, opportunity_stage_id);
            console.log(`Updated deal with ID: ${id}`);
          } else {
            await checkAndInsertOpportunity(id, opportunity_stage_id);
            console.log(`Inserted deal with ID: ${id}`);
          }
        } catch (error) {
          console.error(`Error processing deal with ID: ${id}`, error.message);
          // Continue processing other deals
        }
      },
      (err) => {
        if (err) {
          console.error('Error processing deals:', err);
          reject(err);
        } else {
          console.log(`All ${deals.length} deals processed successfully.`);
          resolve();
        }
      }
    );
  });
};

/**
 * Checks if an opportunity exists and inserts it if it does not.
 * @param {string} id - Opportunity ID.
 * @param {string} opportunity_stage_id - Stage ID of the opportunity.
 */
const checkAndInsertOpportunity = async (id, opportunity_stage_id) => {
  const connection = await pool.getConnection();
  try {
    // Check if the opportunity exists
    const [rows] = await connection.execute(
      'SELECT * FROM apollo_opportunities WHERE id = ?',
      [id]
    );

    if (rows.length > 0) {
      console.log(`Opportunity with ID ${id} already exists. Skipping insertion.`);
      return;
    }

    // Insert the new opportunity
    await connection.execute(
      'INSERT INTO apollo_opportunities (id, opportunity_stage_id, has_changed) VALUES (?, ?, ?)',
      [id, opportunity_stage_id, false]
    );

    console.log('Opportunity inserted:', { id, opportunity_stage_id, has_changed: false });
  } catch (error) {
    console.error('Error in checkAndInsertOpportunity:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Updates an existing opportunity and checks specific conditions.
 * @param {string} id - Opportunity ID.
 * @param {string} opportunity_stage_id - New Stage ID of the opportunity.
 */
const updateOpportunityAndCheck = async (id, opportunity_stage_id) => {
  const connection = await pool.getConnection();
  try {
    // Retrieve current opportunity
    const [rows] = await connection.execute(
      'SELECT * FROM apollo_opportunities WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      console.log(`No record found with ID ${id}.`);
      return;
    }

    const currentStageId = rows[0].opportunity_stage_id;

    // Check the specific condition
    if (
      currentStageId === '657c6cc9ab96200302cbd0a3' &&
      opportunity_stage_id === '669141aa1bcf2c04935c3074'
    ) {
      console.log('Condition met, setting has_changed to true...');
      await connection.execute(
        'UPDATE apollo_opportunities SET has_changed = ? WHERE id = ?',
        [1, id]
      );

      // Call TestFunction when condition is met
      console.log('Calling SyncApolloOpportunities...');
      await SyncApolloOpportunities(id);
    }

    // Update the stage ID
    await connection.execute(
      'UPDATE apollo_opportunities SET opportunity_stage_id = ? WHERE id = ?',
      [opportunity_stage_id, id]
    );

    console.log('Opportunity updated:', { id, opportunity_stage_id });
  } catch (error) {
    console.error('Error in updateOpportunityAndCheck:', error);
    throw error;
  } finally {
    connection.release();
  }
};

async function SyncApolloOpportunities(id){

  

  const opportunity = {
    name: "New Sales Opportunity",
    notes: notes || "Default opportunity notes",
    contact: { id: contactId },
    expectedCloseDate: new Date().toISOString(),  // Required on update
    locationId: 1,  // Default location
    businessUnitId: 1,  // Default business unit
    primarySalesRep: "CAtwell"
  };

}
 
module.exports = { getTables, logCommand,
   checkAndInsertOpportunity, updateOpportunityAndCheck, queryDatabase, connectToMySQL, processDeals, checkPermission};