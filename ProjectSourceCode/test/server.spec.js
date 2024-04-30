// ********************** Initialize server **********************************

const server = require('../src/index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
const bcrypt = require('bcrypt'); // Add this line to import bcrypt
const { app, db } = require('../src/index'); // Make sure to import your Express app and your database instance
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});


// *********************** TODO: WRITE 2 UNIT TESTCASES **************************


// view /register route comments in index.js before testing


describe('Testing Add User API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'user1', password: 'pass1@'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
    // Refer above for the positive testcase implementation
  });

  it('Negative : /register. Checking invalid name', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'a'.repeat(51), password: 'userpassword'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });
});


describe('Testing Login API', () => {
  // Positive test case: Valid login
  it('Positive: /login. Valid credentials', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'Test User2', password: 'TestUserPassword2'})
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming successful login redirects to another page
        // Add additional assertions if your login endpoint returns data
        done();
      });
  });

  // Negative test case: Invalid username
  it('Negative: /login. Invalid username', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'non_existing_username', password: 'password123'})
      .end((err, res) => {
        expect(res).to.redirect; // Assuming redirect is used when username is not found
        expect(res).to.redirectTo(/^.*\/register$/); // Assuming redirect goes to the register page
        done();
      });
  });
});

describe('Testing /create route', () => {
  let user;

  before(async () => {
    // Create a sample user before running the tests
    const username = 'user2';
    const password = 'pass2@';

    // Hash the password using bcrypt library
    const hash = await bcrypt.hash(password, 10);

    // Insert the user into the database
    await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);

    user = { username, password };
  });

  after(async () => {
    // Clean up after tests
    await db.none('DELETE FROM users WHERE username = $1', [user.username]);
  });

  it('should create a new study set', (done) => {
    const studySetData = {
      title: 'Test Study Set',
      terms: JSON.stringify([
        { term: 'Term 1', definition: 'Definition 1' },
        { term: 'Term 2', definition: 'Definition 2' }
      ])
    };

    chai.request(app)
      .post('/create')
      .send(studySetData)
      .set('Cookie', [`session_id=${user.username}`]) // Set user session
      .end((err, res) => {
        expect(res).to.have.status(302); // Expect a redirect
        expect(res).to.redirectTo('/home'); // Expect redirection to '/home'
        done();
      });
  });

  it('should return an error if title is missing', (done) => {
    const studySetData = {
      terms: JSON.stringify([
        { term: 'Term 1', definition: 'Definition 1' },
        { term: 'Term 2', definition: 'Definition 2' }
      ])
    };

    chai.request(app)
      .post('/create')
      .send(studySetData)
      .set('Cookie', [`session_id=${user.username}`]) // Set user session
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message').that.includes('Title and terms are required');
        done();
      });
  });

  it('should return an error if terms are missing', (done) => {
    const studySetData = {
      title: 'Test Study Set'
    };

    chai.request(app)
      .post('/create')
      .send(studySetData)
      .set('Cookie', [`session_id=${user.username}`]) // Set user session
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message').that.includes('Title and terms are required');
        done();
      });
  });
});


// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************
