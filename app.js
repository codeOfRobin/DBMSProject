var express = require('express');
// var app = express();
var morgan = require('morgan');
var Sequelize = require('sequelize')
var sequelize = new Sequelize('ass4', 'root', 'asdf', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});


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

potluck.findAll().then(function(potlucks){
    console.log(potlucks.map(function(p){
        return p.dataValues
    }));
})
