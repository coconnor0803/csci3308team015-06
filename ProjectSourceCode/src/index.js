// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

app.use(express.static(__dirname + '/resources'));
// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here
app.get('/', (req, res) => {
    res.redirect('/login');
});

// test API route
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/quiz', (req, res) => {
  res.render('pages/quiz');
});


app.get('/register', (req, res) => {
  res.render('pages/register');
});
app.get('/create', (req, res) => {
  // Render the create page (assuming you have a create.hbs file in your views directory)
  res.render('pages/create'); // Assuming you're using Handlebars as your template engine
});

app.post('/register', async (req, res) => {
  try{
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    const username = req.body.username;
    const values = [username, hash];
    const insert = 'INSERT INTO users (username, password) VALUES ($1, $2)';
    
    await db.none(insert, values);

    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.redirect('/register');  }    
});

app.post('/create', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/login');
    }
    // Extract title and terms from the request body
    const { title, terms } = req.body;
    
    // Get the username from the session
    const username = req.session.user.username;

    // Insert the new study set into the database
    const studySetId = await db.one(
      'INSERT INTO study_sets (title, user_username) VALUES ($1, $2) RETURNING id',
      [title, username]
    );

    // Insert each term and definition into the terms table
    for (const term of terms) {
      await db.none(
        'INSERT INTO terms (term, definition, study_set_id) VALUES ($1, $2, $3)',
        [term.term, term.definition, studySetId.id]
      );
    }

    // Redirect the user to the home page after successful creation
    res.redirect('/home');
  } catch (error) {
    console.error('Error creating set:', error);
    // If an error occurs, render the create page with an error message
    res.render('pages/create', { error: 'An error occurred while creating the set.', user: req.session.user });
  }
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', async (req, res) => {
  try {
      const username = req.body.username;
      const password = req.body.password;
      const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', username);
      if (!user) {
          return res.redirect('/register');
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
          return res.render('pages/login', { error: 'Incorrect username or password.' });
      }
      req.session.user = user;
      req.session.save();
      res.redirect('/home');
  } catch (error) {
      console.error('Error during login:', error);
      res.render('pages/login', { error: 'An error occurred. Please try again.' });
  }
});

app.get('/home', async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.username) {
      // If user is not logged in or username is not defined, redirect to login page
      return res.redirect('/login');
    }
    // Fetch study sets for the current user
    const studySets = await db.any('SELECT * FROM study_sets WHERE user_username = $1', req.session.user.username);
    
    // Render the home page with study sets data
    res.render('pages/home', { studySets });
  } catch (error) {
    console.error('Error fetching study sets:', error);
    // If an error occurs, render the home page without study sets
    res.render('pages/home', { studySets: [] });
  }
});


//logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};


// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
//lab 11 change
//app.listen(3000);
//to
app.use(auth);

app.listen(3000);

console.log('Server is listening on port 3000');


