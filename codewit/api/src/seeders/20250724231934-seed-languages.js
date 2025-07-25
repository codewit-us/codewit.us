'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('languages', [
      {
        name: 'cpp',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'java',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'python',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      ignoreDuplicates: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('languages', {
      name: ['cpp', 'java', 'python']
    }, {});
  }
};