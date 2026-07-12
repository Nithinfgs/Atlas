// Atlas Repository Database (Mock Data for Rich Simulation)

window.AtlasData = {
  // 1. REACT REPOSITORY
  "github.com/facebook/react": {
    name: "React",
    url: "https://github.com/facebook/react",
    stats: {
      healthScore: 88,
      complexity: "Medium",
      files: 1428,
      functions: 18564,
      dependencies: 12,
      packages: 32,
      languages: [
        { name: "JavaScript", percent: 84 },
        { name: "TypeScript", percent: 12 },
        { name: "Flow", percent: 4 }
      ],
      contributors: 1582,
      learningTime: "6 weeks",
      architectureScore: 92,
      techDebtScore: 78,
      securityScore: 95,
      docScore: 85,
      maintainabilityScore: 89
    },
    
    // Node categories: simple (green), medium (yellow), complex (orange), danger (red), critical (purple), legacy (black)
    graph: {
      nodes: [
        // Packages / Modules
        { id: "react", label: "react", group: "core", type: "package", complexity: "simple" },
        { id: "react-reconciler", label: "react-reconciler", group: "reconciler", type: "package", complexity: "critical" },
        { id: "react-dom", label: "react-dom", group: "dom", type: "package", complexity: "complex" },
        { id: "scheduler", label: "scheduler", group: "scheduler", type: "package", complexity: "medium" },
        { id: "shared", label: "shared", group: "shared", type: "package", complexity: "simple" },

        // Files in React Core
        { id: "react/React.js", label: "React.js", group: "core", type: "file", complexity: "simple", size: 4500, lines: 120 },
        { id: "react/ReactHooks.js", label: "ReactHooks.js", group: "core", type: "file", complexity: "medium", size: 8200, lines: 340 },
        { id: "react/ReactElement.js", label: "ReactElement.js", group: "core", type: "file", complexity: "medium", size: 9100, lines: 420 },
        
        // Files in Reconciler
        { id: "react-reconciler/ReactFiberWorkLoop.js", label: "ReactFiberWorkLoop.js", group: "reconciler", type: "file", complexity: "legacy", size: 84000, lines: 3200 },
        { id: "react-reconciler/ReactFiberBeginWork.js", label: "ReactFiberBeginWork.js", group: "reconciler", type: "file", complexity: "danger", size: 68000, lines: 2400 },
        { id: "react-reconciler/ReactFiberCommitWork.js", label: "ReactFiberCommitWork.js", group: "reconciler", type: "file", complexity: "danger", size: 52000, lines: 1800 },
        { id: "react-reconciler/ReactChildFiber.js", label: "ReactChildFiber.js", group: "reconciler", type: "file", complexity: "complex", size: 41000, lines: 1400 },
        { id: "react-reconciler/ReactFiberHooks.js", label: "ReactFiberHooks.js", group: "reconciler", type: "file", complexity: "critical", size: 73000, lines: 2800 },
        { id: "react-reconciler/ReactFiberHotReloading.js", label: "ReactFiberHotReloading.js", group: "reconciler", type: "file", complexity: "medium", size: 12000, lines: 480 },
        
        // Files in DOM
        { id: "react-dom/ReactDOMRoot.js", label: "ReactDOMRoot.js", group: "dom", type: "file", complexity: "medium", size: 14000, lines: 520 },
        { id: "react-dom/ReactDOMComponent.js", label: "ReactDOMComponent.js", group: "dom", type: "file", complexity: "complex", size: 28000, lines: 980 },
        { id: "react-dom/dangerouslySetInnerHTML.js", label: "dangerouslySetInnerHTML.js", group: "dom", type: "file", complexity: "danger", size: 3400, lines: 110 },
        
        // Files in Scheduler
        { id: "scheduler/Scheduler.js", label: "Scheduler.js", group: "scheduler", type: "file", complexity: "complex", size: 24000, lines: 850 },
        
        // Shared utilities
        { id: "shared/ReactSharedInternals.js", label: "ReactSharedInternals.js", group: "shared", type: "file", complexity: "simple", size: 2100, lines: 75 }
      ],
      edges: [
        // Dependencies between packages
        { source: "react-dom", target: "react-reconciler", relation: "depends" },
        { source: "react-reconciler", target: "scheduler", relation: "depends" },
        { source: "react-reconciler", target: "shared", relation: "depends" },
        { source: "react", target: "shared", relation: "depends" },
        { source: "react-dom", target: "shared", relation: "depends" },

        // File imports
        { source: "react-dom/ReactDOMRoot.js", target: "react-reconciler/ReactFiberWorkLoop.js", relation: "imports" },
        { source: "react-reconciler/ReactFiberWorkLoop.js", target: "react-reconciler/ReactFiberBeginWork.js", relation: "imports" },
        { source: "react-reconciler/ReactFiberBeginWork.js", target: "react-reconciler/ReactChildFiber.js", relation: "imports" },
        { source: "react-reconciler/ReactFiberBeginWork.js", target: "react-reconciler/ReactFiberHooks.js", relation: "imports" },
        { source: "react-reconciler/ReactFiberWorkLoop.js", target: "react-reconciler/ReactFiberCommitWork.js", relation: "imports" },
        { source: "react-reconciler/ReactFiberHooks.js", target: "react/ReactHooks.js", relation: "imports" },
        { source: "react/ReactHooks.js", target: "shared/ReactSharedInternals.js", relation: "imports" },
        { source: "react-reconciler/ReactFiberWorkLoop.js", target: "scheduler/Scheduler.js", relation: "imports" },
        { source: "react-dom/ReactDOMComponent.js", target: "react-dom/dangerouslySetInnerHTML.js", relation: "imports" },
        
        // Circular Dependencies (Tech Debt illustration)
        { source: "react-reconciler/ReactFiberBeginWork.js", target: "react-reconciler/ReactFiberWorkLoop.js", relation: "circular_backlink", style: "dashed" }
      ]
    },

    // Simulations (Execution Paths)
    simulations: {
      "Initial Page Render": {
        description: "Mounts the root element, builds fiber tree, schedules updates, renders components, and commits updates to DOM.",
        steps: [
          { node: "react-dom/ReactDOMRoot.js", duration: 1.2, memory: "0.2MB", action: "createRoot() invoked", details: "Creates FiberRootNode and host root fiber." },
          { node: "react-reconciler/ReactFiberWorkLoop.js", duration: 4.5, memory: "1.4MB", action: "scheduleUpdateOnFiber()", details: "Enqueues render phase update with scheduler." },
          { node: "scheduler/Scheduler.js", duration: 8.2, memory: "0.3MB", action: "requestHostCallback()", details: "Fires postMessage macro-task to loop in execution." },
          { node: "react-reconciler/ReactFiberWorkLoop.js", duration: 15.6, memory: "3.2MB", action: "performSyncWorkOnRoot()", details: "Enters work loop to process update queue." },
          { node: "react-reconciler/ReactFiberBeginWork.js", duration: 22.4, memory: "4.8MB", action: "beginWork() recursively", details: "Traverses tree, resolves component updates, creates children fiber." },
          { node: "react-reconciler/ReactFiberHooks.js", duration: 12.1, memory: "1.8MB", action: "renderWithHooks()", details: "Executes functional components, tracking Hook state allocations." },
          { node: "react-reconciler/ReactChildFiber.js", duration: 6.8, memory: "0.9MB", action: "reconcileChildFibers()", details: "Performs reconciliation of DOM nodes and attributes." },
          { node: "react-reconciler/ReactFiberCommitWork.js", duration: 14.5, memory: "2.1MB", action: "commitRoot()", details: "Enters commit phase. Swaps workInProgress tree with current tree." },
          { node: "react-dom/ReactDOMComponent.js", duration: 5.3, memory: "1.2MB", action: "commitPlacement()", details: "Mutates DOM, inserting child elements into container node." }
        ]
      },
      "React Hook Context Update": {
        description: "User triggers state update hook. Causes partial subtree re-evaluation and paint update.",
        steps: [
          { node: "react/ReactHooks.js", duration: 0.5, memory: "0.1MB", action: "useState dispatchAction()", details: "Queues component state transition." },
          { node: "react-reconciler/ReactFiberWorkLoop.js", duration: 3.1, memory: "0.8MB", action: "scheduleUpdateOnFiber()", details: "Flags dirty component node." },
          { node: "scheduler/Scheduler.js", duration: 5.2, memory: "0.2MB", action: "scheduleCallback()", details: "Schedules work with NormalPriority." },
          { node: "react-reconciler/ReactFiberWorkLoop.js", duration: 10.4, memory: "2.5MB", action: "workLoopConcurrent()", details: "Yields if browser has pressing paint tasks." },
          { node: "react-reconciler/ReactFiberBeginWork.js", duration: 14.2, memory: "3.1MB", action: "beginWork()", details: "Bypasses clean subtrees, only evaluating dirty fiber nodes." },
          { node: "react-reconciler/ReactFiberHooks.js", duration: 9.8, memory: "1.1MB", action: "updateState()", details: "Extracts state value from local ring-buffer hook queue." },
          { node: "react-reconciler/ReactFiberCommitWork.js", duration: 6.2, memory: "0.8MB", action: "commitMutationEffects()", details: "Performs node updates. Triggers layout effects." }
        ]
      }
    },

    // Git Time Machine
    history: [
      { commit: "9c3b210", date: "2013-05-24", author: "Jordan Walke", message: "Initial public release of React open-source framework", nodesAdded: ["react", "react/React.js", "react/ReactElement.js", "react-dom"], nodesRemoved: [] },
      { commit: "f2c418a", date: "2015-10-15", author: "Dan Abramov", message: "Separate core module from react-dom container framework", nodesAdded: ["shared", "shared/ReactSharedInternals.js"], nodesRemoved: [] },
      { commit: "a52b821", date: "2017-09-26", author: "Sebastian Markbåge", message: "Rewrite core reconciler framework (Fiber Architecture Core Release)", nodesAdded: ["react-reconciler", "react-reconciler/ReactFiberWorkLoop.js", "react-reconciler/ReactFiberBeginWork.js", "react-reconciler/ReactFiberCommitWork.js", "react-reconciler/ReactChildFiber.js"], nodesRemoved: [] },
      { commit: "e31a89c", date: "2019-02-06", author: "Sophie Alpert", message: "Release Hooks mechanism (useState, useEffect) in core", nodesAdded: ["react-reconciler/ReactFiberHooks.js", "react/ReactHooks.js"], nodesRemoved: [] },
      { commit: "d6b20ac", date: "2022-03-29", author: "Andrew Clark", message: "React 18: Concurrent rendering support and scheduler scheduler integration", nodesAdded: ["scheduler", "scheduler/Scheduler.js"], nodesRemoved: [] },
      { commit: "8a1b24d", date: "2024-12-05", author: "Lauren Tan", message: "React 19: Actions, server components, and cleanup legacy hot reloading modules", nodesAdded: ["react-dom/ReactDOMRoot.js", "react-dom/ReactDOMComponent.js", "react-dom/dangerouslySetInnerHTML.js"], nodesRemoved: ["react-reconciler/ReactFiberHotReloading.js"] }
    ],

    // Scanners Alerts
    scanners: {
      technicalDebt: [
        { id: "td-1", name: "Circular Dependency Detected", file: "react-reconciler/ReactFiberBeginWork.js", type: "Circular dependency", severity: "danger", details: "Circular reference found between ReactFiberBeginWork.js and ReactFiberWorkLoop.js. Creates tight architectural coupling." },
        { id: "td-2", name: "God Object Smell", file: "react-reconciler/ReactFiberWorkLoop.js", type: "God Object", severity: "legacy", details: "File contains over 3,200 lines of code and holds excessive coordinator state. Violates single responsibility principle." },
        { id: "td-3", name: "Unused Export / Dead Code", file: "react-reconciler/ReactFiberHotReloading.js", type: "Dead Code", severity: "medium", details: "Hot reloading logic module has 0 incoming links. Safe to prune or remove." }
      ],
      security: [
        { id: "sec-1", name: "Potential XSS Vulnerability", file: "react-dom/dangerouslySetInnerHTML.js", type: "XSS Vulnerability", severity: "danger", details: "Assigns HTML strings directly without sanitization step. Ensure input sanitizers are strictly enforced." },
        { id: "sec-2", name: "Authentication Check Bypass", file: "react-dom/ReactDOMComponent.js", type: "Weak Permissions", severity: "warning", details: "Access check attributes are bypassed in server-side mock renders. Potential leakage of secure node attributes." }
      ],
      performance: [
        { id: "perf-1", name: "Slow Import / Sync Blocking", file: "react-reconciler/ReactFiberWorkLoop.js", type: "Slow Import", severity: "complex", details: "Synchronously loads scheduler sub-libraries. Delays boot-time scheduling initialization by 85ms." },
        { id: "perf-2", name: "High Memory Allocations", file: "react-reconciler/ReactFiberHooks.js", type: "High Loop Allocations", severity: "medium", details: "Dynamic allocation of hook cell rings inside tight updates triggers garbage collection pauses." }
      ]
    },

    // AI Answers
    aiAnswers: {
      "react-reconciler/ReactFiberWorkLoop.js": {
        what: "ReactFiberWorkLoop.js orchestrates the main execution loop in React's concurrent model. It processes the queue, calls beginWork to build fiber nodes, and coordinates DOM writes in the commit phase.",
        why: "It serves as the scheduler listener and CPU traffic controller, allowing React to pause, resume, and prioritize renders dynamically.",
        fifteen: "Imagine a supervisor in a toy factory. They look at a list of toys to make, build them piece by piece, but will pause if a VIP customer calls to make a special toy immediately.",
        senior: "Manages cooperative multitasking via a recursive work loop scheduler. Operates two major cycles: Render (which is asynchronous, interruptible, and side-effect free) and Commit (synchronous DOM mutations). Yields execution using message channels.",
        risk: "EXTREMELY HIGH. Editing this file risks breaking concurrency, scheduling prioritizations, error boundary captures, and rendering cycles."
      },
      "react-dom/dangerouslySetInnerHTML.js": {
        what: "A module wrapper that allows injecting raw HTML strings into HTML nodes, bypassing React's default virtual DOM escaping pipelines.",
        why: "To enable rendering raw rich text (e.g. from Markdown parsers or CMS nodes) where escaping would ruin the layout.",
        fifteen: "It is like opening a special slot to put anything into a toy box without checking if it's safe. It can let bad actors slip dangerous things in if you aren't careful.",
        senior: "Sets the `innerHTML` property directly on standard DOM instances. Bypasses standard sanitization wrappers. Susceptible to Cross-Site Scripting (XSS) vectors if contents are user-provided.",
        risk: "HIGH. Modifying this could lead to application-wide markup rendering issues or security vulnerabilities."
      }
    }
  },

  // 2. EXPRESS REPOSITORY
  "github.com/expressjs/express": {
    name: "Express.js",
    url: "https://github.com/expressjs/express",
    stats: {
      healthScore: 92,
      complexity: "Simple",
      files: 84,
      functions: 1420,
      dependencies: 32,
      packages: 1,
      languages: [
        { name: "JavaScript", percent: 100 }
      ],
      contributors: 345,
      learningTime: "1 week",
      architectureScore: 88,
      techDebtScore: 84,
      securityScore: 89,
      docScore: 92,
      maintainabilityScore: 91
    },

    graph: {
      nodes: [
        { id: "lib", label: "lib", group: "core", type: "package", complexity: "simple" },
        { id: "lib/router", label: "lib/router", group: "router", type: "package", complexity: "medium" },

        { id: "lib/express.js", label: "express.js", group: "core", type: "file", complexity: "simple", size: 2800, lines: 90 },
        { id: "lib/application.js", label: "application.js", group: "core", type: "file", complexity: "complex", size: 34000, lines: 1200 },
        { id: "lib/request.js", label: "request.js", group: "core", type: "file", complexity: "medium", size: 14000, lines: 500 },
        { id: "lib/response.js", label: "response.js", group: "core", type: "file", complexity: "danger", size: 18000, lines: 650 },
        
        { id: "lib/router/index.js", label: "index.js (Router)", group: "router", type: "file", complexity: "complex", size: 24000, lines: 880 },
        { id: "lib/router/route.js", label: "route.js", group: "router", type: "file", complexity: "medium", size: 8500, lines: 310 },
        { id: "lib/router/layer.js", label: "layer.js", group: "router", type: "file", complexity: "simple", size: 4200, lines: 180 }
      ],
      edges: [
        { source: "lib/express.js", target: "lib/application.js", relation: "imports" },
        { source: "lib/application.js", target: "lib/router/index.js", relation: "imports" },
        { source: "lib/router/index.js", target: "lib/router/route.js", relation: "imports" },
        { source: "lib/router/route.js", target: "lib/router/layer.js", relation: "imports" },
        { source: "lib/application.js", target: "lib/request.js", relation: "imports" },
        { source: "lib/application.js", target: "lib/response.js", relation: "imports" },
        { source: "lib/router/index.js", target: "lib/router/layer.js", relation: "imports" }
      ]
    },

    simulations: {
      "HTTP GET Request Execution": {
        description: "Receives server TCP connection, initializes request context, fires router middleware chain, and writes response.",
        steps: [
          { node: "lib/express.js", duration: 0.8, memory: "0.1MB", action: "createServer() handler", details: "Attaches app handler function to Node.js HTTP server." },
          { node: "lib/application.js", duration: 2.1, memory: "0.4MB", action: "app.handle()", details: "Triggered on client connection. Populates Request/Response prototypes." },
          { node: "lib/router/index.js", duration: 4.8, memory: "0.8MB", action: "router.handle()", details: "Matches path URL. Begins sequence routing through layered stack." },
          { node: "lib/router/layer.js", duration: 1.5, memory: "0.1MB", action: "layer.match()", details: "Regexp check for route path (e.g. /users/:id)." },
          { node: "lib/router/route.js", duration: 3.2, memory: "0.3MB", action: "route.dispatch()", details: "Runs route callbacks (user request handlers) matching GET method." },
          { node: "lib/response.js", duration: 2.4, memory: "0.5MB", action: "res.send()", details: "Closes response socket, sets headers, writes HTML body buffer." }
        ]
      }
    },

    history: [
      { commit: "ca32101", date: "2010-06-02", author: "TJ Holowaychuk", message: "Initial repository commit for Express router engine", nodesAdded: ["lib", "lib/express.js", "lib/application.js"], nodesRemoved: [] },
      { commit: "bd98210", date: "2012-07-15", author: "TJ Holowaychuk", message: "Connect middleware adaptation and requests integration", nodesAdded: ["lib/request.js", "lib/response.js"], nodesRemoved: [] },
      { commit: "f6e10ac", date: "2014-03-24", author: "Douglas Wilson", message: "Express 4.0 Router decoupling and structural rewrite", nodesAdded: ["lib/router", "lib/router/index.js", "lib/router/route.js", "lib/router/layer.js"], nodesRemoved: [] }
    ],

    scanners: {
      technicalDebt: [
        { id: "td-1", name: "High Cognitive Complexity", file: "lib/router/index.js", type: "Nested Router Loop", severity: "complex", details: "The handle loop relies on deeply nested error callbacks and index tracking. Hard to modify without introducing bugs." }
      ],
      security: [
        { id: "sec-1", name: "Potential Open Redirect", file: "lib/response.js", type: "Redirect Flaw", severity: "danger", details: "Redirect handler does not perform domain whitelist validation. Permits open redirects if URL is query parameter controlled." }
      ],
      performance: [
        { id: "perf-1", name: "Duplicate RegExp Construction", file: "lib/router/layer.js", type: "GC Allocations", severity: "medium", details: "Creates local RegExp matches per matching attempt. Increases GC cycles on high-traffic servers." }
      ]
    },

    aiAnswers: {
      "lib/response.js": {
        what: "response.js extends standard Node.js ServerResponse objects with higher level conveniences like send(), json(), redirect(), and render().",
        why: "To streamline setting HTTP headers, status codes, content-types, and chunked buffering.",
        fifteen: "It is the post office worker who takes the package you want to send back, packs it neatly in a box, writes the address label, and sends it on its way.",
        senior: "Monkey-patches the node stream prototype. Handles content negotiations, ETag headers generation, cookie serialization, and piping node read-streams down response sockets.",
        risk: "MEDIUM. Safe to edit utility helpers, but modifying header flushing operations or response chunk buffers might break stream pipes."
      }
    }
  },

  // 3. VS CODE REPOSITORY
  "github.com/microsoft/vscode": {
    name: "VS Code",
    url: "https://github.com/microsoft/vscode",
    stats: {
      healthScore: 91,
      complexity: "High",
      files: 28450,
      functions: 485000,
      dependencies: 145,
      packages: 84,
      languages: [
        { name: "TypeScript", percent: 94 },
        { name: "CSS", percent: 4 },
        { name: "JavaScript", percent: 2 }
      ],
      contributors: 1980,
      learningTime: "12 weeks",
      architectureScore: 94,
      techDebtScore: 82,
      securityScore: 91,
      docScore: 88,
      maintainabilityScore: 90
    },

    graph: {
      nodes: [
        { id: "src", label: "src (VS Code)", group: "core", type: "package", complexity: "simple" },
        { id: "src/vs/base", label: "vs/base", group: "base", type: "package", complexity: "medium" },
        { id: "src/vs/platform", label: "vs/platform", group: "platform", type: "package", complexity: "complex" },
        { id: "src/vs/editor", label: "vs/editor", group: "editor", type: "package", complexity: "critical" },
        { id: "src/vs/workbench", label: "vs/workbench", group: "workbench", type: "package", complexity: "legacy" },

        { id: "src/vs/base/common/lifecycle.ts", label: "lifecycle.ts", group: "base", type: "file", complexity: "medium", size: 14000, lines: 450 },
        { id: "src/vs/platform/instantiation/instantiationService.ts", label: "instantiationService.ts", group: "platform", type: "file", complexity: "danger", size: 32000, lines: 1100 },
        { id: "src/vs/editor/common/model/textModel.ts", label: "textModel.ts", group: "editor", type: "file", complexity: "legacy", size: 98000, lines: 3400 },
        { id: "src/vs/workbench/browser/layout.ts", label: "layout.ts", group: "workbench", type: "file", complexity: "complex", size: 45000, lines: 1600 }
      ],
      edges: [
        { source: "src/vs/workbench", target: "src/vs/editor", relation: "depends" },
        { source: "src/vs/editor", target: "src/vs/platform", relation: "depends" },
        { source: "src/vs/platform", target: "src/vs/base", relation: "depends" },
        { source: "src/vs/workbench/browser/layout.ts", target: "src/vs/platform/instantiation/instantiationService.ts", relation: "imports" },
        { source: "src/vs/editor/common/model/textModel.ts", target: "src/vs/base/common/lifecycle.ts", relation: "imports" },
        { source: "src/vs/platform/instantiation/instantiationService.ts", target: "src/vs/base/common/lifecycle.ts", relation: "imports" }
      ]
    },

    simulations: {
      "Editor Text Input Event": {
        description: "Intercepts keyboard stroke, runs cursor displacement commands, shifts character buffer, updates layout trees.",
        steps: [
          { node: "src/vs/editor/common/model/textModel.ts", duration: 1.5, memory: "0.8MB", action: "type() event", details: "Keydown listener triggers edit dispatch flow." },
          { node: "src/vs/base/common/lifecycle.ts", duration: 0.9, memory: "0.1MB", action: "Disposable collection", details: "Clears transient cursor layout references." },
          { node: "src/vs/platform/instantiation/instantiationService.ts", duration: 3.4, memory: "1.2MB", action: "Dependency Injection", details: "Resolves command handlers dynamically." },
          { node: "src/vs/editor/common/model/textModel.ts", duration: 8.5, memory: "5.4MB", action: "applyEdits()", details: "Executes array text splicing. Computes line index changes." },
          { node: "src/vs/workbench/browser/layout.ts", duration: 12.4, memory: "3.2MB", action: "layoutGrid()", details: "Triggers layout grid recalculation, repainting Editor line container." }
        ]
      }
    },

    history: [
      { commit: "7a8e0f1", date: "2015-04-20", author: "Erich Gamma", message: "Initial commit of vscode client application structure", nodesAdded: ["src", "src/vs/base", "src/vs/base/common/lifecycle.ts"], nodesRemoved: [] },
      { commit: "9b3c2e1", date: "2016-11-12", author: "Alex Dima", message: "Integrate core editor component and buffer model structure", nodesAdded: ["src/vs/editor", "src/vs/editor/common/model/textModel.ts"], nodesRemoved: [] },
      { commit: "e5f2a18", date: "2018-05-30", author: "Benjamin Pasero", message: "Add workbench layers and IOC dependency injection container", nodesAdded: ["src/vs/workbench", "src/vs/platform", "src/vs/platform/instantiation/instantiationService.ts", "src/vs/workbench/browser/layout.ts"], nodesRemoved: [] }
    ],

    scanners: {
      technicalDebt: [
        { id: "td-1", name: "Monolithic Text Model Class", file: "src/vs/editor/common/model/textModel.ts", type: "Bloated Class", severity: "legacy", details: "TextModel class contains over 3,400 lines of logic. Interweaves lines management, word search, word wrapping and editing operations." }
      ],
      security: [
        { id: "sec-1", name: "Prototype Pollution vector", file: "src/vs/platform/instantiation/instantiationService.ts", type: "Dangerous Assign", severity: "warning", details: "Object properties injection does not block '__proto__' extensions during dynamic instances creation." }
      ],
      performance: [
        { id: "perf-1", name: "High Memory Allocations (Text Buffers)", file: "src/vs/editor/common/model/textModel.ts", type: "GC Pressure", severity: "critical", details: "Splitting lines into discrete string cells causes massive heap object allocation counts on large code files." }
      ]
    },

    aiAnswers: {
      "src/vs/editor/common/model/textModel.ts": {
        what: "textModel.ts defines the core data model for document buffers inside the Monaco editor. It controls raw text storage, line tracking, edit operations, decorations, and formatting markers.",
        why: "To provide a highly optimized, custom text storage engine capable of handling files larger than 100MB without blocking the UI thread.",
        fifteen: "It acts like a giant, super-fast notebook. Instead of keeping a file as one massive page, it splits it into clean lines, making it easy to find and change any character in an instant.",
        senior: "Operates as a coordinate system (line/column). Combines a piecewise line tree index structure with offset maps. Employs lazy tokenized line structures to prevent syntax coloring from blocking main thread text rendering.",
        risk: "EXTREMELY HIGH. Breaking code logic inside this class will crash VS Code's editor surface, rendering the entire window blank."
      }
    }
  }
};
