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
  helpers: {
    json: function (context) {
      return JSON.stringify(context);
    },
  },
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
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
async function fetchQuestionsFromDatabase(studySetId) {
  console.log('ACTUALLY CALLING FUNC');
  try {
      console.log('study id', studySetId);
      const questionsQuery = await db.query('SELECT * FROM terms WHERE study_set_id = $1', [studySetId]);
      console.log(questionsQuery);
      console.log('test please save me', questionsQuery[1].term);
      console.log('size', questionsQuery.length);
      const questions = [];
      for (let i = 0; i < questionsQuery.length; i++) {
        const row = questionsQuery[i];  
        const incorrectAnswers = [];
        for (let j = 0; j < questionsQuery.length; j++) {
          if (j !== i) {
            incorrectAnswers.push(questionsQuery[j].definition);
            console.log('testing definition', questionsQuery[j].definition);
          }
          if (incorrectAnswers.length >= 3) {
            break;
          }
        }
        const answers = [
          { text: row.definition, correct: true }
        ];
        console.log('incorrect answer length', incorrectAnswers.length);
    
        for (let k = 0; k < incorrectAnswers.length; k++) {
          answers.push({ text: incorrectAnswers[k], correct: false });
        }
        shuffleArray(answers);

        const questionObj = {
          question: row.term,
          answers: answers
        };
        
        questions.push(questionObj);
        console.log(questionObj);
      }

      shuffleArray(questions);
      return questions;
    } catch (error) {
      console.error('Error fetching questions from database:', error);
      return [];
    }
  }

app.get('/fetchQuestions', async (req, res) => {
  console.log('i am here');
  const { studySetId } = req.query;
  try {
      const questions = await fetchQuestionsFromDatabase(studySetId);
      res.json(questions);
  } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use(express.static('public'));





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

app.get('/study', (req, res) => {
    res.render('pages/study');
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
    // Extract title and terms from the request body
    const { title, terms } = req.body;
    
    // Get the username from the session
    const username = req.session.user.username;

    // Insert the new study set into the database
    const studySet = await db.one(
      'INSERT INTO study_sets (title, user_username) VALUES ($1, $2) RETURNING id',
      [title, username]
    );

    // Extract the id from the studySet object
    const studySetId = studySet.id;

    // Insert each term and definition into the terms table
    for (const { term, definition } of JSON.parse(terms)) {
      await db.none(
        'INSERT INTO terms (term, definition, study_set_id) VALUES ($1, $2, $3)',
        [term, definition, studySetId]
      );
    }

    // Redirect the user to the home page after successful creation
    res.redirect('/home');
  } catch (error) {
    console.error('Error creating set:', error);
    // If an error occurs, render the create page with an error message
    res.render('pages/create', { error: 'An error occurred while creating the set.' });
  }
});

app.post('/add-term/:studySetId', async (req, res) => {
  try {
    // Extract term and definition from the request body
    const { term, definition } = req.body;
    // Extract study set ID from the request parameters
    const studySetId = req.params.studySetId;

    // Insert the new term into the terms table
    await db.none(
      'INSERT INTO terms (term, definition, study_set_id) VALUES ($1, $2, $3)',
      [term, definition, studySetId]
    );

    // Redirect the user back to the view/edit page for the study set
    res.redirect(`/view/${studySetId}`);
  } catch (error) {
    console.error('Error adding term:', error);
    // If an error occurs, render an error message
    res.status(500).send('Internal Server Error');
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

app.get('/study/:id', async (req, res) => {
  try {
    const studySetId = req.params.id;
    const studySet = await db.one('SELECT * FROM study_sets WHERE id = $1', studySetId);
    const terms = await db.any('SELECT * FROM terms WHERE study_set_id = $1', studySetId);
    res.render('pages/study', { studySet, terms });
  } catch (error) {
    console.error('Error fetching study set:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/view/:id', async (req, res) => {
  try {
    // Get the study set ID from the request parameters
    const studySetId = req.params.id;

    // Fetch the study set data from the database
    const studySet = await db.one('SELECT * FROM study_sets WHERE id = $1', studySetId);
    const terms = await db.any('SELECT * FROM terms WHERE study_set_id = $1', studySetId);

    // Render the view page with the study set data
    res.render('pages/view', { studySet, terms });
  } catch (error) {
    console.error('Error fetching study set:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/delete-term/:id', async (req, res) => {
  try {
    // Get the term ID from the request parameters
    const termId = req.params.id;
    
    // Get the study set ID from the term to be deleted
    const { study_set_id } = await db.one('SELECT study_set_id FROM terms WHERE id = $1', termId);

    // Delete the term from the database
    await db.none('DELETE FROM terms WHERE id = $1', termId);

    // Redirect back to the view page
    res.redirect(`/view/${study_set_id}`);
  } catch (error) {
    console.error('Error deleting term:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/delete-set/:id', async (req, res) => {
  try {
    // Get the study set ID from the request parameters
    const setId = req.params.id;
    
    // Delete the study set and associated terms from the database
    await db.none('DELETE FROM terms WHERE study_set_id = $1', setId);
    await db.none('DELETE FROM study_sets WHERE id = $1', setId);

    // Redirect back to the home page
    res.redirect('/home');
  } catch (error) {
    console.error('Error deleting study set:', error);
    res.status(500).send('Internal Server Error');
  }
});





//logout route
app.get('/logout', (req, res) => {
  if (!req.session.user || !req.session.user.username) {
    // If user is not logged in or username is not defined, redirect to login page
    return res.redirect('/login');
  }
  else{
    req.session.destroy();
    res.render('pages/logout');
  }
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

