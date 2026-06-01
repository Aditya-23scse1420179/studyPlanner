/**
 * ProgressController: Renders CodeChef-like stats dashboards,
 * handles pure SVG/CSS circular progress rendering, and animates stats.
 */

class ProgressController {
  constructor() {
    this.sessionUser = null;
    this.init();
  }

  init() {
    // 1. Fetch user session
    if (typeof AuthService !== 'undefined') {
      this.sessionUser = AuthService.getCurrentUser();
    }

    if (!this.sessionUser) return;

    // 2. Render all statistics
    this.renderStats();
  }

  renderStats() {
    const user = this.sessionUser;

    // Fetch DOM elements
    const streakVal = document.getElementById('prog-streak');
    const modulesVal = document.getElementById('prog-modules');
    const hoursVal = document.getElementById('prog-hours');
    const skillVal = document.getElementById('prog-skill');
    const scoreVal = document.getElementById('prog-score');

    const streakBar = document.getElementById('prog-streak-bar-fill');
    const modulesBar = document.getElementById('prog-modules-bar-fill');
    const hoursBar = document.getElementById('prog-hours-bar-fill');

    // Populate standard values
    if (streakVal) streakVal.textContent = `${user.streak || 0} Days`;
    if (modulesVal) modulesVal.textContent = `${user.modules || 0} Modules`;
    if (hoursVal) hoursVal.textContent = `${user.hours || 0} Hours`;
    if (skillVal) skillVal.textContent = user.skill || 'None selected';
    if (scoreVal) {
      scoreVal.textContent = user.score !== null && user.score !== undefined ? `${user.score} / 10` : 'N/A';
    }

    // Update standard progress bars (with simulated limits)
    if (streakBar) {
      // Goal of 30 days
      const pct = Math.min(100, Math.round(((user.streak || 0) / 30) * 100));
      setTimeout(() => {
        streakBar.style.width = `${pct}%`;
      }, 100);
    }

    if (modulesBar) {
      // Goal of 12 modules
      const pct = Math.min(100, Math.round(((user.modules || 0) / 12) * 100));
      setTimeout(() => {
        modulesBar.style.width = `${pct}%`;
      }, 100);
    }

    if (hoursBar) {
      // Goal of 100 hours
      const pct = Math.min(100, Math.round(((user.hours || 0) / 100) * 100));
      setTimeout(() => {
        hoursBar.style.width = `${pct}%`;
      }, 100);
    }

    // 3. Render Circular SVG meters
    this.renderCircularMeters();
  }

  renderCircularMeters() {
    const user = this.sessionUser;

    // A. Quiz Accuracy Circle (Circle circumference = 251 since r=40, C = 2*PI*40 = 251.3)
    const accuracyCircle = document.getElementById('accuracy-ring-fill');
    const accuracyText = document.getElementById('accuracy-text-val');
    
    let accuracyPct = 0;
    if (user.score !== null && user.score !== undefined) {
      accuracyPct = user.score * 10;
    } else if (user.streak > 0) {
      accuracyPct = 60; // Initial default placeholder if they studied but didn't evaluate
    }

    if (accuracyText) accuracyText.textContent = `${accuracyPct}%`;
    if (accuracyCircle) {
      const circ = 251;
      const offset = circ - (accuracyPct / 100) * circ;
      setTimeout(() => {
        accuracyCircle.style.strokeDashoffset = offset;
      }, 200);
    }

    // B. Course Syllabus Completion Circle
    const completionCircle = document.getElementById('completion-ring-fill');
    const completionText = document.getElementById('completion-text-val');
    
    // Syllabus progress = modules * 8% (capped at 100)
    const completionPct = Math.min(100, (user.modules || 0) * 8 || 0);

    if (completionText) completionText.textContent = `${completionPct}%`;
    if (completionCircle) {
      const circ = 251;
      const offset = circ - (completionPct / 100) * circ;
      setTimeout(() => {
        completionCircle.style.strokeDashoffset = offset;
      }, 200);
    }
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new ProgressController();
});
