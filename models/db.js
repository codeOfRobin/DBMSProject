var Sequelize = require('sequelize')

var db = new Sequelize('ass4', 'root', 'asdf', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

module.exports = db
