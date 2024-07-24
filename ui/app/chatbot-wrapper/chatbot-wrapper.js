import { BaseComponent } from "../../component.js";
import { Utils } from "../../scripts/utils.js";
import { ChatbotMessage } from "../chatbot-message/chatbot-message.js";


/**
 * The chatbot element.
 */
export class ChatbotWrapper extends BaseComponent {
  static initialize() {
    customElements.define("chatbot-wrapper", ChatbotWrapper);
  }

  /** @type {HTMLButtonElement} The submit button element. */
  submitButton;

  /** @type {HTMLTextAreaElement} The textarea human input element. */
  messageInput;

  /** @type {HTMLDivElement} The message list element. */
  messageList;

  constructor() {
    super();

    // Add depending component.
    ChatbotMessage.initialize();

    // Load the content of this component.
    this.loadComponents();
  }

  async loadComponents() {
    super.loadComponents();

    // Load the style sheets, templates and dictionary.
    const [styleSheetContent, templateContent] = await Promise.all([
      Utils.loadFile("/app/chatbot-wrapper/chatbot-wrapper.css"),
      Utils.loadFile("/app/chatbot-wrapper/chatbot-wrapper.html")
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

    // Allow Ctrl+Enter event to submit message for the text area.
    const textarea = this.messageInput = this._shadowRoot.querySelector("textarea");
    textarea.addEventListener("keydown", this.checkEnterMessage.bind(this), false);

    // Add click event to submit button.
    const submitButton = this.submitButton = this._shadowRoot.querySelector("button.submit-message");
    submitButton.addEventListener("click", this.submitMessage.bind(this), false);

    // Set other required referencing elements.
    this.messageList = this._shadowRoot.querySelector(".message-list");
  }

  /**
   * Check enter the message.
   * @param {KeyboardEvent} e 
   */
  checkEnterMessage(e) {
    if (e.ctrlKey && e.key === "Enter") {
      this.submitMessage();
    }
  }

  /**
   * To submit a message.
   */
  async submitMessage() {
    // Check for valid messages.
    const submitMessage = this.messageInput.value.trim();
    if (!submitMessage) {
      alert("No input messages.");
      return;
    }

    // Remove placeholder.
    this._shadowRoot.querySelector(".message-list-placeholder")?.remove();

    // Disable message input and submit button.
    this.submitButton.disabled = true;
    this.messageInput.disabled = true;
    this.messageInput.value = "";

    // Set history messages.
    /** @type {Array<{role: string, content: string}>} */
    const historyMessages = [];
    for (const msg of this.messageList.querySelectorAll("chatbot-message")) {
      historyMessages.push({
        role: msg.messageRole,
        content: msg.messageContent
      });
    }

    // Add human message.
    const userMsg = new ChatbotMessage();
    userMsg.messageRole = "human";
    userMsg.messageContent = submitMessage;
    const userMsgWrapper = document.createElement("div");
    userMsgWrapper.append(userMsg);
    this.messageList.append(userMsgWrapper);

    // Add AI message.
    const aiMsg = new ChatbotMessage();
    aiMsg.messageRole = "ai";
    aiMsg.messageContent = "";
    aiMsg.setLoading();
    const aiMsgWrapper = document.createElement("div");
    aiMsgWrapper.append(aiMsg);
    this.messageList.append(aiMsgWrapper);

    /** @type {Response} The Fetch results. */
    let response;
    try {
      // Send message.
      response = await fetch("http://localhost:8080/chat/stream", {
        method: "POST",
        body: JSON.stringify({"input": {
          "input": submitMessage,
          "history": historyMessages
        }}),
        headers: new Headers({
          "Content-Type": "application/json"
        })
      });
    } catch (e) {
      console.error(e);
      alert("Cannot connect to server.");

      // Remove added messages and put human message back to textarea.
      this.messageInput.value = userMsg.messageContent;
      userMsgWrapper.remove();
      aiMsgWrapper.remove();

      // Re-enable to textarea and submit button.
      this.messageInput.disabled = false;
      this.submitButton.disabled = false;

      return;
    }

    // Update scroll.
    while (!aiMsgWrapper.clientHeight) {
      await Utils.waitNextFrame();
    }
    this.messageList.scrollTop = this.messageList.scrollHeight;

    // Prepare the SSE message reader and data text decoder..
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // A flag for whether some text is received yet.
    let hasText = false;

    // A loop for receiving SSE messages.
    while (true) {
      // Read the SSE data.
      const { value, done } = await reader.read();

      // Exit when SSE finishes.
      if (done) {
        break;
      }

      // Decode and get the data part.
      const allData = decoder.decode(value).split("event: data\r\ndata:");

      // Handle message data for all data parts.
      for (const dataSplit of allData.slice(1)) {
        // Skip subsequent event parts.
        const dataContent = dataSplit.split("event:")[0];

        /** @type {string} Declare the message.*/
        let msg;

        // The returned data may be a JSON object or a plain string.
        try {
          const streamData = JSON.parse(dataContent);
          if (streamData instanceof Object) {
            msg = streamData.content;
          } else if (typeof streamData === "string") {
            msg = streamData;
          }
        } catch (e) {
          msg = dataContent;
        }

        // If there is message, add to the AI message content.
        if (msg) {
          // If there is no text before, flag it has text now and unset loading progress bar.
          if (!hasText) {
            hasText = true;
            aiMsg.unsetLoading();
          }
          aiMsg.addContent(msg);

          // Update scroll.
          this.messageList.scrollTop = this.messageList.scrollHeight;
        }
      }
    }

    // Re-enable to textarea and submit button.
    this.messageInput.disabled = false;
    this.submitButton.disabled = false;

    // Focus again on the textarea.
    this.messageInput.focus();
  }
}