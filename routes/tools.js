const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

//const cors = require('./cors');
const authenticate = require('../authenticate');
router.use(bodyParser.json());

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
// --                   SIGNUP ROUTE                   --
// --      ALL USERS CAN PERFORM THEESE OPERATIONS     -- 
// ------------------------------------------------------
router.post('/signup', authenticate.verifyNewlUser, (req, res, next) => {
  res.end();
});

// ------------------------------------------------------
// --                    LOGIN ROUTE                   --
// --      ALL USERS CAN PERFORM THEESE OPERATIONS     -- 
// ------------------------------------------------------
router.post('/login', authenticate.verifyLocalUser, (req, res, next) => {
  //token and session will expire at the same time
  var token = authenticate.getToken(req.user);
  authenticate.setCookieToken(req, res, next, token);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});
// ------------------------------------------------------
// --                   LOGOUT ROUTE                   --
// --      ALL USERS CAN PERFORM THIS OPERATION        -- 
// ------------------------------------------------------
// router.get('/logout', cors.corsWithOptions, (req, res) => {
//   if (req.session) {
//     req.session.destroy();
//     res.clearCookie('session-id');
//     res.redirect('/');
//   }
//   else {
//     var err = new Error('You are not logged in!');
//     err.status = 403;
//     next(err);
//   }
// });


module.exports = router;
