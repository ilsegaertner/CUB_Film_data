const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json());

let movies = [
  {
    "Title": "Avatar",
    "Year": "2009",
    "Rated": "PG-13",
    "Released": "18 Dec 2009",
    "Runtime": "162 min",
    "Genre": {
      "Name": "Action",
      },
    "Director": "James Cameron"
  }, 
  {
    "Title": "I Am Legend",
    "Year": "2007",
    "Rated": "PG-13",
    "Released": "14 Dec 2007",
    "Runtime": "101 min",
    "Genre": {
      "Name": "Drama"
      },
    "Director": "Francis Lawrence"
  }, 
  {
    "Title": "300",
    "Year": "2006",
    "Rated": "R",
    "Released": "09 Mar 2007",
    "Runtime": "117 min",
    "Genre": {
      "Name": "Fantasy"
    },
    "Director": "Zack Snyder"
  }, 
  {
    "Title": "The Avengers",
    "Year": "2012",
    "Rated": "PG-13",
    "Released": "04 May 2012",
    "Runtime": "143 min",
    "Genre": {
      "Name": "Sci-Fi"
    },
    "Director": "Joss Whedon"
  },
  {
    "Title": "The Wolf of Wall Street",
    "Year": "2013",
    "Rated": "R",
    "Released": "25 Dec 2013",
    "Runtime": "180 min",
    "Genre": {
      "Name": "Biography"
    },
    "Director": "Martin Scorsese"
  },
  {
    "Title": "Interstellar",
    "Year": "2014",
    "Rated": "PG-13",
    "Released": "07 Nov 2014",
    "Runtime": "169 min",
    "Genre": {
      "Name": "Drama"
    },
    "Director": "Christopher Nolan"
  },
  {
    "Title": "Game of Thrones",
    "Year": "2011–",
    "Rated": "TV-MA",
    "Released": "17 Apr 2011",
    "Runtime": "56 min",
    "Genre": {
      "Name": "Drama"
    },
    "Director": "N/A"
  },
  {
    "Title": "Vikings",
    "Year": "2013–",
    "Rated": "TV-14",
    "Released": "03 Mar 2013",
    "Runtime": "44 min",
    "Genre": {
      "Name": "Action"
    },
    "Director": "N/A"
  },
  {
    "Title": "Breaking Bad",
    "Year": "2008–2013",
    "Rated": "TV-14",
    "Released": "20 Jan 2008",
    "Runtime": "49 min",
    "Genre": {
      "Name": "Crime"
    },
    "Director": "N/A",
    "Writer": "Vince Gilligan"
  },
  {
    "Title": "Narcos",
    "Year": "2015–",
    "Rated": "TV-MA",
    "Released": "28 Aug 2015",
    "Runtime": "49 min",
    "Genre": {
      "Name": "Crime"
    },
    "Director": "N/A"
  }
]

let users = [
  {
    id: 1,
    name: "Kim",
    favouriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favouriteMovies: ["Narcos"]
  }
];

// CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names');
  }
})

// UPDATE
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }

})

// CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favouriteMovies.push(movieTitle);
    res.status(200).json(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favouriteMovies = user.favouriteMovies.filter( title => title !== movieTitle)
    res.status(200).json(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

// DELETE
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id)
    res.status(200).json(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
})

// READ
app.get('/movies', (req,res) => {
  res.status(200).json(movies);
})

// READ
app.get('/movies/:title', (req,res) => {
    const { title } = req.params; 
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('no such movie');
    }
}) 

// READ
app.get('/movies/genre/:genreName', (req,res) => {
  const { genreName } = req.params; 
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre');
  }
}) 

// READ
app.get('/movies/directors/:directorName', (req,res) => {
  const { directorName } = req.params; 
  const director = movies.find( movie => movie.Director === directorName ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director');
  }
}) 

app.listen(8080, () => console.log('listening on 8080')); 