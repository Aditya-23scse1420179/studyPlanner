/**
 * AuthService: Handles user registration, sessions, login, logout,
 * and page auth guards for LearnSprint AI, connected to the Render backend API.
 */

const API_BASE_URL = 'https://learnsprint-backend-1.onrender.com/api/v1';

const AuthService = {
  // Get active session
  getCurrentSession() {
    const session = localStorage.getItem('LearnSprint_session');
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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        return { success: false, message: resData.message || 'Login failed.' };
      }

      // Backend returns tokens at top-level or data-level
      const data = resData.data || resData;
      const sessionData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          name: data.user?.fullName || data.user?.name || email.split('@')[0],
          email: data.user?.email || email,
          joined: data.user?.createdAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          skill: localStorage.getItem('LearnSprint_cached_skill') || 'None selected',
          level: localStorage.getItem('LearnSprint_cached_level') || 'Beginner',
          score: null,
          streak: parseInt(localStorage.getItem('LearnSprint_cached_streak')) || 1,
          hours: parseInt(localStorage.getItem('LearnSprint_cached_hours')) || 2,
          modules: parseInt(localStorage.getItem('LearnSprint_cached_modules')) || 1
        }
      };

      localStorage.setItem('LearnSprint_session', JSON.stringify(sessionData));
      return { success: true };
    } catch (error) {
      console.error("API login request error", error);
      return { success: false, message: 'Server connection failed. Try again.' };
    }
  },

  // Signup handler using backend API
  async signup(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        return { success: false, message: resData.message || 'Signup failed.' };
      }

      return { success: true, message: 'OTP sent to your email.' };
    } catch (error) {
      console.error("API signup request error", error);
      return { success: false, message: 'Server connection failed.' };
    }
  },

  // Verify OTP handler
  async verifyOtp(email, otp) {
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
          streak: 1,
          hours: 2,
          modules: 1
        }
      };

      localStorage.setItem('LearnSprint_session', JSON.stringify(sessionData));
      return { success: true };
    } catch (error) {
      console.error("API OTP verification error", error);
      return { success: false, message: 'Server connection failed.' };
    }
  },

  // Resend OTP handler
  async resendOtp(email) {
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
      return { success: false, message: 'Server connection failed.' };
    }
  },

  // Sync profile details with local cache
  syncSession(updatedUser) {
    const session = this.getCurrentSession();
    if (!session) return;
    session.user = updatedUser;
    localStorage.setItem('LearnSprint_session', JSON.stringify(session));

    // Cache stats for recovery
    localStorage.setItem('LearnSprint_cached_skill', updatedUser.skill || '');
    localStorage.setItem('LearnSprint_cached_level', updatedUser.level || '');
    localStorage.setItem('LearnSprint_cached_streak', updatedUser.streak || '0');
    localStorage.setItem('LearnSprint_cached_hours', updatedUser.hours || '0');
    localStorage.setItem('LearnSprint_cached_modules', updatedUser.modules || '0');
  },

  // Log user out using API
  async logout() {
    const session = this.getCurrentSession();
    if (session && session.accessToken && session.refreshToken) {
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

    localStorage.removeItem('LearnSprint_session');
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

  // Page guard
  guardPage() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
};

// ==========================================
// CENTRALIZED COMPONENT API REQUEST WRAPPER
// ==========================================
const ApiService = {
  async request(endpoint, method = 'GET', body = null) {
    const session = AuthService.getCurrentSession();
    const headers = { 'Content-Type': 'application/json' };

    if (session && session.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const config = { method, headers };
    if (body) {
      config.body = JSON.stringify(body);
    }

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

  async getQuizHistory() {
    return this.request('/quiz/history', 'GET');
  },

  async submitAssessment(quizId, answers) {
    return this.request('/assessments/submit', 'POST', { quizId, answers });
  },

  // Study plans
  async getActiveStudyPlan() {
    return this.request('/study-plans/active', 'GET');
  },

  // Reminders
  async getReminders(status = 'pending') {
    return this.request(`/reminders?status=${status}`, 'GET');
  },

  async createReminder(title, scheduledAt) {
    return this.request('/reminders', 'POST', { title, scheduledAt });
  },

  async completeReminder(reminderId) {
    return this.request(`/reminders/${reminderId}/complete`, 'POST');
  },

  // Feedback
  async submitFeedback(message) {
    return this.request('/feedback', 'POST', { message });
  }
};
