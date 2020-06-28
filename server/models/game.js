'use strict';
const utils = require("../websocket/utils");

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
  /* Define Hooks here */
  Game.afterUpdate(game => {
    if(game.num_players <= 0)
      game.destroy()
          .then(() => console.log(`[DESTROYED] game ${game.id}`))
          .catch(err => console.log("[DESTROYED] failed to destroy game "+game.id, error));
  });
  /* Export utility functions */
  Game.prototype.info = function(emmiter, message) {
    utils.info(emmiter, this.id, message);
  };
  Game.prototype.announcement = function(emmiter, message) {
    utils.announcement(emmiter, this.id, message);
  };
  /* Add constants and utilities here */
  Game.STATUS = STATUS;
  Game.PHASE = PHASE;
  Game.DECK = DECK;
  Game.NOBODY = NOBODY;
  return Game;
};