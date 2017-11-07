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
      console.log(req);
      var hash = req.cookies.shortlyid;
      models.Sessions.get({hash: hash})
        .then(result => {
          console.log('THE SESSION AFTER CHECKING COOKIE');
          // if result exists, we update the session record with the associated user id
          // if result doesnt exist 

        });
    }

    // if cookie doesnt exist, we do the creeate sessions stuff here
    models.Sessions.create()
      .then(results => {
        return models.Sessions.get({id: results.insertId});
      }).then(result => {
        console.log('req', req);
        req.session = {hash: result.hash};
        res.cookies = {};     
        // assign session to a user somehow
        
        // set cookies to the session hash;
        res.cookies['shortlyid'] = {value: req.session.hash};
        next();

      });

  });
  
};

// req.cookies = {shortlyid: '23532523'};
// res.cookies = {shorltyid: {value: '2352352'}};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// module.exports.createCookies = () => {

// };



// req.session = {
//   userId: 4,
//   user: {
//     username: 'john'
//   }
// };