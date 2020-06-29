'use strict';
const utils = require("../websocket");

module.exports = (sequelize, DataTypes) => {
  /* Define constants and utilities here */
  const PHASE = {
    LOBBY: "LOBBY",
    SETUP1: "SETUP1",
    SETUP2: "SETUP2",
    REGULAR: "REGULAR",
    SPECIAL: "SPECIAL",
    GAME_OVER: "GAME_OVER"
  };
  const STATUS = {
    LOBBY: "CREATED",
    SETUP: "SETUP",
    PLAYING: "PLAYING",
    GAME_OVER: "GAME_OVER"
  };
  const DECK = "VVVYY";
  const NOBODY = -1;
  /* The actual database table/model */
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      autoIncrement: false
    },
    status:       {type: DataTypes.STRING, defaultValue: STATUS.LOBBY},
    status_timestamp: {type: DataTypes.DATE, defaultValue: new Date()},
    num_players:  {type: DataTypes.INTEGER, defaultValue: 0},
    max_players:         DataTypes.INTEGER,
    turn_now:     {type: DataTypes.INTEGER, defaultValue: NOBODY},
    special_turn: {type: DataTypes.INTEGER, defaultValue: NOBODY},
    phase:        {type: DataTypes.INTEGER, defaultValue: PHASE.LOBBY},
    seed:                DataTypes.INTEGER,
    deck:                DataTypes.STRING,
    structures:   {type: DataTypes.TEXT,    defaultValue: ""},
    longest_road: {type: DataTypes.INTEGER, defaultValue: NOBODY},
    largest_army: {type: DataTypes.INTEGER, defaultValue: NOBODY}
  }, {});
  /* Define associations here */
  Game.associate = function(models) {
    Game.hasMany(models.Player);
    Game.belongsTo(models.Map);
  };
  /* Export utility functions */
  Game.prototype.info = function(message) {
    utils.info(this.id, message);
  };
  Game.prototype.announcement = function(message) {
    utils.announcement(this.id, message);
  };
  Game.prototype.playerLeft = function() {
    if(this.num_players <= 1) {
      console.log("[GAME] destroying model since players left");
      return this.destroy();
    } else {
      console.log("[GAME] decrement num_players: " + this.num_players);
      return this.decrement("num_players");
    }
  };
  /* Add constants and utilities here */
  Game.STATUS = STATUS;
  Game.PHASE = PHASE;
  Game.DECK = DECK;
  Game.NOBODY = NOBODY;
  return Game;
};