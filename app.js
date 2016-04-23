var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var User = require('./models/user')
var Song = require('./models/song')
var Share = require('./models/share')
var db = require('./models/db');
var Rating = require('./models/rating');
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
Share.sync()
Rating.sync()
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
                else
                {
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
                }

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

app.get('/*.mp3',function(req,res)
{
    console.log(req.params);
    res.sendFile(__dirname + '/uploads/'+req.params[0]+'.mp3');
})
app.get('*',function(req,res)
{
    res.sendFile(__dirname + '/public/index.html');
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
app.use(function(req, res, next)
{
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, 'adsf', function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});



app.post('/songs/public',function(req,res)
{
    Song.findAll({where:{securityType:"public"}}).then(function(songs)
    {
        res.json(songs)
    })
})
app.post('/songs/uploaded',function(req,res)
{
    User.findOne({ where: {id: req.body.uploaderId} }).then(function(existingUser)
    {
        if (existingUser.email == "admin@admin.com")
        {
            Song.findAll().then(function(songs)
            {
                res.json(songs)
            })
        }
        else
        {
            Song.findAll({where:{uploaderId:req.body.uploaderId}}).then(function(songs)
            {
                res.json(songs)
            })
        }
    });
})

app.post('/songs/shared',function(req,res)
{
    db.query("SELECT * FROM song, share WHERE song.id=share.songId AND sharedTo = \"" + req.body.sharedTo+"\"", { type: db.QueryTypes.SELECT})
    .then(function(sharedSongs) {
        res.json(sharedSongs)
    })
})

app.post('/share/create',function(req,res)
{
    User.findOne({ where: {email: req.body.sharedToEmail }}).then(function(existingUser)
    {
        var share = Share.build({
            sharedFrom: req.body.sharedFromId,
            sharedTo: existingUser.id,
            songId: req.body.songId
        })
        share.save().then(function()
        {
            res.json(share)
        })
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

app.post('/rating/set',function(req,res)
{
    Rating.findOne({where: {userId:req.body.userId, songId:req.body.songId}}).then(function(existingRating)
    {
        if(existingRating)
        {
            existingRating.rating = req.body.rating
        }
        else
        {
            var existingRating = Rating.build({
                userId:req.body.userId,
                songId:req.body.songId,
                rating:req.body.rating
            })
        }
        existingRating.save().then(function()
        {
            res.json(existingRating)
        })
    })
})

app.post('user/isAdmin',function(req,res)
{
    User.findOne({ where: {id: req.body.uploaderId} }).then(function(existingUser)
    {
        if (existingUser.email == "admin@admin.com")
        {
            res.json(true)
        }
        else
        {
            res.json(false)
        }
    });

})
app.post('/songAvg/get',function(req,res)
{
    db.query("SELECT avg(`rating`) AS `avg` FROM `rating` AS `rating` WHERE `rating`.`songId` = \"" + req.body.songId+"\"", { type: db.QueryTypes.SELECT})
    .then(function(average) {
        res.json(average)
    })
})
app.post('/song/delete',function(req,res)
{
    if (req.body.email == "admin@admin.com")
    {
        Song.destroy({
            where: {
                id:req.body.songId
            }
        }).then(function(){
            res.json("done")
        })
    }
    else {
        res.json("error")
    }
})
app.listen(3000);
console.log('Magic happens on port 3000');
