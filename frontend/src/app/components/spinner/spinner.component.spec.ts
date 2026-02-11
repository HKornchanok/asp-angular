import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent, SpinnerSize } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with medium size by default', () => {
    expect(component).toBeTruthy();
    expect(component.size).toBe(SpinnerSize.Medium);
    expect(fixture.nativeElement.querySelector('.spinner-medium')).toBeTruthy();
  });

  it('should apply correct size classes', () => {
    component.size = SpinnerSize.Small;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.spinner-small')).toBeTruthy();

    component.size = SpinnerSize.Large;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.spinner-large')).toBeTruthy();
  });
});
