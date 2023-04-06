document.addEventListener('DOMContentLoaded', () => {
    const calendarElement = document.getElementById('calendar');
    const goals = [
      // Fetch goals data from your server
      // Example: { title: 'Goal 1', dueDate: '2023-04-10' }
    ];
  
    // Initialize calendar
    const calendar = new FullCalendar.Calendar(calendarElement, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: goals.map(goal => ({
        title: goal.title,
        start: goal.dueDate,
        allDay: true
      })),
    });
  
    calendar.render();
  });
  
  
  