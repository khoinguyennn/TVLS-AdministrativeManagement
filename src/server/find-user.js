const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('dev', 'root', 'Nguyendz.271', {
  host: 'localhost',
  dialect: 'mysql'
});

async function main() {
  try {
    const [results, metadata] = await sequelize.query("SELECT email FROM users WHERE role = 'admin' LIMIT 1");
    console.log("Admin User:", results);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

main();
