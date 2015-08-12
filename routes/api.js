var express = require('express');
var util = require('util');
var router = express.Router();
var nodemailer = require("nodemailer");

var fs = require('fs');
var config = require('config');

//csv to json module
var Converter = require("csvtojson").core.Converter;
//mongodb
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/exampledb";

var senderName = config.get('emailsettings.auth.name'),
    senderMail = config.get('emailsettings.auth.email'),
    senderPass = config.get('emailsettings.auth.pass'),
    receiverIds = config.get('emailsettings.receivers');


/* GET users listing. */
router.post('/upload', function(req, res, next) {
    var fstream;
    var formData = [];
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        // console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/uploads/file.csv');

        file.pipe(fstream);
        fstream.on('close', function() {
            //console.log(req.body);
            var fileStream = fs.createReadStream(__dirname + '/uploads/file.csv');
            var converter = new Converter({
                constructResult: true
            });
            converter.on("end_parsed", function(jsonObj) {
                //console.log(jsonObj); //here is your result json object


                /* -- mongodb connection --*/

                MongoClient.connect(url, function(err, db) {
			if(err){
			 console.log("db error occured.");
			}
                    if (!err) {
                        //console.log("We are connected");
                        db.collection('csvfiledata', function(err, collection) {
				
                            collection.update({
                                'csv': 'csv'
                            }, {
                                $set: {
                                    data: jsonObj
                                }
                            }, function(err, doc) {
                                if (!err) {


                                    /* -- Nodemailer intergration --start -- */
                                    // create reusable transport method (opens pool of SMTP connections)
                                    var smtpTransport = nodemailer.createTransport("SMTP", {
                                        service: "Gmail",
                                        auth: {
                                            user: senderMail,
                                            pass: senderPass
                                        }
                                    });

                                    console.log("-------------");
                                    receiverIds.push(req.body.email)
                                    console.log(receiverIds);

                                    receiverIds.forEach(function(to, i, array) {

                                            // setup e-mail data with unicode symbols
                                            var mailOptions = {
                                                from: senderName + " ✔ <" + senderMail + ">", // sender address
                                                subject: "Hello!, The file has been uploaded successfully ✔", // Subject line
                                                html: "<b>Congratulations " + req.body.username + ". The file has been uploaded successfully. ✔</b>" // html body
                                            }


                                            mailOptions.to = to;


                                            // send mail with defined transport object

                                            smtpTransport.sendMail(mailOptions, function(error, response) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    console.log("Message sent: " + response.message);
                                                    res.end(JSON.stringify(jsonObj));

                                                }

                                                // if you don't want to use this transport object anymore, uncomment following line
                                                //smtpTransport.close(); // shut down the connection pool, no more messages
                                            });

                                        })
                                        /* -- Nodemailer intergration --end -- */
                                }

                            })

                        });
                    }
                });


            });
            //read from file
            fileStream.pipe(converter);
            // Connect to the db

        });
    });

    req.busboy.on('field', function(fieldname, val) {
        console.log(fieldname, val);
        if (req.body.hasOwnProperty(fieldname)) {
            if (Array.isArray(req.body[fieldname])) {
                req.body[fieldname].push(val);
            } else {
                req.body[fieldname] = [req.body[fieldname], val];
            }
        } else {
            req.body[fieldname] = val;
        }
        console.log(req.body);
        //res.render('index',)
    });
});

module.exports = router;
