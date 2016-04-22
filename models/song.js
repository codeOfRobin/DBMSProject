var db = require('./db');
var Sequelize = require('sequelize')

var Song = db.define('song', {
    id:  {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    trackName: Sequelize.TEXT,
    uploaderId: Sequelize.TEXT,
    securityType: Sequelize.ENUM('public','shared'),
    artist: Sequelize.TEXT
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'song'
})

module.exports = Song;
