const { Pool } = require('pg');
require('dotenv').config();

// Configure the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Test function
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL Version:', result.rows[0].version);
    client.release();
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

// Export query function
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection
};