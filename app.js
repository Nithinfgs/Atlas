// Atlas Central Application Controller (Dependency Explorer, Impact, Review, City, Presentation, Compare)

class AtlasApp {
  constructor() {
    this.currentRepoKey = "github.com/facebook/react";
    this.currentRepoData = null;
    this.inspectedNode = null;

    // Submodules instances
    this.graph = null;
    this.simulator = null;
    this.gitMachine = null;
    this.scanners = null;
    this.ai = null;

    // Presentation Mode state
    this.isPresentationActive = false;
    this.currentSlideIdx = 0;
    this.slides = [
      {
        title: "Welcome to React Engine Tour",
        text: "This guided architectural walkthrough flies you through the core reconciliation engine, scheduler priority loops, hooks trackers, and DOM paint layers.",
        nodeId: "react"
      },
      {
        title: "User Interface Gateway",
        text: "ReactHooks.js acts as the developer interface, allocating state proxies. It coordinates internal states without knowing reconciler scheduling details.",
        nodeId: "react/ReactHooks.js"
      },
      {
        title: "Cooperative Work Scheduler",
        text: "Scheduler.js intercepts updates, scheduling task slices with browser postMessage frames. Bypasses main thread paint blockages.",
        nodeId: "scheduler/Scheduler.js"
      },
      {
        title: "Fiber Work Loop Coordinator",
        text: "ReactFiberWorkLoop.js orchestrates concurrent updates, traversing the fiber nodes tree and yielding if priority paint events arrive.",
        nodeId: "react-reconciler/ReactFiberWorkLoop.js"
      },
      {
        title: "Hooks State Allocators",
        text: "ReactFiberHooks.js manages component state lists. It contains complex queue loops and features a high technical risk index.",
        nodeId: "react-reconciler/ReactFiberHooks.js"
      },
      {
        title: "DOM Paint Commit Phase",
        text: "Finally, ReactFiberCommitWork.js mutates standard DOM elements synchronously, flushing layout changes and rendering the page.",
        nodeId: "react-reconciler/ReactFiberCommitWork.js"
      }
    ];

    // Initialize layout modules
    this.initViews();
    this.initSidebarNav();
    this.initInspectorTabs();
    this.initGlobalSearch();
    this.initKeyboardShortcuts();
    this.initSpaceBackground();

    // Call Depth slider UI
    this.initCallDepthSlider();

    // Code City toggle
    this.initCodeCityToggle();

    // Repository Comparison UI
    this.initRepositoryComparison();

    // Presentation UI
    this.initPresentationControls();

    // Auto-load default repository React
    this.loadRepository("github.com/facebook/react", false);
  }

  // View Transition Controller
  initViews() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const repoUrlInput = document.getElementById('repo-url-input');

    const triggerAnalysis = (url) => {
      let key = "github.com/facebook/react"; 
      if (url.includes("express")) key = "github.com/expressjs/express";
      if (url.includes("vscode")) key = "github.com/microsoft/vscode";

      this.loadRepository(key, true);
    };

    analyzeBtn.addEventListener('click', () => {
      const url = repoUrlInput.value.trim();
      if (url) {
        triggerAnalysis(url);
      } else {
        alert("Please paste a repository URL or click one of the quick chips.");
      }
    });

