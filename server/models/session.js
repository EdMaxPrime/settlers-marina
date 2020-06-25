'use strict';
module.exports = (sequelize, DataTypes) => {
  /* This Model defines how to store session data in the database. */
  const Session = sequelize.define('Session', {
    sid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    expires: Sequelize.DATE,
    data: Sequelize.STRING(50000)
  }, {});
  Session.associate = function(models) {};
  return Session;
};