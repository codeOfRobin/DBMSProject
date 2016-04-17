var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var async = require('async')

app.use(express.static(__dirname + '/public'));
app.use(morgan('tiny'))
// Potluck.findAll().then(function(potlucks){
//     console.log(potlucks.map(function(p){
//         return p.dataValues
//     }));
// })

app.get('*',function(req,res){
    res.sendfile('./public/index.html');
})

app.post('/songs',function(req,res){
    res.json(["forgot me now", "heartless", "Bury it"])
})
app.listen(4000);
console.log('Magic happens on port 3000');
