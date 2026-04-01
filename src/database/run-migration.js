const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'dev',
  password: 'dev',
  database: 'dev',
};

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    const sqlFile = path.join(__dirname, '20260401_add_work_order_assignees.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        console.log('Executing:', stmt.substring(0, 100) + '...');
        await connection.execute(stmt);
      }
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();
