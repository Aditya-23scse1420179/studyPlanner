/**
 * AuthService: Handles user registration, sessions, login, logout,
 * and page auth guards for LearnSprint AI, connected to the Render backend API.
 */

// Safe localStorage retrieval with Base64 decode for sensitive keys
window.safeLocalStorageGet = function(key) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    
    const sensitiveKeys = [
      'LearnSprint_session',
      'LearnSprint_cached_',
      'LearnSprint_quiz_history_',
      'LearnSprint_reminders_',
      'LearnSprint_last_active_date_',
      'LearnSprint_feedback_submissions',
      'LearnSprint_improvements'
    ];
    const isSensitive = sensitiveKeys.some(sk => key.startsWith(sk));
    
    if (isSensitive) {
      try {
        return atob(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  } catch (error) {
    console.error("Failed to read from localStorage", error);
    return null;
  }
};

// Safe localStorage write with Base64 encode for sensitive keys and quota protection
window.safeLocalStorageSet = function(key, value) {
  try {
    let valueToStore = value;
    const sensitiveKeys = [
      'LearnSprint_session',
      'LearnSprint_cached_',
      'LearnSprint_quiz_history_',
      'LearnSprint_reminders_',
      'LearnSprint_last_active_date_',
      'LearnSprint_feedback_submissions',
      'LearnSprint_improvements'
    ];
    const isSensitive = sensitiveKeys.some(sk => key.startsWith(sk));
    
    if (isSensitive) {
      valueToStore = btoa(value);
    }
    localStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22
    ) {
      if (typeof AuthService !== 'undefined' && AuthService.showToast) {
        AuthService.showToast("Storage quota exceeded! Please clear some space in your browser.", "error");
      } else {
        alert("Storage quota exceeded! Please clear some space in your browser.");
      }
    }
    return false;
  }
};

// Centralized HTML Sanitizer and Text Escaper
const SecurityService = {
  sanitizeHTML(html) {
    if (typeof DOMPurify !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
      return DOMPurify.sanitize(html);
    }
    // Strict fallback HTML escape to prevent XSS if DOMPurify is not loaded
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  },
  
  escapeText(text) {
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.innerHTML;
  }
};

const API_BASE_URL = 'https://learnsprint-backend-1.onrender.com/api/v1';

