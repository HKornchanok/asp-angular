import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarcodeCellComponent } from './barcode-cell.component';
import { ICellRendererParams } from 'ag-grid-community';

describe('BarcodeCellComponent', () => {
  let component: BarcodeCellComponent;
  let fixture: ComponentFixture<BarcodeCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeCellComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize via agInit', () => {
    expect(component).toBeTruthy();
    expect(component.value).toBe('');

    component.agInit({ value: 'TEST123' } as ICellRendererParams);
    expect(component.value).toBe('TEST123');

    component.agInit({ value: undefined } as ICellRendererParams);
    expect(component.value).toBe('');
  });

  it('should refresh and render barcode', () => {
    fixture.detectChanges();
    const result = component.refresh({ value: 'NEW' } as ICellRendererParams);
    expect(result).toBeTrue();
    expect(component.value).toBe('NEW');
  });

  it('should render barcode after view init', () => {
    component.value = 'BARCODE';
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
