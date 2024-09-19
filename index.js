const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");
const fs = require("fs");
const multer = require("multer");

// Configure storage (for now, store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 5MB upload limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

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
  "https://joachimpruegl.me",
  "https://joachimpruegl.me/CUB-Film-Angular-client",
  "https://joachimpruegl.me/CUB-Film-Angular-client/welcome",
  "https://cub-film-data.netlify.app",
  "https://ilsegaertner.github.io/CUB-Film-Angular-client",
  "https://ilsegaertner.github.io",
]; // ensures that these domains are allowed to make requests to your API.

// app.use(express.json()); // new version for handling JSON data --> replaces bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         // If a specific origin isn’t found on the list of allowed origins
//         let message =
//           "The CORS policy for this application does not allow access from origin " +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

app.use(cors());

// app.use(cors()); // would ensure that all domains are allowed to make requests to your API.

const { check, validationResult } = require("express-validator"); // for server-side validation

let auth = require("./auth")(app); // The (app) argument ensures that Express is available in the auth.js file as well
const passport = require("passport");
require("./passport");

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
 *
 * - **Endpoint URL**: `/users`
 * - **Method**: POST
 * - **Query Parameters**: None
 * - **Request Body**: JSON object with user data
 * - **Response Data Format**: JSON object representing the added user
 *
 * **Example Request**: `POST /users`
 *
 * **Example Request Body**:
 * ```json
 * {
 *    "Username": "user1",
 *    "Password": "password123",
 *    "Email": "user1@example.com",
 *    "Birthday": "1990-01-01"
 * }
 * ```
 *
 * **Example Response**:
 * ```json
 * {
 *    "Id": 1,
 *    "Username": "user1",
 *    "Email": "user1@example.com",
 *    "Birthday": "1990-01-01",
 *    "FavouriteMovies": ["12345", "67890"]
 * }
 * ```
 * @function
 * @name addUser
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.Username - The username of the user.
 * @param {string} req.body.Password - The password of the user.
 * @param {string} req.body.Email - The email of the user.
 * @param {Date} req.body.Birthday - The birthday of the user.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise}  A Promise that resolves when the user creation process is complete.
 * @returns {Object} newUser - The newly created user object. Sent in the response on success.
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
            FavouriteMovies: [],
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
 *
 * - **Endpoint URL**: `/users`
 * - **Method**: GET
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON array of user objects
 *
 * **Example Request**: `GET /users`
 *
 * **Example Response**:
 * ```json
 * [
 *   {
 *     "Username": "user1",
 *     "Email": "user1@example.com",
 *     "Birthday": "1990-01-01",
 *     "FavouriteMovies": ["12345", "67890"]
 *   },
 *   {
 *     "Username": "user2",
 *     "Email": "user2@example.com",
 *     "Birthday": "1995-05-15",
 *     "FavouriteMovies": ["23456", "78901"]
 *   }
 * ]
 * ```
 * @function
 * @name getAllUsers
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Promise} A Promise that resolves when the movie request process is complete.
 * @returns {Object}[] allUsers - The array of all users in the database.
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
 * Get all movies.
 * Retrieves information about all movies.
 *
 * - **Endpoint URL**: `/movies`
 * - **Method**: GET
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON
 *
 * **Example Request**: `GET /movies`
 *
 * **Example Response**:
 * ```json
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
 * ```
 * @function
 * @name getAllMovies
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Promise} A Promise that resolves when the movie request process is complete.
 * @returns {Object}[] allMovies - The array of all movies in the database.
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
 * Get a user by username.
 * Retrieves information about a specific user.
 *
 * - **Endpoint URL**: `/users/:Username`
 * - **Method**: GET
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON
 *
 * **Example Request**: `GET /users/johndoe`
 *
 * **Example Response**:
 * ```json
 * {
 *   "ID": 23,
 *   "Username": "johndoe",
 *   "Email": "john@example.com",
 *   "Birthday": "1990-01-01",
 *   "FavouriteMovies": ["12345", "67890"]
 * }
 * ```
 * @function
 * @name getUserByUsername
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Promise} A Promise that resolves when the userdata is successfully fetched.
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Ensure the user is authorized to access this profile
    if (req.user.Username !== req.params.Username) {
      return res.status(403).send("Permission denied");
    }

    try {
      const user = await Users.findOne({
        Username: req.params.Username,
      }).select("-Password");

      if (!user) {
        return res.status(404).send("User not found");
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }

    // await Users.findOne({ Username: req.params.Username })
    //   .select("-Password") // Exclude the "Password" field from the response
    //   .then((user) => {
    //     if (!user) {
    //       return res.status(404).send("User not found");
    //     }
    //     res.json(user);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     res.status(500).send("Error: " + err);
    //   });
  }
);

