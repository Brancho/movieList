var MongoClient = require('mongodb').MongoClient;

var ObjectID = require('mongodb').ObjectID;
var id = '5754907f8b0adc3f0b48be73';


MongoClient.connect("mongodb://localhost:27017/video", function(err, db) {

  if(!err) {
    console.log("We are connected");
  }



 db.collection('movies').update({_id: new ObjectID(id)}, {$set:{b:3}});

});
