const questions = [
    {
        question: "Why is goal setting important?",
        answer: "Goal setting is important because it helps you plan, focus, and measure your progress. By setting goals, you create a roadmap for your success and a way to stay motivated."
    },
    {
        question: "What are SMART goals?",
        answer: "SMART goals are goals that are Specific, Measurable, Achievable, Relevant, and Time-bound. This framework helps you create effective goals that are clear, trackable, and achievable within a specific timeframe."
    },
    {
        question: "How can I stay motivated to achieve my goals?",
        answer: "To stay motivated, break your goals down into smaller, manageable tasks. Celebrate your accomplishments, find an accountability partner, and remind yourself of the reasons behind your goals. Also, review and adjust your goals as needed."
    },
    {
        question: "What is the best way to track my goals?",
        answer: "There are many ways to track goals, such as using a journal, spreadsheet, or goal-tracking app. Choose a method that works best for you, and make sure to regularly review and update your progress."
    },
    {
        question: "How often should I review my goals?",
        answer: "It's a good idea to review your goals regularly. This can be done daily, weekly, or monthly, depending on the nature of your goals. Regular reviews help you stay on track and make adjustments as needed."
    },
    {
        question: "What if I don't achieve my goals?",
        answer: "If you don't achieve your goals, it's important to assess why and learn from the experience. Consider whether your goals were realistic, if you had the necessary resources, and if you were truly committed to achieving them. Use this information to adjust your approach and set new goals."
    },
    {
        question: "How can I set realistic goals?",
        answer: "To set realistic goals, consider your current situation, resources, and abilities. Break your goals down into smaller, achievable steps, and make sure your goals are challenging but attainable within a specific timeframe."
    },
    {
        question: "What are some common obstacles to achieving goals?",
        answer: "Common obstacles to achieving goals include lack of motivation, poor time management, unrealistic expectations, lack of resources, and fear of failure. Identifying and addressing these obstacles can help improve your chances of success."
    }
];

const faqAccordion = document.getElementById('faqAccordion');

questions.forEach((item, index) => {
    const faqItem = `
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                    ${item.question}
                </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                    ${item.answer}
                </div>
            </div>
        </div>
    `;
    faqAccordion.innerHTML += faqItem;
});
