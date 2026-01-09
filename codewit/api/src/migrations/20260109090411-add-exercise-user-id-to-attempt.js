'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const tableName = 'attempts';
      const cols = await queryInterface.describeTable(tableName);

      if (!cols.exerciseUid) {
        await queryInterface.addColumn(
          tableName,
          'exerciseUid',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          { transaction: t }
        );
      }

      if (!cols.userUid) {
        await queryInterface.addColumn(
          tableName,
          'userUid',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          { transaction: t }
        );
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn('attempts', 'userUid', { transaction: t });
      await queryInterface.removeColumn('attempts', 'exerciseUid', { transaction: t });
    });
  }
};
