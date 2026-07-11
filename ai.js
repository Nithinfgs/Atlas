// Atlas AI Assistant & Explain Mode panel coordinator (AI Review, Camera Fly-To)

class AtlasAI {
  constructor() {
    this.chatMessagesBox = document.getElementById('chat-messages-box');
    this.chatInputField = document.getElementById('chat-input-field');
    this.chatSendBtn = document.getElementById('chat-send-btn');
    
    this.currentNode = null;
    
    this.reportBtn = document.getElementById('btn-generate-arch-report');
    this.reportArea = document.getElementById('arch-report-output');

    this.setupEvents();
  }

  setupEvents() {
    this.chatSendBtn.addEventListener('click', () => this.handleUserMessageSubmit());
    this.chatInputField.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        this.handleUserMessageSubmit();
      }
    });

    document.querySelectorAll('.ai-chip-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const promptText = btn.getAttribute('data-prompt') || btn.innerText;
        this.askQuestion(promptText);
      });
    });

    // Scorecard generation
    this.reportBtn.addEventListener('click', () => this.generateArchitectureScorecard());
  }

  inspectNode(node) {
    this.currentNode = node;
    this.resetChat();
    this.appendBotMessage(`<strong>Symbol Inspected:</strong> <span class="code-font">${node.id}</span><br>Select a quick AI prompt, ask a custom question, or trigger the camera by typing: 'Take me to [module]'.`);
  }

  resetChat() {
    this.chatMessagesBox.innerHTML = '';
  }

  handleUserMessageSubmit() {
    const text = this.chatInputField.value.trim();
    if (!text) return;
    this.chatInputField.value = '';
    this.askQuestion(text);
  }

  askQuestion(questionText) {
    this.appendUserMessage(questionText);

    const typingBubble = this.showTypingIndicator();

    setTimeout(() => {
      typingBubble.remove();
      const response = this.generateBotResponse(questionText);
      this.appendBotMessage(response);
    }, 800);
  }

  generateBotResponse(question) {
    const qLower = question.toLowerCase();

    // 1. AI Navigation Camera Fly-To commands parser
    if (qLower.includes('take me to') || qLower.includes('where is') || qLower.includes('show everything related') || qLower.includes('highlight')) {
      // Extract keywords
      let searchSymbol = qLower
        .replace('take me to', '')
        .replace('where is', '')
        .replace('show everything related to', '')
        .replace('highlight all', '')
        .replace('highlight', '')
        .trim();

      const graph = window.AtlasApp ? window.AtlasApp.graph : null;
      if (graph) {
        // Search nodes
        const found = graph.allNodes.find(n => 
          n.label.toLowerCase().includes(searchSymbol) || 
          n.id.toLowerCase().includes(searchSymbol) || 
          n.group.toLowerCase().includes(searchSymbol)
        );

        if (found) {
          // Switch tabs if needed
          window.AtlasApp.switchTab('architecture');
          setTimeout(() => {
            const canvasNode = graph.nodes.find(n => n.id === found.id);
            if (canvasNode) {
              graph.focusNode(canvasNode);
              window.AtlasApp.inspectNode(canvasNode);
            }
          }, 50);

          return `🚀 **AI Navigation Fly-To triggered!** Centering visualizer camera on **${found.label}** inside folder package group **${found.group}**.`;
        }
      }
      return `I analyzed index files for symbol "${searchSymbol}" but couldn't locate it. Try spelling it matching AST file labels (e.g. 'Scheduler' or 'ReactHooks').`;
    }

    if (!this.currentNode) {
      return "Please select a component node in the visual code galaxy first, then ask your question.";
    }

    const answers = window.AtlasApp && window.AtlasApp.currentRepoData.aiAnswers 
      ? window.AtlasApp.currentRepoData.aiAnswers[this.currentNode.id] 
      : null;

    const learningLevel = document.getElementById('learning-level').value;

    if (answers) {
      if (qLower.includes('do?') || qLower.includes('what does')) {
        return this.formatAnswer(answers.what, learningLevel);
      }
      if (qLower.includes('why') || qLower.includes('exist')) {
        return this.formatAnswer(answers.why, learningLevel);
      }
      if (qLower.includes('15') || qLower.includes('teen')) {
        return answers.fifteen;
      }
      if (qLower.includes('senior') || qLower.includes('expert')) {
        return answers.senior;
      }
      if (qLower.includes('risky') || qLower.includes('edit')) {
        return answers.risk;
      }
    }

    return this.generateGenericResponse(question, learningLevel);
  }

  formatAnswer(baseAnswer, level) {
    if (level === 'beginner') {
      return `[Beginner Friendly] Here is the simple version: ${baseAnswer.split('.')[0]}. It essentially manages this file's responsibilities without complicated logic.`;
    }
    if (level === 'expert') {
      return `[Expert Analysis] System AST inspection indicates direct imports. Operating context constraints: ${baseAnswer}. Potential issues involve heap allocation sizing or synchronous main thread bottlenecks.`;
    }
    return baseAnswer; 
  }

  generateGenericResponse(question, level) {
    const symbol = this.currentNode.label;
    const path = this.currentNode.id;

    if (level === 'beginner') {
      return `This is **${symbol}** inside folder package group **${this.currentNode.group}**. It acts as a standard building block in the app. Developers edit this file when they want to change features related to this specific section of code.`;
    }
    
    return `AST indexing summary for <span class="code-font">${path}</span>:<br><br>
    • **Complexity Score:** Highly dependent on imports. Cognitive branch weight is moderately contained.<br>
    • **Coupling Density:** Connected to adjacent files in group folder. High integrity.<br>
    • **Architectural Role:** Coordinates standard methods. We recommend auditing execution traces via the **Runtime Simulator** to watch calling stacks pulse this node live.`;
  }

  generateArchitectureScorecard() {
    this.reportArea.innerHTML = `
      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px; margin-top: 10px;">
        <span class="badge" style="background: rgba(34, 221, 94, 0.15); border-color: var(--success); color: var(--success);">Architecture Grade: A-</span>
        <ul style="margin-top: 10px;">
          <li class="pos"><strong>Separation of concerns:</strong> Clean division of DOM and scheduling layers.</li>
          <li class="pos"><strong>Modularity:</strong> Consistent folder packaging groups.</li>
          <li class="neg"><strong>Coupling weakness:</strong> Tight dependencies between fiber loop hooks.</li>
          <li class="neg"><strong>Circular reference:</strong> Circular call-stack dependency in BeginWork loop.</li>
        </ul>
      </div>
    `;
    this.reportArea.classList.add('active');
  }

  appendUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-message user';
    msg.innerHTML = `
      <div class="avatar">ME</div>
      <div class="msg-bubble">${text}</div>
    `;
    this.chatMessagesBox.appendChild(msg);
    this.scrollToBottom();
  }

  appendBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-message bot';
    msg.innerHTML = `
      <div class="avatar">AI</div>
      <div class="msg-bubble">${text}</div>
    `;
    this.chatMessagesBox.appendChild(msg);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = 'chat-message bot typing';
    msg.innerHTML = `
      <div class="avatar">AI</div>
      <div class="msg-bubble">Thinking...</div>
    `;
    this.chatMessagesBox.appendChild(msg);
    this.scrollToBottom();
    return msg;
  }

  scrollToBottom() {
    this.chatMessagesBox.scrollTop = this.chatMessagesBox.scrollHeight;
  }
}
window.AtlasAI = AtlasAI;
