var express = require('express');
var router = express.Router();
var techJson = require('../config/int-data.json');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/exampledb";


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'CSV file upload - Login'
    });
});


/* GET home page. */
router.get('/upload', function(req, res, next) {
	   res.render('upload', {
        title: 'CSV file upload',
        user: req.session.googleProfile
    }); 
});

router.get('/reports', function(req, res, next) {
    MongoClient.connect(url, function(err, db) {
        db.collection('csvfiledata', function(err, collection) {
            if (!err) {
                collection.findOne({}, {
                    data: 1
                }, function(err, docs) {
                    if (!err) {
                        res.render('reports', {
                            title: 'CSV file upload',
                            user: req.session.googleProfile,
                            data: docs,
        					techJson: techJson
                        });
                    }
                })
            }
        });
    });
})


module.exports = router;
