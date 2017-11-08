const parseCookies = (req, res, next) => {
  // req with have a cookies property and we're supposed to parse it and store it in a variable and wrap it in the next callback
  // request have the headers property of cookie and we have to parse the cookie out and store it in a cookies property in the request 

    
  req.cookies = req.cookies || {};

  if (req.headers.cookie) {
    var cookieString = req.headers.cookie;
    var cookieArray = cookieString.split('; ');
    
    cookieArray.forEach(function(e) {
      var tempArray = e.split('=');
      req.cookies[tempArray[0].toString()] = tempArray[1];
    });
  } 
  next();
  
  
};

module.exports = parseCookies;


