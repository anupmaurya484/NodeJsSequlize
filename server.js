const express 		= require('express');
const bodyParser 	= require('body-parser');
const app           = express();
const routes        = require('./routes/routes');
var env       = process.env.NODE_ENV || 'development';
var CONFIG    = require('./config/config.json')[env];
const models        = require("./models");

const port =  process.env.PORT  || 3001;

// app.set('port', port);

app.listen(port);

app.use(bodyParser.json());

app.use('/api', routes);

//DATABASE
console.log(CONFIG.database)
models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database:', CONFIG.database);
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


