const notecards = [
    { term: 'Photosynthesis', definition: 'The process by which plants convert sunlight into energy.' },
    { term: 'DNA', definition: 'Deoxyribonucleic acid is the hereditary material in humans and almost all other organisms.' },
    { term: 'Solar System', definition: 'The collection of planets, moons, and other celestial bodies that orbit the Sun.' },
    { term: 'Internet', definition: 'A global computer network providing a variety of information and communication facilities.' }
];

let currentIndex = 0;

const termElement = document.getElementById('term');
const definitionElement = document.getElementById('definition');
const notecardElement = document.querySelector('.notecard');
const nextButton = document.getElementById('next-btn');

function calculateFontSize(text) {
    const length = text.length;
    if (length <= 50) {
        return '24px';
    } else if (length <= 100) {
        return '20px';
    } else if (length <= 150) {
        return '16px';
    } else {
        return '14px';
    }
}

function showCurrentCard() {
    const currentCard = notecards[currentIndex];
    termElement.textContent = currentCard.term;
    definitionElement.textContent = currentCard.definition;

    const termFontSize = calculateFontSize(currentCard.term);
    const definitionFontSize = calculateFontSize(currentCard.definition);
    termElement.style.fontSize = termFontSize;
    definitionElement.style.fontSize = definitionFontSize;
}

function showNextCard() {
    currentIndex = (currentIndex + 1) % notecards.length;
    showCurrentCard();
    notecardElement.classList.remove('flipped');
}

notecardElement.addEventListener('click', () => {
    notecardElement.classList.toggle('flipped');
});

nextButton.addEventListener('click', showNextCard);

showCurrentCard();
