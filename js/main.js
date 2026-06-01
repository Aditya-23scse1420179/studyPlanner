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
    const isCollapsed = localStorage.getItem('cogniflow_sidebar_collapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    }

    // Toggle click handler
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        // Save current state
        localStorage.setItem('cogniflow_sidebar_collapsed', sidebar.classList.contains('collapsed'));
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

  // 6. Bind Logout Button Click Event
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && typeof AuthService !== 'undefined') {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthService.logout();
    });
  }
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
