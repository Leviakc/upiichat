import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class ChatInput extends BaseComponent {
  private $inputElement: HTMLTextAreaElement | null = null;
  private $sendButton: HTMLButtonElement | null = null;
  private isSending = false;

  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    if (this.shadowRoot === null) {
      return;
    }
    this.$inputElement = this.shadowRoot?.querySelector("textarea");
    this.$sendButton = this.shadowRoot?.querySelector("button");

    // TODO: Check why this validation is not working
    // if (!this.inputElement && !this.sendButton) return;
    if (!this.$inputElement || !this.$sendButton) return;

    // Start in a disabled state
    this.$inputElement.disabled = true;
    this.$sendButton.disabled = true;
    this.$inputElement.placeholder = "Initializing chatbot...";

    document.addEventListener("app-ready", () => {
      if (!this.$inputElement || !this.$sendButton) return;
      // Start in a disabled state
      this.$inputElement.disabled = false;
      this.$sendButton.disabled = false;
      this.$inputElement.placeholder = "Escribe tu pregunta";
    });

    this.$inputElement.addEventListener("input", () => {
      if (!this.$inputElement) return;

      // TODO: Check if this is necessary or if it's enough with the max-height
      // const remInPx = parseFloat(
      //   getComputedStyle(document.documentElement).fontSize,
      // );
      // const remHeight = remInPx * 10; // 10rem in pixels
      // const currentHeight = parseFloat(this.$inputElement.style.height) || 0;
      // if (this.$inputElement.value === "") {
      //   this.$inputElement.style.height = "auto";
      //   return;
      //  }
      // if (currentHeight > remHeight) {
      //   return;
      //  }

      this.$inputElement.style.height = "auto";
      this.$inputElement.style.height = `${this.$inputElement.scrollHeight}px`;
    });

    this.$sendButton.addEventListener("click", () => {
      if (this.$inputElement?.value.trim() === "") return;
      this.$sendButton?.blur(); // this will remove focus from the button
      this.sendMessage();
    });

    this.$inputElement.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      if (!this.$inputElement?.value.trim()) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey) {
        return;
      }

      event.preventDefault();
      this.sendMessage();
    });
  }

  public sendMessage(): void {
    if (this.isSending) return;

    if (!this.$inputElement || !this.$sendButton) return;

    const messageText = this.$inputElement.value.trim();
    if (messageText.trim() === "") return;

    this.dispatchEvent(
      new CustomEvent("message-sent", {
        bubbles: true,
        composed: true,
        detail: { text: messageText },
      }),
    );

    this.isSending = true;
    this.$inputElement.disabled = true;
    this.$inputElement.value = "";
    this.$sendButton.disabled = true;

    // Clear the value
    this.$inputElement.placeholder = "Assistant is responding...";
    this.$inputElement.rows = 1;
    this.$inputElement.dispatchEvent(new Event("input"));

    setTimeout(() => {
      this.isSending = false;
      if (!this.$inputElement || !this.$sendButton) return;

      this.$inputElement.disabled = false;
      this.$sendButton.disabled = false;
      this.$inputElement.placeholder = "Escribe tu pregunta";
      if (document.documentElement.clientWidth >= 700) {
        this.$inputElement.focus();
      }
    }, 1000);
  }
}

customElements.define("chat-input", ChatInput);
