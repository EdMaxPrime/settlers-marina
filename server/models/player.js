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
    0: "black",
    1: "green",
    2: "red",
    3: "blue",
    4: "orange",
    5: "purple",
    6: "white",
    7: "cyan"
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
    await this.update({
      status: STATUS.DISCONNECTED, 
      socket_id: null
    });
    const game = await this.getGame();
    return game.playerLeft(this);
  };
  /**
   * Update properties of the game this player belongs to
   */
  Player.prototype.updateGame = function(newValues) {
    return sequelize.model("Game").update(newValues, {
      where: {id: this.GameId}
    });
  };
  /* Export constants */
  Player.STATUS = STATUS;
  Player.PLAYER_COLORS = PLAYER_COLORS;
  return Player;
};