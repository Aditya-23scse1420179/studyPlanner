/**
 * LearnAIController: Handles Goal Settings, 10-Question MCQ quiz,
 * grading levels, and syncing performance stats with Local Storage.
 */

// Question Database (10 questions per skill)
const QUESTION_BANK = {
  "dsa": [
    {
      q: "What is the worst-case time complexity of searching in a balanced Binary Search Tree (BST)?",
      o: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      a: 2
    },
    {
      q: "Which data structure operates on a First-In-First-Out (FIFO) basis?",
      o: ["Stack", "Queue", "Binary Tree", "Heap"],
      a: 1
    },
    {
      q: "What is the worst-case time complexity of the Quick Sort algorithm?",
      o: ["O(n log n)", "O(n^2)", "O(n)", "O(2^n)"],
      a: 1
    },
    {
      q: "Which data structure is typically used to implement Depth First Search (DFS) on a graph?",
      o: ["Stack", "Queue", "Hash Table", "Priority Queue"],
      a: 0
    },
    {
      q: "What is the best-case time complexity of Bubble Sort when the array is already sorted?",
      o: ["O(n)", "O(log n)", "O(n log n)", "O(n^2)"],
      a: 0
    },
    {
      q: "In a singly linked list, what is the time complexity to insert a new node at the very beginning (head)?",
      o: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      a: 2
    },
    {
      q: "Which of the following is classified as a non-linear data structure?",
      o: ["Array", "Linked List", "Stack", "Graph"],
      a: 3
    },
    {
      q: "Which data structure is implicitly used by the system during recursive function calls?",
      o: ["Queue", "Stack", "Linked List", "Binary Tree"],
      a: 1
    },
    {
      q: "What is the worst-case time complexity to heapify an element in a Binary Heap?",
      o: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      a: 1
    },
    {
      q: "What is the space complexity of Breadth First Search (BFS) on a graph in the worst case?",
      o: ["O(1)", "O(V) where V is vertices", "O(E) where E is edges", "O(V * E)"],
      a: 1
    }
  ],
  "html": [
    {
      q: "What does HTML stand for?",
      o: ["Hyperlinks and Text Markup Language", "Hyper Text Markup Language", "Home Tool Markup Language", "Hyper Tech Modern Language"],
      a: 1
    },
    {
      q: "Which element is the correct HTML tag for the largest heading?",
      o: ["<heading>", "<h6>", "<head>", "<h1>"],
      a: 3
    },
    {
      q: "What is the correct HTML element for producing a single line break?",
      o: ["<break>", "<lb>", "<br>", "<line>"],
      a: 2
    },
    {
      q: "Which HTML attribute is used to define the file path for an image?",
      o: ["href", "src", "link", "alt"],
      a: 1
    },
    {
      q: "Which tag is used to create an unordered bulleted list?",
      o: ["<ul>", "<ol>", "<li>", "<list>"],
      a: 0
    },
    {
      q: "Which HTML5 element represents independent, self-contained article content?",
      o: ["<section>", "<div>", "<article>", "<aside>"],
      a: 2
    },
    {
      q: "What is the correct HTML code for creating a hyperlink?",
      o: ["<a>http://google.com</a>", "<a href='http://google.com'>Google</a>", "<a url='http://google.com'>Google</a>", "<a>href='http://google.com'</a>"],
      a: 1
    },
    {
      q: "Which character is used to indicate an end tag in HTML?",
      o: ["^", "<", "*", "/"],
      a: 3
    },
    {
      q: "How can you create a numbered ordered list?",
      o: ["<ol>", "<ul>", "<dl>", "<list>"],
      a: 0
    },
    {
      q: "Which input type attribute creates a slider controller in HTML5?",
      o: ["slider", "number", "range", "scroll"],
      a: 2
    }
  ],
  "css": [
    {
      q: "What does CSS stand for?",
      o: ["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
      a: 2
    },
    {
      q: "Where in an HTML document is the correct place to link an external stylesheet?",
      o: ["At the end of the <body>", "In the <head> section", "Directly inside the first <div>", "In the <footer> section"],
      a: 1
    },
    {
      q: "Which HTML tag is used to define embedded internal style rules?",
      o: ["<script>", "<css>", "<style>", "<link>"],
      a: 2
    },
    {
      q: "Which CSS property is used to change the background color of an element?",
      o: ["color", "background-color", "bgcolor", "background-style"],
      a: 1
    },
    {
      q: "How do you select a unique element with the id 'demo' in CSS?",
      o: [".demo", "*demo", "demo", "#demo"],
      a: 3
    },
    {
      q: "How do you select all elements with the class name 'test' in CSS?",
      o: [".test", "#test", "test", "*test"],
      a: 0
    },
    {
      q: "What is the default initial value of the position property in CSS?",
      o: ["absolute", "relative", "static", "fixed"],
      a: 2
    },
    {
      q: "Which CSS property controls the size of text?",
      o: ["font-style", "text-size", "font-size", "text-style"],
      a: 2
    },
    {
      q: "How do you make the font weight bold using CSS?",
      o: ["font: bold;", "font-weight: bold;", "text-style: bold;", "font-bold: true;"],
      a: 1
    },
    {
      q: "Which CSS box-model property adds space inside an element, between content and border?",
      o: ["margin", "padding", "border", "gap"],
      a: 1
    }
  ],
  "javascript": [
    {
      q: "Which HTML element is used to contain external or inline JavaScript code?",
      o: ["<js>", "<scripting>", "<script>", "<javascript>"],
      a: 2
    },
    {
      q: "How do you write 'Hello World' in a browser popup alert box?",
      o: ["msgBox('Hello World');", "alert('Hello World');", "alertBox('Hello World');", "msg('Hello World');"],
      a: 1
    },
    {
      q: "How do you define a function in JavaScript?",
      o: ["function:myFunction()", "function myFunction()", "def myFunction()", "create myFunction()"],
      a: 1
    },
    {
      q: "How do you call a function named 'myFunction' in JavaScript?",
      o: ["call myFunction()", "myFunction()", "run myFunction", "execute myFunction()"],
      a: 1
    },
    {
      q: "What is the correct syntax for writing a standard IF condition check?",
      o: ["if i = 5 then", "if (i == 5)", "if i == 5", "if i = 5"],
      a: 1
    },
    {
      q: "How does a standard, incrementing FOR loop begin?",
      o: ["for (i <= 5; i++)", "for (let i = 0; i < 5; i++)", "for i = 1 to 5", "for (let i = 0; i < 5)"],
      a: 1
    },
    {
      q: "What is the correct way to declare an array literal in JavaScript?",
      o: ["const colors = (1:'red', 2:'green')", "const colors = 'red', 'green', 'blue'", "const colors = ['red', 'green', 'blue']", "const colors = 1 = ('red'), 2 = ('green')"],
      a: 2
    },
    {
      q: "Which operator is used to assign a value to a variable in JavaScript?",
      o: ["*", "=", "==", "==="],
      a: 1
    },
    {
      q: "What is the output of evaluated expression: 'typeof null'?",
      o: ["'null'", "'undefined'", "'object'", "'string'"],
      a: 2
    },
    {
      q: "How do you round a decimal number to the nearest integer?",
      o: ["Math.rnd()", "Math.round()", "Math.floor()", "Math.ceil()"],
      a: 1
    }
  ],
  "sql": [
    {
      q: "What does SQL stand for?",
      o: ["Strong Question Language", "Structured Query Language", "Structured Question Layout", "System Query Language"],
      a: 1
    },
    {
      q: "Which SQL statement is used to query and extract data from a database?",
      o: ["EXTRACT", "GET", "SELECT", "OPEN"],
      a: 2
    },
    {
      q: "Which SQL statement is used to modify existing records in a database table?",
      o: ["MODIFY", "SAVE", "UPDATE", "CHANGE"],
      a: 2
    },
    {
      q: "Which SQL statement is used to remove records from a table?",
      o: ["REMOVE", "DELETE", "COLLAPSE", "DROP"],
      a: 1
    },
    {
      q: "Which SQL clause is used to insert new row values into a database table?",
      o: ["ADD RECORD", "INSERT INTO", "INSERT ROW", "ADD VALUES"],
      a: 1
    },
    {
      q: "How do you select a column named 'FirstName' from a table named 'Persons'?",
      o: ["SELECT Persons.FirstName", "SELECT FirstName FROM Persons", "EXTRACT FirstName FROM Persons", "SELECT FirstName IN Persons"],
      a: 1
    },
    {
      q: "How do you select all columns from a table named 'Persons'?",
      o: ["SELECT [all] FROM Persons", "SELECT * FROM Persons", "SELECT ALL FROM Persons", "SELECT *.Persons"],
      a: 1
    },
    {
      q: "How do you select records where 'FirstName' is 'Peter'?",
      o: ["SELECT * FROM Persons WHERE FirstName LIKE 'Peter'", "SELECT * FROM Persons WHERE FirstName='Peter'", "SELECT [all] FROM Persons WHERE FirstName='Peter'", "SELECT * FROM Persons WHERE FirstName IS 'Peter'"],
      a: 1
    },
    {
      q: "Which keyword is used to filter out duplicate rows and return unique values?",
      o: ["UNIQUE", "SINGLE", "DISTINCT", "DIFFERENT"],
      a: 2
    },
    {
      q: "Which SQL keyword is used to sort the output records?",
      o: ["SORT BY", "ORDER BY", "ALIGN BY", "GROUP BY"],
      a: 1
    }
  ],
  "machine learning": [
    {
      q: "What is supervised learning in Machine Learning?",
      o: ["Learning without feedback", "Learning with labeled training data", "Learning from environment feedback rewards", "Clustering similar data items"],
      a: 1
    },
    {
      q: "Which of the following is classified as a standard regression algorithm?",
      o: ["K-Means", "Linear Regression", "Logistic Regression", "Random Forest Classifier"],
      a: 1
    },
    {
      q: "What is the primary purpose of a validation dataset?",
      o: ["To test final generalized accuracy", "To train model weights", "To tune hyperparameters and prevent overfitting", "To collect raw raw features"],
      a: 2
    },
    {
      q: "What is 'overfitting' in machine learning?",
      o: ["Model generalizes well to unseen data", "Model performs well on training data but poorly on testing data", "Model performs poorly on both training and test data", "Model runs too slowly in production"],
      a: 1
    },
    {
      q: "Which metric is commonly used to evaluate classification model correctness?",
      o: ["Mean Squared Error (MSE)", "R-squared value", "F1-Score / Accuracy", "Cosine Similarity"],
      a: 2
    },
    {
      q: "What does KNN stand for in machine learning context?",
      o: ["Kernel Node Network", "K-Nearest Neighbors", "K-Numerical Nodes", "K-Newtonian Network"],
      a: 1
    },
    {
      q: "What is unsupervised learning?",
      o: ["Learning from labeled inputs", "Learning structure from unlabeled inputs", "Direct programming from developers", "Playing game agents"],
      a: 1
    },
    {
      q: "What does the 'K' represent in K-Means clustering algorithm?",
      o: ["The size of inputs", "The number of clusters to form", "The dimension space", "The iteration speed limit"],
      a: 1
    },
    {
      q: "Which activation function is most commonly used to output values bounded strictly between 0 and 1?",
      o: ["ReLU", "Tanh", "Sigmoid", "Softmax"],
      a: 2
    },
    {
      q: "What is the main goal of regularization techniques (L1/L2) in ML?",
      o: ["To increase training speed", "To prevent overfitting by penalizing complexity", "To clean corrupted labels", "To increase features size"],
      a: 1
    }
  ]
};

class LearnAIController {
  constructor() {
    this.sessionUser = null;
    this.activeSkill = "";
    this.timeLimit = "";
    this.dailyHours = "";
    
    // Quiz state
    this.currentQuestions = [];
    this.currentQIndex = 0;
    this.userAnswers = [];
    this.selectedOptionIndex = null;

    this.init();
  }

  init() {
    // 1. Fetch user session
    if (typeof AuthService !== 'undefined') {
      this.sessionUser = AuthService.getCurrentUser();
    }
    
    if (!this.sessionUser) return;

    // 2. Parse URL parameters for pre-filled skills
    this.checkUrlParams();

    // 3. Bind UI Form actions
    const genAssessmentBtn = document.getElementById('generate-assessment-btn');
    if (genAssessmentBtn) {
      genAssessmentBtn.addEventListener('click', () => this.handleGenerateClick());
    }

    // 4. Render Attempted Quizzes history
    this.renderQuizHistory();
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const searchSkill = params.get('search');
    const autoGen = params.get('auto') === 'true';
    const skillInput = document.getElementById('skill-input');
    
    if (searchSkill && skillInput) {
      skillInput.value = searchSkill;
      if (autoGen) {
        setTimeout(() => {
          this.handleGenerateClick();
        }, 150);
      }
    }
  }

  async handleGenerateClick() {
    const skillInput = document.getElementById('skill-input');
    const timeSelect = document.getElementById('time-select');
    const hoursSelect = document.getElementById('hours-select');

    if (!skillInput || !skillInput.value.trim()) {
      alert("Please enter a skill to learn.");
      return;
    }

    this.activeSkill = skillInput.value.trim();
    this.timeLimit = timeSelect ? timeSelect.value : "60";
    this.dailyHours = hoursSelect ? hoursSelect.value : "2";

    // Load MCQ Database from API or Local fallback
    await this.loadQuizQuestions();
  }

  async loadQuizQuestions() {
    // Transition forms to show quiz card
    const learnForm = document.getElementById('learn-form-card');
    const quizCard = document.getElementById('quiz-card');

    if (learnForm) learnForm.style.display = 'none';
    if (quizCard) {
      quizCard.classList.remove('hidden');
      quizCard.style.display = 'block';
    }

    // Show loading status inside the quiz card
    const qTitle = document.getElementById('quiz-title');
    const qText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-list');

    if (qTitle) qTitle.textContent = `Skill Evaluation: ${this.activeSkill}`;
    if (qText) qText.textContent = "Connecting to LearnSprint Database...";
    if (optionsContainer) {
      optionsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: var(--text-secondary);">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 16px;"></i>
          <span>Generating custom quiz questions from database...</span>
        </div>
      `;
    }

    // Disable action button during load
    const actionBtn = document.getElementById('quiz-action-btn');
    if (actionBtn) {
      actionBtn.setAttribute('disabled', 'true');
      actionBtn.innerHTML = `Loading...`;
    }

    try {
      if (typeof ApiService !== 'undefined' && AuthService.isAuthenticated()) {
        console.log("Fetching questions from backend for:", this.activeSkill);
        const responseData = await ApiService.generateQuiz(this.activeSkill);
        
        let questions = [];
        if (responseData && responseData.questions) {
          questions = responseData.questions;
        } else if (responseData && Array.isArray(responseData)) {
          questions = responseData;
        } else if (responseData && responseData.data && responseData.data.questions) {
          questions = responseData.data.questions;
        } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
          questions = responseData.data;
        }

        if (questions && questions.length > 0) {
          this.currentQuestions = questions.map((qObj, index) => {
            return {
              id: qObj.id || qObj.questionId || `q${index + 1}`,
              q: qObj.text || qObj.question || qObj.q || "",
              o: qObj.options || qObj.o || [],
              a: qObj.correctAnswerIndex !== undefined ? qObj.correctAnswerIndex : 0
            };
          });
          this.quizId = responseData.quizId || responseData.id || null;
        } else {
          throw new Error("No questions returned from backend API");
        }
      } else {
        throw new Error("Not authenticated / offline");
      }
    } catch (apiError) {
      console.warn("Backend generateQuiz failed. Falling back to local offline QUESTION_BANK.", apiError);
      
      // Standardize key for fallback
      const normalizedKey = this.activeSkill.toLowerCase().trim();
      let dbKey = "javascript"; // Default fallback
      if (QUESTION_BANK[normalizedKey]) {
        dbKey = normalizedKey;
      } else if (normalizedKey.includes("dsa") || normalizedKey.includes("data structure") || normalizedKey.includes("algorithm")) {
        dbKey = "dsa";
      } else if (normalizedKey.includes("html")) {
        dbKey = "html";
      } else if (normalizedKey.includes("css")) {
        dbKey = "css";
      } else if (normalizedKey.includes("js") || normalizedKey.includes("javascript")) {
        dbKey = "javascript";
      } else if (normalizedKey.includes("sql") || normalizedKey.includes("database")) {
        dbKey = "sql";
      } else if (normalizedKey.includes("machine learning") || normalizedKey.includes("ml") || normalizedKey.includes("ai")) {
        dbKey = "machine learning";
      }

      this.currentQuestions = JSON.parse(JSON.stringify(QUESTION_BANK[dbKey]));
      this.quizId = null;
    }

    this.currentQIndex = 0;
    this.userAnswers = [];
    this.selectedOptionIndex = null;

    // Render first question
    this.renderQuestion();
  }

  renderQuestion() {
    const qData = this.currentQuestions[this.currentQIndex];
    
    // Reset selected choice
    this.selectedOptionIndex = null;

    // Bind headers
    const qTitle = document.getElementById('quiz-title');
    const qProgressText = document.getElementById('quiz-progress-text');
    const qProgressBar = document.getElementById('quiz-progress-fill');
    
    if (qTitle) qTitle.textContent = `Skill Evaluation: ${this.activeSkill}`;
    if (qProgressText) qProgressText.textContent = `Question ${this.currentQIndex + 1} of 10`;
    if (qProgressBar) {
      qProgressBar.style.width = `${((this.currentQIndex) / 10) * 100}%`;
    }

    // Bind text
    const qText = document.getElementById('question-text');
    if (qText) qText.textContent = qData.q;

    // Render Options List
    const optionsContainer = document.getElementById('options-list');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      
      const markers = ["A", "B", "C", "D"];
      qData.o.forEach((optionText, idx) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.innerHTML = `
          <div class="option-marker">${markers[idx]}</div>
          <span>${this.escapeHTML(optionText)}</span>
        `;
        
        // Click listener
        optionDiv.addEventListener('click', () => {
          // Deselect others
          document.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('selected');
          });
          optionDiv.classList.add('selected');
          this.selectedOptionIndex = idx;
          
          // Enable action button
          const actionBtn = document.getElementById('quiz-action-btn');
          if (actionBtn) actionBtn.removeAttribute('disabled');
        });

        optionsContainer.appendChild(optionDiv);
      });
    }

    // Action button setup
    const actionBtn = document.getElementById('quiz-action-btn');
    if (actionBtn) {
      actionBtn.setAttribute('disabled', 'true');
      if (this.currentQIndex === 9) {
        actionBtn.innerHTML = `Submit Assessment <i class="fas fa-check-circle"></i>`;
      } else {
        actionBtn.innerHTML = `Next Question <i class="fas fa-arrow-right"></i>`;
      }

      // Re-bind click once
      actionBtn.onclick = () => this.handleNextClick();
    }
  }

  handleNextClick() {
    if (this.selectedOptionIndex === null) return;

    // Save answer
    this.userAnswers.push(this.selectedOptionIndex);

    if (this.currentQIndex < 9) {
      this.currentQIndex++;
      this.renderQuestion();
    } else {
      // Completed, grade and render results
      this.gradeQuiz();
    }
  }

  async gradeQuiz() {
    // If we have a backend quizId, submit it to the backend for grading
    if (typeof ApiService !== 'undefined' && AuthService.isAuthenticated() && this.quizId) {
      try {
        const formattedAnswers = this.currentQuestions.map((q, idx) => {
          return {
            questionId: q.id,
            selectedAnswer: q.o[this.userAnswers[idx]] // text of selected option
          };
        });

        // Show loading/grading state
        const quizCard = document.getElementById('quiz-card');
        const resultsCard = document.getElementById('results-card');
        
        if (quizCard) {
          const qText = document.getElementById('question-text');
          if (qText) qText.textContent = "AI grading engine is evaluating your answers...";
          const optionsContainer = document.getElementById('options-list');
          if (optionsContainer) {
            optionsContainer.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 16px;"></i>
                <span>Analyzing responses...</span>
              </div>
            `;
          }
        }

        const submitRes = await ApiService.submitAssessment(this.quizId, formattedAnswers);
        console.log("Assessment submit response:", submitRes);

        let correctCount = 0;
        let level = "Beginner";
        let badgeClass = "badge-danger";

        if (submitRes) {
          // Backend returns score (out of 10 or percentage) and performanceClass/level
          const score = submitRes.score !== undefined ? submitRes.score : 0;
          correctCount = score > 10 ? Math.round(score / 10) : score;
          
          level = submitRes.performanceClass || submitRes.level || "Beginner";
          if (level.toLowerCase().includes("advanced") || level.toLowerCase() === "advanced") {
            level = "Advanced";
            badgeClass = "badge-success";
          } else if (level.toLowerCase().includes("intermediate") || level.toLowerCase() === "intermediate") {
            level = "Intermediate";
            badgeClass = "badge-warning";
          } else {
            level = "Beginner";
            badgeClass = "badge-danger";
          }
        }

        // Sync stats
        const user = this.sessionUser;
        user.skill = this.activeSkill;
        user.score = correctCount;
        user.level = level;
        user.streak = Math.max(1, (user.streak || 0) + 1);
        user.hours = Math.max(2, (user.hours || 0) + 2);
        user.modules = Math.max(1, (user.modules || 0) + 1);

        if (typeof AuthService !== 'undefined') {
          AuthService.syncSession(user);
        }

        // Save attempt to global history list
        try {
          const history = JSON.parse(localStorage.getItem('LearnSprint_quiz_history') || '[]');
          const attempt = {
            skill: this.activeSkill,
            score: correctCount,
            level: level,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          };
          history.unshift(attempt);
          localStorage.setItem('LearnSprint_quiz_history', JSON.stringify(history));
        } catch(err) {
          console.error("Local quiz history write failed", err);
        }

        this.renderQuizHistory();

        if (quizCard) quizCard.style.display = 'none';
        if (resultsCard) {
          resultsCard.classList.remove('hidden');
          resultsCard.style.display = 'block';
        }

        const scoreVal = document.getElementById('results-score-val');
        const levelBadge = document.getElementById('results-level-badge');
        const skillNameVal = document.getElementById('results-skill-name');

        if (scoreVal) scoreVal.textContent = `${correctCount} / 10`;
        if (skillNameVal) skillNameVal.textContent = this.activeSkill;
        if (levelBadge) {
          levelBadge.className = `level-badge-large badge ${badgeClass}`;
          levelBadge.textContent = level;
        }

        // Load dynamic syllabus/study plan details
        await this.fetchStudyPlanDetails();

      } catch (submitErr) {
        console.error("Failed to submit assessment to backend, falling back to local grading:", submitErr);
        this.gradeQuizLocally();
      }
    } else {
      this.gradeQuizLocally();
    }
  }

  gradeQuizLocally() {
    let correctCount = 0;
    this.currentQuestions.forEach((q, idx) => {
      if (this.userAnswers[idx] === q.a) {
        correctCount++;
      }
    });

    let level = "Beginner";
    let badgeClass = "badge-danger";
    if (correctCount >= 8) {
      level = "Advanced";
      badgeClass = "badge-success";
    } else if (correctCount >= 5) {
      level = "Intermediate";
      badgeClass = "badge-warning";
    }

    const user = this.sessionUser;
    user.skill = this.activeSkill;
    user.score = correctCount;
    user.level = level;
    user.streak = Math.max(1, (user.streak || 0) + 1);
    user.hours = Math.max(2, (user.hours || 0) + 2);
    user.modules = Math.max(1, (user.modules || 0) + 1);

    if (typeof AuthService !== 'undefined') {
      AuthService.syncSession(user);
    }

    try {
      const history = JSON.parse(localStorage.getItem('LearnSprint_quiz_history') || '[]');
      const attempt = {
        skill: this.activeSkill,
        score: correctCount,
        level: level,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      history.unshift(attempt);
      localStorage.setItem('LearnSprint_quiz_history', JSON.stringify(history));
    } catch(err) {
      console.error("Local quiz history write failed", err);
    }

    this.renderQuizHistory();

    const quizCard = document.getElementById('quiz-card');
    const resultsCard = document.getElementById('results-card');

    if (quizCard) quizCard.style.display = 'none';
    if (resultsCard) {
      resultsCard.classList.remove('hidden');
      resultsCard.style.display = 'block';
    }

    const scoreVal = document.getElementById('results-score-val');
    const levelBadge = document.getElementById('results-level-badge');
    const skillNameVal = document.getElementById('results-skill-name');

    if (scoreVal) scoreVal.textContent = `${correctCount} / 10`;
    if (skillNameVal) skillNameVal.textContent = this.activeSkill;
    if (levelBadge) {
      levelBadge.className = `level-badge-large badge ${badgeClass}`;
      levelBadge.textContent = level;
    }
  }

  async fetchStudyPlanDetails() {
    try {
      if (typeof ApiService !== 'undefined' && AuthService.isAuthenticated()) {
        const plan = await ApiService.getActiveStudyPlan();
        if (plan) {
          console.log("Successfully fetched study plan from database:", plan);
          const roadmapPlaceholder = document.querySelector('.roadmap-placeholder');
          if (roadmapPlaceholder) {
            // Render structured plan dynamically
            let stepsHtml = `
              <div class="active-study-plan-box" style="margin-top: 16px; padding: 18px; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background-color: var(--bg-secondary);">
                <h4 style="margin-top: 0; color: var(--accent-blue); display: flex; align-items: center; gap: 8px; font-size: 1rem;">
                  <i class="fas fa-route"></i> AI Study Roadmap: ${this.escapeHTML(this.activeSkill)}
                </h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 14px;">
                  Syllabus level matches your <strong>${this.sessionUser.level}</strong> assessment. Target: ${this.timeLimit || 60} Days (${this.dailyHours || 2} hrs/day).
                </p>
                <div class="roadmap-steps" style="display: flex; flex-direction: column; gap: 12px; max-height: 250px; overflow-y: auto; padding-right: 8px;">
            `;

            const steps = plan.steps || plan.roadmap || [];
            if (steps.length > 0) {
              steps.forEach((step, index) => {
                stepsHtml += `
                  <div class="roadmap-step-item" style="padding: 10px 14px; border-left: 3px solid var(--accent-blue); background-color: var(--bg-primary); border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;">
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">Step ${index + 1}: ${this.escapeHTML(step.title || step.name || `Module ${index + 1}`)}</strong>
                    <p style="margin: 4px 0 0 0; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${this.escapeHTML(step.description || step.content || "")}</p>
                  </div>
                `;
              });
            } else {
              stepsHtml += `
                <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 12px;">
                  Roadmap generated. Connect to database to view structured chapters.
                </div>
              `;
            }

            stepsHtml += `
                </div>
              </div>
            `;
            
            roadmapPlaceholder.innerHTML = stepsHtml;
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch active study plan details from database:", err);
    }
  }

  renderQuizHistory() {
    const listContainer = document.getElementById('quiz-history-list');
    if (!listContainer) return;

    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('LearnSprint_quiz_history') || '[]');
    } catch(err) {
      console.error("Failed to read quiz history", err);
    }

    if (history.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; border: 1px dashed var(--border-color); border-radius: var(--border-radius-sm);">
          <i class="fas fa-folder-open" style="font-size: 1.5rem; margin-bottom: 8px; display: block; color: var(--text-muted);"></i>
          No quiz evaluations completed yet. Start an assessment to see your topic understanding.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    history.forEach(attempt => {
      let badgeClass = "badge-danger";
      let understandingText = "";
      const accuracy = attempt.score * 10;

      if (attempt.level === "Advanced") {
        badgeClass = "badge-success";
        understandingText = `Advanced (${accuracy}% understanding) - Deep knowledge of core components. Excellent grasp of concepts.`;
      } else if (attempt.level === "Intermediate") {
        badgeClass = "badge-warning";
        understandingText = `Intermediate (${accuracy}% understanding) - Good syntax skills, but requires minor review on advanced patterns.`;
      } else {
        badgeClass = "badge-danger";
        understandingText = `Beginner (${accuracy}% understanding) - Foundational gaps detected. Focus on baseline guides and tutorials.`;
      }

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justify = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '12px 16px';
      row.style.border = '1px solid var(--border-color)';
      row.style.borderRadius = 'var(--border-radius-sm)';
      row.style.backgroundColor = 'var(--bg-secondary)';
      row.style.fontSize = '0.9rem';

      row.innerHTML = `
        <div style="flex-grow: 1; padding-right: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <strong style="color: var(--text-primary); font-size: 0.95rem;">${this.escapeHTML(attempt.skill)}</strong>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${attempt.date}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
            ${understandingText}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
          <span class="badge ${badgeClass}" style="font-size: 0.75rem; text-transform: uppercase;">${attempt.level}</span>
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">${attempt.score} / 10</span>
        </div>
      `;
      listContainer.appendChild(row);
    });
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new LearnAIController();
});
