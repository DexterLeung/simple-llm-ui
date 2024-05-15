/**
 * The base WebComponent class.
 */
export class BaseComponent extends HTMLElement {
  /** @type {ShadowRoot} The shadow root of the component. */
  _shadowRoot;

  /** Whether this component is loaded. */
  _loaded = false;

  /**
   * To initialize the component.
   */
  static initialize() {
    throw "Not implemented."
  }

  /**
   * Load the content of the component, including stylesheets or the HTML template content.
   */
  async loadComponents() {
    // Attach the shadow root.
    this._shadowRoot = this.attachShadow({mode: "closed"});

    // Dynamic content to be loaded in each component.
  }

  /**
   * Finish loading the component.
   */
  finishLoad() {
    // Flag loaded to be true to stat it's loaded.
    this._loaded = true;
  }
}