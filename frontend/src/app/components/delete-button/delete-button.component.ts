import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-delete-button',
  standalone: true,
  template: ` <button class="delete-btn" (click)="onClick()">Delete</button> `,
  styles: [
    `
      .delete-btn {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 5px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .delete-btn:hover {
        background-color: #c82333;
      }
    `,
  ],
})
export class DeleteButtonComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onClick(): void {
    if (this.params.context && this.params.context.onDelete) {
      const id = this.params.data.id;
      const serialNumber = this.params.data.serialNumber || '';
      this.params.context.onDelete(id, serialNumber);
    }
  }
}
