'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all indexes on users table
    const [indexes] = await queryInterface.sequelize.query(`
      SELECT DISTINCT INDEX_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND INDEX_NAME LIKE 'email%'
        AND INDEX_NAME != 'email'
    `);

    // Drop duplicate email indexes (keep only one)
    for (const idx of indexes) {
      try {
        await queryInterface.sequelize.query(`ALTER TABLE users DROP INDEX \`${idx.INDEX_NAME}\``);
        console.log(`Dropped index: ${idx.INDEX_NAME}`);
      } catch (error) {
        console.log(`Could not drop index ${idx.INDEX_NAME}: ${error.message}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // No rollback needed
  },
};
