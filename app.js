var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var async = require('async')
var sequelize = new Sequelize('ass4', 'root', 'asdf', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});



Potluck.findAll().then(function(potlucks){
    console.log(potlucks.map(function(p){
        return p.dataValues
    }));
})
