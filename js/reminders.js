/**
 * RemindersController: Manages creation, list rendering, toggling, 
 * editing, and deleting of study reminders inside Local Storage.
 */

class RemindersController {
  constructor() {
    this.sessionUser = null;
    this.storageKey = "";
    this.remindersList = [];
    this.editingId = null; // Stored ID when updating an item

    this.init();
  }

  init() {
    // 1. Fetch user session
    if (typeof AuthService !== 'undefined') {
      this.sessionUser = AuthService.getCurrentUser();
    }
    
    if (!this.sessionUser) return;
    
    this.storageKey = `cogniflow_reminders_${this.sessionUser.email.toLowerCase()}`;
    
    // 2. Load lists
    this.loadReminders();

    // 3. Bind form submit
    const form = document.getElementById('reminder-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // 4. Bind Cancel Edit button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.exitEditMode());
    }

    // 5. Render lists initial
    this.render();
  }

  loadReminders() {
    try {
      this.remindersList = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      console.error("Failed to parse reminders", e);
      this.remindersList = [];
    }
  }

  saveReminders() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.remindersList));
    this.render();
  }

  handleSubmit(e) {
    e.preventDefault();

    const topicInput = document.getElementById('reminder-topic');
    const dateInput = document.getElementById('reminder-date');
    const timeInput = document.getElementById('reminder-time');

    if (!topicInput || !dateInput || !timeInput) return;

    const topic = topicInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    if (!topic || !date || !time) return;

    if (this.editingId !== null) {
      // Edit Mode
      const index = this.remindersList.findIndex(r => r.id === this.editingId);
      if (index !== -1) {
        this.remindersList[index].topic = topic;
        this.remindersList[index].date = date;
        this.remindersList[index].time = time;
      }
      this.exitEditMode();
    } else {
      // Create Mode
      const newReminder = {
        id: Date.now(),
        topic,
        date,
        time,
        completed: false
      };
      this.remindersList.push(newReminder);
    }

    // Save and reset
    this.saveReminders();
    
    const form = document.getElementById('reminder-form');
    if (form) form.reset();
  }

  deleteReminder(id) {
    this.remindersList = this.remindersList.filter(r => r.id !== id);
    if (this.editingId === id) {
      this.exitEditMode();
    }
    this.saveReminders();
  }

  toggleComplete(id) {
    const index = this.remindersList.findIndex(r => r.id === id);
    if (index !== -1) {
      this.remindersList[index].completed = !this.remindersList[index].completed;
      
      // Sync simulated modular updates to dashboard stats if completing
      if (this.remindersList[index].completed) {
        const user = this.sessionUser;
        user.modules = (user.modules || 0) + 1;
        user.hours = (user.hours || 0) + 2;
        if (typeof AuthService !== 'undefined') {
          AuthService.syncSession(user);
          // Sync header streak
          if (typeof populateUserSessionData === 'function') {
            populateUserSessionData();
          }
        }
      }
    }
    this.saveReminders();
  }

  enterEditMode(reminder) {
    this.editingId = reminder.id;

    const topicInput = document.getElementById('reminder-topic');
    const dateInput = document.getElementById('reminder-date');
    const timeInput = document.getElementById('reminder-time');
    const submitBtn = document.getElementById('submit-reminder-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const formTitle = document.getElementById('reminder-form-title');

    if (topicInput) topicInput.value = reminder.topic;
    if (dateInput) dateInput.value = reminder.date;
    if (timeInput) timeInput.value = reminder.time;

    if (submitBtn) submitBtn.innerHTML = `<i class="fas fa-save"></i> Save Updates`;
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';
    if (formTitle) formTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Reminder`;
  }

  exitEditMode() {
    this.editingId = null;

    const form = document.getElementById('reminder-form');
    if (form) form.reset();

    const submitBtn = document.getElementById('submit-reminder-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const formTitle = document.getElementById('reminder-form-title');

    if (submitBtn) submitBtn.innerHTML = `<i class="fas fa-plus"></i> Save Reminder`;
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (formTitle) formTitle.innerHTML = `<i class="fas fa-plus-circle"></i> Create Reminder`;
  }

  render() {
    const container = document.getElementById('reminders-list-container');
    if (!container) return;

    if (this.remindersList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
          <i class="fas fa-bell-slash" style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 12px; display: block;"></i>
          <h4 style="font-weight: 600; margin-bottom: 4px;">No Reminders Set</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Use the form on the left to schedule your study sessions.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    // Sort by date, then time
    const sorted = [...this.remindersList].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    sorted.forEach(reminder => {
      const card = document.createElement('div');
      card.className = `card ${reminder.completed ? 'completed-reminder' : ''}`;
      card.style.padding = '18px';
      card.style.marginBottom = '12px';
      card.style.borderLeft = reminder.completed ? '4px solid var(--color-success)' : '4px solid var(--accent-blue)';
      
      // Escape HTML
      const escapedTopic = reminder.topic.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[tag] || tag));

      // Format date
      const dateObj = new Date(reminder.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Format time (12-hour)
      const [hour, min] = reminder.time.split(':');
      let displayTime = '';
      if (hour && min) {
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        displayTime = `${displayHour}:${min} ${ampm}`;
      } else {
        displayTime = reminder.time;
      }

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
          <div style="min-width: 0;">
            <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; text-decoration: ${reminder.completed ? 'line-through' : 'none'}; color: ${reminder.completed ? 'var(--text-secondary)' : 'var(--text-primary)'};">
              ${escapedTopic}
            </h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-secondary);">
              <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
              <span><i class="far fa-clock"></i> ${displayTime}</span>
              ${reminder.completed ? '<span class="badge badge-success" style="padding: 1px 6px; font-size: 0.65rem;">Completed</span>' : '<span class="badge badge-blue" style="padding: 1px 6px; font-size: 0.65rem;">Pending</span>'}
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <!-- Complete toggle -->
            <button class="btn btn-secondary complete-btn" title="${reminder.completed ? 'Mark incomplete' : 'Mark completed'}" style="padding: 6px 10px;">
              <i class="fas ${reminder.completed ? 'fa-undo' : 'fa-check'}" style="color: ${reminder.completed ? 'var(--text-secondary)' : 'var(--color-success)'}"></i>
            </button>
            <!-- Edit -->
            <button class="btn btn-secondary edit-btn" title="Edit reminder" style="padding: 6px 10px;" ${reminder.completed ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
              <i class="fas fa-edit"></i>
            </button>
            <!-- Delete -->
            <button class="btn btn-secondary delete-btn" title="Delete reminder" style="padding: 6px 10px;">
              <i class="fas fa-trash-alt" style="color: var(--color-danger)"></i>
            </button>
          </div>
        </div>
      `;

      // Event bindings
      card.querySelector('.complete-btn').onclick = () => this.toggleComplete(reminder.id);
      
      const editBtn = card.querySelector('.edit-btn');
      if (editBtn && !reminder.completed) {
        editBtn.onclick = () => this.enterEditMode(reminder);
      }

      card.querySelector('.delete-btn').onclick = () => this.deleteReminder(reminder.id);

      container.appendChild(card);
    });
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new RemindersController();
});