/**
 * Get data by title
 * Retrieves information about a movie by its title.
 * 
 * - **Endpoint URL**: `/movies/:Title`
 * - **Method**: GET
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON object representing the movie
 * 
 * **Example Request**: `GET /movies/The Matrix`
 * 
 * **Example Response**:
 * ```json
 * {
 *   "Title": "The Matrix",
 *   "Genre": {
 *      "Name": "Action",
 *      "Description": "A description of the Action genre."
 *    },
 *   "Director": {
 *      "Name": "The Wachowskis",
 *      "Bio": "A biography of The Wachowskis.",
 *      "Birth": 1945,
 *      "Death": ""
 *    },
 *   "Year": 1999
 * }
 * ```
 * @function
 * @name getMovie
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Promise} - A Promise that resolves when the movie request process is complete.
 * @returns {Object} reqMovie - The object containing the data for the requested movie.

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
 *
 * - **Endpoint URL**: `/movies/genre/:Name`
 * - **Method**: GET
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON object representing the genre
 *
 * **Example Request**: `GET /movies/genre/Drama`
 *
 * **Example Response**:
 * ```json
 * {
 *   "Name": "Genre",
 *   "Description": "Drama movies depict realistic and emotionally charged stories that explore the complexities of human relationships and personal struggles. They often delve into themes such as love, loss, family dynamics, and personal growth. Drama films typically focus on character development and aim to evoke a wide range of emotions from the audience."
 * }
 * ```
 * @function
 * @name getGenre
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @returns {Promise} - A Promise that resolves when the genre request process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Object} reqGenre - The object containing the data for the requested genre.
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
 *
 * - **Endpoint URL**: `/movies/director/:Name`
 * - **Method**: GET
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON object representing the director
 *
 * **Example Request**: `GET /movies/director/WimWenders`
 *
 * **Example Response**:
 * ```json
 * {
 *   "Name": "Wim Wenders",
 *   "Description": "Wim Wenders, a German filmmaker, is renowned for his visually stunning films that often explore themes of identity, memory, and the search for meaning in a modern world. His works frequently blend elements of fiction and documentary, offering unique cinematic experiences.",
 *   "Birth": 1945,
 *   "Death": ""
 * }
 * ```
 * @function
 * @name getDirector
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Object} reqDirector - The object containing the data for the requested director.
 * @returns {Promise} - A Promise that resolves when the director request process is complete.
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
 *
 * - **Endpoint URL**: `/users/:Username`
 * - **Method**: PUT
 * - **Query Parameters**: None
 * - **Request Body**: JSON object with user data to be updated
 * - **Response Data Format**: JSON object with updated user data
 *
 * **Example Request**: `PUT /users/MichaelMeier`
 *
 * **Example Response**:
 * ```json
 * {
 *   "Username": "MichaelMeier",
 *   "Password": "MichaelMeier",
 *   "Email": "MichaelMeier@example.com",
 *   "Birthday": "1990-01-01",
 *   "FavouriteMovies": ["12345", "67890"]
 * }
 * ```
 * @function
 * @name updateUser
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.Username - The username of the user.
 * @param {string} req.body.Password - The password of the user.
 * @param {string} req.body.Email - The email of the user.
 * @param {Date} req.body.Birthday - The birthday of the user.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {Object} updatedUser - The updated user object sent in the response on success.
 * @description
 *   Expects at least one updatable field (username, password, email, birthday) in the request body.
 *   Throws an error if the user making the request does not have permission to update the user's info.
 * @returns {Promise<Object>} Promise representing the operation. Resolves to the updated user object upon success.
 */
