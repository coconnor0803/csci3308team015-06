async function fetchQuestionsFromDatabase(connection, studySetTitle) {
    try {
        const [studySetRow] = await connection.execute(
            'SELECT id FROM study_sets WHERE title = ?',
            [studySetTitle]
        );

        if (studySetRow.length === 0) {
            console.error('Study set not found');
            return [];
        }

        const studySetId = studySetRow[0].id;

        const [rows] = await connection.query(
            'SELECT * FROM terms WHERE study_set_id = ?',
            [studySetId]
        );

        const questions = rows.map(row => {
            return {
                question: row.term,
                answers: [
                    { text: row.definition, correct: true },
                    // Add incorrect answers here if needed
                ]
            };
        });

        return questions;
    } catch (error) {
        console.error('Error fetching questions from database:', error);
        return [];
    }
}
const questions = await fetchQuestionsFromDatabase(connection, studySetTitle);

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
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