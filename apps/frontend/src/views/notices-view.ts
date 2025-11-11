import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { noticeService } from '../services/notice-service-factory.js';
import { notificationService } from '../services/notification-service.js';
import { authContext, type AuthContextValue } from '../contexts/app-context.js';
import type { Notice, User, NoticeFormData } from '../types/index.js';
import '../components/ui/ui-card.js';
import '../components/ui/ui-button.js';
import '../components/ui/ui-modal.js';
import '../components/ui/ui-loading.js';
import '../components/forms/notice-form.js';

console.log('[NoticesView] Module loaded - notices-view.ts executed');

@customElement('notices-view')
export class NoticesView extends LitElement {
  @consume({ context: authContext, subscribe: true })
  @state()
  private authState!: AuthContextValue;

  @state() private notices: Notice[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private unreadCount = 0;
  @state() private showAll = false;
  @state() private showCreateModal = false;
  @state() private availableUsers: User[] = [];
  @state() private creatingNotice = false;

  constructor() {
    super();
    console.log('[NoticesView] Constructor called - component instantiated');
  }

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100vh;
      background-color: transparent;
    }

    .view-header {
      margin-bottom: 2rem;
    }

    .view-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .view-description {
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .unread-badge {
      background-color: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      min-width: 1.5rem;
      text-align: center;
    }

    .filter-toggle {
      display: flex;
      gap: 0.5rem;
    }

    .notices-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notice-card {
      position: relative;
      transition: all 0.2s ease-in-out;
    }

    .notice-card--unread {
      border-left: 4px solid #3b82f6;
      background-color: #f8fafc;
    }

    .notice-content {
      padding: 1rem;
    }

    .notice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }

    .notice-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
      flex: 1;
    }

    .notice-author {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .notice-date {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .notice-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .unread-indicator {
      width: 0.5rem;
      height: 0.5rem;
      background-color: #3b82f6;
      border-radius: 50%;
    }

    .read-indicator {
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 500;
    }

    .notice-text {
      color: #374151;
      line-height: 1.6;
      margin-bottom: 1rem;
      white-space: pre-wrap;
    }

    .notice-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      color: #6b7280;
    }

    .error-state {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 1rem;
      color: #dc2626;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .view-title {
        font-size: 1.5rem;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
      }

      .header-actions ui-button {
        width: 100%;
      }

      .filter-toggle {
        justify-content: center;
        flex-direction: column;
      }

      .filter-toggle ui-button {
        width: 100%;
      }

      .notice-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .notice-status {
        align-self: flex-end;
      }

      .notice-actions {
        justify-content: flex-start;
        flex-direction: column;
        width: 100%;
      }

      .notice-actions ui-button {
        width: 100%;
      }

      .notice-content {
        padding: 0.75rem;
      }
    }
  `;

  connectedCallback() {
    console.log('[NoticesView] connectedCallback called');
    console.log('[NoticesView] Initial state:', {
      authState: this.authState,
      isAuthenticated: this.authState?.isAuthenticated,
      user: this.authState?.user,
      notices: this.notices.length,
      loading: this.loading,
    });
    super.connectedCallback();
    console.log('[NoticesView] super.connectedCallback() completed');
    console.log('[NoticesView] About to load notices and unread count...');

    // Load data asynchronously after connection
    this.loadInitialData();
  }

  private async loadInitialData() {
    console.log('[NoticesView] loadInitialData called');

    // Wait for the component to be fully updated and context to be available
    await this.updateComplete;

    console.log('[NoticesView] After updateComplete, authState:', {
      authState: this.authState,
      isAuthenticated: this.authState?.isAuthenticated,
    });

    // Wait a bit more for context to be fully available
    // This helps ensure the auth context is properly propagated
    if (!this.authState?.isAuthenticated) {
      console.log(
        '[NoticesView] Auth state not ready, waiting for next update...'
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      await this.updateComplete;
      console.log('[NoticesView] After additional wait, authState:', {
        authState: this.authState,
        isAuthenticated: this.authState?.isAuthenticated,
      });
    }

    // Only load if authenticated
    if (this.authState?.isAuthenticated) {
      await this.loadNotices();
      await this.loadUnreadCount();
      console.log('[NoticesView] Load complete, final state:', {
        notices: this.notices.length,
        unreadCount: this.unreadCount,
        loading: this.loading,
        error: this.error,
      });
    } else {
      console.log(
        '[NoticesView] Not authenticated in loadInitialData, skipping data load'
      );
    }
  }

  private async loadNotices() {
    console.log(
      '[NoticesView] loadNotices called, authenticated:',
      this.authState?.isAuthenticated
    );

    // Wait for auth state to be available
    if (!this.authState) {
      console.log('[NoticesView] Auth state not available yet, waiting...');
      await this.updateComplete;
      console.log(
        '[NoticesView] After updateComplete, authState:',
        this.authState
      );
    }

    if (!this.authState?.isAuthenticated) {
      console.log('[NoticesView] Not authenticated, skipping load');
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const filters = this.showAll ? {} : { isRead: false };
      console.log(
        '[NoticesView] Calling noticeService.getNotices with filters:',
        filters
      );
      const response = await noticeService.getNotices(
        { sortBy: 'createdAt', sortOrder: 'desc' },
        filters
      );
      console.log('[NoticesView] Received response:', response);
      this.notices = response.data;
      console.log(
        '[NoticesView] Notices loaded:',
        this.notices.length,
        'items'
      );
      // Force update to ensure re-render
      this.requestUpdate();
      console.log('[NoticesView] requestUpdate called');
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Error al cargar los avisos';
      console.error('[NoticesView] Error loading notices:', error);
    } finally {
      this.loading = false;
      // Force update after loading state changes
      this.requestUpdate();
    }
  }

  private async loadUnreadCount() {
    if (!this.authState?.isAuthenticated) return;

    try {
      this.unreadCount = await noticeService.getUnreadCount();
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  private async handleMarkAsRead(notice: Notice) {
    if (notice.isRead) return;

    try {
      await noticeService.markAsRead(notice.id);

      // Update the notice in the local state
      this.notices = this.notices.map((n) =>
        n.id === notice.id ? { ...n, isRead: true, readAt: new Date() } : n
      );

      // Update unread count
      this.unreadCount = Math.max(0, this.unreadCount - 1);

      // If showing only unread notices, remove this notice from the list
      if (!this.showAll) {
        this.notices = this.notices.filter((n) => n.id !== notice.id);
      }

      // Show success notification
      notificationService.success(
        'Aviso marcado',
        'El aviso se ha marcado como leído.'
      );
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Error al marcar como leído';

      // Show error notification
      notificationService.error('Error', this.error);
      console.error('Error marking notice as read:', error);
    }
  }

  private async handleMarkAllAsRead() {
    if (this.unreadCount === 0) return;

    try {
      await noticeService.markAllAsRead();

      // Update all notices to read status
      this.notices = this.notices.map((notice) => ({
        ...notice,
        isRead: true,
        readAt: new Date(),
      }));

      this.unreadCount = 0;

      // If showing only unread notices, clear the list
      if (!this.showAll) {
        this.notices = [];
      }
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Error al marcar todos como leídos';
      console.error('Error marking all notices as read:', error);
    }
  }

  private async handleToggleFilter() {
    this.showAll = !this.showAll;
    await this.loadNotices();
  }

  private async handleCreateNotice() {
    this.showCreateModal = true;

    // Load available users if not already loaded
    if (this.availableUsers.length === 0) {
      try {
        const recipients = await noticeService.getRecipients();
        this.availableUsers = recipients.users;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Error al cargar usuarios';
        console.error('Error loading users:', error);
      }
    }
  }

  private handleCloseCreateModal() {
    this.showCreateModal = false;

    // Reset form by getting a fresh reference
    const form = this.shadowRoot?.querySelector('notice-form');
    if (form) {
      form.reset();
    }
  }

  private async handleNoticeSubmit(event: CustomEvent) {
    const { formData } = event.detail as { formData: NoticeFormData };

    this.creatingNotice = true;
    this.error = null;

    try {
      await noticeService.createNotice(formData);

      // Close modal and reset form
      this.handleCloseCreateModal();

      // Reload notices to show the new one if it's for the current user
      await this.loadNotices();
      await this.loadUnreadCount();

      // Show success notification
      notificationService.success(
        'Aviso creado',
        'El aviso se ha enviado correctamente.'
      );
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Error al crear el aviso';

      // Show error notification
      notificationService.error('Error al crear aviso', this.error);
      console.error('Error creating notice:', error);
    } finally {
      this.creatingNotice = false;
    }
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1
        ? 'Hace un momento'
        : `Hace ${diffInMinutes} minutos`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  }

  private renderNotice(notice: Notice) {
    return html`
      <ui-card
        class="notice-card ${notice.isRead ? '' : 'notice-card--unread'}"
        padding="none"
      >
        <div class="notice-content">
          <div class="notice-header">
            <div class="notice-meta">
              <div class="notice-author">
                ${notice.author.firstName} ${notice.author.lastName}
              </div>
              <div class="notice-date">
                ${this.formatDate(notice.createdAt)}
              </div>
            </div>
            <div class="notice-status">
              ${notice.isRead
                ? html`<span class="read-indicator">✓ Leído</span>`
                : html`<div class="unread-indicator" title="No leído"></div>`}
            </div>
          </div>

          <div class="notice-text">${notice.content}</div>

          ${!notice.isRead
            ? html`
                <div class="notice-actions">
                  <ui-button
                    variant="secondary"
                    size="sm"
                    @ui-click=${() => this.handleMarkAsRead(notice)}
                  >
                    Marcar como leído
                  </ui-button>
                </div>
              `
            : ''}
        </div>
      </ui-card>
    `;
  }

  render() {
    console.log('[NoticesView] render() called');
    console.log('[NoticesView] Render state:', {
      noticesCount: this.notices.length,
      loading: this.loading,
      authenticated: this.authState?.isAuthenticated,
      authState: this.authState,
      error: this.error,
      showAll: this.showAll,
      unreadCount: this.unreadCount,
    });

    // Check if authState is available and authenticated
    if (!this.authState) {
      console.log(
        '[NoticesView] Auth state not available yet, showing loading spinner'
      );
      return html`
        <div class="loading-state">
          <div class="spinner"></div>
        </div>
      `;
    }

    if (!this.authState.isAuthenticated) {
      console.log('[NoticesView] Not authenticated, showing loading spinner');
      return html`
        <div class="loading-state">
          <div class="spinner"></div>
        </div>
      `;
    }

    console.log('[NoticesView] Authenticated, rendering main content');
    console.log('[NoticesView] About to return HTML template');
    console.log('[NoticesView] Final render decision:', {
      showLoading: this.loading,
      showEmpty: !this.loading && this.notices.length === 0,
      showNotices: !this.loading && this.notices.length > 0,
      noticesCount: this.notices.length,
    });

    return html`
      <div class="view-header">
        <h1 class="view-title">
          Avisos
          ${this.unreadCount > 0
            ? html` <span class="unread-badge">${this.unreadCount}</span> `
            : ''}
        </h1>
        <p class="view-description">
          ${this.showAll ? 'Todos tus avisos recibidos' : 'Avisos no leídos'}
        </p>

        <div class="header-actions">
          <ui-button
            variant="primary"
            size="sm"
            @ui-click=${this.handleCreateNotice}
          >
            + Crear aviso
          </ui-button>

          <div class="filter-toggle">
            <ui-button
              variant=${this.showAll ? 'secondary' : 'primary'}
              size="sm"
              @ui-click=${this.handleToggleFilter}
            >
              ${this.showAll ? 'Solo no leídos' : 'Mostrar todos'}
            </ui-button>

            ${this.unreadCount > 0
              ? html`
                  <ui-button
                    variant="ghost"
                    size="sm"
                    @ui-click=${this.handleMarkAllAsRead}
                  >
                    Marcar todos como leídos
                  </ui-button>
                `
              : ''}
          </div>
        </div>
      </div>

      ${this.error ? html` <div class="error-state">${this.error}</div> ` : ''}
      ${this.loading
        ? html`
            <div class="loading-state">
              <div class="spinner"></div>
            </div>
          `
        : ''}
      ${!this.loading && this.notices.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <h3>
                ${this.showAll
                  ? 'No tienes avisos'
                  : 'No tienes avisos sin leer'}
              </h3>
              <p>
                ${this.showAll
                  ? 'Cuando recibas avisos aparecerán aquí.'
                  : '¡Perfecto! Estás al día con todos tus avisos.'}
              </p>
            </div>
          `
        : ''}
      ${!this.loading && this.notices.length > 0
        ? html`
            <div class="notices-container">
              ${this.notices.map((notice) => this.renderNotice(notice))}
            </div>
          `
        : ''}

      <!-- Create Notice Modal -->
      <ui-modal
        .isOpen=${this.showCreateModal}
        title="Crear nuevo aviso"
        size="lg"
        @ui-modal-close=${this.handleCloseCreateModal}
      >
        <notice-form
          .loading=${this.creatingNotice}
          .availableUsers=${this.availableUsers}
          @notice-submit=${this.handleNoticeSubmit}
          @notice-cancel=${this.handleCloseCreateModal}
        ></notice-form>
      </ui-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notices-view': NoticesView;
  }
}