app.put(
  "/users/:Username",
  [
    check("Username")
      .optional()
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 characters long")
      .isAlphanumeric()
      .withMessage("Username contains non-alphanumeric characters"),
    check("Password").optional().notEmpty().withMessage("Password is required"),
    check("Email")
      .optional()
      .isEmail()
      .withMessage("Email does not appear to be valid"),
    check("Avatar")
      .optional()
      .isBase64()
      .withMessage("Avatar must be a valid Base64-encoded string"),
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
      return res.status(403).send("Permission denied");
    }

    // build the update object dynamically
    const updateFields = {};
    if (req.body.Username) {
      updateFields.Username = req.body.Username;
    }
    if (req.body.Password) {
      updateFields.Password = Users.hashPassword(req.body.Password);
    }
    if (req.body.Email) {
      updateFields.Email = req.body.Email;
    }
    if (req.body.Birthday) {
      updateFields.Birthday = req.body.Birthday;
    }
    if (req.body.Avatar) {
      updateFields.Avatar = req.body.Avatar;
    }

    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: updateFields,
        },
        { new: true }
      ).select("-Password");

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    }

    // // CONDITION ENDS
    // await Users.findOneAndUpdate(
    //   { Username: req.params.Username },
    //   {
    //     $set: updateFields,

    // {
    // Username: req.body.Username,
    // Password: req.body.Password,
    // // Password: Users.hashPassword(req.body.Password),
    // Email: req.body.Email,
    // Birthday: req.body.Birthday,
    // Avatar: req.body.Avatar,
    // },
    //   },
    //   { new: true } // This line makes sure that the updated document is returned
    // )
    //   .select("-Password")
    //   .then((updatedUser) => {
    //     res.json(updatedUser);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     res.status(500).send("Error: " + err);
    //   });
  }
);

/**
 * Add a movie to a user's list of favourites
 *
 * - **Endpoint URL**: `/users/:Username/movies/:MovieID`
 * - **Method**: POST
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON object with updated user data
 *
 * **Example Request**: `POST /users/MichaelMeier/movies/23`
 *
 * **Example Response**:
 * ```json
 * {
 *   "Username": "MichaelMeier",
 *   "Password": "MichaelMeier",
 *   "Email": "MichaelMeier@example.com",
 *   "Birthday": "1990-01-01",
 *   "FavouriteMovies": ["12345", "67890", "23"]
 * }
 * ```
 * @function
 * @name addFavouriteMovie
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to add to the user's favourites.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the user creation process.
 * @returns {Promise} A Promise that resolves when the movie addition process is complete.
 * @returns {Object} updatedUser - The updated user object (including the added movie) sent in the response on success.
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
        .json({ error: "Failed to add movie to favourites.", error });
    }
  }
);
/**
 * Remove a movie from a user's list of favourites (with promises instead of callbacks)
 *
 * - **Endpoint URL**: `/users/:Username/movies/:MovieID`
 * - **Method**: DELETE
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON object with updated user data
 *
 * **Example Request**: `DELETE /users/MichaelMeier/movies/67890`
 *
 * **Example Response**:
 * ```json
 * {
 *   "Username": "MichaelMeier",
 *   "Password": "MichaelMeier",
 *   "Email": "MichaelMeier@example.com",
 *   "Birthday": "1990-01-01",
 *   "FavouriteMovies": ["12345", "23"]
 * }
 * ```
 * @function
 * @name deleteFavouriteMovie
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to delete from the user's favourites.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {Object} updatedUser - The updated user object (after removing the movie) sent in the response on success.
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
 * Delete a user by username.
 *
 * - **Endpoint URL**: `/users/:Username`
 * - **Method**: DELETE
 * - **Query Parameters**: None
 * - **Request Body**: None
 * - **Response Data Format**: JSON object representing the removed user
 *
 * **Example Request**: `DELETE /users/MichaelMeier`
 *
 * **Example Response**:
 * ```json
 * {
 *    "id": 1,
 *     "username": "MichaelMeier",
 *     "email": "MichaelMeier@example.com",
 *     "birthday": "1990-01-01",
 *     "favouriteMovies": ["12345", "67890"]
 * }
 * ```
 *
 * @function
 * @name deleteUser
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user to delete.
 * @param {Object} res - The response object.
 * @param {Function} res.status - Method to set the HTTP status code of the response.
 * @param {Function} res.json - Method to send a JSON response.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {string} message - A message indicating the result of the user deletion process.
 * @returns {Promise} - A Promise that resolves when the user deletion process is complete.
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

app.put(
  "/users/:Username/avatar",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    upload.single("Avatar"),
      (req,
      res,
      (err) => {
        // "Avatar" is the name of the form field in the frontend
        if (err instanceof multer.MulterError) {
          return res.status(400).send(err.message);
        } else if (err) {
          return res.status(400).send(err.message);
        }
        next();
      });
  },

  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(403).send("Permission denied");
    }

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Access the file buffer
    const avatarBuffer = req.file.buffer;

    // convert buffer to Base64 string
    const avatarBase64 = avatarBuffer.toString("base64");

    try {
      // Update the uses's avatar in the database
      const updatedUser = await Users.findOneAndUpdate(
        {
          Username: req.params.Username,
        },
        { $set: { Avatar: avatarBase64 } },
        { new: true }
      ).select("-Password");

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      res.json(updatedUser);
    } catch (err) {
      console.error("Error updating avatar: ", err);
      res.status(500).send("Error updating avatar");
    }
  }
);

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
