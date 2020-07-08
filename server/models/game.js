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
  /**
   * Advances the game state to the next turn. Could involve changing the
   * phase as well as the turn. This function is async!
   * @return Promise<Game>
   */
  Game.prototype.nextTurn = function() {
    switch(this.phase) {
      case PHASE.LOBBY:
        return this.update({phase: PHASE.SETUP1, turn_now: 0});
        break;
      case PHASE.SETUP1:
        if(this.turn_now + 1 < this.num_players)
          return this.increment("turn_now");
        else
          return this.update({phase: PHASE.SETUP2});
        break;
      case PHASE.SETUP2:
        if(this.turn_now > 0)
          return this.decrement("turn_now");
        else
          return this.update({phase: PHASE.REGULAR});
        break;
      case PHASE.REGULAR:
        if(this.turn_now + 1 < this.num_players)
          return this.increment("turn_now");
        else
          return this.update({turn_now: 0});
        break;
      default:
        return this.update({phase: PHASE.LOBBY});
    }
  };
  /**
   * This is a lazy-loading function that can be used to retrieve the player
   * whose turn it is now. If the phase is LOBBY or GAME_OVER, it is the host.
   * Otherwise, this is determined by turn_now (relative ordering of players).
   * Async!
   * @throws  if player can't be found
   * @return Promise<Player>
   */
  Game.prototype.getCurrentPlayer = function() {
    let game = this;
    let filter = {};
    if(this.phase == PHASE.LOBBY || this.phase == PHASE.GAME_OVER) {
      filter = {
        where: {host: true}
      };
    } else {
      filter = {
        order: [["turn_order", "ASC"]],
        limit: 1,
        offset: this.turn_now
      };
    }
    return this.getPlayers(filter)
    .then(players => {
      console.log("getCurrentPlayer(" + game.turn_now + ", " + game.phase + ") -> " + players.length);
      if(players.length < 1) throw new Error("Couldn't get current player");
      return players[0];
    })
  }
  /* Add constants and utilities here */
  Game.STATUS = STATUS;
  Game.PHASE = PHASE;
  Game.DECK = DECK;
  Game.NOBODY = NOBODY;
  return Game;
};