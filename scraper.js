var scrape = require('scrape');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var ids = [];

MongoClient.connect("mongodb://localhost:27017/video", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }

  db.collection('movies').find({"imdb":{$exists:true}}).toArray(function(err, docs) {

    ids = docs.map(function(x){ return { imdb: x.imdb, id: x._id } });


    var i = 0;

    setInterval(function(){
      getMeData(ids[i].imdb, function(data){
        console.log(data);
        console.log(ids[i].id);
        console.log(ids[i].imdb);
          db.collection('movies').update({'_id': new ObjectID(ids[i].id)}, {$set:{ 'image_url': data.img_url, 'description': data.description, 'rating': data.rating }}).then(function(){
            i++;
          });

        })

     }, 3000);



  });

});


function getMeData(imdb, callback){

  var base = "http://www.imdb.com/title/";
  var id = imdb;

  return scrape.request(base + id, function (err, $) {
      if (err) return console.error(err);

      var description;
      var img_url;
      var rating;

      try{
        description = $('.summary_text div')[0].children[0].data;
        img_url = $('.poster a img')[0].attribs.src;
        rating = $(".imdbRating .ratingValue strong span")[0].children[0].data;
        console.log(rating);

      }catch(e){
        console.log('NO Luck');

      }

      callback({description: description, img_url: img_url, rating: rating});


  });


}
