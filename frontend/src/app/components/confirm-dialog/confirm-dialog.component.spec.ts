import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with defaults and hide when not visible', () => {
    expect(component).toBeTruthy();
    expect(component.visible).toBeFalse();
    expect(component.title).toBe('Confirm');
    expect(fixture.nativeElement.querySelector('.overlay')).toBeNull();
  });

  it('should show dialog with custom content', () => {
    component.visible = true;
    component.title = 'Title';
    component.message = 'Message';
    component.confirmText = 'OK';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dialog-header h3').textContent).toBe('Title');
    expect(fixture.nativeElement.querySelector('.dialog-body p').textContent).toBe('Message');
    expect(fixture.nativeElement.querySelector('.btn-confirm').textContent).toBe('OK');
  });

  it('should emit confirmed on confirm click', () => {
    component.visible = true;
    fixture.detectChanges();
    spyOn(component.confirmed, 'emit');
    fixture.nativeElement.querySelector('.btn-confirm').click();
    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('should emit cancelled on cancel/overlay click', () => {
    component.visible = true;
    fixture.detectChanges();
    spyOn(component.cancelled, 'emit');

    fixture.nativeElement.querySelector('.btn-cancel').click();
    expect(component.cancelled.emit).toHaveBeenCalled();

    fixture.nativeElement.querySelector('.overlay').click();
    expect(component.cancelled.emit).toHaveBeenCalledTimes(2);
  });
});
