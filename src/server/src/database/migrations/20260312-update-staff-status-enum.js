'use strict';

module.exports = {
  async up(queryInterface) {
    // Alter the staff_status ENUM to new values
    await queryInterface.sequelize.query(`
      ALTER TABLE staff_profiles
      MODIFY COLUMN staff_status ENUM('working', 'resigned', 'transferred', 'maternity_leave', 'unpaid_leave')
      DEFAULT 'working';
    `);
  },

  async down(queryInterface) {
    // Revert to old ENUM values
    await queryInterface.sequelize.query(`
      ALTER TABLE staff_profiles
      MODIFY COLUMN staff_status ENUM('working', 'probation', 'maternity_leave', 'retired', 'resigned')
      DEFAULT 'working';
    `);
  },
};
