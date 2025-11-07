import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { newsService } from '../services/news-service.js';
import { authContext, type AuthContextValue } from '../contexts/app-context.js';
import type { News, PaginatedResponse, NewsFormData } from '../types/index.js';
import '../components/ui/ui-card.js';
import '../components/ui/ui-button.js';
import '../components/forms/news-form.js';

@customElement('news-view')
export class NewsView extends LitElement {
  @consume({ context: authContext, subscribe: true })
  @state()
  private auth!: AuthContextValue;

  @state() private news: News[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private selectedNews: News | null = null;
  @state() private currentPage = 1;
  @state() private totalPages = 1;
  @state() private hasMore = false;
  @state() private showCreateForm = false;
  @state() private creating = false;

  private readonly pageSize = 10;

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .view-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content {
      flex: 1;
    }

    .view-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .view-description {
      color: #6b7280;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .news-list {
      display: grid;
      gap: 1.5rem;
    }

    .news-item {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .news-item:hover {
      transform: translateY(-2px);
    }

    .news-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .news-author {
      font-weight: 500;
      color: #374151;
    }

    .news-date {
      color: #9ca3af;
    }

    .news-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .news-summary {
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }

    .read-more {
      color: #3b82f6;
      font-weight: 500;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .read-more:hover {
      text-decoration: underline;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      color: #6b7280;
    }

    .error-state {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 1rem;
      color: #dc2626;
      text-align: center;
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

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1rem;
    }

    .pagination-info {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 0.75rem;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 1.5rem;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }

    .modal-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .modal-body {
      padding: 0 1.5rem 1.5rem 1.5rem;
    }

    .modal-content-text {
      color: #374151;
      line-height: 1.7;
      white-space: pre-wrap;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
    }

    .create-form-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .create-form-content {
      background: white;
      border-radius: 0.75rem;
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .create-form-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 1.5rem;
    }

    .create-form-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .create-form-body {
      padding: 0 1.5rem 1.5rem 1.5rem;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .view-header {
        flex-direction: column;
        align-items: stretch;
      }

      .view-title {
        font-size: 1.5rem;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions ui-button {
        width: 100%;
      }

      .modal-overlay {
        padding: 0;
      }

      .modal-content {
        margin: 0;
        max-height: 100vh;
        border-radius: 0;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .modal-title {
        font-size: 1.25rem;
      }

      .create-form-modal {
        padding: 0;
      }

      .create-form-content {
        margin: 0;
        max-height: 100vh;
        border-radius: 0;
      }

      .news-item {
        margin: 0 -0.5rem;
      }

      .pagination {
        flex-direction: column;
        gap: 0.75rem;
      }
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadNews();
  }

  private async loadNews(page: number = 1) {
    this.loading = true;
    this.error = null;

    try {
      const response: PaginatedResponse<News> = await newsService.getNews({
        page,
        limit: this.pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (page === 1) {
        this.news = response.data;
      } else {
        this.news = [...this.news, ...response.data];
      }

      this.currentPage = response.page;
      this.totalPages = Math.ceil(response.total / this.pageSize);
      this.hasMore = response.hasNext;
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Error al cargar las noticias';
    } finally {
      this.loading = false;
    }
  }

  private async loadMore() {
    if (this.hasMore && !this.loading) {
      await this.loadNews(this.currentPage + 1);
    }
  }

  private showNewsDetail(news: News) {
    this.selectedNews = news;
  }

  private closeModal() {
    this.selectedNews = null;
  }

  private showCreateNewsForm() {
    this.showCreateForm = true;
  }

  private hideCreateForm() {
    this.showCreateForm = false;
  }

  private async handleNewsSubmit(event: CustomEvent) {
    const { formData } = event.detail as { formData: NewsFormData };

    this.creating = true;
    this.error = null;

    try {
      const newNews = await newsService.createNews(formData);

      // Add the new news to the beginning of the list
      this.news = [newNews, ...this.news];

      // Hide the form
      this.showCreateForm = false;

      // Show success message (you might want to implement a notification system)
      console.log('Noticia creada exitosamente');
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Error al crear la noticia';
    } finally {
      this.creating = false;
    }
  }

  private handleNewsCancel() {
    this.hideCreateForm();
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private formatAuthor(author: {
    firstName: string;
    lastName: string;
  }): string {
    return `${author.firstName} ${author.lastName}`;
  }

  private renderNewsItem(news: News) {
    return html`
      <ui-card
        class="news-item"
        interactive
        elevated
        @ui-card-click=${() => this.showNewsDetail(news)}
      >
        <div class="news-meta">
          <span class="news-author">${this.formatAuthor(news.author)}</span>
          <span class="news-date">${this.formatDate(news.createdAt)}</span>
        </div>
        <h3 class="news-title">${news.title}</h3>
        <p class="news-summary">${news.summary}</p>
        <a
          href="#"
          class="read-more"
          @click=${(e: Event) => {
            e.preventDefault();
            this.showNewsDetail(news);
          }}
        >
          Leer más →
        </a>
      </ui-card>
    `;
  }

  private renderModal() {
    if (!this.selectedNews) return '';

    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2 class="modal-title">${this.selectedNews.title}</h2>
            <div class="modal-meta">
              <span class="news-author"
                >${this.formatAuthor(this.selectedNews.author)}</span
              >
              <span class="news-date"
                >${this.formatDate(this.selectedNews.createdAt)}</span
              >
            </div>
          </div>
          <div class="modal-body">
            <div class="modal-content-text">${this.selectedNews.content}</div>
          </div>
          <div class="modal-footer">
            <ui-button variant="secondary" @ui-click=${this.closeModal}>
              Cerrar
            </ui-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderCreateForm() {
    if (!this.showCreateForm) return '';

    return html`
      <div class="create-form-modal" @click=${this.hideCreateForm}>
        <div
          class="create-form-content"
          @click=${(e: Event) => e.stopPropagation()}
        >
          <div class="create-form-header">
            <h2 class="create-form-title">Crear Nueva Noticia</h2>
          </div>
          <div class="create-form-body">
            <news-form
              mode="create"
              .loading=${this.creating}
              @news-submit=${this.handleNewsSubmit}
              @news-cancel=${this.handleNewsCancel}
            ></news-form>
          </div>
        </div>
      </div>
    `;
  }

  private renderLoadingState() {
    return html`
      <div class="loading-state">
        <p>Cargando noticias...</p>
      </div>
    `;
  }

  private renderErrorState() {
    return html`
      <div class="error-state">
        <p>${this.error}</p>
        <ui-button variant="primary" @ui-click=${() => this.loadNews()}>
          Reintentar
        </ui-button>
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-state-icon">📰</div>
        <h3>No hay noticias disponibles</h3>
        <p>Aún no se han publicado noticias.</p>
      </div>
    `;
  }

  private renderPagination() {
    if (this.totalPages <= 1) return '';

    return html`
      <div class="pagination">
        <div class="pagination-info">
          Página ${this.currentPage} de ${this.totalPages}
        </div>
        ${this.hasMore
          ? html`
              <ui-button
                variant="secondary"
                ?loading=${this.loading}
                @ui-click=${this.loadMore}
              >
                Cargar más
              </ui-button>
            `
          : ''}
      </div>
    `;
  }

  render() {
    const canCreateNews = this.auth?.user?.role === 'admin';

    return html`
      <div class="view-header">
        <div class="header-content">
          <h1 class="view-title">Noticias</h1>
          <p class="view-description">
            Mantente informado sobre eventos escolares
          </p>
        </div>
        <div class="header-actions">
          ${canCreateNews
            ? html`
                <ui-button
                  variant="primary"
                  @ui-click=${this.showCreateNewsForm}
                >
                  Crear Noticia
                </ui-button>
              `
            : ''}
        </div>
      </div>

      ${this.loading && this.news.length === 0
        ? this.renderLoadingState()
        : this.error
          ? this.renderErrorState()
          : this.news.length === 0
            ? this.renderEmptyState()
            : html`
                <div class="news-list">
                  ${this.news.map((news) => this.renderNewsItem(news))}
                </div>
                ${this.renderPagination()}
              `}
      ${this.renderModal()} ${this.renderCreateForm()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'news-view': NewsView;
  }
}
