import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible) {
      <div class="overlay" (click)="onCancel()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h3>{{ title }}</h3>
          </div>
          <div class="dialog-body">
            <p>{{ message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" (click)="onCancel()">Cancel</button>
            <button class="btn-confirm" (click)="onConfirm()">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .dialog {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        min-width: 350px;
        max-width: 450px;
      }

      .dialog-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;

        h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }
      }

      .dialog-body {
        padding: 20px;

        p {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }
      }

      .dialog-footer {
        padding: 12px 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      button {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        border: none;
        transition: background-color 0.2s;
      }

      .btn-cancel {
        background-color: #e0e0e0;
        color: #333;

        &:hover {
          background-color: #d0d0d0;
        }
      }

      .btn-confirm {
        background-color: #dc3545;
        color: white;

        &:hover {
          background-color: #c82333;
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Delete';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
