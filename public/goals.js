const GoalEntered = 'GoalSet'

async function fetchGoals() {
  const goals = await fetchGoalsFromServer();

  const goalList = document.getElementById('goalList');
  goalList.innerHTML = '';

  goals.forEach((goal) => {
    const goalItem = document.createElement('div');
    goalItem.className = 'list-group-item';
    goalItem.innerText = `${goal.goal} (Due: ${goal.dueDate})`;
    goalList.appendChild(goalItem);
  });

  configureWebSocket();
}

async function fetchGoalsFromServer() {

  try {
    const response = await fetch('/api/goals/'+getUserName());
    goals = await response.json();

    localStorage.setItem('goals', JSON.stringify('goals'));
  } catch {
    const goalsText = localStorage.getItem('goals');
    if (goalsText) {
      goals = JSON.parse(goalsText);
    }
  }

  console.log(goals);
  return goals;
}

function addNewGoal() {
  const newGoalInput = document.getElementById('newGoalInput');
  const newGoalDueDateInput = document.getElementById('newGoalDueDate');
  const newGoal = newGoalInput.value;
  const newGoalDueDate = newGoalDueDateInput.value;

  saveGoal(newGoal, newGoalDueDate);

  const goalList = document.getElementById('goalList');
  const goalItem = document.createElement('div');
  goalItem.className = 'list-group-item';
  goalItem.innerText = `${newGoal} (Due: ${newGoalDueDate})`;
  goalList.appendChild(goalItem);
  newGoalInput.value = '';
  newGoalDueDateInput.value = '';

  broadcastEvent(getUserName(), GoalEntered)
}

function getUserName() {
  return localStorage.getItem('userName') ?? 'Mystery Goal Setter';
}

async function saveGoal(newGoal, newGoalDueDate) {
  const userName = getUserName();
  const goalToAdd = { user: userName, goal: newGoal, dueDate: newGoalDueDate };

  try {
    const response = await fetch('/api/addGoal', {
      method: 'POST',
      headers : { 'content-type': 'application/json' },
      body: JSON.stringify(goalToAdd),
    });

    const goals = await response.json();
    localStorage.setItem('goals', JSON.stringify(goals));
  } catch {
    updateGoalsLocal(goalToAdd);
  }
}


async function fetchRandomQuote() {
  try {
    const response = await fetch('https://api.quotable.io/random');
    if (response.ok) {
      const quoteData = await response.json();
      return { quote: quoteData.content, author: quoteData.author };
    } else {
      console.error('Error fetching quote:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

function addQuoteSlide(quote, author, isActive = false) {
  const carouselInner = document.querySelector('.carousel-inner');

  const carouselItem = document.createElement('div');
  carouselItem.classList.add('carousel-item');
  if (isActive) carouselItem.classList.add('active');

  const blockquote = document.createElement('blockquote');
  blockquote.classList.add('blockquote', 'text-center');

  const quoteText = document.createElement('p');
  quoteText.classList.add('mb-0');
  quoteText.textContent = quote;

  const carouselDiv = document.createElement('div');

  const quoteFooter = document.createElement('footer');
  quoteFooter.classList.add('blockquote-footer');
  quoteFooter.textContent = author;

  blockquote.appendChild(quoteText);
  blockquote.appendChild(carouselDiv)
  blockquote.appendChild(quoteFooter);
  carouselItem.appendChild(blockquote);
  carouselInner.appendChild(carouselItem);
}

document.addEventListener('DOMContentLoaded', async () => {
  fetchGoals();

  for (let i = 0; i < 3; i++) {
    const quoteData = await fetchRandomQuote();
    if (quoteData) {
      addQuoteSlide(quoteData.quote, quoteData.author, i === 0);
    }
  }
});


function configureWebSocket() {
  const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
  this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
  this.socket.onopen = (event) => {
    this.displayMsg('system', 'user', 'connected');
  };
  this.socket.onclose = (event) => {
    this.displayMsg('system', 'user', 'disconnected');
  };
  this.socket.onmessage = async (event) => {
    const msg = JSON.parse(await event.data.text());
    if (msg.type === GoalEntered) {
      this.displayMsg('user', msg.from, `set new goal`);
    } else if (msg.type === GameStartEvent) {
      this.displayMsg('player', msg.from, `started a new game`);
    }
  };
}

function displayMsg(cls, from, msg) {
  const chatText = document.querySelector('#user-messages');
  chatText.innerHTML =
    `<div class="event"><span class="${cls}-event">${from}</span> ${msg}</div>` + chatText.innerHTML;
}

function broadcastEvent(from, type) {
  const event = {
    from: from,
    type: type,
  };
  this.socket.send(JSON.stringify(event));
}
