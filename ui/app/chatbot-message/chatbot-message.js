import { BaseComponent } from "../../component.js";
import { Utils } from "../../scripts/utils.js";


/**
 * The chatbot element.
 */
export class ChatbotMessage extends BaseComponent {
  static initialize() {
    customElements.define("chatbot-message", ChatbotMessage);
  }

  /** @type {string} The message role. */
  messageRole;

  /** @type {string} The message content. */
  messageContent;

  /** @type {HTMLDivElement} The message content element. */
  messageContentEle;

  /** @type {boolean} Whether the message is loading. */
  #isLoading = false;

  constructor() {
    super();
    this.loadComponents();
  }

  async loadComponents() {
    super.loadComponents();

    // Load the style sheets, templates and dictionary.
    const [styleSheetContent, templateContent] = await Promise.all([
      Utils.loadFile("/app/chatbot-message/chatbot-message.css"),
      Utils.loadFile("/app/chatbot-message/chatbot-message.html")
    ]);

    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = styleSheetContent;
    this._shadowRoot.append(styleSheet);

    const template = document.createElement("template");
    template.innerHTML = templateContent;
    this._shadowRoot.append(template.content);

    this.finishLoad();
  }

  finishLoad() {
    super.finishLoad();

    // Show the message row.
    this._shadowRoot.querySelector(".message-role").textContent = this.messageRole;

    // Show the meessage content.
    this.messageContentEle = this._shadowRoot.querySelector(".message-content");
    if (this.messageContent) {
      this.messageContentEle.textContent = this.messageContent;
    }

    // If it's loading, set to show loading progress bar.
    if (this.#isLoading) {
      this.setLoading();
    }
  }

  /**
   * Set the loading status.
   */
  setLoading() {
    this.#isLoading = true;
    this._shadowRoot.querySelector(".message-loading")?.classList.remove("hidden");
  }

  /**
   * Unset the loading status.
   */
  unsetLoading() {
    this.#isLoading = false;
    this._shadowRoot.querySelector(".message-loading")?.classList.add("hidden");
  }

  /**
   * Add message content.
   * @param {string} text 
   */
  addContent(text) {
    this.messageContent += text;
    if (this._loaded) {
      this.messageContentEle.textContent += text;
    }
  }
}