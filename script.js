// Fetch quote
async function fetchQuote() {
    try {
        const response = await fetch("https://api.quotable.io/random");
        const data = await response.json();
        document.getElementById("quote-text").innerText = data.content;
        document.getElementById("quote-author").innerText = `- ${data.author}`;
    } catch (error) {
        console.error("Error fetching quote:", error);
    }
}

// Add event listener to fetch new quote
document.getElementById("next-quote").addEventListener("click", fetchQuote);

// Add goal form submission
document.getElementById("goal-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const goalInput = document.getElementById("goal-input");
    const goalDate = document.getElementById("goal-date");

    if (goalInput.value && goalDate.value) {
        const newGoalItem = document.createElement("li");
        newGoalItem.textContent = `${goalInput.value} (Due: ${goalDate.value})`;
        document.getElementById("goals").appendChild(newGoalItem);

        goalInput.value = "";
        goalDate.value = "";
    }
});

// Calendar functionality
// Rest of the script.js code

document.addEventListener("DOMContentLoaded", function () {
    // FullCalendar initialization
    const calendarEl = document.getElementById("calendar");
  
    if (calendarEl) {
      // Load stored goals from localStorage
      const storedGoals = JSON.parse(localStorage.getItem("goals")) || [];
  
      // Convert stored goals to events
      const events = storedGoals.map(function (goal) {
        return {
          title: goal.text,
          start: goal.date,
        };
      });
  
      $(calendarEl).fullCalendar({
        header: {
          left: "prev,next today",
          center: "title",
          right: "month,agendaWeek,agendaDay",
        },
        events: events,
      });
    }
  });
  

const addGoalButton = document.getElementById("add-goal");
const newGoalInput = document.getElementById("new-goal");
const newGoalDateInput = document.getElementById("new-goal-date");

if (addGoalButton) {
  addGoalButton.addEventListener("click", function () {
    const goalText = newGoalInput.value;
    const goalDate = newGoalDateInput.value;

    if (goalText && goalDate) {
      const goal = { text: goalText, date: goalDate };
      const goals = JSON.parse(localStorage.getItem("goals")) || [];
      goals.push(goal);
      localStorage.setItem("goals", JSON.stringify(goals));
      newGoalInput.value = "";
      newGoalDateInput.value = "";
      displayGoals();
    }
  });
}

const { MongoClient } = require('mongodb');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

const url = `mongodb+srv://${userName}:${password}@${hostname}`;
const client = new MongoClient(url);
const collection = client.db('authTest').collection('user');

app.use(cookieParser());
app.use(express.json());

// createAuthorization from the given credentials
app.post('/auth/create', async (req, res) => {
  if (await getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({
      id: user._id,
    });
  }
});

// loginAuthorization from the given credentials
app.post('/auth/login', async (req, res) => {
  const user = await getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// getMe for the currently authenticated user
app.get('/user/me', async (req, res) => {
  authToken = req.cookies['token'];
  const user = await collection.findOne({ token: authToken });
  if (user) {
    res.send({ email: user.email });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

function getUser(email) {
  return collection.findOne({ email: email });
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await collection.insertOne(user);

  return user;
}

function setAuthCookie(res, authToken) {
  res.cookie('token', authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

const port = 8080;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});