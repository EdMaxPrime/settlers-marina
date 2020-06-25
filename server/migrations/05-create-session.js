'use strict';
/**
 * This migration does one thing: manage the table used by the session store.
 * On migration, it will create the table. On undo, it will delete the table.
 * There are no migrations.
*/
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Session', {
      //this will hold the session cookie's unique id
      sid: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      //this will hold the time the session expires
      expires: Sequelize.DATE,
      //this will hold session data as serialized JSON
      data: Sequelize.STRING(50000)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Session');
  }
};
