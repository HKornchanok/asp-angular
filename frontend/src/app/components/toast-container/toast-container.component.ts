import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  NotificationService,
  Notification,
  NotificationType,
} from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" (click)="dismiss(toast.id)">
          <span class="toast-icon">
            @switch (toast.type) {
              @case (NotificationType.Success) {
                ✓
              }
              @case (NotificationType.Error) {
                ✕
              }
              @case (NotificationType.Warning) {
                ⚠
              }
              @case (NotificationType.Info) {
                ℹ
              }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1100;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 6px;
        color: var(--color-white);
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .toast:hover {
        opacity: 0.9;
      }

      .toast-success {
        background-color: var(--color-success);
      }

      .toast-error {
        background-color: var(--color-danger);
      }

      .toast-warning {
        background-color: var(--color-warning);
        color: var(--color-text);
      }

      .toast-info {
        background-color: var(--color-info);
      }

      .toast-icon {
        font-size: 16px;
        font-weight: bold;
      }

      .toast-message {
        flex: 1;
        font-size: 14px;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private subscriptions: Subscription[] = [];

  NotificationType = NotificationType;
  toasts: Notification[] = [];

  ngOnInit(): void {
    this.subscriptions.push(
      this.notificationService.notification$.subscribe((notification) => {
        this.toasts.push(notification);
      }),
      this.notificationService.remove$.subscribe((id) => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }
}
