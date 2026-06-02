/**
 * AuthService: Handles user registration, sessions, login, logout,
 * and page auth guards for LearnSprint AI.
 */

const AuthService = {
  // Get active session user
  getCurrentUser() {
    const session = localStorage.getItem('LearnSprint_session');
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch (e) {
      console.error("Failed to parse user session", e);
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  // Login handler
  login(email, password) {
    const users = JSON.parse(localStorage.getItem('LearnSprint_users') || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
      const sessionData = {
        name: user.name,
        email: user.email,
        joined: user.joined || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        skill: user.skill || 'None selected',
        level: user.level || 'Beginner',
        score: user.score !== undefined ? user.score : null,
        streak: user.streak || 0,
        hours: user.hours || 0,
        modules: user.modules || 0
      };
      localStorage.setItem('LearnSprint_session', JSON.stringify(sessionData));
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  },

  // Registration handler
  signup(name, email, password) {
    const users = JSON.parse(localStorage.getItem('LearnSprint_users') || '[]');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email address is already registered.' };
    }

    const newUser = {
      name,
      email,
      password,
      joined: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      skill: 'None selected',
      level: 'Beginner',
      score: null,
      streak: 0,
      hours: 0,
      modules: 0
    };

    users.push(newUser);
    localStorage.setItem('LearnSprint_users', JSON.stringify(users));

    // Sign in automatically
    localStorage.setItem('LearnSprint_session', JSON.stringify({
      name: newUser.name,
      email: newUser.email,
      joined: newUser.joined,
      skill: newUser.skill,
      level: newUser.level,
      score: newUser.score,
      streak: newUser.streak,
      hours: newUser.hours,
      modules: newUser.modules
    }));

    return { success: true };
  },

  // Password reset handler
  resetPassword(email, newPassword) {
    const users = JSON.parse(localStorage.getItem('LearnSprint_users') || '[]');
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('LearnSprint_users', JSON.stringify(users));
      return { success: true };
    }
    return { success: false, message: 'Email address not found in our database.' };
  },

  // Sync session changes back to user database
  syncSession(updatedUser) {
    localStorage.setItem('LearnSprint_session', JSON.stringify(updatedUser));
    
    // Also save in users list
    const users = JSON.parse(localStorage.getItem('LearnSprint_users') || '[]');
    const userIndex = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (userIndex !== -1) {
      users[userIndex].name = updatedUser.name;
      users[userIndex].skill = updatedUser.skill;
      users[userIndex].level = updatedUser.level;
      users[userIndex].score = updatedUser.score;
      users[userIndex].streak = updatedUser.streak;
      users[userIndex].hours = updatedUser.hours;
      users[userIndex].modules = updatedUser.modules;
      localStorage.setItem('LearnSprint_users', JSON.stringify(users));
    }
  },

  // Log user out
  logout() {
    localStorage.removeItem('LearnSprint_session');
    window.location.href = 'login.html';
  },

  // Session guard for dashboards/profile/etc.
  guardPage() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
};
