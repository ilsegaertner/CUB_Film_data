# Name: CUB Film data: An Arthouse Movie Database Web Application.

CUB Film Data is a full-stack web application designed to manage arthouse movie information, directors, and genres. This project serves as a demonstration of mastery in full-stack JavaScript development within the MERN stack.

### Overview

The CUB Film Data app, developed as part of CareerFoundry's Full-Stack Web Development Course, provides users with access to a curated collection of arthouse movies, along with detailed information about directors and genres. Users can register an account, update their personal information, and create a list of favorite movies.

For a live demonstration of the application, visit the [Angular client-side implementation] (https://ilsegaertner.github.io/CUB-Film-Angular-client/) or check the code on [GitHub](https://github.com/ilsegaertner/CUB_Film_data)

### Objective

The objectiv was to build the server-side for a movie database application from scratch, showcasing proficiency in full-stack JavaScript development.

### Approach

**Server-Side:**

The development of the project was achieved through the creation of a REST API using Node.js and Express.
Key endpoints for the API were designed to support common HTTP methods (GET, POST, PUT, DELETE), providing users with access to movie, director, and genre data.

Data management was facilitated through Mongoose, connecting user and movie data to a MongoDB database. Authentication and authorization were implemented to ensure data security and compliance with regulations.

Finally, the API and the database were deployed to an online hosting service and a cloud-based database hosting platform.

### Features

- Return a list of ALL movies to the user
- Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
- Return data about a genre (description) by name/title (e.g., “Thriller”)
- Return data about a director (bio, birth year, death year) by name
- Allow new users to register
- Allow users to update their user info (username, password, email, date of birth)
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister

### Challenges

Developing the server-side of the application posed challenges, particularly in understanding backend processes and database management. I built this app from the ground up while learning the key concepts of backend programming.

Being new to backend processes this task was challenging, and at the same time very enriching, resulting in a deeper understanding of backend programming and a newfound appreciation for database management.

### Technologies used

- JavaScript
- Node.js
- Mongoose
- Express
- React
- MongoDB
