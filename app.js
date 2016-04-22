var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var User = require('./models/user')
var Song = require('./models/song')
var mm = require('musicmetadata');
var async = require('async')
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: './uploads' })
var bcrypt   = require('bcrypt-nodejs');
var fs = require('fs')
var jwt = require('jsonwebtoken');
var cors = require('cors')
var request = require('request');
User.sync()
Song.sync({force:false})
app.use(express.static(__dirname + '/public'));
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
app.set(secret, {'secret': 'notSoSecret'});
var secret = 'superSecret'
app.set(secret, "secret");

app.post('/auth/facebook', function(req, res)
{
    var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
    var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: "e6cf1704ddfca7af4c590dc656d50377",
        redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken)
    {
        if (response.statusCode !== 200)
        {
            return res.status(500).send({ message: accessToken.error.message });
        }

        // Step 2. Retrieve profile information about the current user.
        request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile)
        {
            if (response.statusCode !== 200) {
                return res.status(500).send({ message: profile.error.message });
            }
            User.findOne({ where: {fbID: profile.id} }).then(function(existingUser)
            {
                if (existingUser)
                {
                    jwt.sign({user: profile.email}, 'adsf', {expiresIn: 24*60*60},function(token)
                    {
                        res.send({ token: token });
                    });
                }
                var user = User.build({
                    name: profile.name,
                    fbID: profile.id,
                    email: profile.email,
                })
                user.save().then(function()
                {
                    jwt.sign({user: profile.email}, 'adsf', {expiresIn: 24*60*60},function(token)
                    {
                        res.send({ token: token });
                    });

                })
            });
        });
    });
});

app.post('/auth/signup', function(req, res)
{
    User.findOne({ where: {email: req.body.email} }).then(function(existingUser)
    {
        if (existingUser)
        {
            return res.status(409).send({ message: 'Email is already taken' });
        }
        var user = User.build({
            email: req.body.email,
            password : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null)
        })
        user.save().then(function()
        {
            jwt.sign({user: req.body.email}, 'adsf', {expiresIn: 24*60*60},function(token)
            {
                res.send({ token: token });
            });
        })
    });
})

app.post('/auth/login', function(req, res)
{
    User.findOne({ where: {email: req.body.email} }).then(function(existingUser)
    {
        if (!existingUser)
        {
            return res.status(409).send({ message: 'Email not present' });
        }
        jwt.sign({user: req.body.email}, 'adsf', {expiresIn: 24*60*60},function(token)
        {
            res.send({ token: token });
        });
    });
})
// app.use(function(req, res, next)
// {
//     var token = req.body.token || req.query.token || req.headers['x-access-token'];
//     if (token) {
//         // verifies secret and checks exp
//         jwt.verify(token, app.get(secret), function(err, decoded) {
//             if (err) {
//                 return res.json({ success: false, message: 'Failed to authenticate token.' });
//             } else {
//                 // if everything is good, save to request for use in other routes
//                 req.decoded = decoded;
//                 next();
//             }
//         });
//
//     } else {
//         // if there is no token
//         // return an error
//         return res.status(403).send({
//             success: false,
//             message: 'No token provided.'
//         });
//
//     }
// });

app.get('/*.mp3',function(req,res)
{
    console.log(req.params);
    res.sendFile(__dirname + '/uploads/'+req.params[0]+'.mp3');
})
app.get('*',function(req,res)
{
    res.sendFile(__dirname + '/public/index.html');
})

app.post('/songs/public',function(req,res)
{
    Song.findAll({where:{securityType:"public"}}).then(function(songs)
    {
        res.json(songs)
    })
})
app.post('/songs/uploaded',function(req,res)
{
    Song.findAll({where:{uploaderId:req.body.uploaderId}}).then(function(songs)
    {
        res.json(songs)
    })
})
app.post('/user/get',function(req,res)
{
    User.findOne({ where: {email: req.body.email} }).then(function(existingUser)
    {
        // console.log(existingUser);
        res.json({user:existingUser})
    })
})
app.post('/uploadSongs', upload.any(), function (req, res, next)
{
    tmp_path = req.files[0].path;
    originalName=req.files[0].originalname;
    target_path =  req.files[0].path +'.' + "mp3"
    fs.rename(tmp_path, target_path, function(err) {
        if (err)
        throw err;
        fs.unlink(tmp_path, function() {
            if (err)
            throw err;
            // res.json("done : "+ target_path)
            var parser = mm(fs.createReadStream(target_path), function (err, metadata) {
                if (err) throw err;
                console.log(metadata);
                var newSong = Song.build({
                    trackName: metadata.title,
                    artist: metadata.artist[0],
                    uploaderId: req.body.uploaderId,
                    securityType: req.body.securityType,
                    trackLink: "http://localhost:3000"+target_path.slice(7)
                })
                newSong.save().then(function()
                {
                    res.json({song:newSong})
                })
            });
        });
    });


})
app.listen(3000);
console.log('Magic happens on port 3000');
