import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { calendarService } from '../services/calendar-service-factory.js';
import { notificationService } from '../services/notification-service.js';
import type { CalendarEvent } from '../types/index.js';
import { authContext, type AuthContextValue } from '../contexts/app-context.js';
import '../components/ui/ui-button.js';
import '../components/ui/ui-card.js';
import '../components/ui/ui-modal.js';
import '../components/ui/ui-loading.js';
import '../components/forms/event-form.js';

@customElement('calendar-view')
export class CalendarView extends LitElement {
  @consume({ context: authContext, subscribe: true })
  @property({ attribute: false })
  authState?: AuthContextValue;

  @state() private _currentDate = new Date();
  @state() private _events: CalendarEvent[] = [];
  @state() private _loading = false;
  @state() private _selectedEvent: CalendarEvent | null = null;
  @state() private _showEventModal = false;
  @state() private _showCreateModal = false;
  @state() private _showEditModal = false;
  @state() private _showDayEventsModal = false;
  @state() private _selectedDayEvents: CalendarEvent[] = [];
  @state() private _selectedDate: Date | null = null;
  @state() private _creatingEvent = false;
  @state() private _editingEvent = false;

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
    }

    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .view-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .view-description {
      color: #6b7280;
      margin-top: 0.5rem;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
    }

    .month-navigation {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .current-month {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      min-width: 12rem;
      text-align: center;
    }

    .calendar-grid {
      background: white;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }

    .weekday {
      padding: 1rem;
      text-align: center;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .calendar-day {
      min-height: 8rem;
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
      position: relative;
    }

    .calendar-day:nth-child(7n) {
      border-right: none;
    }

    .calendar-day:hover {
      background-color: #f8fafc;
    }

    .calendar-day--other-month {
      background-color: #f9fafb;
      color: #9ca3af;
    }

    .calendar-day--today {
      background-color: #eff6ff;
    }

    .calendar-day--has-events {
      background-color: #fef3c7;
    }

    .calendar-day--today.calendar-day--has-events {
      background-color: #dbeafe;
    }

    .day-number {
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .day-events {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .event-item {
      background: #3b82f6;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event-item:hover {
      background: #2563eb;
    }

    .event-item--multiple {
      background: #6b7280;
    }

    .event-item--multiple:hover {
      background: #4b5563;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 20rem;
      color: #6b7280;
    }

    .loading-spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 1rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .event-modal-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-detail {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .event-detail-label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .event-detail-value {
      color: #6b7280;
      line-height: 1.5;
    }

    .event-date {
      font-family: monospace;
      background: #f3f4f6;
      padding: 0.5rem;
      border-radius: 0.25rem;
    }

    .event-author {
      font-weight: 500;
    }

    .event-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .day-events-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .day-event-item {
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .day-event-item:hover {
      border-color: #3b82f6;
      background-color: #f8fafc;
    }

    .day-event-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .day-event-time {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .day-event-description {
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .day-event-author {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .view-title {
        color: #f9fafb;
      }

      .view-description {
        color: #9ca3af;
      }

      .calendar-header {
        background: #1f2937;
        border-color: #374151;
      }

      .current-month {
        color: #f9fafb;
      }

      .calendar-grid {
        background: #1f2937;
        border-color: #374151;
      }

      .calendar-weekdays {
        background: #374151;
        border-bottom-color: #4b5563;
      }

      .weekday {
        color: #d1d5db;
      }

      .calendar-day {
        border-color: #4b5563;
      }

      .calendar-day:hover {
        background-color: #374151;
      }

      .calendar-day--other-month {
        background-color: #111827;
        color: #6b7280;
      }

      .calendar-day--today {
        background-color: #1e3a8a;
      }

      .calendar-day--has-events {
        background-color: #451a03;
      }

      .calendar-day--today.calendar-day--has-events {
        background-color: #1e40af;
      }

      .event-detail-label {
        color: #d1d5db;
      }

      .event-detail-value {
        color: #9ca3af;
      }

      .event-date {
        background: #374151;
      }

      .event-actions {
        border-top-color: #4b5563;
      }

      .day-event-item {
        border-color: #4b5563;
      }

      .day-event-item:hover {
        border-color: #3b82f6;
        background-color: #374151;
      }

      .day-event-title {
        color: #f9fafb;
      }

      .day-event-time {
        color: #9ca3af;
      }

      .day-event-description {
        color: #d1d5db;
      }

      .day-event-author {
        color: #9ca3af;
      }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .view-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .view-title {
        font-size: 1.5rem;
      }

      .calendar-header {
        flex-direction: column;
        gap: 1rem;
        padding: 0.75rem;
      }

      .month-navigation {
        width: 100%;
        justify-content: space-between;
      }

      .current-month {
        font-size: 1rem;
        min-width: auto;
      }

      .calendar-day {
        min-height: 5rem;
        padding: 0.25rem;
      }

      .day-number {
        font-size: 0.75rem;
        margin-bottom: 0.25rem;
      }

      .event-item {
        font-size: 0.625rem;
        padding: 0.125rem 0.25rem;
      }

      .weekday {
        padding: 0.5rem;
        font-size: 0.75rem;
      }

      .day-events-list {
        gap: 0.75rem;
      }

      .day-event-item {
        padding: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .calendar-day {
        min-height: 4rem;
      }

      .event-item {
        display: none;
      }

      .calendar-day--has-events::after {
        content: '•';
        position: absolute;
        bottom: 0.25rem;
        right: 0.25rem;
        color: #3b82f6;
        font-size: 1.5rem;
        line-height: 1;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._loadEvents();
  }

  render() {
    return html`
      <div class="view-header">
        <div>
          <h1 class="view-title">Calendario</h1>
          <p class="view-description">Visualiza y gestiona eventos escolares</p>
        </div>
        ${this._canCreateEvents()
          ? html`
              <ui-button variant="primary" @ui-click=${this._handleCreateEvent}>
                Crear evento
              </ui-button>
            `
          : ''}
      </div>

      <div class="calendar-header">
        <div class="month-navigation">
          <ui-button variant="ghost" size="sm" @ui-click=${this._previousMonth}>
            ← Anterior
          </ui-button>
          <div class="current-month">${this._formatCurrentMonth()}</div>
          <ui-button variant="ghost" size="sm" @ui-click=${this._nextMonth}>
            Siguiente →
          </ui-button>
        </div>
      </div>

      ${this._loading
        ? html`
            <div class="loading-state">
              <div class="loading-spinner"></div>
              Cargando eventos...
            </div>
          `
        : html`
            <div class="calendar-grid">
              <div class="calendar-weekdays">
                <div class="weekday">Lun</div>
                <div class="weekday">Mar</div>
                <div class="weekday">Mié</div>
                <div class="weekday">Jue</div>
                <div class="weekday">Vie</div>
                <div class="weekday">Sáb</div>
                <div class="weekday">Dom</div>
              </div>
              <div class="calendar-days">${this._renderCalendarDays()}</div>
            </div>
          `}

      <!-- Event Detail Modal -->
      <ui-modal
        .isOpen=${this._showEventModal}
        title="Detalles del evento"
        size="md"
        @ui-modal-close=${this._closeEventModal}
      >
        ${this._selectedEvent ? this._renderEventDetails() : ''}
      </ui-modal>

      <!-- Create Event Modal -->
      <ui-modal
        .isOpen=${this._showCreateModal}
        title="Crear nuevo evento"
        size="lg"
        @ui-modal-close=${this._closeCreateModal}
      >
        <event-form
          mode="create"
          .loading=${this._creatingEvent}
          @event-submit=${this._handleEventSubmit}
          @event-cancel=${this._closeCreateModal}
        ></event-form>
      </ui-modal>

      <!-- Edit Event Modal -->
      <ui-modal
        .isOpen=${this._showEditModal}
        title="Editar evento"
        size="lg"
        @ui-modal-close=${this._closeEditModal}
      >
        <event-form
          mode="edit"
          .initialData=${this._selectedEvent}
          .loading=${this._editingEvent}
          @event-submit=${this._handleEventUpdate}
          @event-cancel=${this._closeEditModal}
        ></event-form>
      </ui-modal>

      <!-- Day Events Modal -->
      <ui-modal
        .isOpen=${this._showDayEventsModal}
        title=${this._selectedDate
          ? `Eventos del ${this._selectedDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`
          : 'Eventos del día'}
        size="md"
        @ui-modal-close=${this._closeDayEventsModal}
      >
        ${this._renderDayEventsList()}
      </ui-modal>
    `;
  }

  private async _loadEvents() {
    this._loading = true;
    try {
      const year = this._currentDate.getFullYear();
      const month = this._currentDate.getMonth() + 1;
      this._events = await calendarService.getEventsForMonth(year, month);
    } catch (error) {
      console.error('Error loading events:', error);
      // TODO: Show error notification
    } finally {
      this._loading = false;
    }
  }

  private _previousMonth() {
    this._currentDate = new Date(
      this._currentDate.getFullYear(),
      this._currentDate.getMonth() - 1,
      1
    );
    this._loadEvents();
  }

  private _nextMonth() {
    this._currentDate = new Date(
      this._currentDate.getFullYear(),
      this._currentDate.getMonth() + 1,
      1
    );
    this._loadEvents();
  }

  private _formatCurrentMonth(): string {
    return this._currentDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  }

  private _renderCalendarDays() {
    const year = this._currentDate.getFullYear();
    const month = this._currentDate.getMonth();

    // Get first day of month and calculate starting day of calendar
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);

    // Adjust to start on Monday (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 6 weeks (42 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = currentDay.getTime() === today.getTime();
      const dayEvents = this._getEventsForDay(currentDay);
      const hasEvents = dayEvents.length > 0;

      const classes = [
        'calendar-day',
        !isCurrentMonth ? 'calendar-day--other-month' : '',
        isToday ? 'calendar-day--today' : '',
        hasEvents ? 'calendar-day--has-events' : '',
      ]
        .filter(Boolean)
        .join(' ');

      days.push(html`
        <div
          class=${classes}
          @click=${() => this._handleDayClick(currentDay, dayEvents)}
        >
          <div class="day-number">${currentDay.getDate()}</div>
          <div class="day-events">
            ${dayEvents.slice(0, 3).map((event, index) => {
              if (index === 2 && dayEvents.length > 3) {
                return html`
                  <div class="event-item event-item--multiple">
                    +${dayEvents.length - 2} más
                  </div>
                `;
              }
              return html`
                <div
                  class="event-item"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._showEventDetails(event);
                  }}
                  title=${event.title}
                >
                  ${event.title}
                </div>
              `;
            })}
          </div>
        </div>
      `);
    }

    return days;
  }

  private _getEventsForDay(date: Date): CalendarEvent[] {
    return this._events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  private _handleDayClick(date: Date, events: CalendarEvent[]) {
    if (events.length === 1) {
      this._showEventDetails(events[0]);
    } else if (events.length > 1) {
      this._selectedDate = date;
      this._selectedDayEvents = events;
      this._showDayEventsModal = true;
    }
  }

  private _showEventDetails(event: CalendarEvent) {
    this._selectedEvent = event;
    this._showEventModal = true;
  }

  private _closeEventModal() {
    this._showEventModal = false;
    this._selectedEvent = null;
  }

  private _renderEventDetails() {
    if (!this._selectedEvent) return '';

    const canEditEvent = this._canEditEvent(this._selectedEvent);

    return html`
      <div class="event-modal-content">
        <div class="event-detail">
          <div class="event-detail-label">Título</div>
          <div class="event-detail-value">${this._selectedEvent.title}</div>
        </div>

        <div class="event-detail">
          <div class="event-detail-label">Fecha y hora</div>
          <div class="event-detail-value">
            <div class="event-date">
              ${this._selectedEvent.date.toLocaleString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        <div class="event-detail">
          <div class="event-detail-label">Descripción</div>
          <div class="event-detail-value">
            ${this._selectedEvent.description}
          </div>
        </div>

        <div class="event-detail">
          <div class="event-detail-label">Creado por</div>
          <div class="event-detail-value">
            <span class="event-author">
              ${this._selectedEvent.author.firstName}
              ${this._selectedEvent.author.lastName}
            </span>
          </div>
        </div>

        <div class="event-detail">
          <div class="event-detail-label">Fecha de creación</div>
          <div class="event-detail-value">
            ${this._selectedEvent.createdAt.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        ${canEditEvent
          ? html`
              <div class="event-actions">
                <ui-button
                  variant="secondary"
                  size="sm"
                  @ui-click=${this._handleEditEvent}
                >
                  Editar evento
                </ui-button>
                <ui-button
                  variant="danger"
                  size="sm"
                  @ui-click=${this._handleDeleteEvent}
                >
                  Eliminar evento
                </ui-button>
              </div>
            `
          : ''}
      </div>

      <div slot="footer">
        <ui-button variant="secondary" @ui-click=${this._closeEventModal}>
          Cerrar
        </ui-button>
      </div>
    `;
  }

  private _canCreateEvents(): boolean {
    return this.authState?.user?.role === 'admin';
  }

  private _handleCreateEvent() {
    this._showCreateModal = true;
  }

  private _closeCreateModal() {
    this._showCreateModal = false;
  }

  private async _handleEventSubmit(event: CustomEvent) {
    this._creatingEvent = true;
    try {
      await calendarService.createEvent(event.detail.formData);
      this._closeCreateModal();
      await this._loadEvents();

      // Show success notification
      notificationService.success(
        'Evento creado',
        'El evento se ha agregado al calendario correctamente.'
      );
    } catch (error) {
      console.error('Error creating event:', error);

      // Show error notification
      notificationService.error(
        'Error al crear evento',
        error instanceof Error ? error.message : 'No se pudo crear el evento.'
      );
    } finally {
      this._creatingEvent = false;
    }
  }

  private _canEditEvent(event: CalendarEvent): boolean {
    const user = this.authState?.user;
    if (!user) return false;

    // Admin can edit any event, or user can edit their own events
    return user.role === 'admin' || event.author.id === user.id;
  }

  private _handleEditEvent() {
    this._showEventModal = false;
    this._showEditModal = true;
  }

  private _closeEditModal() {
    this._showEditModal = false;
  }

  private async _handleEventUpdate(event: CustomEvent) {
    if (!this._selectedEvent) return;

    this._editingEvent = true;
    try {
      await calendarService.updateEvent(
        this._selectedEvent.id,
        event.detail.formData
      );
      this._closeEditModal();
      this._selectedEvent = null;
      await this._loadEvents();
      // TODO: Show success notification
    } catch (error) {
      console.error('Error updating event:', error);
      // TODO: Show error notification
    } finally {
      this._editingEvent = false;
    }
  }

  private async _handleDeleteEvent() {
    if (!this._selectedEvent) return;

    // Show confirmation dialog
    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar el evento "${this._selectedEvent.title}"?`
    );

    if (!confirmed) return;

    try {
      await calendarService.deleteEvent(this._selectedEvent.id);
      this._closeEventModal();
      this._selectedEvent = null;
      await this._loadEvents();
      // TODO: Show success notification
    } catch (error) {
      console.error('Error deleting event:', error);
      // TODO: Show error notification
    }
  }

  private _closeDayEventsModal() {
    this._showDayEventsModal = false;
    this._selectedDayEvents = [];
    this._selectedDate = null;
  }

  private _renderDayEventsList() {
    if (this._selectedDayEvents.length === 0) {
      return html`<p>No hay eventos para este día.</p>`;
    }

    return html`
      <div class="day-events-list">
        ${this._selectedDayEvents.map(
          (event) => html`
            <div
              class="day-event-item"
              @click=${() => {
                this._closeDayEventsModal();
                this._showEventDetails(event);
              }}
            >
              <div class="day-event-title">${event.title}</div>
              <div class="day-event-time">
                ${event.date.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div class="day-event-description">${event.description}</div>
              <div class="day-event-author">
                Por ${event.author.firstName} ${event.author.lastName}
              </div>
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'calendar-view': CalendarView;
  }
}
