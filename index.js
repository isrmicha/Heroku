var express = require('express');
var app = express();
var moment = require('moment');
moment.locale('pt-BR');
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
var router = express.Router(); 
router.use(function(req, res, next) {
	var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    // do logging
    console.log('Middleware Trigger for IP : '+ip+ " at " + moment().format('MMMM Do YYYY, h:mm:ss a'));
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
	console.log("Renderizou index");
  res.render('pages/index', {nome:"Vazio"}); 
});

router.post('/', function(req, res) {
	console.log("Renderizou post");
  res.send('POST'); 
});

router.put('/', function(req, res) {
	console.log("Renderizou put");
  res.send('PUT'); 
});

router.delete('/', function(req, res) {
	console.log("Renderizou delete");
  res.send('DELETE'); 
});

router.get('/inserir', function(req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
        db.collection('banco', function (err, collection) {
            collection.update({nome : "lista1"},
			{$push : {lista : req.ip}});
	
		if (err) console.log(err);
           else 	  res.send("Adicionado com sucesso");
		
			
        
  })} else {
    res.send('Error DB');
  }
});

router.get('/mostrar', function (req, res) {
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

router.get('/:nome', function(req, res) {
	console.log("Renderizou :nome");
  res.render('pages/index', {nome:req.params.nome}); 
});

router.get('/:nome/:idade', function(req, res) {
	console.log("Renderizou :nome :idade");
  res.render('pages/index', {nome:req.params.nome + " " +req.params.idade}); 
});



// error handling
initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});
app.use('/', router);
app.listen(app.get('port'));
console.log('Server running on '+ app.get('port'));

