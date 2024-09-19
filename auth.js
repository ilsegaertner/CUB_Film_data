const jwtSecret = "your_jwt_secret"; // This has to be the same key used in the JWTStrategy

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport"); // Your local passport file

let generateJWTToken = (payload) => {
  return jwt.sign(payload, jwtSecret, {
    subject: payload.Username, //  This is the username you're encoding in the JWT
    expiresIn: "7d", // This specifies that the token will expire in 7 days
    algorithm: "HS256", // This is the algorithm used to "sign" or encode the values of the JWT
  });
};

/* POST login */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    console.log("Received login request with payload:", req.body);
    console.log("Request Headers:", req.headers); // Log headers to check if JSON content type is set

    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        console.error("Authentication failed:", error || info);
        return res.status(400).json({
          message:
            "Authentication failed. " +
            (info && info.message ? info.message : ""),
          error: error,
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          console.error("Login error:", error);
          // res.send(error);
          return res.status(500).json({
            message: "Something went wrong during login.",
            error: error,
          });
        }

        let payload = {
          _id: user._id,
          Username: user.Username,
        };
        let token = generateJWTToken(payload);
        const userResponse = {
          _id: user._id,
          Username: user.Username,
          Email: user.Email,
          Birthday: user.Birthday,
          FavouriteMovies: user.FavouriteMovies,
        };
        return res.json({ user: userResponse, token }); // ES6 shorthand for res.json({ user: user, token: token})
      });
    })(req, res);
  });
};
