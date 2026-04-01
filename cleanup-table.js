const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'src/server/.env.development.local') });

async function cleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'dev',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  });

  try {
    console.log('🗑️  Dropping work_order_assignees table...');
    await connection.query('DROP TABLE IF EXISTS `work_order_assignees`');
    console.log('✅ Table dropped successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

cleanup();
