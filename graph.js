// Atlas Code Universe visualizer (Physics Canvas Engine with Code City, Inertia, Depth Filtering)

class AtlasGraph {
  constructor(canvasId, minimapId, viewportId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.minimap = document.getElementById(minimapId);
    this.minimapCtx = this.minimap.getContext('2d');
    this.viewportIndicator = document.getElementById(viewportId);
    this.hoverCard = document.getElementById('hover-module-card');

    this.nodes = [];
    this.edges = [];
    this.allNodes = []; 
    this.allEdges = []; 
    
    // Camera Transform State
    this.scale = 0.8;
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Inertial Pan Momentum State
    this.vx = 0;
    this.vy = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.isMouseDown = false;

    // Physics parameters
    this.repelStrength = 2200;
    this.springStrength = 0.04;
    this.gravityStrength = 0.015;
    this.damping = 0.85;
    this.linkDistance = 140;
    
    // Interaction States
    this.selectedNode = null;
    this.hoveredNode = null;
    this.isDragging = false;
    this.draggedNode = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.mouseWorldX = 0;
    this.mouseWorldY = 0;
    
    // Heatmap mode: 'none', 'complexity', 'git'
    this.heatmapMode = 'none';
    // Display Mode: 'architecture', 'call-graph'
    this.displayMode = 'architecture';
    // Code City Mode
    this.codeCityMode = false;
    // Call Graph depth level
    this.callDepth = 4; 

    // Execution Simulation Pulses
    this.pulses = []; 

    // Resize listeners
    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
    
    // Setup mouse events
    this.setupEvents();
    
    // Start loop
    this.animate();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    if (this.nodes.length === 0) {
      this.offsetX = this.canvas.width / 2;
      this.offsetY = this.canvas.height / 2;
    }
  }

  setData(graphData) {
    this.allNodes = JSON.parse(JSON.stringify(graphData.nodes));
    this.allEdges = JSON.parse(JSON.stringify(graphData.edges));
    
    this.allNodes.forEach(node => {
      node.x = (Math.random() - 0.5) * 500;
      node.y = (Math.random() - 0.5) * 500;
      node.vx = 0;
      node.vy = 0;
      node.radius = node.type === 'package' ? 24 : 14;
      node.expanded = true; 
    });

    this.filterGraph();
    this.centerGraph();
    this.updateMetrics();
  }

  updateMetrics() {
    document.getElementById('nodes-val').innerText = this.nodes.length;
    document.getElementById('edges-val').innerText = this.edges.length;
  }

  // Filter graph based on collapsing and call graph depth filters
  filterGraph() {
    const collapsedPackages = new Set(
      this.allNodes.filter(n => n.type === 'package' && !n.expanded).map(n => n.id)
    );

    // Apply basic collapsing visibility filters first
    let baseActiveNodes = this.allNodes.filter(node => {
      if (node.type === 'file') {
        return !collapsedPackages.has(node.group);
      }
      return true;
    });

    // If Call Graph mode and a node is selected, apply BFS depth filtering
    if (this.displayMode === 'call-graph' && this.selectedNode) {
      const activeSet = this.bfsCallGraph(this.selectedNode.id, this.callDepth);
      baseActiveNodes = baseActiveNodes.filter(n => activeSet.has(n.id) || n.type === 'package');
    }

    this.nodes = baseActiveNodes;
    const activeNodeIds = new Set(this.nodes.map(n => n.id));

    // Resolve structural edge dependencies
    this.edges = this.allEdges.map(edge => {
      let source = edge.source;
      let target = edge.target;
      
      const sourceNode = this.allNodes.find(n => n.id === source);
      const targetNode = this.allNodes.find(n => n.id === target);
      
      if (sourceNode && sourceNode.type === 'file' && collapsedPackages.has(sourceNode.group)) {
        source = sourceNode.group;
      }
      if (targetNode && targetNode.type === 'file' && collapsedPackages.has(targetNode.group)) {
        target = targetNode.group;
      }

      return {
        source,
        target,
        relation: edge.relation,
        style: edge.style || 'solid'
      };
    }).filter(edge => {
      return edge.source !== edge.target && activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target);
    });

