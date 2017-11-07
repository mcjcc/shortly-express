const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  // create a new session record
  // assign the hash from the record to req.session.hash
  // assign the hash from the record to res.cookies.shortlyid
  // associate the logged in user to the session record

  // var session = 

  models.Sessions.create()
    .then(results => {
      return models.Sessions.get({id: results.insertId});
    }).then(result => {
      req.session = {hash: result.hash};
      res.cookies = {};      
      res.cookies['shortlyid'] = {value: result.hash};
      next();

    });
  
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// module.exports.createCookies = () => {

// };



