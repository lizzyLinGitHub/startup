// FullCalendar v5 initialization
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("calendar")) {
        var calendarEl = document.getElementById("calendar");
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
            },
            editable: true,
            selectable: true,
            navLinks: true,
        });
        calendar.render();
    }
});

// FAQ accordion functionality
document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(function (item) {
        item.querySelector(".faq-question").addEventListener("click", function () {
            const answer = item.querySelector(".faq-answer");
            answer.style.display = answer.style.display === "block" ? "none" : "block";
        });
    });
});

// Quote functionality
function nextQuote() {
    fetch("https://api.quotable.io/random")
        .then((response) => response.json())
        .then((data) => {
            const quote = data.content;
            const author = data.author;
            document.getElementById("quote").innerText = quote;
            document.getElementById("author").innerText = author;
        })
        .catch((error) => {
            console.error("Error fetching quote:", error);
            document.getElementById("quote").innerText = "Error fetching quote";
            document.getElementById("author").innerText = "";
        });
}

// Fetch the initial quote when the page loads
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("quote-carousel")) {
        nextQuote();
    }
});

// Add event listener to the Next button
document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("next-button");
    if (nextButton) {
        nextButton.addEventListener("click", nextQuote);
    }
});
