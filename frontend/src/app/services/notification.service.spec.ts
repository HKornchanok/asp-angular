import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService, NotificationType } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit notifications with correct types', (done) => {
    const notifications: any[] = [];
    const sub = service.notification$.subscribe((n) => {
      notifications.push(n);
      if (notifications.length === 4) {
        expect(notifications[0].type).toBe(NotificationType.Success);
        expect(notifications[1].type).toBe(NotificationType.Error);
        expect(notifications[2].type).toBe(NotificationType.Warning);
        expect(notifications[3].type).toBe(NotificationType.Info);
        sub.unsubscribe();
        done();
      }
    });

    service.success('s');
    service.error('e');
    service.warning('w');
    service.info('i');
  });

  it('should auto-dismiss and allow manual dismiss', fakeAsync(() => {
    let removedId: number | undefined;
    service.remove$.subscribe((id) => (removedId = id));

    service.show('test', NotificationType.Info, 100);
    tick(100);
    expect(removedId).toBe(1);

    service.dismiss(99);
    expect(removedId).toBe(99);
  }));

  it('should not auto-dismiss when duration is 0', fakeAsync(() => {
    let removedId: number | undefined;
    service.remove$.subscribe((id) => (removedId = id));

    service.show('test', NotificationType.Info, 0);
    tick(5000);
    expect(removedId).toBeUndefined();
  }));
});
