# LearnMaster

LearnMaster is a web application designed to streamline the learning process by providing tools for creating, managing, and studying customized study sets, flashcards, and quizzes.


## Contributors

- Colin O'Connor
- Kyle Okura
- Noah Wagner
- Adarsh Charugundla
- Matthew Egyed


## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** bcrypt, Express session
- **Templating Engine:** Handlebars


## Prerequisites

Before running the application, ensure you have the following software installed:

- Node.js
- Docker
- Docker Compose


## Running the Application Locally

### Using Docker Compose

1. Go to the repo at this link: `https://github.com/coconnor0803/csci3308team015-06.git`

2. Clone the repository:

git clone git@github.com:coconnor0803/csci3308team015-06.git


3. Navigate to the project directory:

cd csci3308team015-06
cd ProjectSourceCode


4. Start the application using Docker Compose:

docker-compose up


5. Access LearnMaster in your browser:

`localhost:3000`


### Running Tests

To run the tests, follow these steps:

1. In the docker-compose file, go down to the command section and change 'npm start' to `npm run testandrun'.

2. After that, go to the `/register` route in the `index.js` file and read the comments.

3. Once that is done, run this command:

docker-compose down --volumes

4. Then run:

docker-compose up


### Link to the deployed application:

`http://recitation-15-team-06.eastus.cloudapp.azure.com:3000/study/2`