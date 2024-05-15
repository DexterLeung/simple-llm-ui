import { ChatbotWrapper } from "./app/chatbot-wrapper/chatbot-wrapper.js";



/**
 * The LLM App core script.
 */
class LMMApp {
  /** To initialize the app. */
  static initialize() {
    new LMMApp();
  }

  constructor() {
    // Start the app once the document is ready.
    if (document.readyState === "complete") {
      this.start();
    } else {
      window.addEventListener("load", this.start.bind(this), { capture: false, once: true });
    }
  }

  start() {
    // Initialize the ChatbotWrapper component.
    ChatbotWrapper.initialize();
  }
}

// Initialize the app.
LMMApp.initialize();
