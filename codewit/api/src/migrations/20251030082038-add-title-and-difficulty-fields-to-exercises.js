'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi, Sequelize) {
    await qi.sequelize.transaction(async (t) => {
      const table = 'exercises';
      const cols = await qi.describeTable(table);

      if (!cols.title) {
        await qi.addColumn(table, 'title', {
          type: Sequelize.STRING(255),
          allowNull: true,
        }, { transaction: t });
      }

      if (!cols.difficulty) {
        await qi.addColumn(table, 'difficulty', {
          type: Sequelize.ENUM({
            values: ['worked example', 'easy', 'hard'],
            name: 'enum_exercises_difficulty',
          }),
          allowNull: true,
        }, { transaction: t });
      }
    });
  },

  async down(qi) {
    await qi.sequelize.transaction(async (t) => {
      const table = 'exercises';
      await qi.removeColumn(table, 'difficulty', { transaction: t }).catch(() => {});
      await qi.removeColumn(table, 'title', { transaction: t }).catch(() => {});
      await qi.sequelize.query('DROP TYPE IF EXISTS "enum_exercises_difficulty";', { transaction: t });
    });
  }
};