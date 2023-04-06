document.addEventListener('DOMContentLoaded', async () => {
    const calendarElement = document.getElementById('calendar');
    const goals = await fetchGoalsFromServer();
  
    // Initialize calendar
    const calendar = new FullCalendar.Calendar(calendarElement, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: goals.map(goal => ({
        title: goal.goal,
        start: goal.dueDate,
        allDay: true
      })),
    });
  
    calendar.render();
  });
  
  
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

  function getUserName() {
    return localStorage.getItem('userName') ?? 'Mystery Goal Setter';
  }