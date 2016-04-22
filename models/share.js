var db = require('./db');
var Sequelize = require('sequelize')

var Share = db.define('share', {
    sharedFrom: Sequelize.UUID,
    sharedTo: Sequelize.UUID,
    songId: Sequelize.UUID
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'share'
})

module.exports = Share;
