const models = require('../models');
const Promise = require('bluebird');
const parseCookies = require('./cookieParser');

module.exports.createSession = (req, res, next) => {

  // create a new session record
  // assign the hash from the record to req.session.hash
  // assign the hash from the record to res.cookies.shortlyid
  // associate the logged in user to the session record

  // var session = 
  
  //checks if request already has a cookie. if it does, it retrieves the session
  parseCookies(req, res, function() {
    // if cookie exist , check db    
    if (req.cookies.shortlyid) {
      // we can assume req.cookies.shortlyid is the session hash
      // check database to see if a session matchs req.cookies.shortlyid
      console.log('req.cookies.shortlyid');
      var hash = req.cookies.shortlyid;
      models.Sessions.get({hash: hash})
        .then(result => {
          console.log('THE SESSION OBJECT AFTER CHECKING FOR SESSION USING COOKIE', result);
          console.log('HAS SHORTLY ID COOKIE AND ASSOCIATED SESSION');
          // if result exists, we update the session object with the associated user id
          if (result) {
            req.session = {
              hash: result.hash,
              userId: null,
              user: null
            };
            if (result.userId) {
              req.session.userId = result.userId;
              req.session.user = {username: result.user.username};
            }

            res.cookies = {
            };

            // res.cookies['shortlyid'] = {value: req.session.hash};
            res.cookie('shortlyid', result.hash);
            console.log('COOOKIES FIELD', res.cookies);

            // console.log('res====>', res);
            next();
          } else {
            //has cookie, but cookie has no session. So we create a new session?
            console.log('REQUEST HAS COOKIE BUT WITH NO SESSION');
            models.Sessions.create()
            .then(results => {
              return models.Sessions.get({id: results.insertId});
            }).then(result => {
              // console.log('req', req);
              req.session = {
                hash: result.hash,
                userId: result.userId,
                user: null
              };
              res.cookies = {};     
              // assign session to a user somehow
              
              // set cookies to the session hash;
              // res.cookies['shortlyid'] = {value: req.session.hash};
              res.cookie('shortlyid', req.session.hash);
              console.log('COOOKIES FIELD', res.cookies);
              next();
            });
          // if result doesnt exist 
           
          }
        });
    } else {
      console.log('cookies dont exist!');
    // if cookie doesnt exist, we do the creeate sessions stuff here
      models.Sessions.create()
      .then(results => {
        return models.Sessions.get({id: results.insertId});
      }).then(result => {
        // console.log('req', req);
        req.session = {
          hash: result.hash,
          userId: result.userId,
          user: null
        };
        // res.cookies = {};     
        // assign session to a user somehow
        
        // set cookies to the session hash;
        // res.cookies['shortlyid'] = {value: req.session.hash};
        res.cookie('shortlyid', req.session.hash);
        console.log('COOOKIES FIELD', res.cookies);
        next();
        
      });
    }
  });
};


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
module.exports.updateSessionWithUser = (req, res, user, next) =>{
  // when a user goes to the /login page
  // session is created with no user_id
  // after user succesfully logs in
  // session is associated with the user_id
  var hash = req.session.hash;
  
  models.Sessions.update({hash: hash}, {userId: user}).then(result => {
    next();
  });
  // inputs are a req obj, res obj, next callback

  

  // outputs is a session record is updated with the user_id
};
