
mysql = require('mysql2/promise');

const connectionString = process.env.MYSQLCONNSTR_localdb;

// Function to parse the MySQL connection string safely
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
const sqlconfig = parseConnectionString(connectionString);
// Create a connection pool
const pool = mysql.createPool(sqlconfig);


async function connectToMySQL() {
    try {
      // Establish connection
      connection = await pool.getConnection(sqlconfig);
      console.log('Connected to MySQL In-App');

      const [tables] = await connection.execute('SHOW TABLES');
      console.log('Tables:', tables);

      const [rows] = await connection.execute('SELECT COUNT(*) AS count FROM users');
      console.log('Number of rows in Users:', rows[0].count);
      
      // Print each row and its values
      rows.forEach((row, index) => {
        console.log(`Row ${index + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        console.log('-----------------------------');  // For readability
      });

      // Close the connection
      await connection.release();
    } catch (error) {
      console.error('MySQL connection error:', error);
    }
  }
// Function to insert a single row with a uniqueness check
async function insertSingleRow(name, email) {
    try {
      const connection = await pool.getConnection(); // Get a connection from the pool
  
      // Check if the user already exists
      const [existingRows] = await connection.execute(
        'SELECT * FROM users WHERE name = ? OR email = ?',
        [name, email]
      );
  
      if (existingRows.length > 0) {
        console.log(`User with name "${name}" or email "${email}" already exists. Skipping insertion.`);
        connection.release(); // Release the connection back to the pool
        return;
      }
  
      const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
      const values = [name, email];
  
      const [result] = await connection.execute(query, values);
      console.log('Single row inserted:', result);
  
      connection.release(); // Release the connection back to the pool
    } catch (error) {
      console.error('Error inserting single row:', error);
    }
  }
  async function logCommand(user, command) {
    try {
      const query = `INSERT INTO command_logs (user, command, date) VALUES (?, ?, ?)`;
      const values = [user, command, new Date()]; // Use the current date and time
  
      const [result] = await pool.execute(query, values);
      console.log('Command logged:', result);
    } catch (error) {
      console.error('Error logging command:', error);
    }
  }
  module.exports = { pool, connectToMySQL, insertSingleRow, logCommand};