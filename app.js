
const express = require('express');
const config = require('./config');
const auth = require('./routes/tools');
const cors = require('cors')
// const cookieSession = require('cookie-session')


var app = express()

// (!) CORS is enabled for all origins
app.use(cors())

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
// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2']
// }))

app.use('/tools', auth);

// Update a value in the cookie so that the set-cookie will be sent.
// Only changes every minute so that it's not sent with every request.
// app.get('/prueba', function (req, res, next) {
//   // Update views
//   req.session.views = (req.session.views || 0) + 1

//   // Write response
//   res.end(req.session.views + ' views')
// })


app.listen(3000, () => console.log('MiExpress is listening on port 3000!'))