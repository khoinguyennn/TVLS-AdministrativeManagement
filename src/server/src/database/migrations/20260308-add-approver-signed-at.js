'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('leave_requests');
    if (!tableDesc.approver_signed_at) {
      await queryInterface.addColumn('leave_requests', 'approver_signed_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('leave_requests');
    if (tableDesc.approver_signed_at) {
      await queryInterface.removeColumn('leave_requests', 'approver_signed_at');
    }
  },
};
