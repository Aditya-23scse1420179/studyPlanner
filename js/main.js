/**
 * Global application bootsrap: js/main.js
 * Controls common UI, collapsible sidebar persistence, mobile overlay menu,
 * and user profile session integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Guard page (ensure logged in)
  if (typeof AuthService !== 'undefined') {
    AuthService.guardPage();
  }

  // 2. Initialize and Persist Collapsible Sidebar State
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  
  if (sidebar) {
    // Read state from storage
    const isCollapsed = localStorage.getItem('LearnSprint_sidebar_collapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    }

    // Toggle click handler
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        // Save current state
        localStorage.setItem('LearnSprint_sidebar_collapsed', sidebar.classList.contains('collapsed'));
      });
    }
  }

  // 3. Mobile Navigation Handling
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const menuOverlay = document.getElementById('menu-overlay');
  
  if (mobileMenuToggle && sidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (menuOverlay) {
        menuOverlay.style.display = 'block';
      }
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', () => {
      if (sidebar) {
        sidebar.classList.remove('open');
      }
      menuOverlay.style.display = 'none';
    });
  }

  // 4. Highlight Active Navigation Item
  highlightActiveNav();

  // 5. Populate User Interface Session Stats
  populateUserSessionData();

  // 5.5. Initialize and Persist Theme Toggle State (Dark Mode)
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Sync current UI state
    const syncThemeUI = () => {
      const isDark = document.body.classList.contains('dark-theme');
      if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
    };
    
    syncThemeUI();

    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDarkNow = document.body.classList.contains('dark-theme');
      localStorage.setItem('LearnSprint_theme', isDarkNow ? 'dark' : 'light');
      syncThemeUI();
    });
  }

  // 6. Bind Logout Button Click Events (Desktop and Mobile)
  const logoutButtons = document.querySelectorAll('#logout-btn, .mobile-logout-btn, .logout-btn-trigger');
  if (logoutButtons.length > 0 && typeof AuthService !== 'undefined') {
    logoutButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        AuthService.logout();
      });
    });
  }

  // 7. Active Page Time Tracker
  let activeSeconds = 0;
  setInterval(() => {
    if (document.visibilityState === 'visible' && typeof AuthService !== 'undefined' && AuthService.isAuthenticated()) {
      activeSeconds += 10;
      if (activeSeconds >= 60) {
        activeSeconds = 0;
        const user = AuthService.getCurrentUser();
        if (user) {
          const minutes = 1;
          const hoursToAdd = minutes / 60;
          user.hours = parseFloat(((user.hours || 0) + hoursToAdd).toFixed(4));
          AuthService.syncSession(user);

          // Update visible study hours elements
          const statHoursVal = document.getElementById('stat-hours-val');
          if (statHoursVal) statHoursVal.textContent = user.hours.toFixed(2);

          const progHours = document.getElementById('prog-hours');
          if (progHours) progHours.textContent = `${user.hours.toFixed(2)} Hours`;

          const profileHours = document.getElementById('profile-hours');
          if (profileHours) profileHours.textContent = user.hours.toFixed(2);
        }
      }
    }
  }, 10000);
});

/**
 * Highlights the active item in the navigation sidebar based on current file location
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  
  const navMap = {
    'dashboard.html': 'nav-dashboard',
    'profile.html': 'nav-profile',
    'learn-ai.html': 'nav-learn',
    'progress.html': 'nav-progress',
    'reminders.html': 'nav-reminders',
    'community.html': 'nav-community'
  };

  const activeId = navMap[fileName];
  if (activeId) {
    // Remove active class from all
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    // Add to active
    const activeItem = document.getElementById(activeId);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
}

/**
 * Synchronizes DOM elements with active user session values (Name, Skill, Streak, etc.)
 */
function populateUserSessionData() {
  if (typeof AuthService === 'undefined') return;
  const user = AuthService.getCurrentUser();
  if (!user) return;

  // Sidebar profile
  const sidebarUser = document.getElementById('sidebar-username');
  const sidebarSkill = document.getElementById('sidebar-userskill');
  const avatarLetter = document.getElementById('sidebar-avatar-letter');

  if (sidebarUser) sidebarUser.textContent = user.name;
  if (sidebarSkill) sidebarSkill.textContent = user.skill || 'No skill selected';
  if (avatarLetter && user.name) {
    avatarLetter.textContent = user.name.trim().charAt(0).toUpperCase();
  }

  // Topbar credentials
  const headerUser = document.getElementById('header-username');
  const headerStreakVal = document.getElementById('header-streak-val');
  
  if (headerUser) headerUser.textContent = user.name;
  if (headerStreakVal) headerStreakVal.textContent = user.streak || 0;
}
