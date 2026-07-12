// Atlas Runtime Simulator module

class AtlasSimulator {
  constructor() {
    this.activeSimName = null;
    this.activeSimSteps = [];
    this.currentStepIdx = -1;
    this.intervalId = null;
    this.isRunning = false;
    
    this.cardsContainer = document.getElementById('sim-cards-list');
    this.stepsContainer = document.getElementById('sim-steps-wrapper');
    this.runBtn = document.getElementById('btn-run-simulation');

    this.cpuFill = document.getElementById('sim-cpu-fill');
    this.cpuText = document.getElementById('sim-cpu-text');
    this.memFill = document.getElementById('sim-mem-fill');
    this.memText = document.getElementById('sim-mem-text');
    this.delayFill = document.getElementById('sim-delay-fill');
    this.delayText = document.getElementById('sim-delay-text');

    this.runBtn.addEventListener('click', () => this.startSimulation());
  }

  loadRepositorySimulations(repoData) {
    this.stopSimulation();
    this.cardsContainer.innerHTML = '';
    
    const sims = repoData.simulations || {};
    const keys = Object.keys(sims);

    if (keys.length === 0) {
      this.cardsContainer.innerHTML = '<div class="empty-text">No simulations configured for this repository</div>';
      return;
    }

    keys.forEach((key, idx) => {
      const sim = sims[key];
      const card = document.createElement('div');
      card.className = `sim-card-item ${idx === 0 ? 'active' : ''}`;
      card.innerHTML = `
        <h5>${key}</h5>
        <p>${sim.description}</p>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.sim-card-item').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectSimulation(key, sim);
      });
      this.cardsContainer.appendChild(card);
      
      // Auto-select first simulation
      if (idx === 0) {
        this.selectSimulation(key, sim);
      }
    });
  }

  selectSimulation(name, sim) {
    this.stopSimulation();
    this.activeSimName = name;
    this.activeSimSteps = sim.steps || [];
    this.currentStepIdx = -1;

    // Build static steps preview in dock list
    this.stepsContainer.innerHTML = '';
    this.activeSimSteps.forEach(step => {
      const stepEl = document.createElement('div');
      stepEl.className = 'sim-exec-step';
      stepEl.innerHTML = `
        <span class="s-action">${step.action}</span>
        <span class="s-node">${step.node.split('/').pop()}</span>
      `;
      this.stepsContainer.appendChild(stepEl);
    });

    // Reset CPU/Mem charts
    this.updateStatsBar(0, 14.2, 0);
  }

  startSimulation() {
    if (this.isRunning || this.activeSimSteps.length === 0) return;
    this.isRunning = true;
    this.currentStepIdx = 0;
    this.runBtn.innerText = "Simulating...";
    this.runBtn.disabled = true;

    // Reset list active styles
    const stepEls = this.stepsContainer.children;
    for (let i = 0; i < stepEls.length; i++) {
      stepEls[i].classList.remove('active');
    }

    this.runStep();
  }

  runStep() {
    if (this.currentStepIdx >= this.activeSimSteps.length) {
      this.endSimulation();
      return;
    }

    const step = this.activeSimSteps[this.currentStepIdx];
    const stepEls = this.stepsContainer.children;

    // Remove previous step highlights, add active
    if (this.currentStepIdx > 0) {
      stepEls[this.currentStepIdx - 1].classList.remove('active');
    }
    const currentEl = stepEls[this.currentStepIdx];
    if (currentEl) {
      currentEl.classList.add('active');
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Trigger visual canvas pulses
    const graph = window.AtlasApp ? window.AtlasApp.graph : null;
    if (graph) {
      // Find canvas node matching file path
      const targetNode = graph.nodes.find(n => n.id === step.node);
      if (targetNode) {
        graph.focusNode(targetNode);
        
        // Highlight in inspector automatically
        if (window.AtlasApp) {
          window.AtlasApp.inspectNode(targetNode);
        }

        // Trigger pulse on connection links if we have a previous step
        if (this.currentStepIdx > 0) {
          const prevStep = this.activeSimSteps[this.currentStepIdx - 1];
          graph.triggerPulse(prevStep.node, step.node, 0.04, 'var(--accent-cyan)');
        }
      }
    }

    // Spikes CPU and Mem allocated metrics
    const baseMem = parseFloat(step.memory);
    const mockCpu = Math.floor(Math.random() * 45) + 30; // 30-75% load
    const delayIncrement = Math.round(step.duration * 10);
    this.updateStatsBar(mockCpu, 14 + baseMem, delayIncrement);

    this.currentStepIdx++;
    this.intervalId = setTimeout(() => this.runStep(), 1500);
  }

  updateStatsBar(cpuVal, memVal, delayVal) {
    this.cpuFill.style.width = `${cpuVal}%`;
    this.cpuText.innerText = `${cpuVal}% CPU`;
    
    // Scale slider max
    const maxMem = 30; 
    const memPercent = Math.min((memVal / maxMem) * 100, 100);
    this.memFill.style.width = `${memPercent}%`;
    this.memText.innerText = `${memVal.toFixed(1)} MB`;

    const maxDelay = 300;
    const delayPercent = Math.min((delayVal / maxDelay) * 100, 100);
    this.delayFill.style.width = `${delayPercent}%`;
    this.delayText.innerText = `${delayVal} ms`;
  }

  endSimulation() {
    this.stopSimulation();
    this.runBtn.innerText = "Simulate Runtime Call Path";
    this.runBtn.disabled = false;
    
    // Settle stats metrics
    this.updateStatsBar(2, 14.2, 0);

    const stepEls = this.stepsContainer.children;
    for (let i = 0; i < stepEls.length; i++) {
      stepEls[i].classList.remove('active');
    }
  }

  stopSimulation() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.runBtn.innerText = "Simulate Runtime Call Path";
    this.runBtn.disabled = false;
  }
}
window.AtlasSimulator = AtlasSimulator;
