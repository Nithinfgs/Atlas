# 🌐 Atlas — Navigate Software Like Google Maps

https://symphonious-praline-025cbe.netlify.app/ 

> "Reading code by scrolling through files is like trying to understand a city by looking at a list of street names. Atlas lets you walk through the city instead."

Atlas transforms any GitHub repository into an interactive digital universe where developers can explore architecture, execution flow, dependencies, history, complexity, and AI-powered insights in real time.

---

## 🚀 Key Features

### 🌆 1. Code City 3D Mode (Feature 15)
* Toggle the **Code City Mode** to transform node circles into a 3D isometric grid of skyscrapers.
* **Height** represents the file's lines of code.
* **Floors & Windows** are drawn as glowing dots representing function counts.
* **Flashing Beacons** on roofs highlight bugs, compiler warnings, or security technical debt.

### 🧬 2. Call Graph Explorer & Depth Filter (Feature 13)
* Focus on a function to isolate its call stack connections.
* Slide the **Call Depth** controls (1, 2, 3, or All) to recursively filter the visual tree using Breadth-First Search (BFS) and prune complexity.

### ☄️ 3. Runtime Simulator & Resource Visualizer (Feature 11)
* Trigger execution scenarios like *Initial Page Render* or *GET Requests*.
* Watch glowing particles pulse chronologically along connection lines.
* Observe real-time server dial fluctuations (CPU load spikes, memory allocations, and execution delays) alongside active stack frames.

### 🕰️ 4. Git Time Machine Scrubber (Feature 16)
* Scrub through the timeline slider to morph the visual architecture. Files pop into existence, folders merge, and modules split over years of commits.
* Play automated history replays or compare branch differences visually.

### 🧠 5. AI Explain & Navigation Fly-To (Feature 17)
* Select a node and request explanations at different learning depths (Beginner, Intermediate, Advanced, Expert).
* Ask the chat companion: `"Take me to Scheduler"` or `"Show ReactHooks"` to automatically steer the camera fly-to directly to target symbols.

### 📊 6. Repository Comparisons & Smart Insights (Feature 18/19)
* Review repository facts (longest dependency chain, largest modules, circular groups).
* Compare two repositories side-by-side (e.g. React vs Express) with metric double-bar visualizers.

---

## 🎨 Visual Design

Atlas is styled as a premium, futuristic engineering workstation matching the following color tokens:
* **Background (`#09090B`)**: Deep space zinc base.
* **Surface (`#18181B`)**: Panels, docks, headers.
* **Card (`#27272A`)**: Glassmorphic widgets with blur filters.
* **Border (`#3F3F46`)**: Minimal outline grid bounds.
* **Accent (`#6366F1`)**: Primary navigation theme.
* **Secondary Accent (`#06B6D4`)**: Glowing runtime activity paths.

---

## 🛠️ How to Run

You have two versions ready on your Desktop:

### Method A: Standalone Bundle (`Atlas.html`)
For quick, offline use with zero terminal setup:
1. Double-click the **`Atlas.html`** file on your Desktop.
2. The entire application runs directly in your native web browser.

### Method B: Modular Developer Code (`atlas/` folder)
If you want to edit code or customize files:
1. Open your terminal, navigate to the folder:
   ```bash
   cd ~/Desktop/atlas
   ```
2. Start a local static server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open your browser and navigate to **[http://localhost:8080](http://localhost:8080)**.
4. Save any edits to JS/CSS files and reload the page to test.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Center the active Graph |
| <kbd>F</kbd> | Focus camera on the selected node |
| <kbd>A</kbd> | Open AI Explain tab and focus chat input |
| <kbd>G</kbd> | Toggle Git timeline dock height |
| <kbd>R</kbd> | Play/Pause Git History Morph replay |
| <kbd>S</kbd> | Focus global symbol search field |
| <kbd>P</kbd> | Launch guided walkthrough narration tour |
| <kbd>Esc</kbd> | Exit modals, overlays, or presentation mode |
