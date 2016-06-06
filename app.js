var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', { error: err });
}

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    app.get('/', function(req, res){
      console.log(req.query)

      var page = 1;
      if(!!req.query.page){
        page = Number(req.query.page);
      }



      var skip = 15 * (page - 1);
      var prev_page = page - 1;
      var next_page = page + 1;
      var last_page = 0;


      db.collection('movies').find().count(function(err, count) {
        last_page = Math.ceil(count / 15);
      });


      db.collection('movies').find({}).limit(15).skip(skip).toArray(function(err, docs) {
          res.render('add_movie', { 'movies': docs, 'prev_page': prev_page, 'next_page': next_page, 'last_page': last_page } );
      });



    });

    app.post('/movies', function(req, res, next) {

        var title = req.body.title;
        var year = req.body.year;
        var imdb = req.body.imdb;
        var rating = req.body.rating;
        var description = req.body.description;
        var image = req.body.image;

        if ((title == '') || (year == '') || (imdb == '')) {
            next('Please provide an entry for all fields.');
        } else {
            db.collection('movies').insertOne(
                { 'title': title, 'year': year, 'imdb': imdb, 'rating': rating, 'description': description, 'image': image },
                function (err, r) {
                    assert.equal(null, err);
                    res.redirect('/');

                }
            );
        }
    });

    app.get('/movies/:id', function(req, res){

      db.collection('movies').findOne(new ObjectID(req.params.id), function(err, data) {
          res.render('detail', { 'film': data } );
      });

  });




    app.use(errorHandler);

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});
