const express = require('express')

var app = express()
var router = express.Router()

// predicate the router with a check and bail out when needed
router.use(function (req, res, next) {
  if (!req.headers['x-auth']) return next('router')
  next()
})

router.get('/', function (req, res) {
  res.send('hello, user!')
})

// use the router and 401 anything falling through
app.use('/admin', router)

app.get('/admin', (req, res) => {
    res.sendStatus(401)
})

app.listen(3000, () => console.log('MiExpress is listening on port 3000!'))