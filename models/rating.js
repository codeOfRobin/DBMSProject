var db = require('./db');
var Sequelize = require('sequelize')

var Rating = db.define('rating', {
    userId: Sequelize.UUID,
    songId: Sequelize.UUID,
    rating: Sequelize.INTEGER
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'rating'
})

module.exports = Rating;
