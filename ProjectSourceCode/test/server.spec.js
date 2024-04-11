// ********************** Initialize server **********************************

const server = require('../src/index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

/*
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
*/

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************


//We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 400 along with a "Invalid input" message.

/*
describe('Testing Add User API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'Test User2', password: 'TestUserPassword2'})
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
*/

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
        expect(res).to.have.status(400); // Assuming unsuccessful login redirects to another page
        // Add additional assertions if your login endpoint returns data
        done();
      });
  });

});



// ********************************************************************************