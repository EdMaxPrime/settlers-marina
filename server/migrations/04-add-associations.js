'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /* Player.room_code REFERENCES Game.join_code */
    return queryInterface.addConstraint(
      "Players", //name of source model's table
      {
        type: "foreign key",
        fields: ["room_code"],
        name: "one_game_many_players",
        references: {
          table: "Games",
          field: "join_code"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      })
    /* Game.MapId REFERENCES Map.id */
    .then(() => {
      return queryInterface.addColumn(
        "Games", //name of the table being edited
        "MapId", //name of the column being added
        {
          type: Sequelize.INTEGER,
          references: {
            model: "Maps", //name of the table this references
            key: "id"      //name of the column referenced on Map
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    //get rid of foreign key
    return queryInterface.removeConstraint("Players", "one_game_many_players")
    //get rid of foreign key and column
    .then(() => {
      return queryInterface.removeColumn("Games", "MapId")
    })
  }
};
