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
  const currentCard = terms[currentIndex];
  termElement.textContent = currentCard.term;
  definitionElement.textContent = currentCard.definition;

  const termFontSize = calculateFontSize(currentCard.term);
  const definitionFontSize = calculateFontSize(currentCard.definition);
  termElement.style.fontSize = termFontSize;
  definitionElement.style.fontSize = definitionFontSize;
}

function showNextCard() {
  currentIndex = (currentIndex + 1) % terms.length;
  showCurrentCard();
  notecardElement.classList.remove('flipped');
}

notecardElement.addEventListener('click', () => {
  notecardElement.classList.toggle('flipped');
});

nextButton.addEventListener('click', showNextCard);

showCurrentCard();
