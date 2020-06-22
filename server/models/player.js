'use strict';
const utils = require("../websocket/utils");

module.exports = (sequelize, DataTypes) => {
  /* Define constants and utilities */
  const STATUS = {
    JOINING: "JOINING",
    JOINED: "JOINED",
    DISCONNECTED: "DISCONNECTED"
  };
  const PLAYER_COLORS = {
    0: "#0f0",
    1: "#00f",
    2: "#f00",
    3: "#fff",
    4: "#a0a",
    5: "#090"
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
  Player.prototype.chat = function(emmiter, message) {
    utils.chat(emmiter, this.GameId, message, this.player_id);
  };
  Player.prototype.info = function(emmiter, message) {
    message = message.replace("$ID", this.player_id).replace("$NAME", this.nickname);
    utils.info(emmiter, this.GameId, message);
  };
  Player.prototype.announcement = function(emmiter, message) {
    utils.announcement(emmiter, this.GameId, message);
  };
  /* Export constants */
  Player.STATUS = STATUS;
  Player.PLAYER_COLORS = PLAYER_COLORS;
  return Player;
};