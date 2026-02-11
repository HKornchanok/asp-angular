import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private removeSubject = new Subject<number>();
  private idCounter = 0;

  public notification$ = this.notificationSubject.asObservable();
  public remove$ = this.removeSubject.asObservable();

  show(message: string, type: NotificationType = NotificationType.Info, duration = 3000): void {
    const id = ++this.idCounter;
    this.notificationSubject.next({ id, message, type });

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string): void {
    this.show(message, NotificationType.Success);
  }

  error(message: string): void {
    this.show(message, NotificationType.Error, 5000);
  }

  warning(message: string): void {
    this.show(message, NotificationType.Warning);
  }

  info(message: string): void {
    this.show(message, NotificationType.Info);
  }

  dismiss(id: number): void {
    this.removeSubject.next(id);
  }
}
