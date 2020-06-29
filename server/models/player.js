'use strict';
const utils = require("../websocket");

module.exports = (sequelize, DataTypes) => {
  /* Define constants and utilities */
  const STATUS = {
    JOINING: "JOINING",
    JOINED: "JOINED",
    DISCONNECTED: "DISCONNECTED"
  };
  const PLAYER_COLORS = {
    0: "green",
    1: "red",
    2: "blue",
    3: "orange",
    4: "purple",
    5: "white",
    6: "cyan"
  };
  /* Define database table/model */
  const Player = sequelize.define('Player', {
    socket_id: DataTypes.TEXT,
    player_id: DataTypes.INTEGER,
    nickname: DataTypes.STRING,
    color: DataTypes.STRING,
    status: DataTypes.INTEGER,
    host: {
      type: DataTypes.INTEGER,
      get: function() { //convert to boolean: 0=false, 1=true
        return this.getDataValue("host") != 0;
      },
      set: function(value) { //convert boolean to int
        this.setDataValue("host", value? 1 : 0);
      }
    },
    turn_order: DataTypes.INTEGER
  }, {
    // indexes: {
    //   name: "playerInGame",
    //   unique: true,
    //   fields: ["GameId", "player_id"]
    // }
  });
  /* Define associations here */
  Player.associate = function(models) {
    Player.belongsTo(models.Game); //Player.GameId references Game.id
  };
  /* Export utility functions */
  Player.prototype.chat = function(message) {
    utils.chat(this.GameId, message, this.player_id);
  };
  Player.prototype.info = function(message) {
    message = message.replace("$ID", this.player_id).replace("$NAME", this.nickname);
    utils.info(this.GameId, message);
  };
  Player.prototype.announcement = function(message) {
    message = message.replace("$NAME", this.nickname).replace("$GAME", this.GameId);
    utils.announcement(this.GameId, message);
  };
  Player.prototype.disconnect = async function() {
    await this.update({status: STATUS.DISCONNECTED, socket_id: null});
    const game = await this.getGame();
    return game.playerLeft();
  }
  /* Export constants */
  Player.STATUS = STATUS;
  Player.PLAYER_COLORS = PLAYER_COLORS;
  return Player;
};