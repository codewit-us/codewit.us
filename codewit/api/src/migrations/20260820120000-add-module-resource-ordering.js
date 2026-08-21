/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addColumn(
      'ModuleResources',
      'ordering',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        with ordered_resources as (
          select "moduleUid" as module_uid,
                 "resourceUid" as resource_uid,
                 row_number() over (
                   partition by "moduleUid"
                   order by "createdAt", "resourceUid"
                 ) - 1 as ordering
          from "ModuleResources"
        )
        update "ModuleResources"
        set ordering = ordered_resources.ordering
        from ordered_resources
        where "ModuleResources"."moduleUid" = ordered_resources.module_uid
          and "ModuleResources"."resourceUid" = ordered_resources.resource_uid`,
      { type: Sequelize.QueryTypes.RAW, transaction },
    );
  }),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.removeColumn('ModuleResources', 'ordering', { transaction });
  }),
};
