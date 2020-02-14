const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const hbs = require('hbs');
const multer = require('multer');
const fs = require('fs');
var axios = require("axios");
const port = process.env.PORT || 4000;
const { conv } = require('./funciones/archivos')

var result;
var alg;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
var upload = multer({
    storage: storage,
     });

app.post('/upload', upload.single('myFile'), (req,res, next) =>{
    const file = req.file
  if (!file) {
    const error = new Error('Sube un archivo')
    error.httpStatusCode = 400
    return next(error)
  }
  if(file.mimetype !== 'application/vnd.ms-excel'){
    const error = new Error('Solo se aceptan archivos csv')
    error.httpStatusCode = 500
    return next(error)
  }
    var nombre = "uploads/" + file.filename;
    var out = "transforms/" + file.filename;
   
    conv(nombre, out)
    res.writeContinue();
    
    if(fs.existsSync(out)){
      console.log("si");
      fs.exists(out, function(exists) {
        if (exists) {
          // get information about the file
          fs.stat(out, function(error, stats) {
            // open the file (getting a file descriptor to it)
            fs.open(out, "r", function(error, fd) {
              var buffer = new Buffer(stats.size);
      
              // read its contents into buffer
              fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                var data = buffer.toString("utf8", 0, buffer.length);
                var data2 = JSON.parse(data);
                console.log(data2);
                fs.closeSync(fd);
                axios.post('https://pia-rest.herokuapp.com/RL',
                data2)
                .then((response) => {
                  result = response.data;
                  alg = 'lineal';
                  console.log(result);
                  res.redirect('https://pia-rest.herokuapp.com/res');
                });
              });
            });
          });
        }
      });
    }else{
      console.log("no");
    }
    
});
app.post('/rexp', upload.single('myFile'), (req,res, next) =>{
  const file = req.file
if (!file) {
  const error = new Error('Sube un archivo')
  error.httpStatusCode = 400
  return next(error)
}
if(file.mimetype !== 'application/vnd.ms-excel'){
  const error = new Error('Solo se aceptan archivos csv')
  error.httpStatusCode = 500
  return next(error)
}
  var nombre = "uploads/" + file.filename;
  var out = "transforms/" + file.filename;
 
  conv(nombre, out)
  res.writeContinue();
  
  if(fs.existsSync(out)){
    console.log("si");
    fs.exists(out, function(exists) {
      if (exists) {
        // get information about the file
        fs.stat(out, function(error, stats) {
          // open the file (getting a file descriptor to it)
          fs.open(out, "r", function(error, fd) {
            var buffer = new Buffer(stats.size);
    
            // read its contents into buffer
            fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
              var data = buffer.toString("utf8", 0, buffer.length);
              var data2 = JSON.parse(data);
              console.log(data2);
              fs.closeSync(fd);
              axios.post('https://pia-rest.herokuapp.com/ER',
              data2)
              .then((response) => {
                result = response.data;
                alg = 'exponencial';
                console.log(result);
                res.redirect('https://pia-rest.herokuapp.com/res');
              });
            });
          });
        });
      }
    });
  }else{
    console.log("no");
  }
  
});
app.get('/res', function(req,res){
  if(alg == 'lineal'){
  res.render('resultados.hbs',{
    Algoritmo : result.name,
    ec: 'y = ' + result.intercept + ' + ' + result.slope + ' * x'
  })
  }
  if(alg == 'exponencial'){
    res.render('resultados.hbs',{
      Algoritmo : result.name,
      ec: 'ln(y) = ' + 'ln(' + result.A + ') '+ ' + ' + result.B + ' * x' 
    })

  }

});


hbs.registerPartials(__dirname + '/views/parciales');
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.get('/', function(req, res) {
    res.render('home');
});
app.get('/RLS', function(req, res) {
    res.render('RLineal');
});
app.get('/REXP', function(req, res) {
  res.render('RExp');
});


app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
});