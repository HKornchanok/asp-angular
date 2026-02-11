import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { NotificationService, NotificationType } from '../../services/notification.service';

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create with empty toasts', () => {
    expect(component).toBeTruthy();
    expect(component.toasts.length).toBe(0);
  });

  it('should add and style toasts correctly', fakeAsync(() => {
    notificationService.show('Success', NotificationType.Success, 0);
    notificationService.show('Error', NotificationType.Error, 0);
    tick();
    fixture.detectChanges();

    expect(component.toasts.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.toast-success')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.toast-error')).toBeTruthy();
  }));

  it('should remove toast on dismiss', fakeAsync(() => {
    notificationService.show('Test', NotificationType.Info, 0);
    tick();
    fixture.detectChanges();

    component.dismiss(component.toasts[0].id);
    tick();
    fixture.detectChanges();

    expect(component.toasts.length).toBe(0);
  }));

  it('should cleanup on destroy', fakeAsync(() => {
    notificationService.show('Test', NotificationType.Info, 0);
    tick();
    component.ngOnDestroy();
    notificationService.show('After', NotificationType.Info, 0);
    tick();
    expect(component.toasts.length).toBe(1);
  }));
});
