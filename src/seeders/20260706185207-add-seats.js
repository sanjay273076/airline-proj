'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Seats',[
    {
    airplaneId:1,
    row:1,
    column:'A',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:1,
    column:'B',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:1,
    column:'C',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:1,
    column:'D',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:1,
    column:'E',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:1,
    column:'F',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:2,
    column:'A',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:2,
    column:'B',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:2,
    column:'C',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:2,
    column:'D',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:2,
    column:'E',
    createdAt:new Date(),
    updatedAt:new Date()
    },
    {
    airplaneId:1,
    row:2,
    column:'F',
    createdAt:new Date(),
    updatedAt:new Date()
    }
    


   ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
