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

    const handleSearch = (query, autoGen = false) => {
      if (!query) return;
      // Redirect to Learn With AI page with search query parameter
      let url = `learn-ai.html?search=${encodeURIComponent(query)}`;
      if (autoGen) {
        url += `&auto=true`;
      }
      window.location.href = url;
    };

    if (searchFormBtn && searchInput) {
      searchFormBtn.addEventListener('click', () => {
        handleSearch(searchInput.value.trim(), false);
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch(searchInput.value.trim(), false);
        }
      });
    }

    // Suggested tags click handler
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        const queryText = tag.getAttribute('data-skill') || tag.textContent.trim();
        handleSearch(queryText, true);
      });
    });

    // Trending skills carousel cards click handler
    const carouselCards = document.querySelectorAll('.carousel-card');
    carouselCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const skillTitleEl = card.querySelector('h3');
        if (skillTitleEl) {
          const queryText = skillTitleEl.textContent.trim();
          handleSearch(queryText, true);
        }
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
    
    const displayHours = typeof user.hours === 'number' ? user.hours.toFixed(2) : (parseFloat(user.hours) || 0).toFixed(2);
    if (hoursVal) hoursVal.textContent = displayHours;
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
      if (finalScore > 0) {
        const startTimestamp = performance.now();
        const duration = 800; // ms
        const animate = (now) => {
          const elapsed = now - startTimestamp;
          const progress = Math.min(elapsed / duration, 1);
          const currentVal = Math.floor(progress * finalScore);
          scoreNum.textContent = currentVal;
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            scoreNum.textContent = finalScore;
          }
        };
        requestAnimationFrame(animate);
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

// ==========================================
// INTERACTIVE ALGORITHM VISUALIZER CONTROLLER
// ==========================================
class AlgoVisualizer {
  constructor() {
    this.activeDomain = "dsa"; // Default
    this.timer = null;
    this.isPlaying = false;

    // DSA State (Bubble Sort)
    this.dsaArray = [];
    this.dsaSteps = [];
    this.dsaCurrentStep = 0;

    // WebDev State (Event Bubbling)
    this.webdevSteps = ["button", "container", "body", "document", "window"];
    this.webdevCurrentStep = 0;

    // SQL State (Table Joins)
    this.sqlCustomers = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    ];
    this.sqlOrders = [
      { id: 101, cust_id: 1, product: "Laptop" },
      { id: 102, cust_id: 2, product: "Phone" },
      { id: 103, cust_id: 4, product: "Book" } // Cust 4 doesn't exist
    ];
    this.sqlCurrentStep = 0;
    this.sqlMode = "inner"; // inner, left, right

    // ML State (K-Means Clustering)
    this.mlPoints = [
      { x: 30, y: 40, cluster: null },
      { x: 40, y: 50, cluster: null },
      { x: 35, y: 30, cluster: null },
      { x: 75, y: 70, cluster: null },
      { x: 80, y: 80, cluster: null },
      { x: 70, y: 85, cluster: null },
      { x: 50, y: 60, cluster: null },
      { x: 45, y: 45, cluster: null },
      { x: 68, y: 72, cluster: null }
    ];
    this.mlCentroids = [
      { x: 25, y: 25, color: "red", id: 0 },
      { x: 75, y: 75, color: "blue", id: 1 }
    ];
    this.mlCurrentStep = 0; // 0: reset, 1: assign, 2: update centroids

