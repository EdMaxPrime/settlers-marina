'use strict';
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      autoIncrement: false
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
  /* Define associations here */
  Game.associate = function(models) {
    Game.hasMany(models.Player);
    Game.belongsTo(models.Map);
  };
  return Game;
};