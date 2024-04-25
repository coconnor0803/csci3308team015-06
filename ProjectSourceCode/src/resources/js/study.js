const notecards = [
    { term: 'Term 1', definition: 'Definition 1' },
    { term: 'Term 2', definition: 'Definition 2' },
    { term: 'Term 3', definition: 'Definition 3' },
    { term: 'Term 4', definition: 'Definition 4' }
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
