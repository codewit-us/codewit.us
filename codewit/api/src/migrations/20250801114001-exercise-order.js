/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
        await queryInterface.addColumn(
            "DemoExercises",
            "order",
            {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            {
                transaction
            }
        );

        await queryInterface.sequelize.query(
            `
            with tmp_table as (
                select "demoUid" as demo_uid,
                    "exerciseUid" as exercise_uid,
                    row_number() over (partition by "demoUid" order by "demoUid", "exerciseUid") - 1 as new_order
                from "DemoExercises"
            )
            update "DemoExercises"
            set "order" = tmp_table.new_order
            from tmp_table
            where "DemoExercises"."demoUid" = tmp_table.demo_uid and
                "DemoExercises"."exerciseUid" = tmp_table.exercise_uid`,
            {
                type: Sequelize.QueryTypes.RAW,
                transaction,
            }
        );
    }),
    down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
        await queryInterface.removeColumn(
            "DemoExercises",
            "order",
            {
                transaction
            }
        );
    }),
};