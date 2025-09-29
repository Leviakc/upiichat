import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";
import { Router } from "@/services/router";
import { storageService } from "@/services/store";
import type { ChatDisplayItem } from "@/types/chat";
import { ActionMenu, type MenuItemConfig } from "../common/action-menu";

class Sidebar extends BaseComponent {
  private isCollapsed = true; // Start collapsed
  private hoverCooldownTimeout: number | null = null;
  private isManuallyCollapsed = false;
  private isMobile = false;
  private $toggleButton: HTMLButtonElement | null = null;
  private $chatList: HTMLUListElement | null = null;
  private router = Router;

  protected override connectedCallback(): void {
    this.classList.add("collapsed");
    super.connectedCallback();

    // Initialize mode first
    this.initializeMode();

    // Load saved sidebar state for desktop mode
    this.loadSidebarState();

    this.setupHoverCooldown();
    this.setupModeHandling();

    // Load initial chat list
    this.loadChatList();

    // Listen for storage changes
    document.addEventListener("storage-updated", () => {
      this.loadChatList();
    });

    // Listen for route changes to update active chat highlight
    document.addEventListener("route-changed", (e) => {
      const { route } = (e as CustomEvent).detail as { route: string };
      this.updateActiveChatHighlight(route);
    });
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    if (!this.shadowRoot) {
      return;
    }

    this.$toggleButton = this.shadowRoot?.querySelector(".toggle-btn");
    this.$chatList = this.shadowRoot?.querySelector(".chat-list");

    // Toggle sidebar
    this.shadowRoot
      ?.querySelector("#sidebar-toggle")
      ?.addEventListener("click", () => {
        this.toggleSidebar();
      });

    this.$toggleButton?.addEventListener("click", () => {
      if (this.isMobile) {
        this.toggleMobileSidebar();
      }
    });

    // New chat button
    this.shadowRoot
      ?.querySelector("#new-chat")
      ?.addEventListener("click", () => {
        this.createNewChat();
      });

    // Mobile menu toggle handler
    document.addEventListener("toggle-mobile-sidebar", () => {
      if (this.isMobile) {
        this.toggleMobileSidebar();
      }
    });

    // Close mobile sidebar when clicking backdrop
    document.addEventListener("click", (e) => {
      const container = document.querySelector("chat-container");
      const target = e.target as HTMLElement;

      // Check if mobile sidebar is open and click is on backdrop (not on sidebar or header)
      if (
        this.isMobile &&
        container?.classList.contains("mobile-sidebar-open") &&
        !this.contains(target) &&
        !target.closest("chat-header") &&
        !target.closest("side-bar")
      ) {
        // Close mobile sidebar
        container.classList.remove("mobile-sidebar-open");
        this.classList.add("collapsed");
        this.isCollapsed = true;
      }
    });
  }

  private loadSidebarState(): void {
    // Only load saved state for desktop mode
    if (!this.isMobile) {
      const savedCollapsed = storageService.getSidebarCollapsed();
      this.isCollapsed = savedCollapsed;
      // console.log("desktop - load saved state", this.isCollapsed);
      this.classList.toggle("collapsed", this.isCollapsed);
    } else {
      // Mobile always starts collapsed
      this.isCollapsed = true;
      this.classList.add("collapsed");
    }
  }

  private toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.classList.toggle("collapsed", this.isCollapsed);

    // Save state for desktop mode only
    if (!this.isMobile) {
      storageService.setSidebarCollapsed(this.isCollapsed);
    }

    // Always remove hover-expanded when toggling
    this.classList.remove("hover-expanded");

