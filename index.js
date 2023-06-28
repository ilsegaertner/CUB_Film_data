
  const express = require('express');
  const app = express ();

  let topMovies = [
    {
      "Title": "Avatar",
      "Year": "2009",
      "Rated": "PG-13",
      "Released": "18 Dec 2009",
      "Runtime": "162 min",
      "Genre": "Action, Adventure, Fantasy",
      "Director": "James Cameron"
    }, 
    {
      "Title": "I Am Legend",
      "Year": "2007",
      "Rated": "PG-13",
      "Released": "14 Dec 2007",
      "Runtime": "101 min",
      "Genre": "Drama, Horror, Sci-Fi",
      "Director": "Francis Lawrence"
    }, 
    {
      "Title": "300",
      "Year": "2006",
      "Rated": "R",
      "Released": "09 Mar 2007",
      "Runtime": "117 min",
      "Genre": "Action, Drama, Fantasy",
      "Director": "Zack Snyder"
    }, 
    {
      "Title": "The Avengers",
      "Year": "2012",
      "Rated": "PG-13",
      "Released": "04 May 2012",
      "Runtime": "143 min",
      "Genre": "Action, Sci-Fi, Thriller",
      "Director": "Joss Whedon"
    },
    {
      "Title": "The Wolf of Wall Street",
      "Year": "2013",
      "Rated": "R",
      "Released": "25 Dec 2013",
      "Runtime": "180 min",
      "Genre": "Biography, Comedy, Crime",
      "Director": "Martin Scorsese"
    },
    {
      "Title": "Interstellar",
      "Year": "2014",
      "Rated": "PG-13",
      "Released": "07 Nov 2014",
      "Runtime": "169 min",
      "Genre": "Adventure, Drama, Sci-Fi",
      "Director": "Christopher Nolan"
    },
    {
      "Title": "Game of Thrones",
      "Year": "2011–",
      "Rated": "TV-MA",
      "Released": "17 Apr 2011",
      "Runtime": "56 min",
      "Genre": "Adventure, Drama, Fantasy",
      "Director": "N/A"
    },
    {
      "Title": "Vikings",
      "Year": "2013–",
      "Rated": "TV-14",
      "Released": "03 Mar 2013",
      "Runtime": "44 min",
      "Genre": "Action, Drama, History",
      "Director": "N/A"
    },
    {
      "Title": "Breaking Bad",
      "Year": "2008–2013",
      "Rated": "TV-14",
      "Released": "20 Jan 2008",
      "Runtime": "49 min",
      "Genre": "Crime, Drama, Thriller",
      "Director": "N/A",
      "Writer": "Vince Gilligan"
    },
    {
      "Title": "Narcos",
      "Year": "2015–",
      "Rated": "TV-MA",
      "Released": "28 Aug 2015",
      "Runtime": "49 min",
      "Genre": "Biography, Crime, Drama",
      "Director": "N/A"
    }
  ];

  app.use (express.static('public'));

  app.get('/', (req, res) => {
    res.send('Welcome to CUB FILM DATA!');
  });

  app.get('/movies', (req, res) => {
    res.json(topMovies);
  });

  app.use((err, req, res, next) => {
    console.error (err.stack);
    res.status(500).send('something broke!');
  });

  app.listen(8080, () => {
    console.log ('Your app is listening on port 8080.');
  });

  

 /*

  const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path');
  
  const app = express();
  // create a write stream (in append mode)
  // a ‘log.txt’ file is created in root directory
  const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
  
  // setup the logger
  app.use(morgan('combined', {stream: accessLogStream}));
  
  app.get('/', (req, res) => {
    res.send('Welcome to my app!');
  });
  
  app.get ('/movies', (req, res) => {
    res.send ('That\'s the movies log');
  });
  
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

  */