// Atlas Scanners controller (Tech Debt, Security, Performance UI panels)

class AtlasScanners {
  constructor() {
    this.techDebtTable = document.getElementById('tech-debt-table-body');
    this.securityTable = document.getElementById('security-table-body');
    this.performanceTable = document.getElementById('performance-table-body');

    this.techCountBadge = document.getElementById('techdebt-count-badge');
    this.secCountBadge = document.getElementById('security-count-badge');
    this.perfCountBadge = document.getElementById('performance-count-badge');

    this.setupTabs();
  }

  setupTabs() {
    document.querySelectorAll('.sc-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.scanner-sub-panel').forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        const targetPanel = tab.getAttribute('data-sc-panel');
        document.getElementById(`scanner-panel-${targetPanel}`).classList.add('active');
      });
    });
  }

  loadScannerData(repoData) {
    const scans = repoData.scanners || {};
    
    const techDebtList = scans.technicalDebt || [];
    const securityList = scans.security || [];
    const performanceList = scans.performance || [];

    // Update headers counts badges
    this.techCountBadge.innerText = `${techDebtList.length} Alerts`;
    this.secCountBadge.innerText = `${securityList.length} Alerts`;
    this.perfCountBadge.innerText = `${performanceList.length} Alerts`;

    // Populate Tech Debt
    this.techDebtTable.innerHTML = '';
    if (techDebtList.length === 0) {
      this.techDebtTable.innerHTML = `<tr><td colspan="5" class="empty-text">No technical debt issues detected. Great architecture!</td></tr>`;
    } else {
      techDebtList.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${alert.type}</strong></td>
          <td><span class="code-font">${alert.file}</span></td>
          <td><span class="alert-severity-badge danger">${alert.severity}</span></td>
          <td>${alert.details}</td>
          <td><button class="btn-primary btn-sm btn-locate" data-file="${alert.file}">Locate in Universe</button></td>
        `;
        this.techDebtTable.appendChild(row);
      });
    }

    // Populate Security
    this.securityTable.innerHTML = '';
    if (securityList.length === 0) {
      this.securityTable.innerHTML = `<tr><td colspan="5" class="empty-text">No security flaws discovered. Code is safe.</td></tr>`;
    } else {
      securityList.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${alert.type}</strong></td>
          <td><span class="code-font">${alert.file}</span></td>
          <td><span class="alert-severity-badge danger">${alert.severity}</span></td>
          <td>${alert.details}</td>
          <td><button class="btn-primary btn-sm btn-locate" data-file="${alert.file}">Locate in Universe</button></td>
        `;
        this.securityTable.appendChild(row);
      });
    }

    // Populate Performance
    this.performanceTable.innerHTML = '';
    if (performanceList.length === 0) {
      this.performanceTable.innerHTML = `<tr><td colspan="5" class="empty-text">No performance issues detected. Speed index optimal.</td></tr>`;
    } else {
      performanceList.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${alert.type}</strong></td>
          <td><span class="code-font">${alert.file}</span></td>
          <td><span class="alert-severity-badge warning">${alert.severity}</span></td>
          <td>${alert.details}</td>
          <td><button class="btn-primary btn-sm btn-locate" data-file="${alert.file}">Locate in Universe</button></td>
        `;
        this.performanceTable.appendChild(row);
      });
    }

    // Setup Locate button event click handlers
    document.querySelectorAll('.btn-locate').forEach(btn => {
      btn.addEventListener('click', () => {
        const filePath = btn.getAttribute('data-file');
        this.locateFileInGraph(filePath);
      });
    });
  }

  locateFileInGraph(filePath) {
    const app = window.AtlasApp;
    if (!app) return;

    // Switch workspace view nav tab to visualizer
    app.switchTab('architecture'); // switches view display internally

    // Find node in visual graph
    const targetNode = app.graph.nodes.find(n => n.id === filePath);
    if (targetNode) {
      app.graph.focusNode(targetNode);
      app.inspectNode(targetNode);
    } else {
      alert(`Could not find symbol node for file: ${filePath}. It might be collapsed inside its folder package group folder. Try double clicking group folders.`);
    }
  }
}
window.AtlasScanners = AtlasScanners;
