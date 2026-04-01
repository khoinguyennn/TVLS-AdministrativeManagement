const fs = require('fs');
const path = require('path');

let mysql;
try {
  mysql = require('mysql2/promise');
} catch (error) {
  mysql = require('./src/server/node_modules/mysql2/promise');
}

let dotenv;
try {
  dotenv = require('dotenv');
} catch (error) {
  dotenv = require('./src/server/node_modules/dotenv');
}

dotenv.config({ path: path.join(__dirname, 'src/server/.env.development.local') });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'dev',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  });

  try {
    const migrationDir = path.join(__dirname, 'src/database');
    
    // Get migration file from command line or use default
    const migrationFile = process.argv[2] || '20260401_add_work_order_assignees.sql';
    const sqlFile = path.join(migrationDir, migrationFile);
    
    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Migration file not found: ${sqlFile}`);
      process.exit(1);
    }
    
    console.log(`📄 Running migration: ${migrationFile}`);
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        await connection.query(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
