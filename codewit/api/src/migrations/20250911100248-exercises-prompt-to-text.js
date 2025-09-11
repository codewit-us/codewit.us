'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const ex = await queryInterface.describeTable('exercises');

      // prompt: STRING -> TEXT (NOT NULL)
      if (ex.prompt && ex.prompt.type !== 'TEXT') {
        await queryInterface.changeColumn(
          'exercises',
          'prompt',
          { type: Sequelize.TEXT, allowNull: false },
          { transaction: t }
        );
      }
    });
  },

  // Only for emergencies; narrowing can truncate newer long data
  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const ex = await queryInterface.describeTable('exercises');

      if (ex.prompt) {
        await queryInterface.changeColumn(
          'exercises',
          'prompt',
          { type: Sequelize.STRING(255), allowNull: false },
          { transaction: t }
        );
      }
    });
  }
};