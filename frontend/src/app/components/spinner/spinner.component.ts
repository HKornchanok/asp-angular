import { Component, Input } from '@angular/core';

export enum SpinnerSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrapper" [class]="'spinner-' + size">
      <div class="spinner"></div>
    </div>
  `,
  styles: [
    `
      .spinner-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .spinner {
        border-radius: 50%;
        border-style: solid;
        border-color: var(--spinner-color, var(--color-primary)) transparent
          var(--spinner-color, var(--color-primary)) transparent;
        animation: spin 1s linear infinite;
      }

      .spinner-small .spinner {
        width: 16px;
        height: 16px;
        border-width: 2px;
      }

      .spinner-medium .spinner {
        width: 32px;
        height: 32px;
        border-width: 3px;
      }

      .spinner-large .spinner {
        width: 48px;
        height: 48px;
        border-width: 4px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = SpinnerSize.Medium;
}