    if (this.isCollapsed) {
      this.isManuallyCollapsed = true;
      this.classList.add("manually-collapsed");

      if (this.hoverCooldownTimeout) {
        clearTimeout(this.hoverCooldownTimeout);
      }
    } else {
      this.isManuallyCollapsed = false;
      this.classList.remove("manually-collapsed");
    }
  }

  private toggleMobileSidebar(): void {
    // In mobile mode, toggle the mobile overlay
    const container = document.querySelector("chat-container");
    if (container) {
      const isCurrentlyOpen = container.classList.contains(
        "mobile-sidebar-open",
      );

      if (isCurrentlyOpen) {
        // Close the sidebar - remove overlay and collapse content
        container.classList.remove("mobile-sidebar-open");
        this.classList.add("collapsed");
        this.isCollapsed = true;
        // document
        //   .querySelector("chat-container")
        //   ?.classList.remove("mobile-sidebar-open");
        // console.log("close mobile sidebar");
      } else {
        // Open the sidebar - add overlay and expand content
        container.classList.add("mobile-sidebar-open");
        // console.log("close mobile sidebar");
        this.classList.remove("collapsed");
        // document.querySelector('chat-container')?.classList.remove('mobile-sidebar-open');

        this.isCollapsed = false;
      }
    }
  }

  private createNewChat(): void {
    // Create new chat and navigate to it
    // const chat = storageService.createChat();
    // this.router.goToRoute(`/chat/${chat.id}`);
    this.router.goToRoute("/");

    // Close mobile sidebar if open
    if (this.isMobile) {
      const container = document.querySelector("chat-container");
      container?.classList.remove("mobile-sidebar-open");
      this.classList.add("collapsed");
      this.isCollapsed = true;
    }
  }

  private loadChatList(): void {
    if (!this.$chatList) return;

    const chats = storageService.getChatsForDisplay();

    // Clear existing chats
    this.$chatList.innerHTML = "";

    // Add test chat for action menu demo (temporary)
    if (chats.length === 0) {
      const testChat: ChatDisplayItem = {
        id: "test-chat-1",
        title: "Como registrar materias?",
        preview: "Hola, necesito ayuda con el registro...",
        timeDisplay: "2h ago",
        isActive: false,
        messageCount: 5,
        isEditable: true,
      };
      chats.push(testChat);
    }

    // Add each chat
    chats.forEach((chat) => {
      const chatElement = this.createChatElement(chat);
      this.$chatList!.appendChild(chatElement);
    });

    // Set up event listeners for the new chat bubbles
    this.setupChatBubbleListeners();
  }

  private createChatElement(chat: ChatDisplayItem): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "chat-bubble";
    li.dataset.chatId = chat.id;

    // Check if this is the current chat
    const currentChatId = Router.getCurrentChatId();
    if (currentChatId === chat.id) {
      li.classList.add("active");
    }

    li.innerHTML = `
      <div class="chat-icon">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          />
        </svg>
      </div>
      <div class="chat-content">
        <div class="chat-title">${chat.title}</div>
        <div class="chat-time">${chat.timeDisplay}</div>
      </div>
      <button class="chat-actions-btn" data-chat-id="${chat.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    `;

    // Setup action menu
    this.setupChatActionMenu(li, chat);

    return li;
  }

  private setupChatActionMenu(
    chatElement: HTMLLIElement,
    chat: ChatDisplayItem,
  ): void {
    const actionBtn = chatElement.querySelector(
      ".chat-actions-btn",
    ) as HTMLButtonElement;
    const chatContent = chatElement.querySelector(
      ".chat-content",
    ) as HTMLElement;

    if (!actionBtn || !chatContent) return;

    // Create action menu instance
    const actionMenu = new ActionMenu();

    // Define menu items
    const menuItems: MenuItemConfig[] = [
      {
        id: "rename",
        label: "Renombrar",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>`,
        action: () => this.handleRenameChat(chat.id, chat.title),
      },
      {
        id: "duplicate",
        label: "Duplicar",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>`,
        action: () => this.handleDuplicateChat(chat.id),
      },
      { type: "separator" },
      {
        id: "delete",
        label: "Eliminar",
        variant: "danger",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"/>
          <path d="m19,6v14a2,2 0 0 1-2,2H7a2,2 0 0 1-2-2V6m3,0V4a2,2 0 0 1,2-2h4a2,2 0 0 1,2,2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>`,
        action: () => this.handleDeleteChat(chat.id, chat.title),
      },
    ];

    // Setup desktop click trigger
    actionMenu.setupTrigger(actionBtn, menuItems);

    // Setup mobile long-press trigger
    actionMenu.setupTrigger(chatContent, menuItems, { longPress: true });
  }

  private handleRenameChat(chatId: string, currentTitle: string): void {
    // TODO: Implement rename functionality
    console.log("Rename chat:", chatId, currentTitle);
  }

  private handleDuplicateChat(chatId: string): void {
    // TODO: Implement duplicate functionality
    console.log("Duplicate chat:", chatId);
  }

  private handleDeleteChat(chatId: string, title: string): void {
    // TODO: Show confirmation modal and then delete
    console.log("Delete chat:", chatId, title);
  }

  private setupChatBubbleListeners(): void {
    if (!this.$chatList) return;

    this.$chatList.querySelectorAll(".chat-bubble").forEach((bubble) => {
      bubble.addEventListener("click", (e) => {
        const chatId = (e.currentTarget as HTMLElement).dataset.chatId;
        if (chatId) {
          this.selectChat(chatId);
        }
      });
    });
  }

  private selectChat(chatId: string): void {
    // Remove active class from all bubbles
    this.shadowRoot?.querySelectorAll(".chat-bubble").forEach((bubble) => {
      bubble.classList.remove("active");
    });

    // Add active class to selected bubble
    const selectedBubble = this.shadowRoot?.querySelector(
      `[data-chat-id="${chatId}"]`,
    );
    selectedBubble?.classList.add("active");

    // Navigate to the chat - this will trigger route-changed event
    this.router.goToRoute(`/chat?id=${chatId}`);

    // Close mobile sidebar if open
    if (this.isMobile) {
      const container = document.querySelector("chat-container");
      container?.classList.remove("mobile-sidebar-open");
      this.classList.add("collapsed");
      this.isCollapsed = true;
    }
  }

  private updateActiveChatHighlight(_route: string): void {
    // Remove active class from all bubbles
    this.$chatList?.querySelectorAll(".chat-bubble").forEach((bubble) => {
      bubble.classList.remove("active");
    });

    // Add active class if we're on a chat route
    if (Router.isOnChatRoute()) {
      const chatId = Router.getCurrentChatId();
      if (chatId) {
        const selectedBubble = this.$chatList?.querySelector(
          `[data-chat-id="${chatId}"]`,
        );
        selectedBubble?.classList.add("active");
      }
    }
  }

  private setupHoverCooldown(): void {
    // Only setup hover behavior for desktop mode
    if (this.isMobile) return;

    // Listen for mouse leave on the entire chat-container
    const chatContainer = document.querySelector("chat-container");

    chatContainer?.addEventListener("mouseleave", () => {
      this.startHoverCooldown();
      // Remove hover-expanded class when leaving container
      this.classList.remove("hover-expanded");
    });

    // Also listen for mouse leave on sidebar itself
    this.addEventListener("mouseleave", () => {
      this.startHoverCooldown();
      this.classList.remove("hover-expanded");
    });

    // Add hover-expanded class when hovering over collapsed sidebar
    this.addEventListener("mouseenter", () => {
      if (this.isCollapsed && !this.isManuallyCollapsed && !this.isMobile) {
        this.classList.add("hover-expanded");
      }
    });

    // Remove hover-expanded class when leaving sidebar
    this.addEventListener("mouseleave", () => {
      this.classList.remove("hover-expanded");
    });
  }

  private startHoverCooldown(): void {
    // Only start cooldown if manually collapsed
    if (!this.isManuallyCollapsed) return;

    // Clear existing timeout
    if (this.hoverCooldownTimeout) {
      clearTimeout(this.hoverCooldownTimeout);
    }

    // Wait a bit, then re-enable hover
    // this.hoverCooldownTimeout = window.setTimeout(() => {
    //   this.isManuallyCollapsed = false;
    //   this.classList.remove("manually-collapsed");
    //   this.hoverCooldownTimeout = null;
    // }, 500); // 500ms cooldown before hover works again
  }

  private checkMobile(): boolean {
    return window.innerWidth <= 700;
  }

  private initializeMode(): void {
    this.isMobile = this.checkMobile();

    // this.loadSidebarState();
    // console.log("this is mobile", this.isMobile);
    if (this.isMobile) {
      this.classList.add("mobile-mode");
      this.classList.remove("desktop-mode");
      // Update container layout
      document.querySelector("chat-container")?.classList.add("mobile-layout");
    } else {
      this.classList.add("desktop-mode");
      this.classList.remove("mobile-mode");
      // Remove mobile layout from container
      document
        .querySelector("chat-container")
        ?.classList.remove("mobile-layout");
    }
  }

  private setupModeHandling(): void {
    // Listen for window resize to update mode
    window.addEventListener("resize", () => {
      const wasMobile = this.isMobile;
      this.isMobile = this.checkMobile();

      // Only update if mode actually changed
      if (wasMobile !== this.isMobile) {
        this.initializeMode();

        // Reset sidebar state when switching modes
        if (this.isMobile) {
          // Mobile: start collapsed
          this.isCollapsed = true;
        } else {
          // Desktop: load saved state and reset hover behavior
          this.loadSidebarState();
          this.isManuallyCollapsed = false;
          this.classList.remove("manually-collapsed");
        }
      }
    });
  }

  protected override disconnectedCallback(): void {
    // Clean up timeout when component is removed
    if (this.hoverCooldownTimeout) {
      clearTimeout(this.hoverCooldownTimeout);
    }

    // Clean up resize listener
    window.removeEventListener("resize", this.setupModeHandling);

    super.disconnectedCallback();
  }
}

customElements.define("side-bar", Sidebar);
