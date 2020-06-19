'use strict';
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    socket_id: DataTypes.TEXT,
    room_code: {
      type: DataTypes.STRING,
      references: {
        model: "Games",
        key: "join_code"
      }
    },
    player_id: DataTypes.INTEGER,
    nickname: DataTypes.STRING,
    color: DataTypes.STRING,
    status: DataTypes.INTEGER,
    host: {
      type: DataTypes.INTEGER,
      get: function() { //convert to boolean: 0=false, 1=true
        return this.getDataValue("host") != 0;
      },
      set: function(value) {
        this.setDataValue("host", value? 1 : 0);
      }
    },
    turn_order: DataTypes.INTEGER
  }, {
    indexes: {
      name: "playerInGame",
      unique: true,
      fields: ["room_code", "player_id"]
    }
  });
  /* Define associations here */
  Player.associate = function(models) {
    Player.belongsTo(models.Game);
  };
  return Player;
};