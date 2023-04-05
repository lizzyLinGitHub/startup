const goals = [
    { id: 1, description: 'Learn Python' },
    { id: 2, description: 'Start a blog' },
    { id: 3, description: 'Run a marathon' },
];

const quotes = [
    { author: 'Nelson Mandela', text: 'It always seems impossible until it\'s done.' },
    { author: 'Steve Jobs', text: 'Your time is limited, don\'t waste it living someone else\'s life.' },
    { author: 'Oprah Winfrey', text: 'You become what you believe.' },
];

let currentQuoteIndex = 0;

function displayGoals() {
    const goalsList = document.getElementById('goals-list');
    goals.forEach(goal => {
        const goalItem = document.createElement('li');
        goalItem.textContent = goal.description;
        goalItem.classList.add('goal');
        goalsList.appendChild(goalItem);
    });
}

function displayQuote(index) {
    const quote = quotes[index];
    const quoteText = document.getElementById('quote-text');
    quoteText.textContent = `${quote.text} - ${quote.author}`;
}

document.getElementById('prev-quote').addEventListener('click', () => {
    currentQuoteIndex--;
    if (currentQuoteIndex < 0) {
        currentQuoteIndex = quotes.length - 1;
    }
    displayQuote(currentQuoteIndex);
});

document.getElementById('next-quote').addEventListener('click', () => {
    currentQuoteIndex++;
    if (currentQuoteIndex >= quotes.length) {
        currentQuoteIndex = 0;
    }
    displayQuote(currentQuoteIndex);
});

displayGoals();
displayQuote(currentQuoteIndex);
