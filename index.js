const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");
const fs = require("fs");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:63239",
  "http://localhost:1234",
  "http://localhost:3000",
  "http://localhost:8000",
  "http://localhost:9000",
  "http://localhost:4200",
  "https://cub-film-data.netlify.app",
  "https://ilsegaertner.github.io/CUB-Film-Angular-client",
  "https://ilsegaertner.github.io",
]; // ensures that these domains are allowed to make requests to your API.

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application does not allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// app.use(cors()); // would ensure that all domains are allowed to make requests to your API.

const { check, validationResult } = require("express-validator"); // for server-side validation

let auth = require("./auth")(app); // The (app) argument ensures that Express is available in the auth.js file as well
const passport = require("passport");
require("./passport");

// app.use(express.json()); // new version for handling JSON data --> replaces bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.CONNECTION_URI, {
  // connect to Heroku
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect("mongodb://127.0.0.1/cfDB", {
//   // connect to Local Server
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

app.use(
  morgan("common", {
    stream: fs.createWriteStream("./log.txt", { flags: "a" }),
  })
); //the morgan token how it logs to the txt file
app.use(morgan("dev")); //the morgan token how it logs to the terminal
app.use(express.static("public")); //static files

// Gets the default page
app.get("/", (req, res) => {
  res.send("Welcome to CUB Film Data!");
});

// Add a User
/* 
We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}
*/

/**
 * Add a new user / Registering
 * Endpoint URL: /users
 * Method: POST
 * Query Parameters: None
 * Request Body: JSON object with user data
 * Response Data Format: JSON object representing the added user
 * Example Request: POST /users
 * Example Request Body:
 * {
 *     "Username": "user1",
 *     "Password": "password123",
 *     "Email": "user1@example.com",
 *     "Birthday": "1990-01-01"
 * }
 * Example Response:
 * {
 *    "id": 1,
 *     "username": "user1",
 *     "email": "user1@example.com",
 *     "birthday": "1990-01-01",
 *     "favoriteMovies": ["12345", "67890"]
 *}
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.Username - The username of the user.
 * @param {string} req.body.Password - The password of the user.
 * @param {string} req.body.Email - The email of the user.
 * @param {Date} req.body.Birthday - The birthday of the user.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 * @returns {Object} JSON response indicating success or failure.
 */
app.post(
  "/users",
  [
    check("Username", "Username has to be at least 5 characters long").isLength(
      { min: 5 }
    ), // server-side validation
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "aready exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
            FavoriteMovies: [],
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Get all users.
 * Retrieves information about all users.
 * Endpoint URL: /users
 * Method: GET
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON array of user objects
 * Example Request: GET /users
 * Example Response:
 * [
 *   {
 *     "Username": "user1",
 *     "Email": "user1@example.com",
 *     "Birthday": "1990-01-01",
 *     "FavoriteMovies": ["12345", "67890"]
 *   },
 *   {
 *     "Username": "user2",
 *     "Email": "user2@example.com",
 *     "Birthday": "1995-05-15",
 *     "FavoriteMovies": ["23456", "78901"]
 *   }
 * ]
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get all movies
 * Retrieves information about all movies.
 * Endpoint URL: /movies
 * Method: GET
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON
 * Example Request: GET /movies
 * Example Response:
 * [
 *   {
 *     "Title": "Movie 1",
 *     "Genre": {
 *        "Name": "Action",
 *        "Description": "A description of the Action genre."
 *      },
 *     "Director": {
 *        "Name": "The Wachowskis",
 *        "Bio": "A biography of The Wachowskis.",
 *        "Birth": 1945,
 *        "Death": ""
 *      },
 *     "Year": 2021
 *   },
 *   {
 *     "Title": "Movie 2",
 *     "Genre": {
 *        "Name": "Drama",
 *        "Description": "A description of the Drama genre."
 *      },
 *     "Director": {
 *        "Name": "Wim Wenders",
 *        "Bio": "A biography of Wim Wenders.",
 *        "Birth": 1945,
 *        "Death": ""
 *      },
 *     "Year": 2020
 *   }
 * ]
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get a user by username
 * Retrieves information about a specific user.
 * Endpoint URL: /users/:Username
 * Method: GET
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON
 * Example Request: GET /users/johndoe
 * Example Response:
 * {
 *   "ID": 23,
 *   "Username": "johndoe",
 *   "Email": "john@example.com",
 *   "Birthday": "1990-01-01",
 *   "FavoriteMovies": ["12345", "67890"]
 * }
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .select("-Password") // Exclude the "Password" field from the response
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get data by title
 * Retrieves information about a movie by its title.
 * Endpoint URL: /movies/:Title
 * Method: GET
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON
 * Example Request: GET /movies/The Matrix
 * Example Response:
 *   {
 *     "Title": "The Matrix",
 *     "Genre": {
 *        "Name": "Action",
 *        "Description": "A description of the Action genre."
 *      },
 *     "Director": {
 *        "Name": "The Wachowskis",
 *        "Bio": "A biography of The Wachowskis.",
 *        "Birth": 1945,
 *        "Death": ""
 *      },
 *     "Year": 1999
 *   }
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get data about genre
 * Retrieves information about a movie by its Genre name.
 * Endpoint URL: /movies/genre/:Name
 * Method: GET
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON
 * Example Request: GET /movies/genre/Drama
 * Example Response:
 *   {
 *     "Name": "Genre",
 *     "Description": "Drama movies depict realistic and emotionally charged stories that explore the complexities of human relationships and personal struggles. They often delve into themes such as love, loss, family dynamics, and personal growth. Drama films typically focus on character development and aim to evoke a wide range ot emotions from the audience."
 *   }
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.get(
  "/movies/genre/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.Name })
      .then((genre) => {
        if (!genre) {
          return res.status(404).send(`Genre ${GenreName} not found.`);
        }
        res.json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get data about director
 * Retrieves information about a director by his/her name.
 * Endpoint URL: /movies/director/:Name
 * Method: GET
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON
 * Example Request: GET /movies/director/WimWenders
 * Example Response:
 *   {
 *     "Name": "Wim Wenders",
 *     "Description": "Wim Wenders, a German filmmaker, is renowned for his visually stunning films that often explore themes of identity, memory, and the search for meaning in a modern world. His works frequently blend elements of fiction and documentary, offering unique cinematic experiences.",
 *     "Birth": 1945,
 *     "Death": ""
 *   }
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.get(
  "/movies/director/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.Name })
      .then((director) => {
        if (!director) {
          return res.status(404).send(`Director ${directorName} not found.`);
        }
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
/**
 * Update a user's info, by username
 * Endpoint URL: /users/:Username
 * Method: PUT
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON object with updated user data
 * Example Request: PUT /users/MichaelMeier
 * Example Response:
 *   {
 *     "Username": "MichaelMeier",
 *     "Password": "MichaelMeier",
 *     "Email": "MichaelMeier@example.com",
 *     "Birthday": "1990-01-01",
 *     "FavoriteMovies": ["12345", "67890"]
 *   }
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.Username - The username of the user.
 * @param {string} req.body.Password - The password of the user.
 * @param {string} req.body.Email - The email of the user.
 * @param {Date} req.body.Birthday - The birthday of the user.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise<Object>} Promise representing the operation. Resolves to the updated user object upon success.
 */
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          // Password: Users.hashPassword(req.body.Password),
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true } // This line makes sure that the updated document is returned
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Add a movie to a user's list of favorites
 * Endpoint URL: /users/:Username/movies/:MovieID
 * Method: POST
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON object with updated user data
 * Example Request: POST /users/MichaelMeier/movies/23
 * Example Response:
 *   {
 *     "Username": "MichaelMeier",
 *     "Password": "MichaelMeier",
 *     "Email": "MichaelMeier@example.com",
 *     "Birthday": "1990-01-01",
 *     "FavouriteMovies": ["12345", "67890", "23"]
 *   }
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to add to the user's favorites.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $push: { FavouriteMovies: req.params.MovieID },
        },
        { new: true }
      );

      const updatedUser = await Users.findOne({
        Username: req.params.Username,
      });
      res.status(201).json(updatedUser);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to add movie to favorites.", error });
    }
  }
);

/**
 * Remove a movie from a user's list of favorites (with premises instead of callbacks)
 * Endpoint URL: /users/:Username/movies/:MovieID
 * Method: DELETE
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON object with updated user data
 * Example Request: POST /users/MichaelMeier/movies/67890
 * Example Response:
 *   {
 *     "Username": "MichaelMeier",
 *     "Password": "MichaelMeier",
 *     "Email": "MichaelMeier@example.com",
 *     "Birthday": "1990-01-01",
 *     "FavouriteMovies": ["12345", "23"]
 *   }
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to delete from the user's favourites.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavouriteMovies: req.params.MovieID },
      },
      { new: true } // This line makes sure that the updated document is returned
    )
      .then((updatedUser) => {
        res.status(201).send("Success! A movie has been removed.");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Endpoint URL: /users/:Username
 * Method: DELETE
 * Query Parameters: None
 * Request Body: None
 * Response Data Format: JSON object representing the removed user
 * Example Request: DELETE /users/MichaelMeier
 * Example Response:
 * {
 *    "id": 1,
 *     "username": "MichaelMeier",
 *     "email": "MichaelMeier@example.com",
 *     "birthday": "1990-01-01",
 *     "favoriteMovies": ["12345", "67890"]
 *}
 * Delete a user by username
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user to delete.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} Promise representing the operation.
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(404).json({
            success: false,
            message: req.params.Username + " was not found",
          });
        } else {
          res.status(200).json({
            success: true,
            message: req.params.Username + " was deleted",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ success: false, error: "Error: " + err });
      });
  }
);

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
