
const express = require('express');
const config = require('./config');
const auth = require('./routes/tools');

var app = express()

//Set up mongoose connection
const url = config.mongoUrl;
const mongoose = require('mongoose');
mongoose.connect(url, {
  useMongoClient: true
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//authentication tools
app.use('/tools', auth);



app.listen(3000, () => console.log('MiExpress is listening on port 3000!'))