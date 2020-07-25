'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      socket_id: {
        type: Sequelize.TEXT
      },
      player_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      nickname: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      host: {
        type: Sequelize.INTEGER
      },
      turn_order: {
        type: Sequelize.INTEGER
      },
      wood: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
      clay: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
      iron: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
      harvest: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
      gold: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, {
      // uniqueKeys: { //all UNIQUE index definitions go here
      //   playerInGame: { //index named "playerInGame" ensures player id's don't repeat in game
      //     fields: ["room_code", "player_id"]
      //   }
      // }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Players');
  }
};