'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const maps = [{
      id: 1,
      name: "Classic (Small)",
      max_players: 4,
      difficulty: 0,
      description: "Classic hexagon world for 3-4 players",
      thumbnail: null,
      //map_data: "V=1;WIDTH=7;HEIGHT=7;PROBABILITIES=mod10;HARBORS=W,15,16 C,44,37 H,33,34;TILES=OOOOOOOOOMrWOOOOHCrCOOHWDWMOOOWMHrOOOCHrOOOOOOOOO",
      map_data: {version: 2, width: 7, height: 7, tiles: "OOOOOOOOOMGWOOOOHCGCOOHWDWMOOOWMHGOOOCHGOOOOOOOOO"},
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 2,
      name: "New Islands (Big)",
      max_players: 6,
      difficulty: 2,
      description: "Classic hexagon world for 5-6 players",
      thumbnail: null,
      //map_data: "V=1;WIDTH=6;HEIGHT=6;PROBABILITIES=mod10;TILES=OOOCWCGOHMMHOOMDWHCOOCCOOWOOOOOOOOGO",
      map_data: {version: 2, width: 2, height: 2, tiles: "WCMH"},
      createdAt: new Date(),
      updatedAt: new Date()
    }
    ];
    return queryInterface.bulkInsert("Maps", maps, {}, {map_data: {type: new Sequelize.JSON()}});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete("Maps", null, {});
  }
};
