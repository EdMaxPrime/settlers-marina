'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      join_code: {
        type: Sequelize.STRING,
        unique: true
      },
      status: {
        type: Sequelize.STRING
      },
      status_timestamp: {
        type: Sequelize.DATE
      },
      num_players: {
        type: Sequelize.INTEGER
      },
      max_players: {
        type: Sequelize.INTEGER
      },
      turn_now: {
        type: Sequelize.INTEGER
      },
      special_turn: {
        type: Sequelize.INTEGER
      },
      phase: {
        type: Sequelize.INTEGER
      },
      seed: {
        type: Sequelize.INTEGER
      },
      deck: {
        type: Sequelize.STRING
      },
      structures: {
        type: Sequelize.TEXT
      },
      longest_road: {
        type: Sequelize.INTEGER
      },
      largest_army: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Games');
  }
};