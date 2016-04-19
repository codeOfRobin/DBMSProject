var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var async = require('async')
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: './uploads' })

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

app.post('/uploadSongs', upload.any(), function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
  console.log(req.body);
})
app.listen(4000);
console.log('Magic happens on port 4000');
