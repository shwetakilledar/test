var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;


var url='mongodb://localhost:27017/codingtest3';


// Homepage
router.get('/', function(req, res){
	res.render('index');
});



router.get('/get-data', function(req, res, next) {
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    if (err) throw err;
    var cursor = db.collection('songs').find();
    cursor.forEach(function(doc, err) {
      if (err) throw err;
      resultArray.push(doc);
    }, function() {
      //console.log(resultArray);
      db.close();
      
      res.render('index', {items: resultArray});
    });
  });
});


module.exports = router;