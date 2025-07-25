'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('languages', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.ENUM('python','java','cpp'), allowNull: false, unique: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('users', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      googleId: { type: Sequelize.STRING, allowNull: true, unique: true },
      isAdmin: { type: Sequelize.BOOLEAN, allowNull: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('tags', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('resources', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      url: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      source: { type: Sequelize.STRING, allowNull: false },
      likes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('exercises', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      prompt: { type: Sequelize.STRING, allowNull: false },
      topic: { type: Sequelize.STRING, allowNull: false },
      referenceTest: { type: Sequelize.TEXT, allowNull: false },
      starterCode: { type: Sequelize.TEXT },
      languageUid: {
        type: Sequelize.INTEGER,
        references: { model: 'languages', key: 'uid' },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('demos', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      topic: { type: Sequelize.STRING, allowNull: false },
      likes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      youtube_id: { type: Sequelize.STRING, allowNull: false },
      youtube_thumbnail: { type: Sequelize.STRING, allowNull: false },
      languageUid: {
        type: Sequelize.INTEGER,
        references: { model: 'languages', key: 'uid' },
        onDelete: 'SET NULL'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('modules', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      topic: { type: Sequelize.STRING, allowNull: false },
      languageUid: {
        type: Sequelize.INTEGER,
        references: { model: 'languages', key: 'uid' },
        onDelete: 'SET NULL'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('courses', {
      id: { type: Sequelize.STRING, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      enrolling: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      auto_enroll: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      languageUid: {
        type: Sequelize.INTEGER,
        references: { model: 'languages', key: 'uid' },
        onDelete: 'SET NULL'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('attempts', {
      uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      timestamp: { type: Sequelize.DATE, allowNull: false },
      submissionNumber: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      code: { type: Sequelize.TEXT, allowNull: false },
      completionPercentage: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      error: { type: Sequelize.TEXT },
      exerciseUid: {
        type: Sequelize.INTEGER,
        references: { model: 'exercises', key: 'uid' },
        onDelete: 'CASCADE'
      },
      userUid: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'uid' },
        onDelete: 'CASCADE'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('DemoExercises', {
      demoUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'demos', key: 'uid' }, onDelete: 'CASCADE' },
      exerciseUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'exercises', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('ModuleDemos', {
      moduleUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'modules', key: 'uid' }, onDelete: 'CASCADE' },
      demoUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'demos', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('CourseInstructors', {
      courseId: { type: Sequelize.STRING, primaryKey: true, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('CourseModules', {
      courseId: { type: Sequelize.STRING, primaryKey: true, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
      moduleUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'modules', key: 'uid' }, onDelete: 'CASCADE' },
      ordering: Sequelize.INTEGER,
    });

    await queryInterface.createTable('CourseRoster', {
      courseId: { type: Sequelize.STRING, primaryKey: true, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('course_registrations', {
      courseId: { type: Sequelize.STRING, primaryKey: true, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('ModuleResources', {
      moduleUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'modules', key: 'uid' }, onDelete: 'CASCADE' },
      resourceUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'resources', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('DemoLikes', {
      demoUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'demos', key: 'uid' }, onDelete: 'CASCADE' },
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('ResourceLikes', {
      resourceUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'resources', key: 'uid' }, onDelete: 'CASCADE' },
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable('ExerciseTags', {
      exerciseUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'exercises', key: 'uid' }, onDelete: 'CASCADE' },
      tagUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'tags', key: 'uid' }, onDelete: 'CASCADE' },
      ordering: Sequelize.INTEGER,
    });

    await queryInterface.createTable('DemoTags', {
      demoUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'demos', key: 'uid' }, onDelete: 'CASCADE' },
      tagUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'tags', key: 'uid' }, onDelete: 'CASCADE' },
      ordering: Sequelize.INTEGER,
    });

    await queryInterface.createTable('UserDemoCompletions', {
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      demoUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'demos', key: 'uid' }, onDelete: 'CASCADE' },
      completion: { type: Sequelize.REAL, allowNull: false },
    });

    await queryInterface.createTable('UserExerciseCompletions', {
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      exerciseUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'exercises', key: 'uid' }, onDelete: 'CASCADE' },
      completion: { type: Sequelize.REAL, allowNull: false },
    });

    await queryInterface.createTable('UserModuleCompletions', {
      userUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'uid' }, onDelete: 'CASCADE' },
      moduleUid: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'modules', key: 'uid' }, onDelete: 'CASCADE' },
      completion: { type: Sequelize.REAL, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserModuleCompletions');
    await queryInterface.dropTable('UserExerciseCompletions');
    await queryInterface.dropTable('UserDemoCompletions');
    await queryInterface.dropTable('DemoTags');
    await queryInterface.dropTable('ExerciseTags');
    await queryInterface.dropTable('ResourceLikes');
    await queryInterface.dropTable('DemoLikes');
    await queryInterface.dropTable('ModuleResources');
    await queryInterface.dropTable('course_registrations');
    await queryInterface.dropTable('CourseRoster');
    await queryInterface.dropTable('CourseInstructors');
    await queryInterface.dropTable('CourseModules');
    await queryInterface.dropTable('ModuleDemos');
    await queryInterface.dropTable('DemoExercises');
    await queryInterface.dropTable('attempts');
    await queryInterface.dropTable('courses');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('demos');
    await queryInterface.dropTable('exercises');
    await queryInterface.dropTable('resources');
    await queryInterface.dropTable('tags');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('languages');
  }
};