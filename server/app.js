const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup', 
  // if user alreayd exists, we dont create the user and respond with an error message saying the username is taken
  // if it deosnt exist, we create it!
  // res.status(201).send('Hello');
  
(req, res, next) => {
// store the request body info in a variable
// call models.Users.create with the user info as a param
// on success respond with appropriate header/body
  var username = req.body.username.toString();
  var password = req.body.password.toString();
  // console.log(req.query);
  console.log('Username: ', username, 'Password ', password);

  models.Users.create({username, password})
    .then(results => {
      console.log('user created!');
      res.status(201).redirect('/');
    })
    .error(error => {
      console.log('REACHED THE ERROR BLOCK', error.code);

      if (error.code.toString() === 'ER_DUP_ENTRY') {
        res.redirect('/signup');
      }
      // res.status(500).send(error);
    })
    .catch(user => {
      res.status(200).send('it got to the catch 200');
    });
});

app.post('/login', 

(req, res, next) => {
  var username = req.body.username.toString();
  var attemptedPassword = req.body.password.toString();
  
  models.Users.get({username})
    .then(result => {
      console.log('RETURN VALUE FROM DB QUERY', result);
      if (result) {
        var password = result.password;
        var salt = result.salt;
        if ( models.Users.compare(attemptedPassword, password, salt) ) {
          console.log('password verified!');
          res.redirect('/');
        } else { // password supplied is wrong
          console.log('password not verified, redirecting to /login');
          res.redirect('/login');
        }
            
      } else { // if user wasnt found
        console.log('USER WAS NOT FOUND!');
        res.redirect('/login');
      }
    });
/// take request info and search for the user in the user database
// if user exists, check if passwords match
  // if passwords match, redirect to '/',
  // if passwords dont match, keep them at '/login' page
// if user doesnt exist, keep them at '/login' page
  
}
);

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
