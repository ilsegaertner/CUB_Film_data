const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let movies = [
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

//Gets the list of data about ALL movies

app.get('/movies', (req, res) => {
  res.json(movies);
})

//Gets the data of a single movie, by title

app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) => 
    { return movie.name === req.params.name }));
});

//Adds data for a new student to our list of students

app.post('/students', (req,res) => {
  let newStudent = req.body;

  if (!newStudent.name) {
    const message = 'Missing name in request body';
    res.status(400).send(message);
  } else {
    newStudent.id = uuid.v4();
    students.push(newStudent);
    res.status(201).send(newStudent);
  }
});

// Deletes a student from our list by ID

app.delete('/students/:id', (req, res) => {
  let student = student.find((student) => { return student.id === req.params.id });

  if (student) {
    students = students.filter((obj) => { return obj.id !== req.params.id });
    res.status(201).send('Student ' + req.params.id + ' was deleted.');
  }
});

// Update the"grade" of a student by student name/class name

app.put('/students/:name/:class/:grade', (req, res) => {
  let student = students.find((student) => { return student.name === req.params.name});

  if (student) {
    student.classes[req.params.class] = parseInt(req.params.grade);
    res.status(201).send('Student ' + req.params.name + ' was assigned a grade of ' + req.params.grade + ' in ' + req.params.class);
  } else {
    res.status(404).send('Student with the name ' + req.params.name + ' was not found.');
  }
});

//Gets the GPA of a student

app.get('/students/:name/gpa', (req, res) => {
  let student = students.find((student) => { return student.name == req.params.name});

  if (student) {
    let classesGrades = Object.values(student.classes); //Object.values() filters out object's keys and keeps the values that are returned as a new array
    let sumOfGrades = 0;
    classesGrades.forEach(grade => {
      sumOfGrades = sumOfGrades + grade;
    });

    let gpa = sumOfGrades / classesGrades.length;
    console.log(sumOfGrades);
    console.log(classesGrades.length);
    console.log(gpa);
    res.status(201).send('' + gpa);
    //res.status(201).send(gpa);
  } else {
    res.status(404).send('Student with the name ' + req.params.name + ' was not found.');
  }
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080')
});