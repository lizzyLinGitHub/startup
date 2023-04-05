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

document.getElementById("add-goal-btn").addEventListener("click", function () {
    const goalInput = document.getElementById("new-goal");
    const goalText = goalInput.value.trim();

    if (goalText) {
        const goalItem = document.createElement("li");
        goalItem.classList.add("goal");
        goalItem.innerText = goalText;
        document.getElementById("goals-list").appendChild(goalItem);
        goalInput.value = "";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(function (item) {
        item.querySelector(".faq-question").addEventListener("click", function () {
            const answer = item.querySelector(".faq-answer");
            answer.style.display = answer.style.display === "block" ? "none" : "block";
        });
    });
});


// Calendar functionality

$(document).ready(function () {
    if ($("#calendar").length) {
        $("#calendar").fullCalendar({
            header: {
                left: "prev,next today",
                center: "title",
                right: "month,agendaWeek,agendaDay",
            },
            defaultDate: new Date(),
            navLinks: true,
            editable: true,
            eventLimit: true,
        });
    }
});
