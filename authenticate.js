const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user')

const JwtStrategy = require('passport-jwt').Strategy
// const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken') // used to create, sign, and verify tokens
const config = require('./config.js') // app config data

exports.getToken = function (user) {
  return jwt.sign({ _id: user._id }, config.secretKey, {
    expiresIn: config.expirationTime // 1 hour
  })
}

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy(
  function (username, password, done) {
    console.log('usarname en auth es: ' + username)
    User.findOne({ 'username': username }, (err, user) => { // Mongoose search
      if (err) { return done(err) }
      if (!user) { return done(null, false) }
      if (user.comparePassword(password, function (err1, isMatch) {
        if (err1) { return done(err1) } // wrong-password
        return done(null, user) // correct-passowrd
      }));
    })
  }))

// ////////////////////////////////////////////////////////////////////////.
// // Compares cookie and header token (both encoded) returns the jwt in it
var xsrfExtractor = (req) => {
  if (req && req.session) {
    let xsrfToken = req.cookies.xsrf_token // encoded cookie
    let xXsrfToken = req.headers.x_xsrf_token
    console.log('xsrf_token: ' + xsrfToken + ', x_xsrf_token: ' + xXsrfToken)
    if (xsrfToken === xXsrfToken) {
      return req.session.token // decoded cookie: jwt
    }
  }
  console.log('xsrfExtractor falló.')
  return null
}

// ////////////////////////////////////////////////////////////////////////.
// Configure the JWT strategy for use by Passport.
let opts = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken() <-- forma original
opts.jwtFromRequest = xsrfExtractor // <-- elegir una forma de extracción del token

opts.secretOrKey = config.secretKey
passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
  console.log('JWT payload: ', jwtPayload)
  User.findOne({ _id: jwtPayload._id }, (err, user) => {
    if (err) {
      return done(err, false)
    } else if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  })
}))

// ////////////////////////////////////////////////////////////////////////.
// Verifies the no existance of the user in order to create a new account
exports.verifyNewlUser = (req, res) => passport.authenticate('local', { session: false }, (err, user) => {
  if (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.json({ 'status': 'error', 'body': 'Error.' })
  } else if (!user) { // register user
    user = {}
    user.username = req.body.username
    user.password = req.body.password
    User.create(user) // Mongoose creation
      .then(
        (_user) => {
          passport.authenticate('local', { session: false })(req, res, () => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({ status: 'success', 'body': 'Registration Successful!' })
          })
        },
        (_err) => {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.json({ 'status': 'error', 'body': _err })
        })
  } // end register user
  res.statusCode = 500
  res.setHeader('Content-Type', 'application/json')
  res.json({ 'status': 'error', 'body': user.username + ' already exists.' })
})(req, res)

exports.verifyLocalUser = passport.authenticate('local', { session: false })

exports.verifyJWTUser = passport.authenticate('jwt', { session: false })

// exports.verifyAdmin = function (req, res, next) {
//     //console.log("**** req.user: " + JSON.stringify(req.user));
//     if (!req.user.admin) {
//         err = new Error('You are not authorized to perform this operation!');
//         err.status = 403;
//         next(err);
//     } else {
//         next();
//     }
// }
