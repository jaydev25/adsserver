module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.addColumn(
      'Ads',
      'pickup',
      Sequelize.STRING
    ).then(() => {
      return queryInterface.addColumn(
        'Ads',
        'drop',
        Sequelize.STRING
      );
    });
  },
  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.removeColumn(
      'Ads',
      'pickup'
    ).then(() => {
      return queryInterface.removeColumn(
        'Ads',
        'drop'
      );
    });
  }
}