    this.init();
  }

  init() {
    this.bindTabEvents();
    this.bindControlEvents();
    this.loadActiveDomain();
  }

  bindTabEvents() {
    const tabs = document.querySelectorAll('.visualizer-tabs button');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');
        
        this.resetVisualizer();
        this.activeDomain = tab.getAttribute('data-domain');
        this.loadActiveDomain();
      });
    });
  }

  bindControlEvents() {
    const playBtn = document.getElementById('visualizer-btn-play');
    const stepBtn = document.getElementById('visualizer-btn-step');
    const resetBtn = document.getElementById('visualizer-btn-reset');

    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlay());
    }
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.stepForward());
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetVisualizer());
    }
  }

  togglePlay() {
    const playBtn = document.getElementById('visualizer-btn-play');
    if (this.isPlaying) {
      this.pause();
    } else {
      this.isPlaying = true;
      if (playBtn) playBtn.innerHTML = `<i class="fas fa-pause"></i> Pause Visualizer`;
      this.runAnimationLoop();
    }
  }

  pause() {
    const playBtn = document.getElementById('visualizer-btn-play');
    this.isPlaying = false;
    if (playBtn) playBtn.innerHTML = `<i class="fas fa-play"></i> Run Visualizer`;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  runAnimationLoop() {
    this.timer = setInterval(() => {
      const hasNext = this.stepForward();
      if (!hasNext) {
        this.pause();
      }
    }, 1200);
  }

  stepForward() {
    switch (this.activeDomain) {
      case "dsa":
        return this.stepDSA();
      case "webdev":
        return this.stepWebDev();
      case "sql":
        return this.stepSQL();
      case "ml":
        return this.stepML();
    }
    return false;
  }

  resetVisualizer() {
    this.pause();
    const desc = document.getElementById('visualizer-step-description');
    if (desc) desc.textContent = 'Visualizer reset. Click "Run" or "Next" to start.';
    
    // Reset specific states
    switch (this.activeDomain) {
      case "dsa":
        this.initDSA();
        break;
      case "webdev":
        this.initWebDev();
        break;
      case "sql":
        this.initSQL();
        break;
      case "ml":
        this.initML();
        break;
    }
  }

  loadActiveDomain() {
    switch (this.activeDomain) {
      case "dsa":
        this.initDSA();
        break;
      case "webdev":
        this.initWebDev();
        break;
      case "sql":
        this.initSQL();
        break;
      case "ml":
        this.initML();
        break;
    }
  }

  // ==========================================
  // DSA VISUALIZER: BUBBLE SORT
  // ==========================================
  initDSA() {
    this.dsaArray = [65, 30, 85, 45, 95, 20, 75, 40, 50, 15];
    this.dsaCurrentStep = 0;
    this.dsaSteps = [];

    // Precalculate all Bubble Sort swaps
    let temp = [...this.dsaArray];
    let n = temp.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Step: Compare index j and j+1
        this.dsaSteps.push({
          type: "compare",
          indexA: j,
          indexB: j+1,
          array: [...temp]
        });
        if (temp[j] > temp[j+1]) {
          let hold = temp[j];
          temp[j] = temp[j+1];
          temp[j+1] = hold;
          this.dsaSteps.push({
            type: "swap",
            indexA: j,
            indexB: j+1,
            array: [...temp]
          });
        }
      }
    }
    this.dsaSteps.push({
      type: "done",
      indexA: -1,
      indexB: -1,
      array: [...temp]
    });

    this.renderDSA();
  }

  renderDSA(stepInfo = null) {
    const display = document.getElementById('visualizer-display-area');
    if (!display) return;

    const arr = stepInfo ? stepInfo.array : this.dsaArray;
    const compareA = stepInfo ? stepInfo.indexA : -1;
    const compareB = stepInfo ? stepInfo.indexB : -1;
    const isSwap = stepInfo && stepInfo.type === "swap";

    display.innerHTML = `
      <div style="display: flex; align-items: flex-end; gap: 8px; width: 100%; height: 200px; justify-content: center;">
        ${arr.map((val, idx) => {
          let color = "var(--accent-blue)";
          if (idx === compareA || idx === compareB) {
            color = isSwap ? "var(--color-danger)" : "var(--color-warning)";
          }
          return `
            <div style="width: 24px; height: ${val}%; background-color: ${color}; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; color: #fff; font-size: 0.72rem; font-weight: bold; padding-bottom: 4px; transition: height 0.3s ease, background-color 0.3s ease;">
              <span>${val}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const desc = document.getElementById('visualizer-step-description');
    if (desc) {
      if (!stepInfo) {
        desc.textContent = "Unsorted Array loaded. Bubble Sort compares adjacent items and swaps them.";
      } else if (stepInfo.type === "compare") {
        desc.textContent = `Comparing indices ${compareA} and ${compareB} (${arr[compareA]} > ${arr[compareB]}?)...`;
      } else if (stepInfo.type === "swap") {
        desc.textContent = `Swapping items at ${compareA} and ${compareB} to order them correctly.`;
      } else {
        desc.textContent = "Bubble Sort Complete! The array is fully sorted in ascending order.";
      }
    }
  }

  stepDSA() {
    if (this.dsaCurrentStep >= this.dsaSteps.length) return false;
    const stepInfo = this.dsaSteps[this.dsaCurrentStep];
    this.renderDSA(stepInfo);
    this.dsaCurrentStep++;
    return this.dsaCurrentStep < this.dsaSteps.length;
  }

  // ==========================================
  // WEBDEV VISUALIZER: EVENT BUBBLING
  // ==========================================
  initWebDev() {
    this.webdevCurrentStep = 0;
    this.renderWebDev();
  }

  renderWebDev() {
    const display = document.getElementById('visualizer-display-area');
    if (!display) return;

    const highlight = (node) => {
      const activeIdx = this.webdevCurrentStep - 1;
      if (activeIdx >= 0 && this.webdevSteps[activeIdx] === node) {
        return "border: 2px solid var(--color-danger); background-color: var(--color-danger-light); color: var(--color-danger); box-shadow: 0 0 10px rgba(207, 34, 46, 0.4);";
      }
      return "border: 1px dashed var(--border-color); background-color: var(--bg-primary); color: var(--text-primary);";
    };

    display.innerHTML = `
      <div id="wd-window" style="width: 100%; max-width: 420px; padding: 12px; border-radius: 8px; font-family: var(--font-sans); text-align: center; font-size: 0.8rem; transition: all 0.25s ease; ${highlight('window')}">
        <strong>window</strong>
        <div id="wd-document" style="margin-top: 10px; padding: 12px; border-radius: 6px; transition: all 0.25s ease; ${highlight('document')}">
          <strong>document</strong>
          <div id="wd-body" style="margin-top: 10px; padding: 12px; border-radius: 4px; transition: all 0.25s ease; ${highlight('body')}">
            <strong>&lt;body&gt;</strong>
            <div id="wd-container" style="margin-top: 10px; padding: 12px; border-radius: 4px; transition: all 0.25s ease; ${highlight('container')}">
              <strong>&lt;div class="container"&gt;</strong>
              <div id="wd-button" style="margin-top: 10px; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: all 0.25s ease; ${highlight('button')}">
                &lt;button id="btn"&gt;Click Me!&lt;/button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const desc = document.getElementById('visualizer-step-description');
    if (desc) {
      if (this.webdevCurrentStep === 0) {
        desc.textContent = "Clicking the inner button triggers an event. Watch it bubble up the DOM hierarchy.";
      } else {
        const bubbleNode = this.webdevSteps[this.webdevCurrentStep - 1];
        desc.textContent = `Event reached the [${bubbleNode}] handler! Executing listener.`;
      }
    }
  }

  stepWebDev() {
    if (this.webdevCurrentStep >= this.webdevSteps.length) {
      this.webdevCurrentStep = 0; // Loop around
    }
    this.webdevCurrentStep++;
    this.renderWebDev();
    return this.webdevCurrentStep < this.webdevSteps.length;
  }

  // ==========================================
  // SQL VISUALIZER: TABLE JOIN MATRIX
  // ==========================================
  initSQL() {
    this.sqlCurrentStep = 0;
    this.renderSQL();
  }

  renderSQL() {
    const display = document.getElementById('visualizer-display-area');
    if (!display) return;

    // Domain selectors inside visual area
    display.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; font-size: 0.78rem; font-family: var(--font-sans);">
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 4px;">
          <button class="btn btn-secondary btn-sm ${this.sqlMode === 'inner' ? 'active-tab' : ''}" id="sql-join-inner" style="font-size: 0.72rem; padding: 2px 8px;">INNER JOIN</button>
          <button class="btn btn-secondary btn-sm ${this.sqlMode === 'left' ? 'active-tab' : ''}" id="sql-join-left" style="font-size: 0.72rem; padding: 2px 8px;">LEFT JOIN</button>
          <button class="btn btn-secondary btn-sm ${this.sqlMode === 'right' ? 'active-tab' : ''}" id="sql-join-right" style="font-size: 0.72rem; padding: 2px 8px;">RIGHT JOIN</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 12px;">
          <!-- Customers Table -->
          <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px;">
            <strong style="display: block; margin-bottom: 6px; text-transform: uppercase;">Customers (A)</strong>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); font-weight: bold;">
                  <th style="padding: 2px;">id</th>
                  <th style="padding: 2px;">name</th>
                </tr>
              </thead>
              <tbody>
                ${this.sqlCustomers.map(c => {
                  let isMatched = false;
                  if (this.sqlCurrentStep > 0) {
                    if (this.sqlMode === "inner" && (c.id === 1 || c.id === 2)) isMatched = true;
                    if (this.sqlMode === "left") isMatched = true;
                    if (this.sqlMode === "right" && (c.id === 1 || c.id === 2)) isMatched = true;
                  }
                  const bg = isMatched ? "background-color: var(--accent-blue-light);" : "";
                  return `<tr style="${bg} border-bottom: 1px solid var(--border-color);"><td style="padding: 3px;">${c.id}</td><td style="padding: 3px;">${c.name}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Orders Table -->
          <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px;">
            <strong style="display: block; margin-bottom: 6px; text-transform: uppercase;">Orders (B)</strong>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); font-weight: bold;">
                  <th style="padding: 2px;">id</th>
                  <th style="padding: 2px;">cust_id</th>
                  <th style="padding: 2px;">product</th>
                </tr>
              </thead>
              <tbody>
                ${this.sqlOrders.map(o => {
                  let isMatched = false;
                  if (this.sqlCurrentStep > 0) {
                    if (this.sqlMode === "inner" && (o.cust_id === 1 || o.cust_id === 2)) isMatched = true;
                    if (this.sqlMode === "left" && (o.cust_id === 1 || o.cust_id === 2)) isMatched = true;
                    if (this.sqlMode === "right") isMatched = true;
                  }
                  const bg = isMatched ? "background-color: var(--accent-blue-light);" : "";
                  return `<tr style="${bg} border-bottom: 1px solid var(--border-color);"><td style="padding: 3px;">${o.id}</td><td style="padding: 3px;">${o.cust_id}</td><td style="padding: 3px;">${o.product}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Join Results Table -->
        ${this.sqlCurrentStep > 0 ? `
          <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px;">
            <strong style="display: block; margin-bottom: 6px; text-transform: uppercase; color: var(--accent-blue);">Result Table (A JOIN B ON A.id = B.cust_id)</strong>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); font-weight: bold;">
                  <th style="padding: 2px;">cust_id</th>
                  <th style="padding: 2px;">name</th>
                  <th style="padding: 2px;">order_id</th>
                  <th style="padding: 2px;">product</th>
                </tr>
              </thead>
              <tbody>
                ${this.getSQLJoinResults().map(r => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 3px;">${r.cust_id !== null ? r.cust_id : 'NULL'}</td>
                    <td style="padding: 3px;">${r.name !== null ? r.name : 'NULL'}</td>
                    <td style="padding: 3px;">${r.order_id !== null ? r.order_id : 'NULL'}</td>
                    <td style="padding: 3px;">${r.product !== null ? r.product : 'NULL'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `;

    // Bind Join Mode buttons click
    const btnInner = document.getElementById('sql-join-inner');
    const btnLeft = document.getElementById('sql-join-left');
    const btnRight = document.getElementById('sql-join-right');

    if (btnInner) btnInner.onclick = () => { this.sqlMode = "inner"; this.sqlCurrentStep = 0; this.renderSQL(); };
    if (btnLeft) btnLeft.onclick = () => { this.sqlMode = "left"; this.sqlCurrentStep = 0; this.renderSQL(); };
    if (btnRight) btnRight.onclick = () => { this.sqlMode = "right"; this.sqlCurrentStep = 0; this.renderSQL(); };

    const desc = document.getElementById('visualizer-step-description');
    if (desc) {
      if (this.sqlCurrentStep === 0) {
        desc.textContent = `Selected: [${this.sqlMode.toUpperCase()} JOIN]. Click "Next Step" to align keys and run query.`;
      } else {
        desc.textContent = `Completed ${this.sqlMode.toUpperCase()} JOIN. Matches paired up. Non-matching values are populated as NULL.`;
      }
    }
  }

  getSQLJoinResults() {
    const results = [];
    if (this.sqlMode === "inner") {
      // Intersection: matched records only
      this.sqlCustomers.forEach(c => {
        this.sqlOrders.forEach(o => {
          if (c.id === o.cust_id) {
            results.push({ cust_id: c.id, name: c.name, order_id: o.id, product: o.product });
          }
        });
      });
    } else if (this.sqlMode === "left") {
      // Left outer: All customers, matching orders or NULL
      this.sqlCustomers.forEach(c => {
        let matches = this.sqlOrders.filter(o => o.cust_id === c.id);
        if (matches.length > 0) {
          matches.forEach(o => {
            results.push({ cust_id: c.id, name: c.name, order_id: o.id, product: o.product });
          });
        } else {
          results.push({ cust_id: c.id, name: c.name, order_id: null, product: null });
        }
      });
    } else if (this.sqlMode === "right") {
      // Right outer: All orders, matching customers or NULL
      this.sqlOrders.forEach(o => {
        let cust = this.sqlCustomers.find(c => c.id === o.cust_id);
        if (cust) {
          results.push({ cust_id: cust.id, name: cust.name, order_id: o.id, product: o.product });
        } else {
          results.push({ cust_id: o.cust_id, name: null, order_id: o.id, product: o.product });
        }
      });
    }
    return results;
  }

  stepSQL() {
    if (this.sqlCurrentStep > 0) {
      this.sqlCurrentStep = 0; // Reset
    } else {
      this.sqlCurrentStep = 1; // Compute results
    }
    this.renderSQL();
    return this.sqlCurrentStep > 0;
  }

  // ==========================================
  // ML VISUALIZER: K-MEANS CLUSTERING
  // ==========================================
  initML() {
    this.mlCurrentStep = 0;
    this.mlPoints.forEach(p => p.cluster = null);
    this.mlCentroids[0] = { x: 25, y: 25, color: "red", id: 0 };
    this.mlCentroids[1] = { x: 75, y: 75, color: "blue", id: 1 };
    this.renderML();
  }

  renderML() {
    const display = document.getElementById('visualizer-display-area');
    if (!display) return;

    display.innerHTML = `
      <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
        <svg viewBox="0 0 100 100" style="width: 200px; height: 200px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--bg-primary); overflow: visible;">
          <!-- Centroid Radii Indicator -->
          ${this.mlCentroids.map(c => `
            <circle cx="${c.x}" cy="${c.y}" r="4" fill="none" stroke="${c.color}" stroke-dasharray="2 2" opacity="0.3"/>
          `).join('')}

          <!-- Grid Scatter points -->
          ${this.mlPoints.map(p => {
            let fill = "#8c959f";
            if (p.cluster === 0) fill = "var(--color-danger)";
            if (p.cluster === 1) fill = "var(--accent-blue)";
            return `<circle cx="${p.x}" cy="${p.y}" r="2" fill="${fill}" style="transition: fill 0.3s ease;"/>`;
          }).join('')}

          <!-- Centroids represented as Cross X -->
          ${this.mlCentroids.map(c => `
            <g transform="translate(${c.x}, ${c.y})">
              <path d="M-3,-3 L3,3 M-3,3 L3,-3" stroke="${c.color}" stroke-width="1.8"/>
              <circle cx="0" cy="0" r="1.5" fill="none" stroke="${c.color}"/>
            </g>
          `).join('')}
        </svg>
      </div>
    `;

    const desc = document.getElementById('visualizer-step-description');
    if (desc) {
      if (this.mlCurrentStep === 0) {
        desc.textContent = 'Scatter plot ready. Red & Blue Crosses are random Centroids. Points are grey.';
      } else if (this.mlCurrentStep === 1) {
        desc.textContent = 'Step 1: Assigned all points to the nearest cluster centroid (Red or Blue).';
      } else if (this.mlCurrentStep === 2) {
        desc.textContent = 'Step 2: Adjusted Centroids position to be the center of their assigned points.';
      }
    }
  }

  stepML() {
    if (this.mlCurrentStep === 0) {
      // Step 1: Assign points to nearest centroid
      this.mlPoints.forEach(p => {
        let dist0 = Math.hypot(p.x - this.mlCentroids[0].x, p.y - this.mlCentroids[0].y);
        let dist1 = Math.hypot(p.x - this.mlCentroids[1].x, p.y - this.mlCentroids[1].y);
        p.cluster = dist0 < dist1 ? 0 : 1;
      });
      this.mlCurrentStep = 1;
    } else if (this.mlCurrentStep === 1) {
      // Step 2: Recalculate centroids
      [0, 1].forEach(clusterId => {
        let clusterPoints = this.mlPoints.filter(p => p.cluster === clusterId);
        if (clusterPoints.length > 0) {
          let avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
          let avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
          // Apply new coordinates
          this.mlCentroids[clusterId].x = Math.round(avgX);
          this.mlCentroids[clusterId].y = Math.round(avgY);
        }
      });
      this.mlCurrentStep = 2;
    } else {
      // Loop reset
      this.mlCurrentStep = 0;
      this.mlPoints.forEach(p => p.cluster = null);
      this.mlCentroids[0] = { x: 25, y: 25, color: "red", id: 0 };
      this.mlCentroids[1] = { x: 75, y: 75, color: "blue", id: 1 };
    }

    this.renderML();
    return this.mlCurrentStep !== 2; // return false when done so animation loop stops
  }
}

// Instantiate visualizer and hook it inside load
document.addEventListener('DOMContentLoaded', () => {
  new DashboardController();
  new AlgoVisualizer();
});
