'use strict';
module.exports = (sequelize, DataTypes) => {
  const Map = sequelize.define('Map', {
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    max_players: DataTypes.INTEGER,
    difficulty: DataTypes.INTEGER,
    description: DataTypes.STRING,
    thumbnail: DataTypes.BLOB,
    map_data: DataTypes.JSON
  }, {});
  Map.associate = function(models) {
    // associations can be defined here
  };
  return Map;
};