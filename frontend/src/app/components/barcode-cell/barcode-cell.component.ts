import { Component, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode-cell',
  standalone: true,
  template: `<svg #barcode></svg>`,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: 100%;
      }
      svg {
        max-height: 35px;
      }
    `,
  ],
})
export class BarcodeCellComponent implements ICellRendererAngularComp, AfterViewInit {
  @ViewChild('barcode') barcodeElement!: ElementRef<SVGElement>;
  @Input() value: string = '';

  agInit(params: ICellRendererParams): void {
    this.value = params.value || '';
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value || '';
    this.renderBarcode();
    return true;
  }

  ngAfterViewInit(): void {
    this.renderBarcode();
  }

  private renderBarcode(): void {
    if (this.barcodeElement && this.value) {
      try {
        JsBarcode(this.barcodeElement.nativeElement, this.value, {
          format: 'CODE39',
          width: 1.5,
          height: 30,
          displayValue: false,
          margin: 0,
        });
      } catch (e) {
        console.error('Barcode error:', e);
      }
    }
  }
}
