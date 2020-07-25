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
    status: DataTypes.STRING,
    host: {
      type: DataTypes.INTEGER,
      get: function() { //convert to boolean: 0=false, 1=true
        return this.getDataValue("host") != 0;
      },
      set: function(value) { //convert boolean to int
        this.setDataValue("host", value? 1 : 0);
      }
    },
    turn_order: DataTypes.INTEGER,
    wood:    {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    iron:    {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    clay:    {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    harvest: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    gold:    {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
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
  /**
   * ASYNC!
   * You MUST eagerload the associated Game instance for this to work.
   * The Promise has no meaningful value. On success, the new settlement is saved
   * to the database. On failure, due to invalid constraints or a database error,
   * it will reject.
   * @param where {int}  intersection ID where you want to build a settlement
   * @param connected {boolean}  true if your road must connect to this 
   *                  intersection, false if it can be an independent node.
   * @param free {boolean}  true if this costs no resources, false if resources
   *                        must be spent. Cost: 3 wood, 2 clay, 4 harvests
   * @return Promise
   */
  Player.prototype.buildStlm = function(where, connected=true, free=false) {
    return sequelize.transaction(async (transaction) => {
      //find or build the intersection
      var intersection = {building: null, roads: []};
      if(where in this.Game.structures) intersection = this.Game.structures[where];
      //make sure there is no building there already
      if(intersection.building != null) 
        throw new Error("There's already a building here");
      //if a connecting road is required, check that there is a road belonging to you
      if(connected) {
        let hasRoad = intersection.roads.some(r => r[0] == this.player_id);
        if(!hasRoad)
          throw new Error("You don't have a road leading to here");
      }
      //if this settlement costs money, make sure there's enough and subtract it
      if(!free && (this.wood < 3 || this.clay < 2 || this.harvest < 4)) 
        throw new Error("You don't have enough resources");
      else if(!free) {
        await this.decrement({
          wood: 3,
          clay: 2,
          harvest: 4
        }, {transaction: transaction});
      }
      //add building to intersection
      intersection.building = [this.player_id, "Stlm"];
      this.Game.set(`structures.${where}`, intersection);
      await this.Game.save({transaction: transaction});
    });
  };
  /* Export constants */
  Player.STATUS = STATUS;
  Player.PLAYER_COLORS = PLAYER_COLORS;
  return Player;
};