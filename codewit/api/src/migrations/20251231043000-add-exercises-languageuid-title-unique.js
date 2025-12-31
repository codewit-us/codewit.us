/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addIndex(
        "exercises",
        ["languageUid", "title"],
        {
          unique: true,
          name: "exercises_languageUid_title_unique",
          transaction,
        }
      );
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex(
        "exercises",
        "exercises_languageUid_title_unique",
        { transaction }
      );
    }),
};