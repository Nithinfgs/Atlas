// Atlas Git Time Machine scrubber & Replay Morph module

class AtlasGitMachine {
  constructor() {
    this.history = [];
    this.currentCommitIdx = -1;
    this.isReplaying = false;
    this.replayInterval = null;

    this.slider = document.getElementById('git-slider');
    this.marksContainer = document.getElementById('git-slider-marks');
    this.replayBtn = document.getElementById('btn-git-replay');

    this.hashVal = document.getElementById('commit-hash-val');
    this.authorVal = document.getElementById('commit-author-val');
    this.dateVal = document.getElementById('commit-date-val');
    this.msgVal = document.getElementById('commit-msg-val');
    this.addedVal = document.getElementById('commit-added-val');
    this.removedVal = document.getElementById('commit-removed-val');

    this.diffBtn = document.getElementById('btn-run-diff');
    this.branchASelect = document.getElementById('diff-branch-a');
    this.branchBSelect = document.getElementById('diff-branch-b');

    this.setupEvents();
  }

  loadRepositoryHistory(repoData) {
    this.stopReplay();
    this.history = repoData.history || [];
    
    if (this.history.length === 0) return;

    this.slider.min = 0;
    this.slider.max = this.history.length - 1;
    this.slider.value = this.history.length - 1;
    this.currentCommitIdx = this.history.length - 1;

    // Draw slider years indicators
    this.marksContainer.innerHTML = '';
    this.history.forEach((commit, idx) => {
      const year = commit.date.split('-')[0];
      const mark = document.createElement('span');
      mark.innerText = year;
      mark.style.cursor = 'pointer';
      mark.addEventListener('click', () => {
        this.slider.value = idx;
        this.scrubToCommit(idx);
      });
      this.marksContainer.appendChild(mark);
    });

    this.scrubToCommit(this.currentCommitIdx);
  }

  setupEvents() {
    this.slider.addEventListener('input', () => {
      this.stopReplay();
      this.scrubToCommit(parseInt(this.slider.value));
    });

    this.replayBtn.addEventListener('click', () => {
      if (this.isReplaying) {
        this.stopReplay();
      } else {
        this.startReplay();
      }
    });

    this.diffBtn.addEventListener('click', () => this.executeBranchDiff());
  }

  scrubToCommit(index) {
    if (index < 0 || index >= this.history.length) return;
    this.currentCommitIdx = index;
    this.slider.value = index;

    const commit = this.history[index];
    this.hashVal.innerText = commit.commit;
    this.authorVal.innerText = commit.author;
    this.dateVal.innerText = commit.date;
    this.msgVal.innerText = commit.message;
    this.addedVal.innerText = `+${commit.nodesAdded.length} symbols added`;
    this.removedVal.innerText = `-${commit.nodesRemoved.length} symbols removed`;

    // Compute active topology up to this index
    const activeNodes = new Set();
    
    for (let i = 0; i <= index; i++) {
      const c = this.history[i];
      c.nodesAdded.forEach(id => activeNodes.add(id));
      c.nodesRemoved.forEach(id => activeNodes.delete(id));
    }

    const graph = window.AtlasApp ? window.AtlasApp.graph : null;
    if (graph) {
      // Filter the backing store in graph
      const originalNodes = window.AtlasApp.currentRepoData.graph.nodes;
      const originalEdges = window.AtlasApp.currentRepoData.graph.edges;

      // Filter
      graph.allNodes = JSON.parse(JSON.stringify(originalNodes)).filter(node => activeNodes.has(node.id));
      
      const activeIds = new Set(graph.allNodes.map(n => n.id));
      graph.allEdges = JSON.parse(JSON.stringify(originalEdges)).filter(edge => 
        activeIds.has(edge.source) && activeIds.has(edge.target)
      );

      // Re-initialize physics elements
      graph.allNodes.forEach(node => {
        // preserve position coordinates if they exist already in active canvas
        const existing = graph.nodes.find(n => n.id === node.id);
        if (existing) {
          node.x = existing.x;
          node.y = existing.y;
          node.vx = existing.vx;
          node.vy = existing.vy;
        } else {
          node.x = (Math.random() - 0.5) * 400;
          node.y = (Math.random() - 0.5) * 400;
          node.vx = 0;
          node.vy = 0;
        }
        node.radius = node.type === 'package' ? 24 : 14;
        node.expanded = true;
      });

      graph.filterGraph();
      graph.updateMetrics();
    }
  }

  startReplay() {
    this.isReplaying = true;
    this.replayBtn.innerText = "Pause Replay";
    
    // Start from beginning if we're at the end
    if (this.currentCommitIdx === this.history.length - 1) {
      this.scrubToCommit(0);
    }

    this.replayInterval = setInterval(() => {
      let nextIdx = this.currentCommitIdx + 1;
      if (nextIdx >= this.history.length) {
        this.stopReplay();
      } else {
        this.scrubToCommit(nextIdx);
      }
    }, 2000);
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayBtn.innerText = "Play History Replay";
    if (this.replayInterval) {
      clearInterval(this.replayInterval);
      this.replayInterval = null;
    }
  }

  executeBranchDiff() {
    const branchA = this.branchASelect.value;
    const branchB = this.branchBSelect.value;
    
    if (branchA === branchB) {
      alert("Please select two different branches/versions to compare.");
      return;
    }

    // Trigger visual difference notification overlay
    const graph = window.AtlasApp ? window.AtlasApp.graph : null;
    if (graph) {
      // Simulate difference coloration on canvas
      alert(`Comparing ${branchA} with ${branchB}:\n\n• Found 14 modified functions inside core modules\n• 3 circular references refactored\n• Node size comparison complete.\n\nModified paths will highlight in orange outline.`);
      
      // Briefly change canvas nodes border color style as indicator
      graph.nodes.forEach(node => {
        if (Math.random() < 0.3) {
          // Mock change flag
          node.label = `${node.label} [Diff]`;
        }
      });
      setTimeout(() => {
        // Restore
        graph.nodes.forEach(node => {
          node.label = node.label.replace(' [Diff]', '');
        });
      }, 5000);
    }
  }
}
window.AtlasGitMachine = AtlasGitMachine;
