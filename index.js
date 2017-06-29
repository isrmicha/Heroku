var express = require('express');
var app = express();
var http = require("http");
setInterval(function() {
    http.get("https://isrmicha.herokuapp.com/");
}, 60000*25); // every 5 minutes (300000)
var moment = require('moment-timezone');
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
	logInsert(req,res,'Visitou');
	
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
	  if (!db) {
    initDb(function(err){});
  }
  if (db) {
        db.collection('logs', function (err, collection) {
            collection.find().toArray(function (err, logs) {
					console.log("Renderizou index");
                res.render('pages/index', { logs : logs});
            });
        });
  } else {
    res.send('Error DB');
  }


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
			logInsert(req,res,'Adicionou');
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
					logInsert(req,res,'Mostrou');
            });
        });
  } else {
    res.send('Error DB');
  }
});

router.get('/logs', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
        db.collection('logs', function (err, collection) {
            collection.find().toArray(function (err, logs) {
                res.render('pages/logs', { logs : logs});
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


function logInsert(req, res, acao){
	var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    // do logging
    console.log('Middleware Trigger for IP : '+ip+ " at " + moment().tz("America/Sao_Paulo").format('MMMM Do YYYY, h:mm:ss a'));
	  if (!db) {
    initDb(function(err){});
  }
  if (db) {
        db.collection('logs', function (err, collection) {
            collection.update({nome : "logs"},
			{$push : {logs : {ip : ip,horario: moment().tz("America/Sao_Paulo").format('MMMM Do YYYY, h:mm:ss a'), acao :acao}}});
	
		if (err) console.log(err);
  })} else {
    res.send('Error DB');
  }
}
// error handling
initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});
app.use('/', router);
app.listen(app.get('port'));
console.log('Server running on '+ app.get('port'));

