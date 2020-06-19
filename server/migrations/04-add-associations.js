'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /* Player.GameId REFERENCES Game.id */
    return queryInterface.addColumn(
      "Players", //name of the table being edited (source)
      "GameId",  //name of the column being added (foreign key)
      {
        type: Sequelize.STRING, //type of foreign key
        references: {           //foreign key data
          model: "Games",       //the target/owner of this Model
          key: "id"             //the target/owner's identifier column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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
    //get rid of foreign key Player.belongsTo(Game) aka Game.hasMany(Player)
    return queryInterface.removeColumn("Players", "GameId")
    //get rid of foreign key Game.belongsTo(Map) aka Map.hasMany(Game)
    .then(() => {
      return queryInterface.removeColumn("Games", "MapId")
    })
  }
};