const AuthService = {
  // Get active session
  getCurrentSession() {
    const session = window.safeLocalStorageGet('LearnSprint_session');
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch (e) {
      console.error("Failed to parse user session", e);
      return null;
    }
  },

  // Get active session user details
  getCurrentUser() {
    const session = this.getCurrentSession();
    if (!session) return null;
    return session.user || null;
  },

  // Check if authenticated
  isAuthenticated() {
    const session = this.getCurrentSession();
    return session && session.accessToken ? true : false;
  },

  // Login handler using backend API
  async login(email, password) {
    if (navigator.onLine === false) {
      AuthService.showToast("You are currently offline. Please check your internet connection.", "warning");
      return { success: false, message: 'You are offline. Please check your internet connection and try again.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        let errMsg = resData.message || 'Login failed.';
        if (resData.errors && Array.isArray(resData.errors)) {
          const details = resData.errors.map(err => err.message).join(', ');
          errMsg = `${errMsg}: ${details}`;
        }
        return { success: false, message: errMsg };
      }

      // Backend returns tokens at top-level or data-level
      const data = resData.data || resData;
      const emailLower = email.toLowerCase();
      const sessionData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          name: data.user?.fullName || data.user?.name || email.split('@')[0],
          email: data.user?.email || email,
          joined: data.user?.createdAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          skill: window.safeLocalStorageGet(`LearnSprint_cached_skill_${emailLower}`) || 'None selected',
          level: window.safeLocalStorageGet(`LearnSprint_cached_level_${emailLower}`) || 'Beginner',
          score: null,
          streak: parseInt(window.safeLocalStorageGet(`LearnSprint_cached_streak_${emailLower}`)) || 0,
          hours: parseFloat(window.safeLocalStorageGet(`LearnSprint_cached_hours_${emailLower}`)) || 0,
          modules: parseInt(window.safeLocalStorageGet(`LearnSprint_cached_modules_${emailLower}`)) || 0
        }
      };

      window.safeLocalStorageSet('LearnSprint_session', JSON.stringify(sessionData));

      // Fetch latest profile from backend database to restore progress
      try {
        const profile = await ApiService.getProfile();
        if (profile) {
          sessionData.user.skill = profile.skill || sessionData.user.skill;
          sessionData.user.level = profile.level || sessionData.user.level;
          sessionData.user.score = profile.score !== undefined && profile.score !== null ? profile.score : sessionData.user.score;
          sessionData.user.streak = profile.streak !== undefined && profile.streak !== null ? parseInt(profile.streak) : sessionData.user.streak;
          sessionData.user.hours = profile.hours !== undefined && profile.hours !== null ? parseFloat(profile.hours) : sessionData.user.hours;
          sessionData.user.modules = profile.modules !== undefined && profile.modules !== null ? parseInt(profile.modules) : sessionData.user.modules;
          
          window.safeLocalStorageSet('LearnSprint_session', JSON.stringify(sessionData));

          // Also update recovery caches
          window.safeLocalStorageSet(`LearnSprint_cached_skill_${emailLower}`, sessionData.user.skill);
          window.safeLocalStorageSet(`LearnSprint_cached_level_${emailLower}`, sessionData.user.level);
          window.safeLocalStorageSet(`LearnSprint_cached_streak_${emailLower}`, String(sessionData.user.streak));
          window.safeLocalStorageSet(`LearnSprint_cached_hours_${emailLower}`, String(sessionData.user.hours));
          window.safeLocalStorageSet(`LearnSprint_cached_modules_${emailLower}`, String(sessionData.user.modules));
        }
      } catch (err) {
        console.warn("Could not fetch user profile from backend on login:", err);
      }

      return { success: true };
    } catch (error) {
      console.error("API login request error", error);
      AuthService.showToast("Server connection failed. Try again.", "error");
      return { success: false, message: 'Server connection failed. Try again.' };
    }
  },

  // Signup handler using backend API
  async signup(name, email, password) {
    if (navigator.onLine === false) {
      AuthService.showToast("You are currently offline. Please check your internet connection.", "warning");
      return { success: false, message: 'You are offline. Please check your internet connection.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        let errMsg = resData.message || 'Signup failed.';
        if (resData.errors && Array.isArray(resData.errors)) {
          const details = resData.errors.map(err => err.message).join(', ');
          errMsg = `${errMsg}: ${details}`;
        }
        return { success: false, message: errMsg };
      }

      return { success: true, message: 'OTP sent to your email.' };
    } catch (error) {
      console.error("API signup request error", error);
      AuthService.showToast("Server connection failed.", "error");
      return { success: false, message: 'Server connection failed.' };
    }
  },

  // Verify OTP handler
  async verifyOtp(email, otp) {
    if (navigator.onLine === false) {
      AuthService.showToast("You are currently offline. Please check your internet connection.", "warning");
      return { success: false, message: 'You are offline. Please check your internet connection.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const resData = await response.json();
      if (!response.ok) {
        return { success: false, message: resData.message || 'OTP verification failed.' };
      }

      const data = resData.data || resData;
      const sessionData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          name: data.user?.fullName || data.user?.name || email.split('@')[0],
          email: data.user?.email || email,
          joined: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          skill: 'None selected',
          level: 'Beginner',
          score: null,
          streak: 0,
          hours: 0,
          modules: 0
        }
      };

      window.safeLocalStorageSet('LearnSprint_session', JSON.stringify(sessionData));
      return { success: true };
    } catch (error) {
      console.error("API OTP verification error", error);
      AuthService.showToast("Server connection failed.", "error");
      return { success: false, message: 'Server connection failed.' };
    }
  },

  // Resend OTP handler
  async resendOtp(email) {
    if (navigator.onLine === false) {
      AuthService.showToast("You are currently offline. Please check your internet connection.", "warning");
      return { success: false, message: 'You are offline. Please check your internet connection.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const resData = await response.json();
      if (!response.ok) {
        return { success: false, message: resData.message || 'Resending OTP failed.' };
      }

      return { success: true };
    } catch (error) {
      console.error("API resend OTP error", error);
      AuthService.showToast("Server connection failed.", "error");
      return { success: false, message: 'Server connection failed.' };
    }
  },

  // Sync profile details with local cache
  syncSession(updatedUser) {
    const session = this.getCurrentSession();
    if (!session) return;
    
    // Explicitly allow-list/map permitted user fields to prevent mass assignment
    const permittedUser = {
      name: String(updatedUser.name || ''),
      email: String(updatedUser.email || ''),
      joined: String(updatedUser.joined || ''),
      skill: String(updatedUser.skill || 'None selected'),
      level: String(updatedUser.level || 'Beginner'),
      score: updatedUser.score !== undefined && updatedUser.score !== null ? Number(updatedUser.score) : null,
      streak: Number(updatedUser.streak || 0),
      hours: Number(updatedUser.hours || 0),
      modules: Number(updatedUser.modules || 0)
    };
    
    session.user = permittedUser;
    window.safeLocalStorageSet('LearnSprint_session', JSON.stringify(session));

    const emailLower = permittedUser.email.toLowerCase();
    // Cache stats for recovery using safe storage
    window.safeLocalStorageSet(`LearnSprint_cached_skill_${emailLower}`, permittedUser.skill);
    window.safeLocalStorageSet(`LearnSprint_cached_level_${emailLower}`, permittedUser.level);
    window.safeLocalStorageSet(`LearnSprint_cached_streak_${emailLower}`, String(permittedUser.streak));
    window.safeLocalStorageSet(`LearnSprint_cached_hours_${emailLower}`, String(permittedUser.hours));
    window.safeLocalStorageSet(`LearnSprint_cached_modules_${emailLower}`, String(permittedUser.modules));

    // Persist to backend database via patch request
    if (navigator.onLine) {
      ApiService.updateProfile({
        skill: permittedUser.skill,
        level: permittedUser.level,
        score: permittedUser.score,
        streak: permittedUser.streak,
        hours: permittedUser.hours,
        modules: permittedUser.modules
      }).catch(err => {
        console.warn("Failed to persist profile sync to backend", err);
      });
    }
  },

  // Log user out using API
  async logout() {
    const session = this.getCurrentSession();
    if (session) {
      if (session.user && session.user.email) {
        const emailLower = session.user.email.toLowerCase();
        localStorage.removeItem(`LearnSprint_cached_skill_${emailLower}`);
        localStorage.removeItem(`LearnSprint_cached_level_${emailLower}`);
        localStorage.removeItem(`LearnSprint_cached_streak_${emailLower}`);
        localStorage.removeItem(`LearnSprint_cached_hours_${emailLower}`);
        localStorage.removeItem(`LearnSprint_cached_modules_${emailLower}`);
        localStorage.removeItem(`LearnSprint_last_active_date_${emailLower}`);
        localStorage.removeItem(`LearnSprint_quiz_history_${emailLower}`);
        localStorage.removeItem(`LearnSprint_reminders_${emailLower}`);
      }
      if (session.accessToken && session.refreshToken) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`
            },
            body: JSON.stringify({ refreshToken: session.refreshToken })
          });
        } catch (e) {
          console.error("Logout request to backend failed", e);
        }
      }
    }

    // Also remove global fallback keys
    localStorage.removeItem('LearnSprint_session');
    localStorage.removeItem('LearnSprint_cached_skill');
    localStorage.removeItem('LearnSprint_cached_level');
    localStorage.removeItem('LearnSprint_cached_streak');
    localStorage.removeItem('LearnSprint_cached_hours');
    localStorage.removeItem('LearnSprint_cached_modules');
    localStorage.removeItem('LearnSprint_last_active_date');
    localStorage.removeItem('LearnSprint_quiz_history');

    window.location.href = 'login.html';
  },

  // Simulated resetPassword method
  async resetPassword(email, newPassword) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Password reset code verified. Your password has been updated (simulation).' });
      }, 1000);
    });
  },

  checkStreakValidity() {
    const session = this.getCurrentSession();
    if (!session || !session.user) return;

    const emailLower = session.user.email.toLowerCase();
    const todayStr = new Date().toLocaleDateString('en-CA');
    const lastActiveStr = window.safeLocalStorageGet(`LearnSprint_last_active_date_${emailLower}`);

    if (lastActiveStr) {
      const today = new Date(todayStr);
      const lastActive = new Date(lastActiveStr);
      const diffTime = today - lastActive;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Broke streak! Reset to 0
        session.user.streak = 0;
        this.syncSession(session.user);
      }
    }
  },

  updateStreakOnActivity() {
    const session = this.getCurrentSession();
    if (!session || !session.user) return;

    const emailLower = session.user.email.toLowerCase();
    const todayStr = new Date().toLocaleDateString('en-CA');
    const lastActiveStr = window.safeLocalStorageGet(`LearnSprint_last_active_date_${emailLower}`);

    if (!lastActiveStr) {
      session.user.streak = 1;
      window.safeLocalStorageSet(`LearnSprint_last_active_date_${emailLower}`, todayStr);
      this.syncSession(session.user);
    } else if (lastActiveStr !== todayStr) {
      const today = new Date(todayStr);
      const lastActive = new Date(lastActiveStr);
      const diffTime = today - lastActive;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        session.user.streak = (session.user.streak || 0) + 1;
      } else if (diffDays > 1) {
        session.user.streak = 1;
      }
      window.safeLocalStorageSet(`LearnSprint_last_active_date_${emailLower}`, todayStr);
      this.syncSession(session.user);
    }
  },

  // Page guard
  guardPage() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    } else {
      this.checkStreakValidity();
      // Periodically sync profile from backend database to ensure consistency
      this.syncFromBackend();
    }
  },

  async syncFromBackend() {
    if (!navigator.onLine) return;
    try {
      const profile = await ApiService.getProfile();
      if (profile) {
        const session = this.getCurrentSession();
        if (session && session.user) {
          const user = session.user;
          let changed = false;
          
          if (profile.skill && profile.skill !== user.skill) { user.skill = profile.skill; changed = true; }
          if (profile.level && profile.level !== user.level) { user.level = profile.level; changed = true; }
          if (profile.score !== undefined && profile.score !== null && profile.score !== user.score) { user.score = profile.score; changed = true; }
          if (profile.streak !== undefined && profile.streak !== null && parseInt(profile.streak) !== user.streak) { user.streak = parseInt(profile.streak); changed = true; }
          if (profile.hours !== undefined && profile.hours !== null && parseFloat(profile.hours) !== user.hours) { user.hours = parseFloat(profile.hours); changed = true; }
          if (profile.modules !== undefined && profile.modules !== null && parseInt(profile.modules) !== user.modules) { user.modules = parseInt(profile.modules); changed = true; }
          
          if (changed) {
            const permittedUser = {
              name: String(user.name || ''),
              email: String(user.email || ''),
              joined: String(user.joined || ''),
              skill: String(user.skill || 'None selected'),
              level: String(user.level || 'Beginner'),
              score: user.score !== undefined && user.score !== null ? Number(user.score) : null,
              streak: Number(user.streak || 0),
              hours: Number(user.hours || 0),
              modules: Number(user.modules || 0)
            };
            
            session.user = permittedUser;
            window.safeLocalStorageSet('LearnSprint_session', JSON.stringify(session));

            const emailLower = permittedUser.email.toLowerCase();
            window.safeLocalStorageSet(`LearnSprint_cached_skill_${emailLower}`, permittedUser.skill);
            window.safeLocalStorageSet(`LearnSprint_cached_level_${emailLower}`, permittedUser.level);
            window.safeLocalStorageSet(`LearnSprint_cached_streak_${emailLower}`, String(permittedUser.streak));
            window.safeLocalStorageSet(`LearnSprint_cached_hours_${emailLower}`, String(permittedUser.hours));
            window.safeLocalStorageSet(`LearnSprint_cached_modules_${emailLower}`, String(permittedUser.modules));
            
            if (typeof populateUserSessionData === 'function') {
              populateUserSessionData();
            }
          }
        }
      }
    } catch (err) {
      console.warn("Background profile sync failed", err);
    }
  },

  // Dynamic glassmorphic toast notification creator
  showToast(message, type = 'error') {
    let container = document.getElementById('learnsprint-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'learnsprint-toast-container';
      container.style.position = 'fixed';
      container.style.bottom = '24px';
      container.style.right = '24px';
      container.style.zIndex = '99999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.minWidth = '300px';
    toast.style.maxWidth = '450px';
    toast.style.padding = '16px 20px';
    toast.style.borderRadius = '12px';
    toast.style.background = 'rgba(26, 26, 38, 0.9)';
    toast.style.backdropFilter = 'blur(16px)';
    toast.style.border = type === 'error' ? '1px solid rgba(225, 112, 85, 0.5)' : (type === 'warning' ? '1px solid rgba(253, 203, 110, 0.5)' : '1px solid rgba(108, 92, 231, 0.5)');
    toast.style.color = '#ffffff';
    toast.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    toast.style.fontSize = '0.88rem';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    const icon = document.createElement('i');
    if (type === 'error') {
      icon.className = 'fas fa-exclamation-circle';
      icon.style.color = '#e17055';
    } else if (type === 'warning') {
      icon.className = 'fas fa-wifi-slash';
      icon.style.color = '#fdcb6e';
    } else {
      icon.className = 'fas fa-check-circle';
      icon.style.color = '#00b894';
    }
    icon.style.fontSize = '1.15rem';

    const text = document.createElement('span');
    text.textContent = message;
    text.style.flex = '1';

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.addEventListener('transitionend', () => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      });
    }, 4000);
  }
};

// ==========================================
// CENTRALIZED COMPONENT API REQUEST WRAPPER
// ==========================================
const ApiService = {
  async request(endpoint, method = 'GET', body = null) {
    if (navigator.onLine === false) {
      if (typeof AuthService !== 'undefined') {
        AuthService.showToast("You are currently offline. Please check your internet connection.", "warning");
      }
      throw new Error('You are offline. Please check your internet connection.');
    }

    const session = AuthService.getCurrentSession();
    const headers = { 'Content-Type': 'application/json' };

    if (session && session.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const config = { method, headers };
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401) {
        // Auto logout on token expiration
        localStorage.removeItem('LearnSprint_session');
        window.location.href = 'login.html';
        throw new Error('Session expired');
      }

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'API operation failed');
      }

      return resData.data !== undefined ? resData.data : resData;
    } catch (error) {
      console.error("API request failed", error);
      if (typeof AuthService !== 'undefined') {
        AuthService.showToast("Server request failed. Please check your connection.", "error");
      }
      throw error;
    }
  },

  // Profiles
  async getProfile() {
    return this.request('/profile', 'GET');
  },

  async updateProfile(data) {
    return this.request('/profile', 'PATCH', data);
  },

  // Quiz
  async generateQuiz(topic) {
    return this.request('/quiz/generate', 'POST', { topic });
  },

  async submitAssessment(quizId, answers) {
    return this.request('/assessments/submit', 'POST', { quizId, answers });
  },

  // Study plans
  async getActiveStudyPlan() {
    return this.request('/study-plans/active', 'GET');
  }
};
