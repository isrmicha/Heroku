var express = require('express');
var app = express();
//{Conexao MONGODB
var db = null,
    dbDetails = new Object();
var initDb = function(callback) {
  var mongodb = require('mongodb');
  if (mongodb == null) return;
 var mongoDbUrl = 'mongodb://user:user@ds123182.mlab.com:23182/banco';
  mongodb.connect(mongoDbUrl, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }
    db = conn;
    dbDetails.type = 'MongoDB';
    console.log('Connected to MongoDB at '+ mongoDbUrl);
  });
};
//}
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	console.log("Renderizou index");
  res.render('pages/index', {nome:"Vazio"}); 
});

app.get('/:nome', function(req, res) {
	console.log("Renderizou index");
  res.render('pages/index', {nome:req.params.nome}); 
});

app.get('/:nome/:idade', function(req, res) {
	console.log("Renderizou index");
  res.render('pages/index', {nome:req.params.nome + " " +req.params.idade}); 
});

app.get('/teste', function(req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
        db.collection('banco', function (err, collection) {
            collection.insert({nome : "Israel"},function (err) {
		if (err) console.log(err);
				 else res.send("Adicionado com sucesso");
            });
        });
  } else {
    res.send('Error DB');
  }
});

app.get('/teste2', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
        db.collection('banco', function (err, collection) {
            collection.find().toArray(function (err, items) {
                res.jsonp(items);
            });
        });
  } else {
    res.send('Error DB');
  }
});

// error handling
initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(app.get('port'));
console.log('Server running on '+ app.get('port'));

