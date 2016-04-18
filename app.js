var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var async = require('async')
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Potluck.findAll().then(function(potlucks){
//     console.log(potlucks.map(function(p){
//         return p.dataValues
//     }));
// })

app.get('*',function(req,res){
    res.sendFile(__dirname + '/public/index.html');
})

app.post('/songs',function(req,res){
	res.json(req.body);
})
app.listen(4000);
console.log('Magic happens on port 4000');
