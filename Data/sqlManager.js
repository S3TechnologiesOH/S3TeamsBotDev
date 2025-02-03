// sqlManager.js

const { DefaultAzureCredential, ClientSecretCredential } = require('@azure/identity');
const mysql = require('mysql2/promise');

const parseConnectionString = (connectionString) => {
  if (!connectionString) {
    throw new Error('Connection string is undefined or empty.');
  }

  const config = {};
  const parts = connectionString.split(';');

  parts.forEach((part) => {
    if (part.includes('=')) {
      const [key, value] = part.split('=');
      if (key && value) {
        config[key.trim().toLowerCase()] = value.trim();
      }
    }
  });

  if (!config['data source'] || !config['user id'] || !config['password'] || !config['database']) {
    throw new Error('Connection string is missing required components.');
  }

  return {
    host: config['data source'].split(':')[0],
    port: parseInt(config['data source'].split(':')[1], 10) || 3306,
    user: config['user id'],
    password: config['password'],
    database: config['database'],
  };
};

let pool;
let sqlconfig;
async function connectToMySQL() {
  sqlconfig = parseConnectionString(process.env.MYSQLCONNSTR_localdb);
  pool = mysql.createPool(sqlconfig);

  try {
    // Establish connection
    const connection = await pool.getConnection(sqlconfig);
    console.log('Connected to MySQL In-App');

    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:', tables);
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
}

async function queryDatabase() {
  const config = getMySQLConfig();
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to the database with AAD token.');

    const [rows, fields] = await connection.execute('SELECT * FROM users LIMIT 10');
    console.log('Query Results:', rows);
    return rows;
  } catch (err) {
    console.error('Error querying the database with AAD token:', err);
    throw err;
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

// Function to retrieve tables from the database
async function getTables() {
  let poolConnection;
  try {
    const token = await getAccessToken();
    poolConnection = await sql.connect({
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

    const result = await poolConnection.request().query(query);
    console.log('Tables:', result.recordset);

    return result.recordset;
  } catch (error) {
    console.error('Error retrieving tables:', error);
    throw error;
  } finally {
    if (poolConnection) {
      poolConnection.close();
    }
  }
}

async function logCommand(user, command) {
  let connection;
  try {
    connection = await pool.getConnection(sqlconfig);
    const query = `
      INSERT INTO command_logs (user, command, date)
      VALUES (?, ?, ?)
    `;
    const values = [user, command, new Date()];
    await connection.query(query, values);
    console.log('Command logged:', { user, command });
  } catch (error) {
    console.error('Error logging command:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function checkPermission(email, group, value) {
  let connection;
  try {
    connection = await pool.getConnection(sqlconfig);
    const query = `
      SELECT ${group} 
      FROM permissions
      WHERE emails = ? AND ${group} = ?
    `;
    const values = [email, value];
    const [rows] = await connection.query(query, values);

    if (rows.length > 0) {
      console.log('Permission found:', { email, group, value });
      return true;
    } else {
      console.log('Permission not found:', { email, group, value });
      return false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
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
    const [rows] = await connection.execute(
      'SELECT * FROM apollo_opportunities WHERE id = ?',
      [id]
    );

    if (rows.length > 0) {
      console.log(`Opportunity with ID ${id} already exists. Skipping insertion.`);
      return;
    }

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
    const [rows] = await connection.execute(
      'SELECT * FROM apollo_opportunities WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      console.log(`No record found with ID ${id}.`);
      return;
    }

    const currentStageId = rows[0].opportunity_stage_id;

    if (
      currentStageId === '657c6cc9ab96200302cbd0a3' &&
      opportunity_stage_id === '669141aa1bcf2c04935c3074'
    ) {
      console.log('Condition met, setting has_changed to true...');
      await connection.execute(
        'UPDATE apollo_opportunities SET has_changed = ? WHERE id = ?',
        [1, id]
      );

      console.log('Calling SyncApolloOpportunities...');
      await SyncApolloOpportunities(id);
    }

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

async function SyncApolloOpportunities(id) {
  const opportunity = {
    name: "New Sales Opportunity",
    notes: typeof notes !== 'undefined' ? notes : "Default opportunity notes",
    contact: { id: typeof contactId !== 'undefined' ? contactId : null },
    expectedCloseDate: new Date().toISOString(),
    locationId: 1,
    businessUnitId: 1,
    primarySalesRep: "CAtwell"
  };
  // Implement the rest of the sync logic here.
}

/**
 * Ensures that a user with the specified email has the guest role.
 * If the user does not exist in the permissions table, insert a new record with guest role enabled.
 * If the user exists but doesn't have the guest role, update the record to set guest=1.
 *
 * @param {string} userEmail - The email of the user to check.
 */
async function ensureGuestRole(userEmail) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM permissions WHERE emails = ?", [userEmail]);
    if (rows.length > 0) {
      const userRow = rows[0];
      if (userRow.guest !== 1) {
        await connection.query("UPDATE permissions SET guest = 1 WHERE emails = ?", [userEmail]);
        console.log(`Updated user ${userEmail} to have guest role.`);
      } else {
        console.log(`User ${userEmail} already has guest role.`);
      }
    } else {
      await connection.query(
        "INSERT INTO permissions (emails, admin, ticket_management, company_management, guest) VALUES (?, 0, 0, 0, 1)",
        [userEmail]
      );
      console.log(`Inserted new user ${userEmail} with guest role.`);
    }
  } catch (error) {
    console.error("Error in ensureGuestRole:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  parseConnectionString,
  getTables,
  logCommand,
  checkAndInsertOpportunity,
  updateOpportunityAndCheck,
  queryDatabase,
  connectToMySQL,
  processDeals,
  checkPermission,
  ensureGuestRole
};