    document.querySelectorAll('.example-chip, .repo-item, .trend-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = el.getAttribute('data-url');
        triggerAnalysis(url);
      });
    });

    document.getElementById('sidebar-home-btn').addEventListener('click', () => {
      this.switchMainView('home-view');
    });

    document.getElementById('launch-canvas-btn').addEventListener('click', () => {
      this.switchTab('architecture');
    });
  }

  switchMainView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'workspace-view' && this.graph) {
      setTimeout(() => this.graph.resizeCanvas(), 50);
    }
  }

  // Load and Index repository simulation
  loadRepository(repoKey, showLoaderAnimation = true) {
    const repoData = window.AtlasData[repoKey];
    if (!repoData) {
      alert("Error: Atlas visual indexes only exist for Express, React, or VS Code currently.");
      return;
    }

    this.currentRepoKey = repoKey;
    this.currentRepoData = repoData;

    // Reset components inspector
    this.inspectedNode = null;
    document.getElementById('inspect-title').innerText = "Select a node to inspect";
    document.getElementById('inspect-meta').innerText = "No node selected";
    
    // Set headers
    document.getElementById('current-repo-name').innerText = repoData.name;
    document.getElementById('current-repo-badge').innerText = repoData.stats.languages[0].name;

    if (showLoaderAnimation) {
      document.getElementById('loading-repo-name').innerText = `Analyzing ${repoData.name}...`;
      this.switchMainView('loading-view');
      this.runLoaderSimulation(() => this.initializeWorkspaceViews(repoData));
    } else {
      this.initializeWorkspaceViews(repoData);
      this.switchMainView('workspace-view');
    }
  }

  runLoaderSimulation(callback) {
    const bar = document.getElementById('loading-progress-bar');
    const stepClone = document.getElementById('step-clone');
    const stepAst = document.getElementById('step-ast');
    const stepDeps = document.getElementById('step-deps');
    const stepScanners = document.getElementById('step-scanners');

    document.querySelectorAll('.progress-steps .step').forEach(s => s.classList.remove('active'));
    bar.style.width = '0%';

    stepClone.classList.add('active');
    bar.style.width = '25%';

    setTimeout(() => {
      stepAst.classList.add('active');
      bar.style.width = '50%';
    }, 600);

    setTimeout(() => {
      stepDeps.classList.add('active');
      bar.style.width = '75%';
    }, 1200);

    setTimeout(() => {
      stepScanners.classList.add('active');
      bar.style.width = '100%';
    }, 1800);

    setTimeout(() => {
      callback();
    }, 2400);
  }

  initializeWorkspaceViews(repoData) {
    // Populate Overview dashboard stats
    document.getElementById('health-score-text').textContent = `${repoData.stats.healthScore}%`;
    document.getElementById('health-score-path').setAttribute('stroke-dasharray', `${repoData.stats.healthScore}, 100`);

    document.getElementById('ov-complexity').innerText = repoData.stats.complexity;
    document.getElementById('ov-files').innerText = repoData.stats.files.toLocaleString();
    document.getElementById('ov-functions').innerText = repoData.stats.functions.toLocaleString();
    document.getElementById('ov-deps').innerText = repoData.stats.dependencies;

    document.getElementById('score-arch').innerText = `${repoData.stats.architectureScore}%`;
    document.getElementById('fill-arch').style.width = `${repoData.stats.architectureScore}%`;
    document.getElementById('score-debt').innerText = `${repoData.stats.techDebtScore}%`;
    document.getElementById('fill-debt').style.width = `${repoData.stats.techDebtScore}%`;
    document.getElementById('score-security').innerText = `${repoData.stats.securityScore}%`;
    document.getElementById('fill-security').style.width = `${repoData.stats.securityScore}%`;
    document.getElementById('score-doc').innerText = `${repoData.stats.docScore}%`;
    document.getElementById('fill-doc').style.width = `${repoData.stats.docScore}%`;

    // Smart Insights / Facts loader
    this.populateSmartInsights(repoData);

    // Languages distribution bar
    const bar = document.getElementById('lang-distribution-bar');
    const legend = document.getElementById('lang-list-legend');
    bar.innerHTML = '';
    legend.innerHTML = '';

    const colors = ['#6366F1', '#06B6D4', '#8B5CF6', '#22C55E', '#F59E0B'];
    repoData.stats.languages.forEach((lang, idx) => {
      const color = colors[idx % colors.length];
      
      const segment = document.createElement('div');
      segment.className = 'lang-segment';
      segment.style.width = `${lang.percent}%`;
      segment.style.backgroundColor = color;
      bar.appendChild(segment);

      const legItem = document.createElement('li');
      legItem.className = 'lang-legend-item';
      legItem.innerHTML = `
        <span class="lang-dot" style="background-color: ${color}"></span>
        <span>${lang.name} (${lang.percent}%)</span>
      `;
      legend.appendChild(legItem);
    });

    if (!this.graph) {
      this.graph = new window.AtlasGraph("architecture-canvas", "minimap-canvas", "minimap-viewport");
    }
    this.graph.setData(repoData.graph);

    if (!this.simulator) {
      this.simulator = new window.AtlasSimulator();
    }
    this.simulator.loadRepositorySimulations(repoData);

    if (!this.gitMachine) {
      this.gitMachine = new window.AtlasGitMachine();
    }
    this.gitMachine.loadRepositoryHistory(repoData);

    if (!this.scanners) {
      this.scanners = new window.AtlasScanners();
    }
    this.scanners.loadScannerData(repoData);

    if (!this.ai) {
      this.ai = new window.AtlasAI();
    }

    this.switchMainView('workspace-view');
    this.switchTab('overview');
  }

  // Smart Insights facts loader helper
  populateSmartInsights(repoData) {
    const isExpress = repoData.name.includes("Express");
    const isVscode = repoData.name.includes("VS Code");

    if (isExpress) {
      document.getElementById('fact-largest-module').innerText = "Router Module";
      document.getElementById('fact-oldest-file').innerText = "express.js";
      document.getElementById('fact-most-edited-fn').innerText = "router.handle()";
      document.getElementById('fact-most-connected-file').innerText = "application.js";
      document.getElementById('fact-longest-chain').innerText = "6 modules";
      document.getElementById('fact-largest-circular').innerText = "None detected";
    } else if (isVscode) {
      document.getElementById('fact-largest-module').innerText = "VS Workbench Common";
      document.getElementById('fact-oldest-file').innerText = "lifecycle.ts";
      document.getElementById('fact-most-edited-fn').innerText = "applyEdits()";
      document.getElementById('fact-most-connected-file').innerText = "textModel.ts";
      document.getElementById('fact-longest-chain').innerText = "28 modules";
      document.getElementById('fact-largest-circular').innerText = "9 circular groups";
    } else {
      // React default
      document.getElementById('fact-largest-module').innerText = "Fiber Reconciler";
      document.getElementById('fact-oldest-file').innerText = "React.js";
      document.getElementById('fact-most-edited-fn').innerText = "performSyncWorkOnRoot()";
      document.getElementById('fact-most-connected-file').innerText = "ReactFiberWorkLoop.js";
      document.getElementById('fact-longest-chain').innerText = "18 modules";
      document.getElementById('fact-largest-circular').innerText = "BeginWork <-> WorkLoop";
    }
  }

  initSidebarNav() {
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
      item.addEventListener('click', () => {
        const tabName = item.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
      li.classList.remove('active');
      if (li.getAttribute('data-tab') === tabName) {
        li.classList.add('active');
      }
    });

    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Call Graph Depth slider toggler
    const depthContainer = document.getElementById('depth-slider-container');
    if (depthContainer) {
      depthContainer.style.display = (tabName === 'call-graph') ? 'flex' : 'none';
    }

    if (tabName === 'architecture' || tabName === 'call-graph') {
      document.getElementById('tab-visualizer').classList.add('active');
      
      if (this.graph) {
        this.graph.displayMode = tabName;
        this.graph.filterGraph(); // trigger BFS filter logic if switching call graph
        this.graph.resizeCanvas();
        
        document.getElementById('btn-mode-arch').classList.remove('active');
        document.getElementById('btn-mode-call').classList.remove('active');
        if (tabName === 'architecture') {
          document.getElementById('btn-mode-arch').classList.add('active');
        } else {
          document.getElementById('btn-mode-call').classList.add('active');
        }
      }
    } else {
      document.getElementById(`tab-${tabName}`).classList.add('active');
    }
  }

  // Call Graph Depth slider changes listener
  initCallDepthSlider() {
    const slider = document.getElementById('call-depth-slider');
    const labelVal = document.getElementById('call-depth-value');

    slider.addEventListener('input', () => {
      const val = parseInt(slider.value);
      labelVal.innerText = val === 4 ? "All" : val;
      
      if (this.graph) {
        this.graph.callDepth = val;
        this.graph.filterGraph();
      }
    });
  }

  // Code City mode toggle key listener
  initCodeCityToggle() {
    const btn = document.getElementById('btn-mode-city');
    btn.addEventListener('click', () => {
      if (this.graph) {
        this.graph.codeCityMode = !this.graph.codeCityMode;
        btn.classList.toggle('active');
      }
    });
  }

  // Repository side-by-side comparison stats controller
  initRepositoryComparison() {
    const selectA = document.getElementById('comp-repo-a');
    const selectB = document.getElementById('comp-repo-b');

    const updateCompareDetails = () => {
      const keyA = selectA.value;
      const keyB = selectB.value;

      const dataA = window.AtlasData[keyA];
      const dataB = window.AtlasData[keyB];

      if (!dataA || !dataB) return;

      // Update complexity bars (lower is better, so lower value is represented as longer healthy bar? Actually standard percentage rating)
      const compValA = keyA.includes("react") ? 45 : keyA.includes("express") ? 25 : 85;
      const compValB = keyB.includes("react") ? 45 : keyB.includes("express") ? 25 : 85;
      
      document.getElementById('comp-a-val-complexity').innerText = `${compValA}%`;
      document.getElementById('comp-b-val-complexity').innerText = `${compValB}%`;
      document.getElementById('comp-a-bar-complexity').style.width = `${compValA}%`;
      document.getElementById('comp-b-bar-complexity').style.width = `${compValB}%`;

      // Cohesion / Coupling
      const coupA = dataA.stats.architectureScore;
      const coupB = dataB.stats.architectureScore;
      document.getElementById('comp-a-val-coupling').innerText = `${coupA}%`;
      document.getElementById('comp-b-val-coupling').innerText = `${coupB}%`;
      document.getElementById('comp-a-bar-coupling').style.width = `${coupA}%`;
      document.getElementById('comp-b-bar-coupling').style.width = `${coupB}%`;

      // Dependency Density
      const densA = keyA.includes("react") ? 12 : keyA.includes("express") ? 32 : 55;
      const densB = keyB.includes("react") ? 12 : keyB.includes("express") ? 32 : 55;
      document.getElementById('comp-a-val-density').innerText = `${densA}%`;
      document.getElementById('comp-b-val-density').innerText = `${densB}%`;
      document.getElementById('comp-a-bar-density').style.width = `${densA}%`;
      document.getElementById('comp-b-bar-density').style.width = `${densB}%`;

      // Maintainability
      const maintA = dataA.stats.maintainabilityScore;
      const maintB = dataB.stats.maintainabilityScore;
      document.getElementById('comp-a-val-maintainability').innerText = `${maintA}%`;
      document.getElementById('comp-b-val-maintainability').innerText = `${maintB}%`;
      document.getElementById('comp-a-bar-maintainability').style.width = `${maintA}%`;
      document.getElementById('comp-b-bar-maintainability').style.width = `${maintB}%`;

      // Narrative text
      document.getElementById('comp-summary-text').innerHTML = `
        <strong>${dataA.name}</strong> scores ${dataA.stats.healthScore}% health, exhibiting standard file structures. 
        In contrast, <strong>${dataB.name}</strong> scores ${dataB.stats.healthScore}% health, featuring alternate folder packing modularity.
      `;
    };

    selectA.addEventListener('change', updateCompareDetails);
    selectB.addEventListener('change', updateCompareDetails);
  }

  // Guided tours camera path automated loops
  initPresentationControls() {
    const presentBtn = document.getElementById('btn-canvas-present');
    const overlay = document.getElementById('presentation-narration-card');
    
    const exitBtn = document.getElementById('btn-exit-presentation');
    const prevBtn = document.getElementById('btn-pres-prev');
    const nextBtn = document.getElementById('btn-pres-next');
    const dotsWrapper = document.getElementById('pres-steps-indicator-dots');

    const launchTour = () => {
      this.isPresentationActive = true;
      this.currentSlideIdx = 0;
      
      this.switchTab('architecture');
      overlay.classList.add('active');

      // Populate dots
      dotsWrapper.innerHTML = '';
      this.slides.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = `pres-dot ${idx === 0 ? 'active' : ''}`;
        dotsWrapper.appendChild(dot);
      });

      this.loadSlideStep(0);
    };

    const closeTour = () => {
      this.isPresentationActive = false;
      overlay.classList.remove('active');
      if (this.graph) this.graph.centerGraph();
    };

    presentBtn.addEventListener('click', launchTour);
    exitBtn.addEventListener('click', closeTour);
    
    prevBtn.addEventListener('click', () => {
      if (this.currentSlideIdx > 0) {
        this.currentSlideIdx--;
        this.loadSlideStep(this.currentSlideIdx);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (this.currentSlideIdx < this.slides.length - 1) {
        this.currentSlideIdx++;
        this.loadSlideStep(this.currentSlideIdx);
      } else {
        closeTour();
      }
    });
  }

  loadSlideStep(index) {
    this.currentSlideIdx = index;
    const slide = this.slides[index];

    document.getElementById('pres-slide-title').innerText = slide.title;
    document.getElementById('pres-slide-text').innerText = slide.text;

    // Update active dot
    const dots = document.querySelectorAll('.pres-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    // Animate Visualizer Camera Fly-To target node
    if (this.graph) {
      const foundNode = this.graph.allNodes.find(n => n.id === slide.nodeId);
      if (foundNode) {
        const canvasNode = this.graph.nodes.find(n => n.id === foundNode.id);
        if (canvasNode) {
          this.graph.focusNode(canvasNode);
          this.inspectNode(canvasNode);
        }
      }
    }
  }

  initInspectorTabs() {
    const tabs = document.querySelectorAll('.ins-tab');
    const panels = document.querySelectorAll('.ins-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        const targetPanel = tab.getAttribute('data-ins-tab');
        document.getElementById(`ins-panel-${targetPanel}`).classList.add('active');
      });
    });

    document.getElementById('btn-close-inspect').addEventListener('click', () => {
      document.querySelector('.visualizer-inspector-pane').style.display = 'none';
      setTimeout(() => this.graph.resizeCanvas(), 50);
    });

    document.getElementById('btn-mode-arch').addEventListener('click', () => this.switchTab('architecture'));
    document.getElementById('btn-mode-call').addEventListener('click', () => this.switchTab('call-graph'));
    document.getElementById('btn-canvas-center').addEventListener('click', () => this.graph.centerGraph());
    document.getElementById('btn-canvas-focus').addEventListener('click', () => {
      if (this.graph.selectedNode) this.graph.focusNode(this.graph.selectedNode);
    });

    document.getElementById('btn-canvas-fullscreen').addEventListener('click', () => {
      const el = document.querySelector('.canvas-visualizer-wrapper');
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(err => alert(err.message));
      } else {
        document.exitFullscreen();
      }
    });

    document.querySelectorAll('.heatmap-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.heatmap-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const heatmap = chip.getAttribute('data-heatmap');
        this.graph.heatmapMode = heatmap;
      });
    });

    document.getElementById('btn-canvas-split').addEventListener('click', () => {
      alert("Split View layout activated! (Opens secondary branch canvas layer alongside master graph).");
    });

    document.querySelectorAll('.dock-header-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.dock-header-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dock-panels .dock-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const target = tab.getAttribute('data-dock-tab');
        
        if (target.includes('git')) {
          document.getElementById('dock-panel-git-scrubber').classList.add('active');
        } else {
          document.getElementById(`dock-panel-${target}`).classList.add('active');
        }
      });
    });

    // Dependency scope checkbox listeners
    const checkboxes = ['dep-toggle-direct', 'dep-toggle-transitive', 'dep-toggle-internal', 'dep-toggle-external'];
    checkboxes.forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        if (this.inspectedNode) {
          this.populateReferences(this.inspectedNode);
        }
      });
    });
  }

  // Node Selection Inspector detail populator
  inspectNode(node) {
    this.inspectedNode = node;
    
    const pane = document.querySelector('.visualizer-inspector-pane');
    pane.style.display = 'flex';
    setTimeout(() => this.graph.resizeCanvas(), 50);

    document.getElementById('inspect-badge').innerText = node.type.toUpperCase();
    document.getElementById('inspect-title').innerText = node.label;
    
    const sizeKb = node.size ? `${(node.size / 1024).toFixed(1)} KB` : 'N/A';
    const lines = node.lines ? `${node.lines} lines` : 'N/A';
    document.getElementById('inspect-meta').innerText = `${sizeKb} • ${lines} • Group: ${node.group}`;

    if (this.ai) {
      this.ai.inspectNode(node);
    }

    this.populateSourceCode(node);
    this.populateReferences(node);
    
    // Populate Impact assessments estimates
    this.calculateImpactRisk(node);

    // Update Breadcrumbs trace
    const breadcrumbVal = document.getElementById('visualizer-breadcrumbs');
    breadcrumbVal.innerHTML = `
      <span class="crumb root-crumb">Root</span>
      <span class="crumb-separator">/</span>
      <span class="crumb">${node.group}</span>
      <span class="crumb-separator">/</span>
      <span class="crumb current-crumb">${node.label}</span>
    `;
    
    breadcrumbVal.querySelector('.root-crumb').addEventListener('click', () => {
      this.graph.centerGraph();
    });
  }

  // Impact risk calculation helper
  calculateImpactRisk(node) {
    const isCore = node.group === 'core' || node.group === 'reconciler';
    
    // Spikes calculations based on modular positioning
    const affFiles = isCore ? 17 : 3;
    const affEndpoints = isCore ? 4 : 0;
    const affComponents = isCore ? 9 : 1;
    const affTests = isCore ? 31 : 5;
    
    const riskScore = isCore ? 82 : 25;
    const breakingProb = isCore ? "High" : "Low";

    document.getElementById('impact-val-files').innerText = affFiles;
    document.getElementById('impact-val-endpoints').innerText = affEndpoints;
    document.getElementById('impact-val-components').innerText = affComponents;
    document.getElementById('impact-val-tests').innerText = affTests;

    document.getElementById('impact-risk-score').innerText = `${riskScore}%`;
    document.getElementById('impact-risk-fill').style.width = `${riskScore}%`;
    
    const textProb = document.getElementById('impact-breaking-text');
    textProb.innerText = breakingProb;
    
    textProb.className = breakingProb === 'High' ? 'danger-text' : 'success-text';

    // Populate predicted breakages list
    const breakagesList = document.getElementById('impact-breakages-list');
    breakagesList.innerHTML = '';
    
    const warnings = isCore 
      ? [`ReactDOMRoot.test.js (Uncaught mount exceptions)`, `ReactHooks.test.js (Queue pointer errors)`, `dangerouslySetInnerHTML.js (Markup binding breaks)`]
      : [`${node.label.replace('.js', '.test.js')} (Direct API mismatch)`];

    warnings.forEach(w => {
      const li = document.createElement('li');
      li.innerHTML = `⚠️ <span class="code-font">${w}</span>`;
      breakagesList.appendChild(li);
    });

    // Populate Dependency Explorer scope values in references header
    document.getElementById('dep-metric-radius').innerText = affFiles;
    document.getElementById('dep-metric-depth').innerText = isCore ? 6 : 2;
    document.getElementById('dep-metric-shared').innerText = isCore ? "Yes" : "No";
  }

  populateSourceCode(node) {
    const codeArea = document.getElementById('code-display-area');
    const pathTitle = document.getElementById('code-filepath-title');
    
    pathTitle.innerText = `${node.group}/${node.label}`;

    let code = `// AST Indexed source file: ${node.label}
// Package context module: ${node.group}
// Code complexity: ${node.complexity}

import { SharedInternals } from '../shared/ReactSharedInternals';
import { Scheduler } from '../scheduler/Scheduler';

export function ${node.label.replace('.js', '').replace('.ts', '')}() {
  const context = SharedInternals.context;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log("Analyzing execution stack path...");
  }

  // Simulated node business logic
  try {
    const workInProgress = context.current;
    if (workInProgress !== null) {
      Scheduler.performSyncWork(workInProgress);
    }
  } catch (error) {
    console.error("Call Graph Exception trace: ", error);
  }
}`;

    if (node.complexity === 'danger' || node.complexity === 'legacy') {
      code += `\n\n// TODO: Refactor God Object warnings. High coupling density detected.\n// Circular references found in imports!`;
    }

    codeArea.innerHTML = '';
    
    const lines = code.split('\n');
    lines.forEach((line, idx) => {
      const span = document.createElement('span');
      span.className = 'code-line-span';
      
      if (idx === 10 && (node.complexity === 'danger' || node.complexity === 'legacy')) {
        span.className += ' highlight-complexity';
      }
      if (idx === 5 && node.complexity === 'critical') {
        span.className += ' highlight-security';
      }

      span.innerText = `${idx + 1} | ${line}`;
      codeArea.appendChild(span);
    });
  }

  populateReferences(node) {
    const incomingList = document.getElementById('relations-incoming-list');
    const outgoingList = document.getElementById('relations-outgoing-list');
    const cochangesList = document.getElementById('relations-cochanges-list');

    incomingList.innerHTML = '';
    outgoingList.innerHTML = '';
    cochangesList.innerHTML = '';

    // Scope check boxes
    const showTransitive = document.getElementById('dep-toggle-transitive').checked;
    const showInternal = document.getElementById('dep-toggle-internal').checked;

    let incoming = this.graph.edges.filter(e => e.target === node.id);
    let outgoing = this.graph.edges.filter(e => e.source === node.id);

    // If Transitive is checked, simulate indirect connection list additions
    if (showTransitive && incoming.length > 0) {
      // add a mock transitive coupling file to demonstrate
      incoming.push({ source: `shared/ReactSharedInternals.js`, target: node.id, relation: 'transitive' });
    }

    if (!showInternal) {
      incoming = [];
      outgoing = [];
    }

    if (incoming.length === 0) {
      incomingList.innerHTML = '<li><span class="empty-text">No incoming references matching scope</span></li>';
    } else {
      incoming.forEach(edge => {
        const li = document.createElement('li');
        li.innerText = `${edge.source} ${edge.relation === 'transitive' ? '(transitive)' : ''}`;
        li.style.color = edge.relation === 'transitive' ? 'var(--highlight-purple)' : 'inherit';
        
        li.addEventListener('click', () => {
          const match = this.graph.nodes.find(n => n.id === edge.source);
          if (match) {
            this.graph.focusNode(match);
            this.inspectNode(match);
          }
        });
        incomingList.appendChild(li);
      });
    }

    if (outgoing.length === 0) {
      outgoingList.innerHTML = '<li><span class="empty-text">No outgoing imports matching scope</span></li>';
    } else {
      outgoing.forEach(edge => {
        const li = document.createElement('li');
        li.innerText = edge.target;
        li.addEventListener('click', () => {
          const match = this.graph.nodes.find(n => n.id === edge.target);
          if (match) {
            this.graph.focusNode(match);
            this.inspectNode(match);
          }
        });
        outgoingList.appendChild(li);
      });
    }

    const cochanged = [`packages/${node.group}/index.js`, `tests/${node.label.replace('.js', '.test.js')}`];
    cochanged.forEach(file => {
      const li = document.createElement('li');
      li.innerText = file;
      li.className = 'empty-text';
      cochangesList.appendChild(li);
    });
  }

  // Symbol indexing search controller
  initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    const dropdown = document.getElementById('search-dropdown');

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      dropdown.innerHTML = '';

      if (!query || !this.graph) {
        dropdown.classList.remove('active');
        return;
      }

      const matches = this.graph.allNodes.filter(n => 
        n.label.toLowerCase().includes(query) || 
        n.id.toLowerCase().includes(query)
      ).slice(0, 8); 

      if (matches.length === 0) {
        dropdown.innerHTML = '<div class="search-result-item empty-text">No matching symbols found</div>';
      } else {
        matches.forEach(node => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.innerHTML = `
            <span><strong>${node.label}</strong> <span style="opacity: 0.6; font-size: 0.7rem;">(${node.group})</span></span>
            <span class="item-type">${node.type}</span>
          `;
          item.addEventListener('click', () => {
            dropdown.classList.remove('active');
            searchInput.value = '';
            
            this.switchTab('architecture');

            setTimeout(() => {
              const canvasNode = this.graph.nodes.find(n => n.id === node.id);
              if (canvasNode) {
                this.graph.focusNode(canvasNode);
                this.inspectNode(canvasNode);
              } else {
                alert(`Node inside folder group "${node.group}" is currently collapsed. Double click folder group node to expand.`);
              }
            }, 50);
          });
          dropdown.appendChild(item);
        });
      }

      dropdown.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  // Keyboard Shortcuts overlay controller
  initKeyboardShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    const openBtn = document.getElementById('btn-shortcuts-info');
    const closeBtn = document.getElementById('btn-close-modal');

    openBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    document.addEventListener('keydown', e => {
      const act = document.activeElement.tagName;
      if (act === 'INPUT' || act === 'SELECT' || act === 'TEXTAREA') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (this.graph) this.graph.centerGraph();
          break;
        case 'f':
          if (this.graph && this.graph.selectedNode) {
            this.graph.focusNode(this.graph.selectedNode);
          }
          break;
        case 'a':
          e.preventDefault();
          this.switchTab('architecture');
          document.querySelector('.ins-tab[data-ins-tab="ai"]').click();
          setTimeout(() => document.getElementById('chat-input-field').focus(), 100);
          break;
        case 'g':
          document.body.classList.toggle('dock-collapsed');
          setTimeout(() => { if (this.graph) this.graph.resizeCanvas(); }, 300);
          break;
        case 'r':
          if (this.gitMachine) {
            document.getElementById('btn-git-replay').click();
          }
          break;
        case 's':
          e.preventDefault();
          document.getElementById('global-search-input').focus();
          break;
        case 'p':
          // Start presentation Mode shortcut
          e.preventDefault();
          document.getElementById('btn-canvas-present').click();
          break;
        case 'escape':
          modal.classList.remove('active');
          if (this.isPresentationActive) {
            document.getElementById('btn-exit-presentation').click();
          }
          break;
      }
    });
  }

  // Background Nebula Canvas Particle drawing
  initSpaceBackground() {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const count = 120;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.005 + 0.002
      });
    }

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 10,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
      );
      grad.addColorStop(0, '#0C132B');
      grad.addColorStop(1, '#050816');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${p.alpha})`; 
        ctx.fill();

        p.alpha += p.speed;
        if (p.alpha > 0.8 || p.alpha < 0.2) {
          p.speed = -p.speed;
        }
      });

      requestAnimationFrame(drawStars);
    };

    drawStars();
  }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  window.AtlasApp = new AtlasApp();
});
