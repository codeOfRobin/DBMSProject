var db = require('./db');
var Sequelize = require('sequelize')

var User = db.define('user', {
    id:  {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    name: Sequelize.TEXT,
    fbID: Sequelize.TEXT,
    fbToken : Sequelize.TEXT,
    email : Sequelize.TEXT,
    password: Sequelize.TEXT
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'user'
})

module.exports = User;
