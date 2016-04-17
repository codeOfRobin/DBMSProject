var Sequelize = require('sequelize')

var potluck = sequelize.define('potluck', {
  id: { type: Sequelize.INTEGER, primaryKey: true},
  name: Sequelize.TEXT,
  food: Sequelize.TEXT,
  confirmed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
  signup_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
},{
    timestamps: false,
    freezeTableName: true,
     tableName: 'potluck'
})

module.exports = potluck;
