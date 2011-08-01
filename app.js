
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/urlshortener');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

//Document Models
var urls_schema = new Schema({
  shurl       :  { type: String, index: true }
  , orurl     :  { type: String, index: true }
  , created   :  { type: Date, default: Date.now }
});
mongoose.model('Urls', urls_schema);
var Urls = mongoose.model('Urls');

var seqs_schema = new Schema({
  _id       :  { type: String}
  , seq       :  { type: Number}
});
mongoose.model('Seqs', seqs_schema);
var Seqs = mongoose.model('Seqs');



// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){

  res.render('index', {
    title: 'URL Shortener'
    , url: ""
  });
});

app.post('/', function(req, res){
  var query = '{query: {"_id":"urls"}, update: {$inc: {"seq":1}}, new: true}';

  Seqs.db.db.executeDbCommand({
    findAndModify: 'seqs'
    , query: {"_id":"urls"}
    , update: {$inc: {"seq":1}}
    , new: true
    , upsert: true
  }
  , function(err, data) {
    shurl = shortener(data.documents[0].value.seq);
    var data = {"orurl": req.param('orurl'), "shurl": shurl};
    var url = new Urls();
    url.orurl = req.param('orurl');
    url.shurl = shurl;
    url.save(function (err) {
      res.render('index', {
        locals: {
          title: 'URL Shortener'        
          , url: data
        } 
      });
    });    
  });
});

app.get('/:shurl', function(req, res){
  Urls.findOne({"shurl": req.params.shurl}, function (err, data) {
    if(!err){
      res.render('shorturl', {
      locals: {
      title: 'URL Shortener'
      , url: data
      }
      });
    }
  });
});

function shortener(seq){
  //thanks https://github.com/juanmaia
  var chars = "abcdefghijklmnopqrstuvxzwyABCDEFGHIJKLMNOPQRSTUVXZWY1234567890";
  while (seq > 0){
      var k = seq % chars.length;
      if (k==0) { k = 62; seq--; }
      seq = Math.floor(seq / chars.length); 
      str = chars[k-1];
  }
  return str;
}

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
