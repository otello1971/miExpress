
const config = require('./config')
const tools = require('./routes/tools')
// var cors = require('cors')
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const express = require('express')

var app = express()

app.use(cookieSession({
  name: 'xsrf_token',
  secret: 'secreto'
  // never set signed=false cause session is lost
}))

app.use(cookieParser())

// app.get('/api', cors(corsOptions), function (req, res, next) {

// Set up mongoose connection
const url = config.mongoUrl
const mongoose = require('mongoose')
mongoose.connect(url, {
  useMongoClient: true
})
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use('/api/tools', tools)

app.listen(3000, () => console.log('MiExpress is listening on port 3000!'))
