const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

// const cors = require('cors')
const authenticate = require('../authenticate')
const config = require('../config.js') // app config data
router.use(bodyParser.json())

// ------------------------------------------------------
// --               ALL USERS ROUTE: GET               --
// --  ONLY ADMIN USERS CAN PERFORM THEESE OPERATIONS  --
// ------------------------------------------------------
// router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     User.find({})
//     .then((users) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(users);
//       }, (err) => next(err))
//     .catch((err) => next(err));
// });

// ------------------------------------------------------
// --           POST ROUTE FOR TESTING ONLY            --
// --      ALL USERS CAN PERFORM THEESE OPERATIONS     --
// ------------------------------------------------------
router.post('/', authenticate.verifyJWTUser, (req, res, next) => {
  console.log('....Estoy en post /')
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ status: 'Ok', body: 'XSRF-JWT is working!' })
})

// ------------------------------------------------------
// --                   SIGNUP ROUTE                   --
// --      ALL USERS CAN PERFORM THEESE OPERATIONS     --
// ------------------------------------------------------
router.post('/signup', authenticate.verifyNewlUser)

// ------------------------------------------------------
// --                    LOGIN ROUTE                   --
// --      ALL USERS CAN PERFORM THEESE OPERATIONS     --
// ------------------------------------------------------
router.post('/login',
  authenticate.verifyLocalUser, (req, res, next) => {
    // token and session will expire at the same time
    var token = authenticate.getToken(req.user)
    req.session.token = token // jwt token
    req.sessionOptions.maxAge = config.expirationTime // same as jwt token
    req.sessionOptions.httpOnly = false // allows Angular to work with this cookie
    req.sessionOptions.exposedHeaders = '*' // useful for cookie-parser
    if (req.session.token) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({ status: 'logged-in', body: 'You are successfully logged in' })
      console.log('Session logged-in.')
    } else {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.json({ status: 'error', body: 'Cookie has not been created.' })
    }
  })
// ------------------------------------------------------
// --                   LOGOUT ROUTE                   --
// --      ALL USERS CAN PERFORM THIS OPERATION        --
// ------------------------------------------------------
router.get('/logout',
  // authenticate.verifyLocalUser
  // authenticate.verifyJWTUser,
  (req, res) => {
    if (req.session) {
      req.session = null
      res.clearCookie('xsrf_token')
      res.json({ status: 'logout', body: 'You are successfully logged out!' })
      console.log('Session disconnected.')
    } else {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.json({ 'status': 'error', 'body': 'You are not logged in!' })
    }
  })

module.exports = router
