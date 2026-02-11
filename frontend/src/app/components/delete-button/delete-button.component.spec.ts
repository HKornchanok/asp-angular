import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteButtonComponent } from './delete-button.component';
import { ICellRendererParams } from 'ag-grid-community';

describe('DeleteButtonComponent', () => {
  let component: DeleteButtonComponent;
  let fixture: ComponentFixture<DeleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteButtonComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render button', () => {
    expect(component).toBeTruthy();
    const button = fixture.nativeElement.querySelector('.delete-btn');
    expect(button.textContent).toContain('BUTTON.DELETE');
  });

  it('should return false on refresh', () => {
    expect(component.refresh()).toBeFalse();
  });

  it('should call onDelete when clicked', () => {
    const mockOnDelete = jasmine.createSpy('onDelete');
    component.agInit({
      data: { id: 123, serialNumber: 'SN123' },
      context: { onDelete: mockOnDelete },
    } as unknown as ICellRendererParams);

    fixture.nativeElement.querySelector('.delete-btn').click();
    expect(mockOnDelete).toHaveBeenCalledWith(123, 'SN123');
  });

  it('should handle missing context gracefully', () => {
    component.agInit({ data: { id: 1 }, context: null } as unknown as ICellRendererParams);
    expect(() => fixture.nativeElement.querySelector('.delete-btn').click()).not.toThrow();
  });
});
