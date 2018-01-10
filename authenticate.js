const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const cookieSession = require('cookie-session')

const config = require('./config.js'); //app config data 

exports.getToken = function (user) {
    return jwt.sign({"_id": user._id}, config.secretKey, {
        expiresIn: config.expirationTime // 1 hour
    });
};


exports.setCookieToken = function (req, res, next, token){
  // set cookie-session 
  req.session = cookieSession({
    name: 'XSRF-TOKEN',
    secret: token,
    // Cookie Options
    maxAge: config.expirationTime // 1 hour
  })(req, res, next)
}
// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log("usarname en auth es: " + username);
        User.findOne({"username": username}, (err, user) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }  
            if (user.comparePassword(password, function(err1, isMatch) {
                if (err1) { return done(err1); }  //wrong-password
                return done(null, user); //correct-passowrd 
            }));
       });
    }));

// ////////////////////////////////////////////////////////////////////////.
// Configure the JWT strategy for use by Passport. 
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

// ////////////////////////////////////////////////////////////////////////.
// Verefies the no existance of this user in order to create a new account    
exports.verifyNewlUser = (req, res) => passport.authenticate('local', {session: false}, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({"err": err});
    } else if(!user) { //register user
      user = {};
      user.username = req.body.username;
      user.password = req.body.password;
      User.create(user)
      .then(
        (_user) =>{
          passport.authenticate('local', {session: false})(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({"success": true, "status": "Registration Successful!"});
          });
        }, 
        (_err) => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({"err": _err});
        })
      } // end register user
  })(req, res);

exports.verifyLocalUser = passport.authenticate('local', {session: false});

exports.verifyJWTUser = passport.authenticate('jwt', { session: false });

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

