/**
 * DashboardController: Handles events, search queries,
 * stats population, and learning score calculations on dashboard.html
 */

class DashboardController {
  constructor() {
    this.sessionUser = null;
    this.init();
  }

  init() {
    // 1. Get current logged-in user
    if (typeof AuthService !== 'undefined') {
      this.sessionUser = AuthService.getCurrentUser();
    }

    if (!this.sessionUser) return;

    // 2. Setup event listeners
    this.setupSearchListeners();
    
    // 3. Populate stats cards
    this.populateDashboardStats();
    
    // 4. Animate SVG Learning Intelligence Score
    this.renderLearningScore();
  }

  setupSearchListeners() {
    const searchFormBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const tags = document.querySelectorAll('.tag-chip');

    const handleSearch = (query) => {
      if (!query) return;
      // Redirect to Learn With AI page with search query parameter
      window.location.href = `learn-ai.html?search=${encodeURIComponent(query)}`;
    };

    if (searchFormBtn && searchInput) {
      searchFormBtn.addEventListener('click', () => {
        handleSearch(searchInput.value.trim());
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch(searchInput.value.trim());
        }
      });
    }

    // Suggested tags click handler
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        const queryText = tag.getAttribute('data-skill') || tag.textContent.trim();
        handleSearch(queryText);
      });
    });
  }

  populateDashboardStats() {
    const user = this.sessionUser;

    const streakVal = document.getElementById('stat-streak-val');
    const modulesVal = document.getElementById('stat-modules-val');
    const hoursVal = document.getElementById('stat-hours-val');
    const skillVal = document.getElementById('stat-skill-val');

    if (streakVal) streakVal.textContent = user.streak || 0;
    if (modulesVal) modulesVal.textContent = user.modules || 0;
    if (hoursVal) hoursVal.textContent = user.hours || 0;
    if (skillVal) {
      // Truncate long skill names if necessary
      const skillName = user.skill || 'None selected';
      skillVal.textContent = skillName.length > 20 ? skillName.substring(0, 18) + '...' : skillName;
      skillVal.title = skillName;
    }
  }

  renderLearningScore() {
    const user = this.sessionUser;
    
    // Calculate Learning Intelligence (LI) Score:
    // Base: assessment score * 10 (max 100 if score is 10)
    // Bonus: streak * 2 (max 20)
    // Max capped at 100.
    // If no assessment score is available, base is 0.
    let baseScore = 0;
    if (user.score !== null && user.score !== undefined) {
      baseScore = user.score * 10;
    }
    
    const bonus = (user.streak || 0) * 2;
    let finalScore = Math.min(100, baseScore + bonus);
    
    // If user has zero stats and no assessment, default to a friendly initial score
    if (finalScore === 0 && user.streak > 0) {
      finalScore = Math.min(100, user.streak * 5);
    }

    const scoreNum = document.getElementById('score-num');
    const scoreCircle = document.getElementById('score-circle-fill');

    if (scoreNum) {
      // Simple animate number count-up
      let currentVal = 0;
      const duration = 800; // ms
      const stepTime = Math.abs(Math.floor(duration / finalScore));
      
      if (finalScore > 0) {
        const timer = setInterval(() => {
          currentVal++;
          scoreNum.textContent = currentVal;
          if (currentVal >= finalScore) {
            clearInterval(timer);
          }
        }, stepTime || 10);
      } else {
        scoreNum.textContent = '0';
      }
    }

    if (scoreCircle) {
      // Stroke dashoffset animation
      // Circumference is 377
      const circumference = 377;
      const offset = circumference - (finalScore / 100) * circumference;
      
      // Delay slightly for smooth transition on load
      setTimeout(() => {
        scoreCircle.style.strokeDashoffset = offset;
      }, 100);
    }
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  new DashboardController();
});
