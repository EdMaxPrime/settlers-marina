'use strict';
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    join_code: {
      type: DataTypes.STRING,
      unique: true
    },
    status: DataTypes.STRING,
    status_timestamp: DataTypes.DATE,
    num_players: DataTypes.INTEGER,
    max_players: DataTypes.INTEGER,
    turn_now: DataTypes.INTEGER,
    special_turn: DataTypes.INTEGER,
    phase: DataTypes.INTEGER,
    seed: DataTypes.INTEGER,
    deck: DataTypes.STRING,
    structures: DataTypes.TEXT,
    longest_road: DataTypes.INTEGER,
    largest_army: DataTypes.INTEGER
  }, {});
  Game.associate = function(models) {
    // associations can be defined here
  };
  return Game;
};