/**
 * Created by harshilkumar on 4/25/17.
 */

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var $ = require('jquery');

var fs = require("fs");
var http = require('http');
var path = require('path');

/*============= Not needed in this application========*/
var nodeemail = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodeemail.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 465,
    "secure": true,
    auth: {
        user: 'henrynmkg@gmail.com',
        pass: 'harshil123'
    }
}));
/*====================================================*/
var app = express();
//var app = express.createServer();
app.use(bodyParser.json());

/*
 var serverDB = {
 "_id": "heroku_vtc69g5x.heroku_vtc69g5x",
 "user": "admin",
 "db": "heroku_vtc69g5x",
 "pass": "admin",
 "roles": [
 {
 "role": "dbOwner",
 "db": "heroku_vtc69g5x"
 }
 ]
 }
 var mongoUrl = 'mongodb://'+serverDB.user+':'+serverDB.pass+'@ds163010.mlab.com:63010/heroku_vtc69g5x';

 */
var MongoClient = require('mongodb').MongoClient;
var db;


var localDBUrl = "mongodb://localhost:27017/invitation_db";
console.log("Mongodb URL :" + JSON.stringify(localDBUrl));
// Initialize connection once
MongoClient.connect(localDBUrl, function (err, database) {
    if (err) {
        return console.error(err);
    }
    else {
        db = database;
        console.log("Invitation Database connected.");

    }
});

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, **Authorization**');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.header('Content-Security-Policy', 'default-src "self";script-src "self";object-src "none";img-src "self";media-src "self";frame-src "none";font-src "self" data:;connect-src "self";style-src "self"');
    next();
});

app.listen(3000, function () {
    console.log('Invitation app listening on port 3000!')
})


// Find the first time user data and add
app.post('/storeNewdata', function (req, res) {

    //console.log(JSON.stringify(req.body));

    var _guestUsrKey = req.body.guestkey;
    var _guestData = req.body.guestData;

    //var userjsonData = JSON.stringify(_apusrStockData);

    console.log("Seperating the userkey :" + JSON.stringify(_guestUsrKey));
    console.log("Seperating the stockdata :" + JSON.stringify(_guestData));
    //var testdata = {};

    db.collection('testguestData').insertOne(
        {
            "g_name": _guestUsrKey,
            "g_data": _guestData
        },
        function (err, result) {
            if (err) {
                console.log('Error updating use: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                //res.writeHead('200');
                res.send(result);
            }
        }
    );

});

//Existing stock edit and save
app.post('/updateExistingdata', function (req, res) {

    //console.log(JSON.stringify(req.body));

    var _guestUsrKey = req.body.guestkey;
    var _guestData = req.body.guestData;

    //var userjsonData = JSON.stringify(_apusrStockData);

    console.log("Seperating the userkey :" + JSON.stringify(_guestUsrKey));
    console.log("Seperating the stockdata :" + JSON.stringify(_guestData));

    //var testdata = {};

    var update = {"$set": {}};

    update.$set["g_data"] = _guestData;
    db.collection('testguestData').updateOne(
        {
            g_name: _guestUsrKey
        },
        update,
        {upsert: true},
        function (err, result) {
            if (err) {
                console.log('Error updating use: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                //res.writeHead('200');
                res.send(result);
            }
        }
    );
});

// get all data
app.get('/getguestJson', function (req, res) {
    var testdata = {};
    db.collection('testguestData', function (err, collection) {
        collection.find().toArray(function (err, items) {
            console.log(items);
            //testdata = testdata+items;
            res.send(items);
        });
    });
});

// find specific guest data
app.get('/getspecificGuest/:id', function (req, res) {

    //console.log(JSON.stringify(req.body));

    var g_userId = req.params.id;
    //var userjsonData = JSON.stringify(_apusrStockData);

    console.log("Userkey to get data :" + JSON.stringify(g_userId));
    //var testdata = {};

    db.collection('testguestData').findOne({
            g_name: g_userId
        },
        function (err, result) {
            if (err) {
                console.log('Error updating use: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                //res.writeHead('200');
                res.send(result);
            }
        }
    );

});
/*====================================*/

// Find the first time user data and add
app.post('/sendemails', function (req, res) {

    console.log(JSON.stringify(req.body.mailAry));
    console.log(JSON.stringify(req.body.eventKind));

    var emailDraft = {};
    var _guestUsrKey = req.body.mailAry;

    console.log(JSON.stringify(_guestUsrKey));
    //var userjsonData = JSON.stringify(_apusrStockData);

    _guestUsrKey.forEach(function (value) {
        value = value.replace(/^[ ]+|[ ]+$/g, '');
        var encoded = new Buffer(value).toString('base64');
        console.log(encoded);

        /*
        emailDraft = {

            from: 'henrynmkg@gmail.com',
            to: value,
            subject: 'Harshil & Jinail Wedding Invitation',
            html: '<a href="https://henry263.github.io/2-page-invite/?_guestKey=' + encoded + '"><img src="https://i.imgur.com/GpHJUhE.png" alt="Wedding invite" border="0"></a><br />',
            text: 'RSVP here (By clicking on image )'
        };

        transporter.sendMail(emailDraft, function (error, response) {  //callback
            if (error) {
                console.log(error);
            } else {

                console.log("Message sent: " + response.message);
            }

            transporter.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
        });
        */
    });


});

/*==================== Not needed in this application===*/
/*
 var encoded = new Buffer("hrpatel.263@gmail.com").toString('base64');
 var decoded = new Buffer(encoded, 'base64').toString('ascii');

 console.log(encoded);
 console.log(decoded);
 var emailDraft = {

 from: 'henrynmkg@gmail.com',
 to: 'hrpatel.263@gmail.com',
 subject: 'Harshil & Jinail Wedding Invitation',
 html: '<a href="https://google.com/?_guestKey=' + encoded + '"><span onclick="callfunc()"><img src="https://i.imgur.com/GpHJUhE.png" alt="image_1_invite" border="0"></span></a><br />',
 text: 'Wedding Invitation!'
 };
 function callfunc() {
 console.log("Image clicked");
 }
 transporter.sendMail(emailDraft, function (error, response) {  //callback
 if (error) {
 console.log(error);
 } else {

 console.log("Message sent: " + response.message);
 }

 transporter.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
 });
 */
/*=========================================================*/
