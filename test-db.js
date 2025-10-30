const pool = require('./db');

async function testQuery() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database Time:', res.rows[0].now);
  } catch (err) {
    console.error('Error executing query', err);
  } finally {
    pool.end();
  }
}

testQuery();