    const seen = new Set();
    this.edges = this.edges.filter(edge => {
      const key = `${edge.source}->${edge.target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    this.edges.forEach(edge => {
      edge.sourceObj = this.nodes.find(n => n.id === edge.source);
      edge.targetObj = this.nodes.find(n => n.id === edge.target);
    });
  }

  // BFS Call Graph traverser
  bfsCallGraph(rootId, maxDepth) {
    const visited = new Set([rootId]);
    const queue = [{ id: rootId, depth: 0 }];

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr.depth >= maxDepth) continue;

      // Find adjacent connections (incoming or outgoing calls)
      this.allEdges.forEach(edge => {
        let neighbor = null;
        if (edge.source === curr.id) neighbor = edge.target;
        if (edge.target === curr.id) neighbor = edge.source;

        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ id: neighbor, depth: curr.depth + 1 });
        }
      });
    }

    return visited;
  }

  // Physics Update Tick
  updatePhysics() {
    const physicsSpeedSlider = document.getElementById('setting-physics-speed');
    const speedMultiplier = physicsSpeedSlider ? parseFloat(physicsSpeedSlider.value) / 5 : 1;
    
    const repel = this.repelStrength * speedMultiplier;
    const spring = this.springStrength * speedMultiplier;
    const gravity = this.gravityStrength * speedMultiplier;

    // Repulsion
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        if (dist < 320) {
          const force = repel / (dist * dist);
          n1.vx += (dx / dist) * force;
          n1.vy += (dy / dist) * force;
          n2.vx -= (dx / dist) * force;
          n2.vy -= (dy / dist) * force;
        }
      }
    }

    // Spring
    this.edges.forEach(edge => {
      const s = edge.sourceObj;
      const t = edge.targetObj;
      if (!s || !t) return;
      
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const force = (dist - this.linkDistance) * spring;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      
      s.vx += fx;
      s.vy += fy;
      t.vx -= fx;
      t.vy -= fy;
    });

    // Gravity & friction
    this.nodes.forEach(node => {
      if (node === this.draggedNode) return;
      
      node.vx -= node.x * gravity;
      node.vy -= node.y * gravity;
      
      node.x += node.vx;
      node.y += node.vy;
      
      node.vx *= this.damping;
      node.vy *= this.damping;
    });

    // Apply Inertial Camera panning momentum
    if (!this.isMouseDown && !this.isDragging) {
      this.offsetX += this.vx;
      this.offsetY += this.vy;
      this.vx *= 0.88;
      this.vy *= 0.88;
    }
  }

  // Draw complete Canvas Graph
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    // 1. Draw Edges (Glowing roads if Code City active)
    this.edges.forEach(edge => {
      const s = edge.sourceObj;
      const t = edge.targetObj;
      if (!s || !t) return;

      const isHigh = this.isEdgeHighlighted(edge);
      const isMuted = (this.selectedNode || this.hoveredNode) && !isHigh;

      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(t.x, t.y);

      if (this.codeCityMode) {
        // Neon Roads
        this.ctx.strokeStyle = isHigh 
          ? 'rgba(34, 211, 238, 0.9)' 
          : isMuted ? 'rgba(34, 211, 238, 0.05)' : 'rgba(34, 211, 238, 0.25)';
        this.ctx.lineWidth = isHigh ? 4 : 2;
      } else {
        this.ctx.strokeStyle = isHigh 
          ? 'rgba(34, 211, 238, 0.8)' 
          : isMuted ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = isHigh ? 3 : 1.2;
      }
      
      this.ctx.setLineDash(edge.style === 'dashed' ? [6, 4] : []);
      this.ctx.stroke();
    });

    // 2. Draw Simulated Execution Pulses
    this.drawPulses();

    // 3. Draw Nodes (Skyscraper blocks if Code City Mode is on)
    this.nodes.forEach(node => {
      const isMuted = (this.selectedNode || this.hoveredNode) && 
                      node !== this.selectedNode && 
                      node !== this.hoveredNode && 
                      !this.areNodesConnected(node, this.selectedNode) && 
                      !this.areNodesConnected(node, this.hoveredNode);

      const color = this.getNodeColor(node);
      const isActive = node === this.selectedNode || node === this.hoveredNode;

      if (this.codeCityMode && node.type === 'file') {
        this.drawIsometricSkyscraper(node, color, isActive, isMuted);
      } else {
        // Standard Circle Rendering
        this.ctx.save();
        this.ctx.translate(node.x, node.y);

        if (isActive) {
          this.ctx.shadowBlur = 20;
          this.ctx.shadowColor = color;
        }

        this.ctx.beginPath();
        this.ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = isMuted ? 'rgba(40, 50, 80, 0.15)' : color;
        this.ctx.fill();

        if (node.type === 'package') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, node.radius - 6, 0, Math.PI * 2);
          this.ctx.strokeStyle = isMuted ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.2)';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
        }

        this.ctx.beginPath();
        this.ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = isActive ? 2 : 1;
        this.ctx.stroke();

        this.ctx.restore();
      }

      // Draw Labels
      if (this.scale > 0.45 || node.type === 'package' || isActive) {
        this.ctx.font = node.type === 'package' ? 'bold 11px Inter' : '10px JetBrains Mono';
        this.ctx.fillStyle = isMuted 
          ? 'rgba(148, 163, 184, 0.15)' 
          : isActive ? '#FFFFFF' : 'rgba(248, 250, 252, 0.85)';
        this.ctx.textAlign = 'center';
        
        const labelYOffset = (this.codeCityMode && node.type === 'file') ? 35 : node.radius + 15;
        this.ctx.fillText(node.label, node.x, node.y + labelYOffset);
      }
    });

    this.ctx.restore();
    this.drawMinimap();
  }

  // Draw Code City Isometric Block Buildings
  drawIsometricSkyscraper(node, color, isActive, isMuted) {
    const cx = node.x;
    const cy = node.y;
    
    // Building Dimensions
    const size = 16; 
    const height = node.lines ? Math.min(node.lines / 10 + 20, 160) : 40; // line count maps to building height
    const opacity = isMuted ? 0.15 : 0.9;

    this.ctx.save();
    
    // Draw base projection coordinate offsets
    const leftX = cx - size;
    const leftY = cy + size / 2;
    const rightX = cx + size;
    const rightY = cy + size / 2;
    const topY = cy - size / 2;
    const bottomY = cy + size;

    // Top points extruded by height H
    const tL_X = leftX;
    const tL_Y = leftY - height;
    const tR_X = rightX;
    const tR_Y = rightY - height;
    const tT_X = cx;
    const tT_Y = topY - height;
    const tB_X = cx;
    const tB_Y = bottomY - height;

    // Glowing foundation shadow
    if (isActive) {
      this.ctx.shadowBlur = 24;
      this.ctx.shadowColor = color;
    }

    // 1. Draw Front-Left Face
    this.ctx.beginPath();
    this.ctx.moveTo(leftX, leftY);
    this.ctx.lineTo(cx, bottomY);
    this.ctx.lineTo(tB_X, tB_Y);
    this.ctx.lineTo(tL_X, tL_Y);
    this.ctx.closePath();
    this.ctx.fillStyle = `rgba(13, 20, 42, ${opacity})`; // dark face
    this.ctx.fill();
    this.ctx.strokeStyle = isActive ? '#FFFFFF' : `rgba(34, 211, 238, ${opacity * 0.3})`;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 2. Draw Front-Right Face (simulate source lighting)
    this.ctx.beginPath();
    this.ctx.moveTo(cx, bottomY);
    this.ctx.lineTo(rightX, rightY);
    this.ctx.lineTo(tR_X, tR_Y);
    this.ctx.lineTo(tB_X, tB_Y);
    this.ctx.closePath();
    this.ctx.fillStyle = `rgba(22, 34, 66, ${opacity})`; // lighter face
    this.ctx.fill();
    this.ctx.stroke();

    // 3. Draw Top Roof Face
    this.ctx.beginPath();
    this.ctx.moveTo(tL_X, tL_Y);
    this.ctx.lineTo(tB_X, tB_Y);
    this.ctx.lineTo(tR_X, tR_Y);
    this.ctx.lineTo(tT_X, tT_Y);
    this.ctx.closePath();
    this.ctx.fillStyle = isMuted ? 'rgba(30, 40, 70, 0.2)' : color;
    this.ctx.fill();
    this.ctx.stroke();

    // 4. Draw Glowing Windows representing function/method structures
    if (!isMuted) {
      const windowRows = Math.floor(height / 15);
      this.ctx.fillStyle = color;
      
      for (let r = 1; r <= windowRows; r++) {
        const hOffset = r * 12;
        
        // draw tiny cyan window dots on front left face
        const wX_L = leftX + (cx - leftX) * 0.5;
        const wY_L = leftY + (bottomY - leftY) * 0.5 - hOffset;
        this.ctx.beginPath();
        this.ctx.arc(wX_L, wY_L, 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // draw tiny window dots on front right face
        const wX_R = cx + (rightX - cx) * 0.5;
        const wY_R = bottomY + (rightY - bottomY) * 0.5 - hOffset;
        this.ctx.beginPath();
        this.ctx.arc(wX_R, wY_R, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 5. Flashing red light on top roof if critical bugs/complexity smell detected
    if (!isMuted && (node.complexity === 'danger' || node.complexity === 'critical')) {
      const flash = (Math.sin(Date.now() / 180) > 0);
      this.ctx.beginPath();
      this.ctx.arc(tT_X, tT_Y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = flash ? '#EF4444' : 'rgba(239, 68, 68, 0.2)';
      this.ctx.shadowBlur = flash ? 10 : 0;
      this.ctx.shadowColor = '#EF4444';
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  getNodeColor(node) {
    if (this.heatmapMode === 'complexity') {
      switch (node.complexity) {
        case 'simple': return '#22C55E';
        case 'medium': return '#F59E0B';
        case 'complex': return '#E2792F';
        case 'danger': return '#EF4444';
        case 'critical': return '#8B5CF6';
        case 'legacy': return '#64748B';
        default: return '#6366F1';
      }
    } else if (this.heatmapMode === 'git') {
      const hashes = { 'core': '#06B6D4', 'reconciler': '#8B5CF6', 'dom': '#E2792F', 'scheduler': '#F59E0B', 'shared': '#22C55E' };
      return hashes[node.group] || '#6366F1';
    }

    if (node.type === 'package') return 'rgba(99, 102, 241, 0.8)';
    return '#06B6D4';
  }

  isEdgeHighlighted(edge) {
    if (this.selectedNode && (edge.source === this.selectedNode.id || edge.target === this.selectedNode.id)) return true;
    if (this.hoveredNode && (edge.source === this.hoveredNode.id || edge.target === this.hoveredNode.id)) return true;
    return false;
  }

  areNodesConnected(n1, n2) {
    if (!n1 || !n2) return false;
    return this.edges.some(edge => 
      (edge.source === n1.id && edge.target === n2.id) || 
      (edge.source === n2.id && edge.target === n1.id)
    );
  }

  drawPulses() {
    this.pulses.forEach((pulse, index) => {
      const edge = pulse.edge;
      const s = edge.sourceObj;
      const t = edge.targetObj;
      if (!s || !t) return;

      const px = s.x + (t.x - s.x) * pulse.progress;
      const py = s.y + (t.y - s.y) * pulse.progress;

      this.ctx.beginPath();
      this.ctx.arc(px, py, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = pulse.color || 'var(--accent-cyan)';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = pulse.color || '#06B6D4';
      this.ctx.fill();

      pulse.progress += pulse.speed;

      if (pulse.progress >= 1) {
        this.pulses.splice(index, 1);
      }
    });
  }

  triggerPulse(sourceId, targetId, speed = 0.02, color = '#06B6D4') {
    const edge = this.edges.find(e => e.source === sourceId && e.target === targetId);
    if (edge) {
      this.pulses.push({ edge, progress: 0, speed, color });
    }
  }

  centerGraph() {
    if (this.nodes.length === 0) return;
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    this.nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    });

    const graphW = maxX - minX || 1;
    const graphH = maxY - minY || 1;
    const padding = 60;
    
    const scaleX = (this.canvas.width - padding * 2) / graphW;
    const scaleY = (this.canvas.height - padding * 2) / graphH;
    
    this.scale = Math.min(Math.min(scaleX, scaleY), 1.2); 
    this.offsetX = this.canvas.width / 2 - ((minX + maxX) / 2) * this.scale;
    this.offsetY = this.canvas.height / 2 - ((minY + maxY) / 2) * this.scale;
    
    this.vx = 0;
    this.vy = 0; // stop inertial slide
  }

  focusNode(node) {
    if (!node) return;
    this.selectedNode = node;
    
    const targetScale = 1.1;
    const targetX = this.canvas.width / 2 - node.x * targetScale;
    const targetY = this.canvas.height / 2 - node.y * targetScale;

    this.vx = 0;
    this.vy = 0; // stop slide

    let steps = 15;
    const step = () => {
      if (steps <= 0) return;
      this.scale += (targetScale - this.scale) * 0.25;
      this.offsetX += (targetX - this.offsetX) * 0.25;
      this.offsetY += (targetY - this.offsetY) * 0.25;
      steps--;
      requestAnimationFrame(step);
    };
    step();
  }

  drawMinimap() {
    this.minimapCtx.clearRect(0, 0, this.minimap.width, this.minimap.height);
    this.minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);

    if (this.nodes.length === 0) return;

    let minX = -1000, maxX = 1000, minY = -1000, maxY = 1000;
    
    const worldToMinimap = (wx, wy) => {
      const rx = ((wx - minX) / (maxX - minX)) * this.minimap.width;
      const ry = ((wy - minY) / (maxY - minY)) * this.minimap.height;
      return { x: rx, y: ry };
    };

    this.nodes.forEach(node => {
      const p = worldToMinimap(node.x, node.y);
      this.minimapCtx.beginPath();
      this.minimapCtx.arc(p.x, p.y, node.type === 'package' ? 3 : 1.5, 0, Math.PI * 2);
      this.minimapCtx.fillStyle = this.getNodeColor(node);
      this.minimapCtx.fill();
    });

    const topLeft = this.toWorldCoords(0, 0);
    const bottomRight = this.toWorldCoords(this.canvas.width, this.canvas.height);

    const tlMinimap = worldToMinimap(topLeft.x, topLeft.y);
    const brMinimap = worldToMinimap(bottomRight.x, bottomRight.y);

    const w = brMinimap.x - tlMinimap.x;
    const h = brMinimap.y - tlMinimap.y;

    this.viewportIndicator.style.left = `${Math.max(0, Math.min(150, tlMinimap.x))}px`;
    this.viewportIndicator.style.top = `${Math.max(0, Math.min(100, tlMinimap.y))}px`;
    this.viewportIndicator.style.width = `${Math.max(10, Math.min(150, w))}px`;
    this.viewportIndicator.style.height = `${Math.max(10, Math.min(100, h))}px`;
  }

  toWorldCoords(sx, sy) {
    const rx = (sx - this.offsetX) / this.scale;
    const ry = (sy - this.offsetY) / this.scale;
    return { x: rx, y: ry };
  }

  setupEvents() {
    this.canvas.addEventListener('mousedown', e => {
      this.isMouseDown = true;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      this.prevMouseX = mouseX;
      this.prevMouseY = mouseY;
      
      const worldPos = this.toWorldCoords(mouseX, mouseY);
      
      let clickedNode = null;
      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const n = this.nodes[i];
        const dx = worldPos.x - n.x;
        const dy = worldPos.y - n.y;
        
        // click building area collision
        const clickRange = (this.codeCityMode && n.type === 'file') ? 22 : n.radius;
        if (dx * dx + dy * dy < clickRange * clickRange) {
          clickedNode = n;
          break;
        }
      }

      if (clickedNode) {
        this.draggedNode = clickedNode;
        this.dragStartX = worldPos.x - clickedNode.x;
        this.dragStartY = worldPos.y - clickedNode.y;
        
        this.selectedNode = clickedNode;
        if (window.AtlasApp) {
          window.AtlasApp.inspectNode(clickedNode);
        }
      } else {
        this.isDragging = true;
        this.dragStartX = mouseX - this.offsetX;
        this.dragStartY = mouseY - this.offsetY;
      }
    });

    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldPos = this.toWorldCoords(mouseX, mouseY);
      this.mouseWorldX = worldPos.x;
      this.mouseWorldY = worldPos.y;

      if (this.draggedNode) {
        this.draggedNode.x = worldPos.x - this.dragStartX;
        this.draggedNode.y = worldPos.y - this.dragStartY;
      } else if (this.isDragging) {
        // Calculate velocity for camera sliding inertia
        this.vx = mouseX - this.prevMouseX;
        this.vy = mouseY - this.prevMouseY;

        this.offsetX = mouseX - this.dragStartX;
        this.offsetY = mouseY - this.dragStartY;
        
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
      } else {
        let hovered = null;
        for (let i = this.nodes.length - 1; i >= 0; i--) {
          const n = this.nodes[i];
          const dx = worldPos.x - n.x;
          const dy = worldPos.y - n.y;
          const checkRange = (this.codeCityMode && n.type === 'file') ? 22 : n.radius;
          if (dx * dx + dy * dy < checkRange * checkRange) {
            hovered = n;
            break;
          }
        }
        
        if (hovered !== this.hoveredNode) {
          this.hoveredNode = hovered;
          this.canvas.style.cursor = hovered ? 'pointer' : 'grab';
          this.handleHoverPopup(hovered, e);
        }
        
        // update popup position dynamically
        if (hovered && hovered.type === 'package') {
          this.hoverCard.style.left = (e.clientX + 18) + 'px';
          this.hoverCard.style.top = (e.clientY + 18) + 'px';
        }
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.draggedNode = null;
      this.isDragging = false;
    });

    this.canvas.addEventListener('dblclick', () => {
      if (this.selectedNode && this.selectedNode.type === 'package') {
        this.selectedNode.expanded = !this.selectedNode.expanded;
        this.filterGraph();
      }
    });

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      
      const zoomFactor = 1.1;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldPos = this.toWorldCoords(mouseX, mouseY);
      
      if (e.deltaY < 0) {
        this.scale = Math.min(this.scale * zoomFactor, 4.0);
      } else {
        this.scale = Math.max(this.scale / zoomFactor, 0.15);
      }

      this.offsetX = mouseX - worldPos.x * this.scale;
      this.offsetY = mouseY - worldPos.y * this.scale;
    }, { passive: false });
  }

  // Hover popup card populator
  handleHoverPopup(node, e) {
    if (node && node.type === 'package') {
      const isReconciler = node.label.includes('reconciler');
      this.hoverCard.innerHTML = `
        <h4>${node.label.toUpperCase()} MODULE</h4>
        <p>
          <strong>Created:</strong> 2017<br>
          <strong>Files:</strong> ${isReconciler ? 34 : 12}<br>
          <strong>Functions:</strong> ${isReconciler ? 228 : 84}<br>
          <strong>Contributors:</strong> ${isReconciler ? 18 : 5}<br>
          <strong>Avg Complexity:</strong> ${isReconciler ? '8.4 (High)' : '4.2'}<br>
          <strong>Technical Debt:</strong> ${isReconciler ? 'High' : 'Low'}<br>
          <strong>Most Changed:</strong> ${isReconciler ? 'ReactFiberWorkLoop.js' : 'index.js'}
        </p>
      `;
      this.hoverCard.style.display = 'block';
    } else {
      this.hoverCard.style.display = 'none';
    }
  }

  animate() {
    this.updatePhysics();
    this.draw();
    
    if (!this.lastFrameTime) this.lastFrameTime = performance.now();
    const now = performance.now();
    const fps = Math.round(1000 / (now - this.lastFrameTime));
    this.lastFrameTime = now;
    
    const fpsVal = document.getElementById('fps-val');
    if (fpsVal && Math.random() < 0.1) {
      fpsVal.innerText = Math.min(fps, 60);
    }

    requestAnimationFrame(() => this.animate());
  }
}
window.AtlasGraph = AtlasGraph;
