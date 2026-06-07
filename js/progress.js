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

    // 3. Bind download button click event
    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadReport());
    }
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
    
    const displayHours = typeof user.hours === 'number' ? user.hours.toFixed(2) : (parseFloat(user.hours) || 0).toFixed(2);
    if (hoursVal) hoursVal.textContent = `${displayHours} Hours`;
    if (skillVal) skillVal.textContent = user.skill || 'None selected';
    
    if (scoreVal) {
      let scoreText = 'N/A';
      if (user.score !== null && user.score !== undefined) {
        scoreText = `${user.score} / 10`;
      } else {
        try {
          const history = JSON.parse(localStorage.getItem('LearnSprint_quiz_history') || '[]');
          if (history.length > 0) {
            scoreText = `${history[0].score} / 10`;
          }
        } catch (e) {
          console.error(e);
        }
      }
      scoreVal.textContent = scoreText;
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
      const pct = Math.min(100, Math.round(((parseFloat(user.hours) || 0) / 100) * 100));
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
    } else {
      try {
        const history = JSON.parse(localStorage.getItem('LearnSprint_quiz_history') || '[]');
        if (history.length > 0) {
          accuracyPct = history[0].score * 10;
        }
      } catch (e) {
        console.error(e);
      }
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

  downloadReport() {
    const user = this.sessionUser;
    if (!user) return;

    let accuracyPct = 0;
    let scoreText = 'N/A';
    
    if (user.score !== null && user.score !== undefined) {
      accuracyPct = user.score * 10;
      scoreText = `${user.score} / 10`;
    } else {
      try {
        const history = JSON.parse(localStorage.getItem('LearnSprint_quiz_history') || '[]');
        if (history.length > 0) {
          accuracyPct = history[0].score * 10;
          scoreText = `${history[0].score} / 10`;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const displayHours = typeof user.hours === 'number' ? user.hours.toFixed(2) : (parseFloat(user.hours) || 0).toFixed(2);
    const completionPct = Math.min(100, (user.modules || 0) * 8 || 0);

    const reportContent = `==================================================
        LearnSprint AI - ADAPTIVE STUDY PLANNER REPORT
==================================================
Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Student Name: ${user.name}
Email: ${user.email}
Account Joined: ${user.joined || 'N/A'}

--------------------------------------------------
ACADEMIC ANALYTICS & METRICS
--------------------------------------------------
Current Learning Skill : ${user.skill || 'None selected'}
Assessment Score       : ${scoreText}
Evaluation Level       : ${user.level || 'Beginner'}

Study Streak           : ${user.streak || 0} Days
Total Study Hours      : ${displayHours} Hours
Syllabus Modules Done  : ${user.modules || 0} Modules

Quiz Performance       : ${accuracyPct}% Average Accuracy
Course Syllabus Done   : ${completionPct}% Syllabus Completed

--------------------------------------------------
GOALS & CONSISTENCY PROGRESS
--------------------------------------------------
Daily Streak Goal (30 Days)   : [${'#'.repeat(Math.round(Math.min(100, ((user.streak || 0)/30)*100)/5))}${' '.repeat(20 - Math.round(Math.min(100, ((user.streak || 0)/30)*100)/5))}] ${Math.min(100, Math.round(((user.streak || 0)/30)*100))}%
Study Hours Goal (100 Hours)   : [${'#'.repeat(Math.round(Math.min(100, ((parseFloat(user.hours) || 0)/100)*100)/5))}${' '.repeat(20 - Math.round(Math.min(100, ((parseFloat(user.hours) || 0)/100)*100)/5))}] ${Math.min(100, Math.round(((parseFloat(user.hours) || 0)/100)*100))}%
Syllabus Modules Goal (12 Modules): [${'#'.repeat(Math.round(Math.min(100, ((user.modules || 0)/12)*100)/5))}${' '.repeat(20 - Math.round(Math.min(100, ((user.modules || 0)/12)*100)/5))}] ${Math.min(100, Math.round(((user.modules || 0)/12)*100))}%

Keep studying and tracking your goals with LearnSprint AI!
==================================================`;

    try {
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LearnSprint_Progress_Report_${user.name.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export report failed", err);
      alert("Failed to export progress report.");
    }
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new ProgressController();
});
