console.log('IN SCRIPT');

// Add event listener to handle quiz button clicks
document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('quiz-button')) {
        const studySetId = event.target.dataset.id;
        console.log('JS FILE');
        try {
            // Make a request to the server to fetch questions
            const response = await fetch(`/fetchQuestions?studySetId=${studySetId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const questions = await response.json();
            const queryParams = encodeURIComponent(JSON.stringify(questions));
            window.location.href = `/quiz?questions=${queryParams}`;
     
            // Proceed with the quiz using the fetched questions
            console.log('inside event listener', questions);

            
        } 
         catch (error) {
            console.error('Error fetching questions:', error);
        }
       
    }
});
const queryParams = new URLSearchParams(window.location.search);
const questionsParam = queryParams.get('questions');
const questions = JSON.parse(decodeURIComponent(questionsParam))

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
console.log('ARE WE EVER HERE?', nextButton);
let currentQuestionIndex = 0;
let score = 0;
console.log('Lost', questions);
function startQuiz() {
    console.log('inside startquiz', questions);
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if(answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}


function resetState() {
    nextButton.style.display = "none";
    while(answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(event) {
    const selectedBtn = event.target;
    const isCorrect = selectedBtn.dataset.correct == "true";
    if(isCorrect){
        selectedBtn.classList.add("correct");
        score++;

    } else {
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button => {
        if(button.dataset.correct == "true") {
            button.classList.add("correct");

        }
        button.disabled = true;

    });
    nextButton.style.display = "block";
}
function showScore(){
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Try Again";
    nextButton.style.display = "block";
}   
function handleNextButton() {
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){
        showQuestion();
    }else{
        showScore();
    }
}


nextButton.addEventListener("click", ()=> {
    if(currentQuestionIndex < questions.length) {
        handleNextButton();
    }else {
        startQuiz();
    }

    
    });

startQuiz();

