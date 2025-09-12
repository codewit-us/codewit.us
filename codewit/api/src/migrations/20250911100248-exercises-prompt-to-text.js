/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.changeColumn(
        'exercises',
        'prompt',
        { type: Sequelize.TEXT, allowNull: false },
        { transaction: t }
      );
    });
  },

  async down (queryInterface) {
    if (queryInterface.sequelize.getDialect() !== 'postgres') {
      throw new Error('This migration assumes Postgres.');
    }
    await queryInterface.sequelize.transaction(async (t) => {
      // Safely narrow by truncating to 255 during the cast
      await queryInterface.sequelize.query(
        `
        ALTER TABLE "exercises"
        ALTER COLUMN "prompt" TYPE VARCHAR(255) USING LEFT("prompt", 255),
        ALTER COLUMN "prompt" SET NOT NULL;
        `,
        { transaction: t }
      );
    });
  }
};