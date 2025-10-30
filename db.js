// db.js
const { Pool } = require('pg');
require('dotenv').config();

// Debugging the loaded DATABASE_URL
console.log('Database URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   ssl: 
     {rejectUnauthorized: false}, //RENDER ONLY

});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL!'))
  .catch(err => console.error('Error connecting to PostgreSQL:', err));

module.exports = pool;
